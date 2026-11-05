//Xeno Exe
const axios = require('axios')
const tts = require('google-tts-api')
module.exports = [
  {
    name: 'weather', category: 'tools', desc: 'Weather of a place',
    execute: async (sock, m, { text }) => {
      if (!text) return m.reply('Give a place name')
      const r = await axios.get('https://wttr.in/' + encodeURIComponent(text) + '?format=%l:+%c+%t+(feels+%f)+humidity+%h+wind+%w', { timeout: 20000 })
      await m.reply(String(r.data))
    }
  },
  {
    name: 'tts', category: 'tools', desc: 'Text to speech: tts ml hello',
    execute: async (sock, m, { args }) => {
      let lang = 'en'
      if (args[0] && /^[a-z]{2}(-[A-Za-z]{2})?$/.test(args[0]) && args.length > 1) lang = args.shift()
      const t = args.join(' ') || (m.quoted && m.quoted.text)
      if (!t) return m.reply('Give a text')
      const url = tts.getAudioUrl(t.slice(0, 200), { lang, slow: false, host: 'https://translate.google.com' })
      await sock.sendMessage(m.chat, { audio: { url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: m.raw })
    }
  },
  {
    name: 'joke', category: 'tools', desc: 'Random joke',
    execute: async (sock, m) => {
      const r = await axios.get('https://official-joke-api.appspot.com/random_joke', { timeout: 20000 })
      await m.reply(r.data.setup + '\n\n' + r.data.punchline + ' 😂')
    }
  },
  {
    name: 'fact', category: 'tools', desc: 'Random fact',
    execute: async (sock, m) => {
      const r = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', { timeout: 20000 })
      await m.reply('💡 ' + r.data.text)
    }
  }
]
