import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from 'dotenv';

config();

const botKey: string = process.env.BOT_TOKEN || "";
const domain: string = process.env.DOMAIN || "";
const port: number = parseInt(process.env.PORT || '0', 10);

console.info('Started bot process');

const bot = new Telegraf(botKey);

bot.start((ctx: any) => ctx.reply('Welcome'));
bot.help((ctx: any) => {
    ctx.reply('Send me a sticker')
});

bot.on(message('sticker'), (ctx: any) => {
    console.info('Received sticker');
    ctx.reply('👍')
});

bot.hears('hi', (ctx: any) => {
    console.info('Received "hi"');
    ctx.reply('Hey there')
})

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
