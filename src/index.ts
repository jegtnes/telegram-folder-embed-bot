import { Context, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from 'dotenv';

config();

const botKey: string = process.env.BOT_TOKEN || "";
const domain: string = process.env.DOMAIN || "";
const port: number = parseInt(process.env.PORT || '0', 10);

console.info(`Started bot process at port ${port} at domain ${domain}`);

const bot = new Telegraf(botKey);

bot.start((ctx: Context) => ctx.reply('Welcome'));
bot.help((ctx: Context) => {
    ctx.reply('Send me a sticker')
});

bot.on(message('sticker'), (ctx: Context) => {
    console.info('Received sticker');
    ctx.reply('👍')
});

bot.hears('hi', (ctx: Context) => {
    console.info('Received "hi"');
    ctx.reply('Hey there')
})

bot.on('inline_query', async (ctx: Context) => {
    console.info('Received folder inline query command: ', ctx.update.inline_query.query);

    const result = []
    return await ctx.answerInlineQuery(result)
});

// Start webhook via launch method (preferred)
bot.launch({
    webhook: {
        domain: domain,
        port: port,
    },
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
