import { config } from "dotenv";
import { type Context, type NarrowedContext, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import type {
	InlineQueryResult,
	InlineQueryResultGif,
	InlineQueryResultPhoto,
	Update,
	Convenience,
} from "telegraf/types";
import { v5 as uuidV5 } from "uuid";

import { fetchLinks } from "./fetchLinks";

type CommandContext = Context & Convenience.CommandContextExtn;
type InlineQueryContext = NarrowedContext<Context, Update.InlineQueryUpdate>;

type InlineQueryResultsPossible = InlineQueryResultGif | InlineQueryResultPhoto;
type PartialQueryResult = {
	id: string;
	thumbnail_url: string;
	title: string;
	photo_url?: string;
	gif_url?: string;
	type?: "gif" | "photo";
};

config();

const botKey: string = process.env.BOT_TOKEN || "";
const domain: string = process.env.DOMAIN || "";
const port: number = Number.parseInt(process.env.PORT || "0", 10);

console.info(`Started bot process at port ${port} at domain ${domain}`);

const bot = new Telegraf(botKey);

bot.start((ctx: Context) => ctx.reply("Welcome"));
bot.help((ctx: Context) => {
	ctx.reply("Send me a sticker");
});

bot.command("addfolder", async (ctx: CommandContext) => {
	console.info("Received addfolder command", ctx.payload);
	console.debug({ ctx });
	ctx.reply("Guten tag");
});

bot.command("showfolders", async (ctx: CommandContext) => {
	console.info("Received show folders command", ctx.payload);
	console.debug({ ctx });
	ctx.reply("Guten tag");
});

bot.command("removefolder", async (ctx: CommandContext) => {
	console.info("Remove folders command", ctx.payload);
	console.debug({ ctx });
	ctx.reply("Guten tag");
});

bot.on(message("sticker"), (ctx: Context) => {
	console.info("Received sticker");
	ctx.reply("👍");
});

bot.hears("hi", (ctx: Context) => {
	console.info("Received 'hi'");
	ctx.reply("Hey there");
});

bot.on("inline_query", async (ctx: InlineQueryContext) => {
	const query = ctx.update.inline_query.query.trim();
	console.info("Received folder inline query command: ", query);

	const links = await fetchLinks("https://folder.jegtnes.com");

	const result: InlineQueryResult[] = links
		.filter((link) => {
			const extRx = link.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
			return extRx?.[1] === "jpg" || extRx?.[1] === "gif";
		})
		.filter((link) => (link.length === 0 ? true : link.includes(query)))
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
		.filter((item): item is InlineQueryResultsPossible => item !== undefined)
		.slice(0, 39);

	if (!result || result.length === 0) {
		return [];
	}

	console.log("Total results: ", result.length);

	for (const item of result as InlineQueryResultsPossible[]) {
		console.log(item.title);
	}

	console.debug({ result });

	return await ctx.answerInlineQuery(result);
});

// Start webhook via launch method (preferred)
bot.launch({
	webhook: {
		domain: domain,
		port: port,
	},
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
process.once("SIGQUIT", () => bot.stop("SIGQUIT"));
