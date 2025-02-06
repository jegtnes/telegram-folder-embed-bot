import Database from "bun:sqlite";
import { dbFilePath } from "../index";
import type { CommandContext } from "../types/types";
import { addProtocolToLink } from "../utils/url";

export function removeFolder(ctx: CommandContext) {
	const arg = ctx.payload;
	const userId = ctx.message?.from?.id;
	if (!arg.length) {
		return ctx.reply("Please type the URL of the server you'd like to remove");
	}

	const url = addProtocolToLink(arg);

	const db = new Database(dbFilePath);

	try {
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
		console.error("Unexpected error deleting folder from database:");
		console.error(error);
		return ctx.reply("Unexpected error, sorry.");
	} finally {
		db.close(false);
	}
}
