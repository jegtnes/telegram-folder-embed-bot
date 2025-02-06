import type { Context } from "telegraf";

import { botName, botUsername } from "../index";

export function start(ctx: Context) {
	ctx.reply(`
Welcome to ${botName}! This is a Telegram bot that will let you embed GIFs and pictures from an Apache or Nginx directory listing.

To get started, type /addfolder followed by the folder name you'd like to embed, e.g. "/addfolder bukk.it"

This will then let you embed images and GIFs from that folder in any chat by typing, e.g. "@${botUsername} cat" to find images and videos with "cat" in the name.
`);
}
