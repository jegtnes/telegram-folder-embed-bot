import { config } from "dotenv";
import { type Context, type NarrowedContext, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import type {
	InlineQueryResult,
	InlineQueryResultGif,
	InlineQueryResultPhoto,
	Update,
} from "telegraf/types";
import { v5 as uuidV5 } from "uuid";

import { fetchLinks } from "./fetchLinks";

type InlineQueryContext = NarrowedContext<Context, Update.InlineQueryUpdate>;

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

bot.on(message("sticker"), (ctx: Context) => {
	console.info("Received sticker");
	ctx.reply("👍");
});

bot.hears("hi", (ctx: Context) => {
	console.info("Received 'hi'");
	ctx.reply("Hey there");
});

bot.on("inline_query", async (ctx: InlineQueryContext) => {
	console.info(
		"Received folder inline query command: ",
		ctx.update.inline_query.query,
	);

	const links = await fetchLinks("https://folder.jegtnes.com");

	const result: InlineQueryResult[] = links
		.map((link) => {
			const extRx = link.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
			const ext = extRx?.[1];
			console.log("Extension", ext);
			if (ext === "jpg") {
				const title = new URL(link).pathname.slice(1);
				return {
					type: "photo",
					id: uuidV5(link, uuidV5.URL),
					photo_url: link,
					thumbnail_url: link,
					title,
				} as InlineQueryResultPhoto;
			}
			if (ext === "gif") {
				const title = new URL(link).pathname.slice(1);
				return {
					type: "gif",
					id: uuidV5(link, uuidV5.URL),
					gif_url: link,
					thumbnail_url: link,
					title,
				} as InlineQueryResultGif;
			}
		})
		.filter((item): item is InlineQueryResultPhoto => item !== undefined);

	if (!result || result.length === 0) {
		return [];
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

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
