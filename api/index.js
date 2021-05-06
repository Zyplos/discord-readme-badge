require("dotenv").config();
const Card = require("../src/Card");
const Discord = require("discord.js");

const allowlistGames = require("../src/allowlistGames");

const truncate = (input) =>
  input.length > 32 ? `${input.substring(0, 32)}...` : input;

const encodeHTML = (input) => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const processText = (input) => {
  return encodeHTML(truncate(input));
};

function parsePresence(user) {
  const username = processText(user.username);
  const pfpImage = user.displayAvatarURL({
    format: "jpg",
    dynamic: true,
    size: 512,
  });

  const statuses = user.presence.clientStatus;
  if (!statuses) {
    return {
      username,
      pfpImage,
      status: "offline",
      gameType: "Offline",
      game: "",
      details: "",
      detailsImage: false,
      state: "",
    };
  }
  const status = statuses.desktop || statuses.mobile || statuses.web;

  const playingRichGame = user.presence.activities
    .reverse()
    .find(
      (e) =>
        allowlistGames.includes(e.name.toLowerCase()) && (e.details || e.state)
    );
  const playingGame = user.presence.activities
    .reverse()
    .find(
      (e) =>
        allowlistGames.includes(e.name.toLowerCase()) && !e.details && !e.state
    );
  const spotifyGame = user.presence.activities.find(
    (e) => e.type == "LISTENING" && e.name == "Spotify"
  );

  const gameObject = playingRichGame || playingGame || spotifyGame;

  if (!gameObject) {
    return {
      username,
      pfpImage,
      status,
      gameType: "",
      game: "",
      details: "",
      detailsImage: false,
      state: "",
    };
  }

  console.log(gameObject);

  const game = processText(gameObject.name);
  let gameType = "Playing";

  if (game == "Spotify") gameType = "Listening to";

  if (!gameObject.details && !gameObject.state) {
    return {
      username,
      pfpImage,
      status,
      gameType,
      game,
      details: "",
      detailsImage: false,
      state: "",
    };
  }

  const details = processText(gameObject.details);

  let detailsImage = false;
  if (gameObject.assets && gameObject.assets.largeImage) {
    detailsImage = `https://cdn.discordapp.com/app-assets/${gameObject.applicationID}/${gameObject.assets.largeImage}.png`;

    if (game == "Spotify")
      detailsImage = `https://i.scdn.co/image/${gameObject.assets.largeImage.replace(
        "spotify:",
        ""
      )}`;
  }

  const state = processText(gameObject.state);

  return {
    username,
    pfpImage,
    status,
    game,
    gameType,
    details,
    detailsImage,
    state,
  };
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "image/svg+xml");

  const { id } = req.query;

  const client = new Discord.Client();

  client.login(process.env.BOTTOKEN).then(async () => {
    const member = await client.guilds
      .fetch("839432085856583730")
      .then(async (guild) => {
        return await guild.members
          .fetch({
            user: id,
            cache: false,
            force: true,
          })
          .catch((error) => {
            return error;
          });
      });
    client.destroy();

    console.log(member);

    let card;
    if (member instanceof Discord.DiscordAPIError) {
      card = new Card({
        username: "Error",
        pfpImage:
          "https://canary.discord.com/assets/1cbd08c76f8af6dddce02c5138971129.png",
        status: "dnd",
        game: "Zyplos/discord-readme-badge",
        gameType: "Check",
        details: processText(member.toString()),
        detailsImage: false,
        state: "Are you in the server? Correct ID?",
      });
    } else {
      card = new Card(parsePresence(member.user));
    }

    return res.send(card.render());
  });
};
