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
import { showFolders } from "./commands/showFolders";

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
bot.command("showfolders", (ctx: CommandContext) => showFolders(ctx));
bot.command("removefolder", async (ctx: CommandContext) => removeFolder(ctx));
bot.on("inline_query", async (ctx: InlineQueryContext) => inlineQuery(ctx));

bot.launch({
	webhook: {
		domain: domain,
		port: port,
	},
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
process.once("SIGQUIT", () => bot.stop("SIGQUIT"));
