import { Database, type Statement } from "bun:sqlite";
import { join as pathJoin, resolve as pathResolve } from "node:path";
import { config } from "dotenv";
import { type Context, Telegraf } from "telegraf";
import { v5 as uuidV5 } from "uuid";

import type {
	CommandContext,
	InlineQueryContext,
	InlineQueryResultsPossible,
	PartialQueryResult,
	FolderTable,
} from "./types";

import type {
	InlineQueryResult,
	InlineQueryResultGif,
	InlineQueryResultPhoto,
} from "telegraf/types";

import { fetchLinks } from "./fetchLinks";
import { isFolderValid } from "./isFolderValid";
import { getAllFolders } from "./getAllFolders";
import { addProtocolToLink, removeProtocolFromLink } from "./urlUtils";
import { addFolder } from "./commands/addFolder";

config();

export const dbFile: string =
	pathResolve(
		pathJoin(
			process.env.SQLITE_DB_PATH || "",
			process.env.SQLITE_DB_FILE || "",
		),
	) || "";

const botKey: string = process.env.BOT_TOKEN || "";
const domain: string = process.env.DOMAIN || "";
const port: number = Number.parseInt(process.env.PORT || "0", 10);

// Ensure database file has been created on bot start
const db = new Database(dbFile, { create: true });

try {
	const initTable = db.query(`CREATE TABLE IF NOT EXISTS servers(
		telegram_id INTEGER,
		server_url STRING,
		PRIMARY KEY (telegram_id, server_url)
	);`);
	initTable.run();
} catch (error) {
	console.debug({ error });
	console.log("Error connecting to / initialising DB");
} finally {
	db.close(false);
}

console.info(`Started bot process at port ${port} at domain ${domain}`);

const bot = new Telegraf(botKey);

bot.start((ctx: Context) => ctx.reply("TODO"));
bot.help((ctx: Context) => {
	ctx.reply("TODO");
});

bot.command("addfolder", async (ctx: CommandContext) => addFolder(ctx));

bot.command("showfolders", (ctx: CommandContext) => {
	const userId: number | undefined = ctx.message?.from?.id;
	if (!userId) return ctx.reply("Unexpected error occurred");

	const folders = getAllFolders(userId);
	if (folders.length === 0) {
		return ctx.reply(
			"You haven't added any folders yet. Add folders using the `/addfolder [folder]` command.",
		);
	}

	return ctx.reply(
		folders
			.map((folder) => {
				return removeProtocolFromLink(folder.server_url);
			})
			.join(", "),
	);
});

bot.command("removefolder", async (ctx: CommandContext) => {
	const arg = ctx.payload;
	const userId = ctx.message?.from?.id;
	if (!arg.length) {
		return ctx.reply("Please type the URL of the server you'd like to remove");
	}

	const url = addProtocolToLink(arg);

	try {
		const db = new Database(dbFile);
		const query = db.query(
			"DELETE FROM servers WHERE (telegram_id = $telegram_id) AND (server_url = $server_url);",
		);
		const result = query.run({
			$telegram_id: `${userId}`,
			$server_url: `${url}`,
		});
		if (result.changes === 0) {
			throw new Error("Could not delete the database row");
		}
		return ctx.reply("You've successfully removed this folder.");
	} catch (error) {
		console.error({ error });
		return ctx.reply("Unexpected error. Soz");
	} finally {
		db.close(false);
	}
});

bot.on("inline_query", async (ctx: InlineQueryContext) => {
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
});

bot.launch({
	webhook: {
		domain: domain,
		port: port,
	},
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
process.once("SIGQUIT", () => bot.stop("SIGQUIT"));
