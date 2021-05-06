![Repo Banner](./src/assets/badgebanner.png)

<h1 align="center">Discord README Badge</h1>

Working in an IDE with Rich Presence on? Show off what you're working on with a README badge! Comes as a svg you can add anywhere you'd like. Inspired by [kittinan/spotify-github-profile](https://github.com/kittinan/spotify-github-profile) and [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats). Built by leveraging Vercel's serverless functions.

## Getting started

First off, you will need your Discord user ID. If you're unsure how, follow [this guide](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-).

In order to grab your Discord status and Rich Presence data, you will have to join [this discord server](https://discord.gg/MqSew5KzYp). For privacy's sake, there is no members list, you'll temporarily join a voice channel (where invites can be created).

Once you've joined, you can add a badge to your profile using this snippet:

```
![My Discord](https://discord-readme-badge.vercel.app/api?id=<your discord id>)
```

It should look something like this:
![Card with Rich Presence](./src/assets/example-richpresence.svg)

## Card states

The card will only display certain games. Since this is meant to show off what you're working on, they are IDEs and creative programs. The full list of shown games can be found at [allowlistGames.js](./src/allowlistGames.js). If there are missing ones you would like to add, create a pull request.

If the game you're playing does not have rich presence, it will look something like this:
![Card without Rich Presence](./src/assets/example-game.svg)

If you're not playing anything, it will just show your status:
![Card Default](./src/assets/example-nogame.svg)
