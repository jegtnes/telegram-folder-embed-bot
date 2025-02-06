import Database from "bun:sqlite";
import { isFolderValid } from "../folderParsing/isFolderValid";
import type { CommandContext } from "../types/types";
import { addProtocolToLink } from "../utils/url";
import { dbFilePath, botUsername } from "../index";

export async function addFolder(ctx: CommandContext) {
	const folderName = ctx.payload;
	const userId = ctx.message?.from?.id;
	if (!folderName.length) {
		return ctx.reply("Please type the URL of the server you'd like to add");
	}

	const folderValid = await isFolderValid(folderName);

	if (!folderValid) {
		return ctx.reply(
			"Sorry, that URL doesn't seem to be a valid folder listing",
		);
	}

	const db = new Database(dbFilePath);
	const url = addProtocolToLink(folderName);
	try {
		const query = db.query(
			"INSERT INTO servers (telegram_id, server_url) VALUES ($telegram_id, $server_url);",
		);
		query.run({
			$telegram_id: `${userId}`,
			$server_url: `${url}`,
		});
		return ctx.reply(
			`You've successfully added this folder. You can now use gifs and images from it with the inline query @${botUsername}`,
		);
	} catch (error) {
		if (error.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
			return ctx.reply(
				"You've already added this folder. See your list of folders with the command /showfolders.",
			);
		}
		console.error({ error });
		return ctx.reply("Unexpected error, sorry.");
	} finally {
		db.close(false);
	}
}
