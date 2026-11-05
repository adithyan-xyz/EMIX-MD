//Xeno Exe
const config = require('../config')
const settings = require('../lib/settings')
const { getTarget } = require('../lib/utils')
const keys = ['antidelete', 'autoread', 'statusseen', 'anticall']
module.exports = [
  {
    name: 'mode', category: 'owner', owner: true, desc: 'Set mode public or private',
    execute: async (sock, m, { args }) => {
      const v = (args[0] || '').toLowerCase()
      if (!['public', 'private'].includes(v)) return m.reply('Use: mode public | private')
      settings.set('global', 'mode', v)
      await m.reply('Mode set to *' + v + '*')
    }
  },
  {
    name: 'setprefix', category: 'owner', owner: true, desc: 'Change prefix',
    execute: async (sock, m, { args }) => {
      if (!args[0]) return m.reply('Give a prefix')
      settings.set('global', 'prefix', args[0])
      await m.reply('Prefix set to *' + args[0] + '*')
    }
  },
  {
    name: 'set', category: 'owner', owner: true, desc: 'Toggle antidelete, autoread, statusseen, anticall',
    execute: async (sock, m, { args, prefix }) => {
      const k = (args[0] || '').toLowerCase()
      const v = (args[1] || '').toLowerCase()
      if (!keys.includes(k) || !['on', 'off'].includes(v)) return m.reply('Use: ' + prefix + 'set <' + keys.join('|') + '> on|off')
      settings.set('global', k, v === 'on')
      await m.reply(k + ' is now *' + v + '*')
    }
  },
  {
    name: 'restart', category: 'owner', owner: true, desc: 'Restart the bot',
    execute: async (sock, m) => { await m.reply('Restarting...'); setTimeout(() => process.exit(0), 1000) }
  },
  {
    name: 'block', category: 'owner', owner: true, desc: 'Block a user',
    execute: async (sock, m, { args }) => {
      const t = getTarget(m, args) || (!m.isGroup ? m.chat : null)
      if (!t) return m.reply('Mention or reply to a user')
      await sock.updateBlockStatus(t, 'block')
      await m.reply('Blocked')
    }
  },
  {
    name: 'unblock', category: 'owner', owner: true, desc: 'Unblock a user',
    execute: async (sock, m, { args }) => {
      const t = getTarget(m, args) || (!m.isGroup ? m.chat : null)
      if (!t) return m.reply('Mention or reply to a user')
      await sock.updateBlockStatus(t, 'unblock')
      await m.reply('Unblocked')
    }
  },
  {
    name: 'join', category: 'owner', owner: true, desc: 'Join group by link',
    execute: async (sock, m, { text }) => {
      const mt = text.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
      if (!mt) return m.reply('Give a group invite link')
      await sock.groupAcceptInvite(mt[1])
      await m.reply('Joined')
    }
  },
  {
    name: 'leave', category: 'owner', owner: true, group: true, desc: 'Leave this group',
    execute: async (sock, m) => { await m.reply('Bye 👋'); await sock.groupLeave(m.chat) }
  },
  {
    name: 'bc', aliases: ['broadcast'], category: 'owner', owner: true, desc: 'Broadcast to all groups',
    execute: async (sock, m, { text }) => {
      if (!text) return m.reply('Give a message')
      const groups = Object.keys(await sock.groupFetchAllParticipating())
      let n = 0
      for (const id of groups) {
        await sock.sendMessage(id, { text: '*' + config.BOT_NAME + ' Broadcast*\n\n' + text }).catch(() => {})
        n++
        await new Promise(r => setTimeout(r, 1500))
      }
      await m.reply('Sent to ' + n + ' groups')
    }
  },
  {
    name: 'setbio', category: 'owner', owner: true, desc: 'Change bot bio',
    execute: async (sock, m, { text }) => {
      if (!text) return m.reply('Give a bio')
      await sock.updateProfileStatus(text)
      await m.reply('Bio updated')
    }
  }
]
