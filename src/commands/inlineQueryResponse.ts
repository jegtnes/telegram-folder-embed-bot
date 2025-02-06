import { v5 as uuidV5 } from "uuid";

import { fetchLinks } from "../fetchLinks";
import { getAllFolders } from "../getAllFolders";
import type {
	InlineQueryResult,
	InlineQueryResultPhoto,
	InlineQueryResultGif,
} from "@telegraf/types";
import type {
	InlineQueryContext,
	PartialQueryResult,
	InlineQueryResultsPossible,
} from "../types";

export async function inlineQueryResponse(ctx: InlineQueryContext) {
	const userId = ctx.update?.inline_query?.from?.id;
	const query = ctx.update.inline_query.query.trim();
	console.info("Received folder inline query command: ", query);

	const folders = getAllFolders(userId);

	const promises = folders.map((folder) =>
		fetchLinks(folder.server_url, query),
	);
	const allLinks = (await Promise.all(promises)).flat().slice(0, 40);

	const result: InlineQueryResult[] = allLinks
		.map((link) => {
			const title = new URL(link).pathname.slice(1);
			const extRx = link.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
			const ext = extRx?.[1];
			const result: PartialQueryResult = {
				id: uuidV5(link, uuidV5.URL),
				thumbnail_url: link,
				title,
			};
			if (ext === "jpg") {
				result.type = "photo";
				result.photo_url = link;
				return result as InlineQueryResultPhoto;
			}
			if (ext === "gif") {
				result.type = "gif";
				result.gif_url = link;
				return result as InlineQueryResultGif;
			}

			return undefined;
		})
		.filter((item): item is InlineQueryResultsPossible => item !== undefined);

	if (!result || result.length === 0) {
		return [];
	}

	return await ctx.answerInlineQuery(result, {
		is_personal: true,
		cache_time: 60,
	});
}
