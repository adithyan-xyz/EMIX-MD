//Xeno Exe
const yts = require('yt-search')
const config = require('../config')
const { getJSON, pickUrl } = require('../lib/utils')
const audioKeys = ['mp3', 'audio', 'download_url', 'downloadUrl', 'download', 'url', 'link', 'result', 'data']
const videoKeys = ['mp4', 'video', 'download_url', 'downloadUrl', 'download', 'url', 'link', 'result', 'data']
const resolve = async text => {
  if (/youtu\.?be/.test(text)) return { url: text.trim(), title: 'YouTube' }
  const r = await yts(text)
  const v = r.videos[0]
  if (!v) return null
  return { url: v.url, title: v.title, thumb: v.thumbnail, info: 'Duration: ' + v.timestamp + '\nViews: ' + v.views + '\nChannel: ' + v.author.name }
}
module.exports = [
  {
    name: 'play', aliases: ['song', 'mp3'], category: 'download', desc: 'Download song by name or link',
    execute: async (sock, m, { text, prefix }) => {
      if (!text) return m.reply('Use: ' + prefix + 'play <song name or youtube link>')
      const v = await resolve(text)
      if (!v) return m.reply('Nothing found')
      if (v.thumb) await sock.sendMessage(m.chat, { image: { url: v.thumb }, caption: '🎵 *' + v.title + '*\n' + v.info }, { quoted: m.raw })
      const data = await getJSON(config.API_SONG + encodeURIComponent(v.url))
      const dl = pickUrl(data, audioKeys)
      if (!dl) return m.reply('Song API returned nothing')
      await sock.sendMessage(m.chat, { audio: { url: dl }, mimetype: 'audio/mpeg', fileName: v.title + '.mp3' }, { quoted: m.raw })
    }
  },
  {
    name: 'ytv', aliases: ['video', 'yt'], category: 'download', desc: 'Download youtube video',
    execute: async (sock, m, { text, prefix }) => {
      if (!text) return m.reply('Use: ' + prefix + 'ytv <video name or youtube link>')
      const v = await resolve(text)
      if (!v) return m.reply('Nothing found')
      await m.reply('⏳ Downloading *' + v.title + '*')
      const data = await getJSON(config.API_YTV + encodeURIComponent(v.url))
      const dl = pickUrl(data, videoKeys)
      if (!dl) return m.reply('Video API returned nothing')
      await sock.sendMessage(m.chat, { video: { url: dl }, caption: '🎬 ' + v.title, mimetype: 'video/mp4' }, { quoted: m.raw })
    }
  },
  {
    name: 'ytsearch', aliases: ['yts'], category: 'download', desc: 'Search youtube',
    execute: async (sock, m, { text }) => {
      if (!text) return m.reply('Give a search term')
      const r = await yts(text)
      let t = '*YouTube results*\n\n'
      r.videos.slice(0, 8).forEach((v, i) => { t += (i + 1) + '. ' + v.title + '\n' + v.timestamp + ' | ' + v.url + '\n\n' })
      await m.reply(t)
    }
  },
  {
    name: 'igdl', aliases: ['insta', 'ig'], category: 'download', desc: 'Instagram reel or post downloader',
    execute: async (sock, m, { text }) => {
      if (!/instagram\.com/.test(text)) return m.reply('Give an instagram link')
      const data = await getJSON(config.API_IGDL + encodeURIComponent(text))
      const dl = pickUrl(data, videoKeys)
      if (!dl) return m.reply('Could not download')
      await sock.sendMessage(m.chat, { video: { url: dl }, caption: config.BOT_NAME }, { quoted: m.raw })
    }
  },
  {
    name: 'tiktok', aliases: ['tt'], category: 'download', desc: 'TikTok downloader',
    execute: async (sock, m, { text }) => {
      if (!/tiktok\.com/.test(text)) return m.reply('Give a tiktok link')
      const data = await getJSON(config.API_TIKTOK + encodeURIComponent(text))
      const dl = pickUrl(data, videoKeys)
      if (!dl) return m.reply('Could not download')
      await sock.sendMessage(m.chat, { video: { url: dl }, caption: config.BOT_NAME }, { quoted: m.raw })
    }
  }
]
