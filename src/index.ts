import { Database } from "bun:sqlite";
import { join as pathJoin, resolve as pathResolve } from "node:path";
import { config } from "dotenv";
import { type Context, Telegraf } from "telegraf";

import type { CommandContext, InlineQueryContext } from "./types/types";

import { addFolder } from "./commands/addFolder";
import { showFolders } from "./commands/showFolders";
import { removeFolder } from "./commands/removeFolder";
import { start } from "./commands/start";
import { inlineQueryResponse as inlineQuery } from "./commands/inlineQueryResponse";

config();
const botKey: string = process.env.BOT_TOKEN || "";
const domain: string = process.env.DOMAIN || "";
const port: number = Number.parseInt(process.env.PORT || "0", 10);
const dbPath: string = process.env.SQLITE_DB_PATH || "";
const dbFileName: string = process.env.SQLITE_DB_FILE || "";
export const botName: string = process.env.BOT_NAME || "FolderEmbed";
export const botUsername: string = process.env.BOT_USERNAME || "FolderEmbedBot";
export const dbFilePath: string = pathResolve(pathJoin(dbPath, dbFileName));

// Ensure database file has been created on bot start
const db = new Database(dbFilePath, { create: true });

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

bot.start((ctx: Context) => start(ctx));
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
