//Xeno Exe
const config = require('../config')
const { runtime, num } = require('../lib/utils')
const os = require('os')
module.exports = [
  {
    name: 'menu', aliases: ['help', 'list', 'cmds'], category: 'general', desc: 'Show all commands',
    execute: async (sock, m, { list, prefix, mode }) => {
      const cats = {}
      for (const c of list) { const k = c.category || 'other'; if (!cats[k]) cats[k] = []; cats[k].push(c) }
      let t = '╭━━━〔 *' + config.BOT_NAME + '* 〕━━━╮\n'
      t += '┃ ⎈ User: ' + (m.pushName || num(m.sender)) + '\n'
      t += '┃ ⎈ Mode: ' + mode + '\n'
      t += '┃ ⎈ Prefix: ' + prefix + '\n'
      t += '┃ ⎈ Uptime: ' + runtime(process.uptime()) + '\n'
      t += '┃ ⎈ Commands: ' + list.length + '\n╰━━━━━━━━━━━━━━━━━╯\n'
      for (const k of Object.keys(cats).sort()) {
        t += '\n╭─「 *' + k.toUpperCase() + '* 」\n'
        for (const c of cats[k]) t += '│ ◦ ' + prefix + c.name + '\n'
        t += '╰────────────\n'
      }
      t += '\n_XENO XD' + config.BOT_NAME + '_'
      await m.reply(t)
    }
  },
  {
    name: 'ping', aliases: ['speed'], category: 'general', desc: 'Check bot speed',
    execute: async (sock, m) => {
      const s = Date.now()
      const r = await sock.sendMessage(m.chat, { text: 'Pinging...' }, { quoted: m.raw })
      await sock.sendMessage(m.chat, { text: '_Latency_ ' + (Date.now() - s) + ' ms', edit: r.key })
    }
  },
  {
    name: 'alive', category: 'general', desc: 'Bot status',
    execute: async (sock, m, { mode }) => {
      await m.reply('*' + config.BOT_NAME + '* is alive \nUptime: ' + runtime(process.uptime()) + '\nMode: ' + mode + '\nRAM: ' + Math.round((os.totalmem() - os.freemem()) / 1048576) + ' MB used\nNode: ' + process.version)
    }
  },
  {
    name: 'runtime', aliases: ['uptime'], category: 'general', desc: 'Bot uptime',
    execute: async (sock, m) => m.reply('⎈' + runtime(process.uptime()))
  },
  {
    name: 'owner', category: 'general', desc: 'Owner contact',
    execute: async (sock, m) => {
      const o = config.OWNER[0] || num(sock.user.id)
      const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:' + config.BOT_NAME + ' Owner\nTEL;type=CELL;waid=' + o + ':+' + o + '\nEND:VCARD'
      await sock.sendMessage(m.chat, { contacts: { displayName: 'Owner', contacts: [{ vcard }] } }, { quoted: m.raw })
    }
  },
  {
    name: 'jid', category: 'general', desc: 'Get chat or user jid',
    execute: async (sock, m) => m.reply(m.quoted ? m.quoted.sender : m.chat)
  }
]
