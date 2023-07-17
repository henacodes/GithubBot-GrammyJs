import { Bot, session, InlineKeyboard, InlineQueryResultBuilder } from "grammy";
import dotenv from "dotenv";
import { Octokit } from "octokit";
import axios from "axios";

// utility functions and objects
import { commands, initialState, salute, searchUsers } from "./utills.js";

// Load env variables
dotenv.config();
// connect to the bot
const bot = new Bot(process.env.BOT_TOKEN);
// Connect Github
const octokit = new Octokit({
  auth: process.env.GIT_AUTH,
});

bot.api.setMyCommands(commands);

bot.use(session(initialState));

bot.command("start", (ctx) => {
  salute(ctx);
});

bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query;

  const users = await searchUsers(octokit, query);
  const results = users.map((user) => {
    return InlineQueryResultBuilder.article(user.id, user.login, {
      thumbnail_url: user.avatar_url,
    }).text(`@${user.login}`);
  });

  // Answer the inline query.
  await ctx.answerInlineQuery(
    results, // answer with result list
    { cache_time: 30 * 24 * 3600 } // 30 days in seconds
  );
});

bot.callbackQuery("repo", async (ctx) => {
  ctx.reply("repo search mode");
});

bot.callbackQuery("user", async (ctx) => {
  ctx.reply("user search mode");
});

bot.on("message:entities:mention", (ctx) => {
  ctx.reply("mentioned someone");
});

bot.start();
