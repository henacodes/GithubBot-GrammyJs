import { Bot, session } from "grammy";
import dotenv from "dotenv";

// utility functions and objects
import { commands, initialState } from "./utills.js";

// Load env variables
dotenv.config();
// connect to the bot
const bot = new Bot(process.env.BOT_TOKEN);

bot.api.setMyCommands(commands);

bot.use(session(initialState));
bot.command("start", (ctx) => {
  ctx.reply("Welcome to Github browser bot!\n what do you wanna do?", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "search repo", callback_data: "repo" },
          { text: "search repo", callback_data: "repo" },
        ],
      ],
      remove_keyboard: true,
    },
  });
});

bot.callbackQuery("repo", async (ctx) => {
  ctx.deleteMessage();
  ctx.reply("repo search mode");
});

bot.callbackQuery("user", async (ctx) => {
  ctx.reply("user search mode");
});

bot.on("message:entities:mention", (ctx) => {
  ctx.reply("mentioned someone");
});

bot.start();
