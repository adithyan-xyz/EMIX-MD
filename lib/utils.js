//Xeno Exe
const axios = require('axios')
const num = j => String(j || '').split('@')[0].split(':')[0]
const runtime = s => {
  s = Math.floor(s)
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60)
  return (d ? d + 'd ' : '') + h + 'h ' + m + 'm ' + (s % 60) + 's'
}
const pickUrl = (o, keys = ['download_url', 'downloadUrl', 'url', 'link', 'video', 'mp4', 'audio', 'mp3', 'result', 'data']) => {
  if (!o) return null
  if (typeof o === 'string') return /^https?:\/\//.test(o) ? o : null
  if (Array.isArray(o)) { for (const i of o) { const r = pickUrl(i, keys); if (r) return r } return null }
  if (typeof o === 'object') {
    for (const k of keys) if (k in o) { const r = pickUrl(o[k], keys); if (r) return r }
    for (const k in o) { const r = pickUrl(o[k], keys); if (r) return r }
  }
  return null
}
const getJSON = async (url, timeout = 60000) => (await axios.get(url, { timeout })).data
const getTarget = (m, args) => {
  if (m.mentioned && m.mentioned[0]) return m.mentioned[0]
  if (m.quoted && m.quoted.sender) return m.quoted.sender
  const n = (args[0] || '').replace(/\D/g, '')
  return n ? n + '@s.whatsapp.net' : null
}
module.exports = { num, runtime, pickUrl, getJSON, getTarget }
