export const commands = [
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help text" },
];

export const salute = (ctx) => {
  return ctx.reply(
    "Welcome to Github browser bot!\n you can send me a github repo link. \n you can also type @github_browser_bot to search for users and download their repo "
  );
};

export const initialState = () => {
  return { currentUser: "" };
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
  const DEFAULT_QUERY = "default search query";
  const response = await octokit.rest.search.users({
    q: query || DEFAULT_QUERY,
  });
  return response.data.items;
};

export const showUser = async (
  ctx,
  name,
  username,
  bio,
  img,
  followers,
  following
) => {
  await ctx.api.sendPhoto(ctx.chat.id, img, {
    caption: `${
      name + ` (@${username} ) `
    }\n${bio}\n${followers} followers\n${following} following
  
      `,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Repos",
            callback_data: `repos`,
          },
        ],
      ],
      remove_keyboard: true,
    },
  });
};

export const sendRepos = (ctx, repos, username) => {
  ctx.api.sendMessage(ctx.chat.id, `Here the last 10 repos of @${username}`, {
    reply_markup: {
      inline_keyboard: [
        ...repos.map((repo) => [
          {
            text: repo.name,
            callback_data: `repo ${username} ${repo.name}`,
          },
        ]),
      ],
    },
  });
};
