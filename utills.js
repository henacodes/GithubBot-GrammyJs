export const commands = [
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help text" },
];

export const salute = (ctx) => {
  return ctx.reply("Welcome to Github browser bot!\n what do you wanna do?", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "search repo", callback_data: "repo" },
          { text: "search user", callback_data: "user" },
        ],
      ],
      remove_keyboard: true,
    },
  });
};

export const initialState = {
  user: false,
  repo: true,
};

export const fetchRepo = async (username, repo, octokit) => {
  try {
    const response = await octokit.request(
      `GET /repos/${username}/${repo}/zipball/{ref}`,
      {
        owner: username,
        repo: repo,
        ref: "",
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (octokit, query) => {
  const response = await octokit.rest.search.users({
    q: query,
  });

  return response.data.items;
};

export const showUser = (
  ctx,
  name,
  username,
  bio,
  img,
  followers,
  following
) => {
  ctx.telegram.sendPhoto(ctx.chat.id, img, {
    caption: `${
      name + ` (@${username} ) `
    }\n${bio}\n${followers} followers\n${following} following
  
      `,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Repos",
            callback_data: `repos ${username} `,
          },
        ],
      ],
    },
  });
};

export const sendRepos = (ctx, repos, username) => {
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `Here the last 10 repos of @${username}`,
    {
      reply_markup: {
        inline_keyboard: [
          ...repos.map((repo) => [
            { text: repo.name, callback_data: `repo ${username} ${repo.name}` },
          ]),
        ],
      },
    }
  );
};
