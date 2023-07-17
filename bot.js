import { Bot, session, InlineQueryResultBuilder, InputFile } from "grammy";
import dotenv from "dotenv";
import { Octokit } from "octokit";
import axios from "axios";
import fs from "fs";
// utility functions and objects
import {
  commands,
  initialState,
  salute,
  searchUsers,
  showUser,
  sendRepos,
  fetchRepo,
} from "./utills.js";

// Load env variables
dotenv.config();
// connect to the bot
const bot = new Bot(process.env.BOT_TOKEN);
// Connect Github
const octokit = new Octokit({
  auth: process.env.GIT_AUTH,
});

bot.api.setMyCommands(commands);

bot.use(session({ initial: initialState }));

bot.command("start", async (ctx) => {
  console.log(ctx.session);
  salute(ctx);
});

// fetch the last 10 repos of a user
bot.callbackQuery("repos", async (ctx) => {
  ctx.deleteMessage();
  const username = ctx.session.currentUser;
  try {
    axios.get(`https://api.github.com/users/${username}/repos`).then((res) => {
      const repos = res.data.slice(-10);
      sendRepos(ctx, repos, username);
    });
  } catch (error) {
    ctx.reply(error.message);
  }
});

// search users
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

// listen to mentions or messages that start with @
bot.on("message:entities:mention", async (ctx) => {
  const username = ctx.message.text.match(/@(\w+)/)[1];
  ctx.session.currentUser = username;
  try {
    const response = await octokit.rest.users.getByUsername({ username });
    const { name, avatar_url, bio, followers, following } = response.data;
    showUser(ctx, name, username, bio, avatar_url, followers, following);
  } catch (error) {
    ctx.reply(`A user with @${username} could not be found`);
  }
});

bot.on("callback_query", async (ctx) => {
  const query = ctx.callbackQuery;
  const [type, username, repoName] = query.data.split(" ");
  if (type === "repo") {
    try {
      const result = await fetchRepo(username, repoName, octokit);
      try {
        const fileBuffer = Buffer.from(result);
        ctx.api
          .sendDocument(
            ctx.chat.id,
            new InputFile(fileBuffer, `${username}-${repoName}.zip`),
            {
              thumbnail: new InputFile("./winrar.jpg"),
              caption: "File Arrived",
            }
          )
          .then((res) => res)
          .catch((err) => ctx.reply(err.message));
      } catch (error) {
        ctx.reply(error.message);
      }
    } catch (error) {
      ctx.reply("Can't fetch the repo. Please try again ...");
    }
  }
});

bot.on("message", (ctx) => {
  ctx.reply("repopeorpeop");
});

bot.start();
