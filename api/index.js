const Card = require("../src/Card");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "image/svg+xml");

  const card = new Card({
    username: "Zyplos",
    pfpImage:
      "https://cdn.discordapp.com/avatars/204620732259368960/aafb013acb7c66b9084dfc941c9193fd.png?size=512",
    status: "dnd",
    game: "League of Legends",
    gameType: "Playing",
    details: "Summoner's Rift (Normal)",
    detailsImage:
      "https://cdn.discordapp.com/app-assets/383226320970055681/808841241142755358.png",
    state: "Teemo",
  });

  return res.send(card.render());
};
