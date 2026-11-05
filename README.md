# XENO XD - Multi Device WhatsApp Bot

Baileys based multi device bot with plugin system, multi session support and pairing site session restore.

## Get a session
Open your pairing site https://xeno-xd-pair-6hpe.onrender.com/ , pair your number and copy the SESSION_ID it gives.

## Setup
1. Install Node 18+ , git and ffmpeg
2. `npm install`
3. `cp config.env.example config.env` and fill it
4. `npm start`

## config.env
| Key | Meaning |
|-----|---------|
| SESSION_ID | Session from the pairing site. Several sessions: separate with commas (each one runs as its own bot) |
| PAIR_NUMBER | Optional. If no SESSION_ID, bot prints a pairing code for this number (country code, no +) |
| OWNER | Owner numbers, comma separated |
| PREFIX | Command prefix |
| MODE | private (owner only) or public |
| AUTO_READ, AUTO_STATUS_SEEN, ANTI_DELETE, ANTI_CALL, ALWAYS_ONLINE | true / false |
| API_SONG, API_YTV, API_IGDL, API_TIKTOK | Download APIs, replace anytime |

Session format accepted: base64 of creds.json, gzip+base64, raw creds JSON, or any of those with a prefix ending in `~` (example `XENO~....`).

## Deploy
- Render: push to GitHub, create a Web Service (Docker), add SESSION_ID and OWNER in Environment.
- VPS: `npm i -g pm2 && pm2 start ecosystem.config.js`
- Docker: `docker build -t xeno-xd . && docker run -d --env-file config.env xeno-xd`

## Commands
Type `.menu`. Categories: general, owner, group, media, download, tools.

Owner runtime toggles: `.mode public`, `.setprefix !`, `.set antidelete on`, `.set autoread on`, `.set statusseen on`, `.set anticall on`.
Group toggles: `.antilink on`, `.welcome on`.

## Add a plugin
Create a file in `plugins/`:
```js
module.exports = {
  name: 'hello',
  aliases: ['hi'],
  category: 'fun',
  desc: 'Say hello',
  execute: async (sock, m, { args, text, isOwner, isAdmin }) => {
    await m.reply('Hello ' + m.pushName)
  }
}
```
Flags: `owner`, `group`, `admin`, `botAdmin`. A file can also export an array of commands.

## Custom Baileys fork
Everything imports Baileys from `lib/baileys.js`. To use your own fork change that one line.
