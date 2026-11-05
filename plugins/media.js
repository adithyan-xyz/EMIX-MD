//Xeno Exe
const config = require('../config')
const sharp = require('sharp')
const { Sticker, StickerTypes } = require('wa-sticker-formatter')
const pick = (m, types) => {
  if (m.quoted && types.includes(m.quoted.type)) return m.quoted
  if (types.includes(m.type)) return m
  return null
}
module.exports = [
  {
    name: 'sticker', aliases: ['s', 'stic'], category: 'media', desc: 'Image or video to sticker',
    execute: async (sock, m, { text }) => {
      const src = pick(m, ['imageMessage', 'videoMessage'])
      if (!src) return m.reply('Reply to an image or video')
      const [pack, author] = text.includes('|') ? text.split('|').map(x => x.trim()) : [config.PACK, config.AUTHOR]
      const buf = await src.download()
      const s = new Sticker(buf, { pack, author, type: StickerTypes.FULL, quality: 60 })
      await sock.sendMessage(m.chat, { sticker: await s.toBuffer() }, { quoted: m.raw })
    }
  },
  {
    name: 'take', category: 'media', desc: 'Change sticker pack and author',
    execute: async (sock, m, { text }) => {
      if (!m.quoted || m.quoted.type !== 'stickerMessage') return m.reply('Reply to a sticker')
      const [pack, author] = text.includes('|') ? text.split('|').map(x => x.trim()) : [text || config.PACK, config.AUTHOR]
      const s = new Sticker(await m.quoted.download(), { pack, author, type: StickerTypes.FULL })
      await sock.sendMessage(m.chat, { sticker: await s.toBuffer() }, { quoted: m.raw })
    }
  },
  {
    name: 'toimg', aliases: ['photo'], category: 'media', desc: 'Sticker to image',
    execute: async (sock, m) => {
      if (!m.quoted || m.quoted.type !== 'stickerMessage') return m.reply('Reply to a sticker')
      const png = await sharp(await m.quoted.download()).png().toBuffer()
      await sock.sendMessage(m.chat, { image: png }, { quoted: m.raw })
    }
  },
  {
    name: 'vv', aliases: ['reveal'], category: 'media', desc: 'Reveal view once media',
    execute: async (sock, m) => {
      if (!m.quoted) return m.reply('Reply to a view once message')
      const t = m.quoted.type
      const buf = await m.quoted.download()
      if (t === 'imageMessage') return sock.sendMessage(m.chat, { image: buf, caption: m.quoted.text }, { quoted: m.raw })
      if (t === 'videoMessage') return sock.sendMessage(m.chat, { video: buf, caption: m.quoted.text }, { quoted: m.raw })
      if (t === 'audioMessage') return sock.sendMessage(m.chat, { audio: buf, mimetype: 'audio/mpeg' }, { quoted: m.raw })
      await m.reply('Unsupported media')
    }
  }
]
