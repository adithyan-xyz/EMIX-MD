//Xeno Exe
const config = require('../config')
const settings = require('./settings')
const { num } = require('./utils')
module.exports = sock => {
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      if (!settings.get(id, 'welcome', false)) return
      if (action !== 'add' && action !== 'remove') return
      const meta = await sock.groupMetadata(id)
      for (const p of participants) {
        const jid = typeof p === 'string' ? p : (p.phoneNumber || p.id)
        const text = action === 'add'
          ? 'Welcome @' + num(jid) + ' to *' + meta.subject + '* 🎉\nMembers: ' + meta.participants.length
          : 'Goodbye @' + num(jid) + ' 👋'
        let pic = null
        try { pic = await sock.profilePictureUrl(jid, 'image') } catch (e) {}
        if (pic) await sock.sendMessage(id, { image: { url: pic }, caption: text, mentions: [jid] })
        else await sock.sendMessage(id, { text, mentions: [jid] })
      }
    } catch (e) {}
  })
  sock.ev.on('call', async calls => {
    try {
      if (!settings.get('global', 'anticall', config.ANTI_CALL)) return
      for (const c of calls) if (c.status === 'offer') await sock.rejectCall(c.id, c.from)
    } catch (e) {}
  })
}
