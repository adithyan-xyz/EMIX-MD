//Xeno Exe
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
module.exports = (raw, dir) => {
  try {
    const file = path.join(dir, 'creds.json')
    if (fs.existsSync(file)) return true
    let s = String(raw).trim()
    let txt
    if (s.startsWith('{')) txt = s
    else {
      if (s.includes('~')) s = s.split('~').pop()
      let buf = Buffer.from(s, 'base64')
      if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf)
      txt = buf.toString('utf8')
    }
    JSON.parse(txt)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(file, txt)
    return true
  } catch (e) {
    console.log('session restore failed:', e.message)
    return false
  }
}
