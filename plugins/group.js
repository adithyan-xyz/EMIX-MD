//Xeno Exe
const settings = require('../lib/settings')
const { num, getTarget } = require('../lib/utils')
const toggle = (name, key, desc) => ({
  name, category: 'group', group: true, admin: true, desc,
  execute: async (sock, m, { args, prefix }) => {
    const v = (args[0] || '').toLowerCase()
    if (!['on', 'off'].includes(v)) return m.reply('Use: ' + prefix + name + ' on|off')
    settings.set(m.chat, key, v === 'on')
    await m.reply(name + ' is now *' + v + '*')
  }
})
const act = (name, aliases, action, desc, done) => ({
  name, aliases, category: 'group', group: true, admin: true, botAdmin: true, desc,
  execute: async (sock, m, { args }) => {
    const t = getTarget(m, args)
    if (!t) return m.reply('Mention or reply to a user')
    await sock.groupParticipantsUpdate(m.chat, [t], action)
    await sock.sendMessage(m.chat, { text: '@' + num(t) + ' ' + done, mentions: [t] }, { quoted: m.raw })
  }
})
module.exports = [
  {
    name: 'tagall', aliases: ['everyone'], category: 'group', group: true, admin: true, desc: 'Mention all members',
    execute: async (sock, m, { text, meta }) => {
      const ids = meta.participants.map(p => p.id)
      let t = '*📢 ' + (text || 'Attention everyone') + '*\n\n'
      for (const id of ids) t += '• @' + num(id) + '\n'
      await sock.sendMessage(m.chat, { text: t, mentions: ids }, { quoted: m.raw })
    }
  },
  {
    name: 'hidetag', aliases: ['tag'], category: 'group', group: true, admin: true, desc: 'Silent mention all',
    execute: async (sock, m, { text, meta }) => {
      await sock.sendMessage(m.chat, { text: text || (m.quoted && m.quoted.text) || '', mentions: meta.participants.map(p => p.id) })
    }
  },
  act('kick', ['remove'], 'remove', 'Remove a member', 'removed'),
  act('promote', [], 'promote', 'Make admin', 'is now admin'),
  act('demote', [], 'demote', 'Remove admin', 'is no longer admin'),
  {
    name: 'add', category: 'group', group: true, admin: true, botAdmin: true, desc: 'Add a number',
    execute: async (sock, m, { args }) => {
      const n = (args[0] || '').replace(/\D/g, '')
      if (!n) return m.reply('Give a number with country code')
      const r = await sock.groupParticipantsUpdate(m.chat, [n + '@s.whatsapp.net'], 'add')
      await m.reply('Result: ' + (r[0] && r[0].status))
    }
  },
  {
    name: 'mute', aliases: ['close'], category: 'group', group: true, admin: true, botAdmin: true, desc: 'Only admins can send',
    execute: async (sock, m) => { await sock.groupSettingUpdate(m.chat, 'announcement'); await m.reply('Group closed 🔒') }
  },
  {
    name: 'unmute', aliases: ['open'], category: 'group', group: true, admin: true, botAdmin: true, desc: 'Everyone can send',
    execute: async (sock, m) => { await sock.groupSettingUpdate(m.chat, 'not_announcement'); await m.reply('Group opened 🔓') }
  },
  {
    name: 'link', aliases: ['grouplink'], category: 'group', group: true, botAdmin: true, desc: 'Group invite link',
    execute: async (sock, m) => m.reply('https://chat.whatsapp.com/' + await sock.groupInviteCode(m.chat))
  },
  {
    name: 'revoke', category: 'group', group: true, admin: true, botAdmin: true, desc: 'Reset invite link',
    execute: async (sock, m) => { await sock.groupRevokeInvite(m.chat); await m.reply('Invite link reset') }
  },
  {
    name: 'setname', category: 'group', group: true, admin: true, botAdmin: true, desc: 'Change group name',
    execute: async (sock, m, { text }) => { if (!text) return m.reply('Give a name'); await sock.groupUpdateSubject(m.chat, text); await m.reply('Done') }
  },
  {
    name: 'setdesc', category: 'group', group: true, admin: true, botAdmin: true, desc: 'Change group description',
    execute: async (sock, m, { text }) => { if (!text) return m.reply('Give a description'); await sock.groupUpdateDescription(m.chat, text); await m.reply('Done') }
  },
  {
    name: 'admins', category: 'group', group: true, desc: 'List admins',
    execute: async (sock, m, { meta }) => {
      const a = meta.participants.filter(p => p.admin).map(p => p.id)
      await sock.sendMessage(m.chat, { text: '*Admins*\n\n' + a.map(x => '• @' + num(x)).join('\n'), mentions: a }, { quoted: m.raw })
    }
  },
  {
    name: 'groupinfo', aliases: ['ginfo'], category: 'group', group: true, desc: 'Group information',
    execute: async (sock, m, { meta }) => {
      await m.reply('*' + meta.subject + '*\n\nMembers: ' + meta.participants.length + '\nAdmins: ' + meta.participants.filter(p => p.admin).length + '\nCreated: ' + new Date(meta.creation * 1000).toDateString() + '\n\n' + (meta.desc || 'No description'))
    }
  },
  {
    name: 'del', aliases: ['delete'], category: 'group', group: true, admin: true, botAdmin: true, desc: 'Delete replied message',
    execute: async (sock, m) => {
      if (!m.quoted) return m.reply('Reply to a message')
      await sock.sendMessage(m.chat, { delete: m.quoted.key })
    }
  },
  toggle('antilink', 'antilink', 'Remove members who send group links'),
  toggle('welcome', 'welcome', 'Welcome and goodbye messages')
]
