require("dotenv").config();
const Card = require("../src/Card");
const Discord = require("discord.js");
const imageToBase64 = require("image-to-base64");

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

async function parsePresence(user) {
  const username = processText(user.username);
  let pfpImage = user.displayAvatarURL({
    format: "jpg",
    dynamic: true,
    size: 512,
  });
  pfpImage = await imageToBase64(pfpImage);
  pfpImage = "data:image/png;base64," + pfpImage;

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
      height: 97,
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
      height: 97,
    };
  }

  // console.log(gameObject);

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
      height: 150,
    };
  }

  const details = gameObject.details ? processText(gameObject.details) : "";

  let detailsImage = false;
  if (gameObject.assets && gameObject.assets.largeImage) {
    detailsImage = `https://cdn.discordapp.com/app-assets/${gameObject.applicationID}/${gameObject.assets.largeImage}.png`;

    if (game == "Spotify")
      detailsImage = `https://i.scdn.co/image/${gameObject.assets.largeImage.replace(
        "spotify:",
        ""
      )}`;

    detailsImage = await imageToBase64(detailsImage);
    detailsImage = "data:image/png;base64," + detailsImage;
  }

  const state = gameObject.state ? processText(gameObject.state) : "";

  return {
    username,
    pfpImage,
    status,
    game,
    gameType,
    details,
    detailsImage,
    state,
    height: 187,
  };
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=30");

  const { id } = req.query;

  const client = new Discord.Client();

  client.login(process.env.BOTTOKEN).then(async () => {
    const member = await client.guilds
      .fetch("745179308930236427")
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

    // console.log(member);

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
      const cardContent = await parsePresence(member.user);
      card = new Card(cardContent);
    }

    return res.send(card.render());
  });
};
