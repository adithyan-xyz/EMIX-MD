//Xeno Exe
const map = new Map()
module.exports = {
  save: msg => { if (!msg.key || !msg.key.id) return; map.set(msg.key.id, msg); if (map.size > 1500) map.delete(map.keys().next().value) },
  get: id => map.get(id)
}
