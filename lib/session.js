//Xeno Exe
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const axios = require('axios')
const config = require('../config')
const decode = s => {
  try {
    s = String(s).trim()
    if (s.startsWith('{')) { JSON.parse(s); return s }
    let buf = Buffer.from(s, 'base64')
    if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf)
    const txt = buf.toString('utf8')
    JSON.parse(txt)
    return txt
  } catch (e) { return null }
}
const isCreds = o => o && typeof o === 'object' && (o.noiseKey || o.signedIdentityKey || o.me)
const extract = (d, depth = 0) => {
  if (!d || depth > 4) return null
  if (typeof d === 'string') { const t = decode(d); if (t && isCreds(JSON.parse(t))) return t; return null }
  if (typeof d === 'object') {
    if (isCreds(d)) return JSON.stringify(d)
    for (const k of ['creds', 'session', 'data', 'result', 'content', 'value', 'file']) {
      if (d[k] !== undefined) { const r = extract(d[k], depth + 1); if (r) return r }
    }
    for (const k in d) { const r = extract(d[k], depth + 1); if (r) return r }
  }
  return null
}
const urls = (id, full) => {
  const e = encodeURIComponent(id)
  if (config.SESSION_API) return [config.SESSION_API.includes('{id}') ? config.SESSION_API.split('{id}').join(encodeURIComponent(full)) : config.SESSION_API + encodeURIComponent(full)]
  const b = (config.SESSION_BASE || 'https://xeno-xd-pair-6hpe.onrender.com').replace(/\/$/, '')
  return [
    b + '/session?q=' + encodeURIComponent(full),
    b + '/session?q=' + e,
    b + '/session/' + e, b + '/api/session/' + e, b + '/sessions/' + e, b + '/get/' + e, b + '/api/get/' + e,
    b + '/download/' + e, b + '/api/download/' + e, b + '/creds/' + e, b + '/api/creds/' + e,
    b + '/session?id=' + e, b + '/api/session?id=' + e, b + '/get?id=' + e, b + '/api/get?id=' + e,
    b + '/download?id=' + e, b + '/creds?id=' + e, b + '/session?session=' + e, b + '/api/session?session=' + e
  ]
}
module.exports = async (raw, dir) => {
  try {
    const file = path.join(dir, 'creds.json')
    if (fs.existsSync(file)) return true
    const s = String(raw).trim()
    const id = s.includes('~') ? s.split('~').pop() : s
    let txt = decode(s) || decode(id)
    if (txt && !isCreds(JSON.parse(txt))) txt = null
    if (!txt) {
      const list = urls(id, s)
      for (const u of list) {
        try {
          const r = await axios.get(u, { timeout: 60000, validateStatus: () => true, headers: { Accept: 'application/json' } })
          console.log('session fetch ' + u.split(id).join('<id>') + ' -> ' + r.status)
          if (r.status !== 200) continue
          txt = extract(r.data)
          if (txt) { console.log('session fetched from ' + u.split(id).join('<id>')); break }
        } catch (e) { console.log('session fetch error: ' + e.message) }
      }
    }
    if (!txt) {
      console.log('Could not get credentials for this session id. Set SESSION_API to the exact URL that returns the creds (use {id} where the id goes).')
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
