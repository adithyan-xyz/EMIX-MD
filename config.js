//Xeno Exe
require('dotenv').config({ path: './config.env' })
const bool = (v, d) => (v === undefined || v === '' ? d : String(v).toLowerCase() === 'true')
module.exports = {
  SESSION_ID: process.env.SESSION_ID || '',
  PAIR_NUMBER: (process.env.PAIR_NUMBER || '').replace(/\D/g, ''),
  OWNER: (process.env.OWNER || '').split(',').map(v => v.replace(/\D/g, '')).filter(Boolean),
  PREFIX: process.env.PREFIX || '.',
  MODE: (process.env.MODE || 'private').toLowerCase(),
  BOT_NAME: process.env.BOT_NAME || 'XENO XD',
  PACK: process.env.PACK || 'XENO XD',
  AUTHOR: process.env.AUTHOR || 'Xeno',
  PORT: process.env.PORT || 3000,
  AUTO_READ: bool(process.env.AUTO_READ, false),
  AUTO_STATUS_SEEN: bool(process.env.AUTO_STATUS_SEEN, false),
  ANTI_DELETE: bool(process.env.ANTI_DELETE, false),
  ANTI_CALL: bool(process.env.ANTI_CALL, false),
  ALWAYS_ONLINE: bool(process.env.ALWAYS_ONLINE, false),
  API_SONG: process.env.API_SONG || 'https://ameen-api.vercel.app/v2/ytd?url=',
  API_YTV: process.env.API_YTV || 'https://yt-quality-api.vercel.app/api/ytmp4?url=',
  API_IGDL: process.env.API_IGDL || 'https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=',
  API_TIKTOK: process.env.API_TIKTOK || 'https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url='
}
