/* global process */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../server/db.js';
import { TelegramAdmin } from '../server/models.js';
import { createTelegramBot, getTelegramConfig } from '../server/telegramBot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

if (process.env.ALLOW_INSECURE_TLS === 'true') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const getNextId = async (Model) => {
    const highest = await Model.findOne().sort('-id').exec();
    return highest && highest.id ? highest.id + 1 : 1;
};

await connectDB();

const bot = createTelegramBot({
    ...getTelegramConfig(),
    AdminModel: TelegramAdmin,
    getNextId
});

bot.start();

console.log('Premium Tools Telegram bot is running');
