//Xeno Exe
const fs = require('fs')
const path = require('path')
const config = require('../config')
const serialize = require('./serialize')
const settings = require('./settings')
const store = require('./store')
const { num } = require('./utils')
const commands = new Map()
const list = []
const load = dir => {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) { load(p); continue }
    if (!f.endsWith('.js')) continue
    try {
      let mod = require(p)
      mod = Array.isArray(mod) ? mod : [mod]
      for (const c of mod) {
        if (!c || !c.name || !c.execute) continue
        list.push(c)
        commands.set(c.name, c)
        for (const a of c.aliases || []) commands.set(a, c)
      }
    } catch (e) { console.log('plugin error in ' + f + ': ' + e.message) }
  }
}
load(path.join(__dirname, '../plugins'))
console.log('commands loaded: ' + list.length)
const metaCache = new Map()
const getMeta = async (sock, jid) => {
  const c = metaCache.get(jid)
  if (c && Date.now() - c.t < 60000) return c.d
  const d = await sock.groupMetadata(jid)
  metaCache.set(jid, { t: Date.now(), d })
  return d
}
const g = (key, def) => settings.get('global', key, def)
const handle = async (sock, raw) => {
  if (!raw.message) return
  const jid = raw.key.remoteJid
  if (jid === 'status@broadcast') {
    if (g('statusseen', config.AUTO_STATUS_SEEN)) await sock.readMessages([raw.key])
    return
  }
  store.save(raw)
  const proto = raw.message.protocolMessage
  if (proto && proto.type === 0 && proto.key) {
    if (!g('antidelete', config.ANTI_DELETE)) return
    const old = store.get(proto.key.id)
    if (!old || old.key.fromMe) return
    const me = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    await sock.sendMessage(me, { text: 'Deleted message from @' + num(old.key.participant || old.key.remoteJid) + ' in ' + old.key.remoteJid, mentions: [old.key.participant || old.key.remoteJid] })
    await sock.sendMessage(me, { forward: old })
    return
  }
  const m = serialize(sock, raw)
  if (!m.type) return
  if (g('autoread', config.AUTO_READ)) sock.readMessages([raw.key]).catch(() => {})
  const botIds = [sock.user.id, sock.user.lid].filter(Boolean).map(num)
  const isOwner = m.fromMe || m.senders.some(s => config.OWNER.includes(num(s)) || botIds.includes(num(s)))
  let meta = null, isAdmin = false, isBotAdmin = false
  if (m.isGroup) {
    try {
      meta = await getMeta(sock, m.chat)
      const admins = new Set()
      for (const p of meta.participants) if (p.admin) [p.id, p.lid, p.phoneNumber, p.jid].filter(Boolean).forEach(x => admins.add(num(x)))
      isAdmin = m.senders.some(s => admins.has(num(s)))
      isBotAdmin = botIds.some(b => admins.has(b))
    } catch (e) {}
    if (settings.get(m.chat, 'antilink', false) && /chat\.whatsapp\.com\/[A-Za-z0-9]/i.test(m.body) && !isAdmin && !isOwner && !m.fromMe && isBotAdmin) {
      await sock.sendMessage(m.chat, { delete: raw.key })
      await sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {})
      return
    }
  }
  const prefix = g('prefix', config.PREFIX)
  if (!m.body || !m.body.startsWith(prefix)) return
  const parts = m.body.slice(prefix.length).trim().split(/\s+/)
  const command = (parts.shift() || '').toLowerCase()
  const cmd = commands.get(command)
  if (!cmd) return
  const mode = g('mode', config.MODE)
  if (mode === 'private' && !isOwner) return
  if (cmd.owner && !isOwner) return m.reply('Owner only command')
  if (cmd.group && !m.isGroup) return m.reply('This command works only in groups')
  if (cmd.admin && !(isAdmin || isOwner)) return m.reply('Only group admins can use this')
  if (cmd.botAdmin && !isBotAdmin) return m.reply('Make me admin first')
  const args = parts
  const text = args.join(' ')
  try {
    await cmd.execute(sock, m, { args, text, prefix, command, isOwner, isAdmin, isBotAdmin, meta, mode, list, config, settings })
  } catch (e) {
    console.log('command error [' + command + ']: ' + e.message)
    await sock.sendMessage(m.chat, { react: { text: '❌', key: raw.key } }).catch(() => {})
    await m.reply('Error: ' + e.message).catch(() => {})
  }
}
module.exports = {
  list,
  attach: sock => {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return
      for (const raw of messages) {
        try { await handle(sock, raw) } catch (e) { console.log('handler error: ' + e.message) }
      }
    })
  }
}
