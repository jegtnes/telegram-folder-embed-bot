import { getAllFolders } from "../db/getAllFolders";
import type { CommandContext } from "../types/types";
import { removeProtocolFromLink } from "../utils/url";

export function showFolders(ctx: CommandContext) {
	const userId: number | undefined = ctx.message?.from?.id;
	if (!userId) {
		console.error("Couldn't get userID from showFolders command. Context:");
		console.error(ctx);
		return ctx.reply("Unexpected error occurred");
	}

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
}
