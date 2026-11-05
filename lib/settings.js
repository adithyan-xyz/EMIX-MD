//Xeno Exe
const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, '../data/settings.json')
let db = {}
try { db = JSON.parse(fs.readFileSync(file, 'utf8')) } catch (e) { db = {} }
const save = () => { try { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(db, null, 2)) } catch (e) {} }
module.exports = {
  get: (jid, key, def) => (db[jid] && db[jid][key] !== undefined ? db[jid][key] : def),
  set: (jid, key, val) => { db[jid] = db[jid] || {}; db[jid][key] = val; save() }
}
