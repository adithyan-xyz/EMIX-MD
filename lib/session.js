//Xeno Exe
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const axios = require('axios')
const config = require('../config')
const decode = s => {
  try {
    if (s.startsWith('{')) { JSON.parse(s); return s }
    let buf = Buffer.from(s, 'base64')
    if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf)
    const txt = buf.toString('utf8')
    JSON.parse(txt)
    return txt
  } catch (e) { return null }
}
module.exports = async (raw, dir) => {
  try {
    const file = path.join(dir, 'creds.json')
    if (fs.existsSync(file)) return true
    const s = String(raw).trim()
    const id = s.includes('~') ? s.split('~').pop() : s
    let txt = decode(s) || decode(id)
    if (!txt && config.SESSION_API) {
      const url = config.SESSION_API.includes('{id}') ? config.SESSION_API.replace('{id}', encodeURIComponent(id)) : config.SESSION_API + encodeURIComponent(id)
      const r = await axios.get(url, { timeout: 30000 })
      const d = r.data
      if (d && typeof d === 'object') txt = JSON.stringify(d.creds || d.session || d.data || d)
      else if (typeof d === 'string') txt = decode(d.trim())
      if (txt) JSON.parse(txt)
    }
    if (!txt) {
      console.log('SESSION_ID is only a short lookup key (' + id.length + ' chars), not the credentials. Set SESSION_API to the URL that returns the creds for this id, or use PAIR_NUMBER.')
      return false
    }
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(file, txt)
    return true
  } catch (e) {
    console.log('session restore failed:', e.message)
    return false
  }
}
