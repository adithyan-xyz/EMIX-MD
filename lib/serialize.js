//Xeno Exe
const { getContentType, normalizeMessageContent, downloadMediaMessage, jidNormalizedUser } = require('./baileys')
const pino = require('pino')
const logger = pino({ level: 'silent' })
const bodyOf = c => {
  if (!c) return ''
  const t = getContentType(c)
  const v = c[t]
  if (!v) return ''
  return c.conversation || v.text || v.caption || v.selectedButtonId || (v.singleSelectReply && v.singleSelectReply.selectedRowId) || v.selectedId || ''
}
module.exports = (sock, raw) => {
  const key = raw.key
  const content = normalizeMessageContent(raw.message)
  const type = getContentType(content)
  const chat = key.remoteJid
  const isGroup = chat.endsWith('@g.us')
  const rawSender = key.fromMe ? sock.user.id : (isGroup ? (key.participantPn || key.participantAlt || key.participant || raw.participant) : chat)
  const sender = jidNormalizedUser(rawSender)
  const senders = [sender, key.participant, key.participantPn, key.participantAlt].filter(Boolean)
  const info = (content && content[type] && content[type].contextInfo) || {}
  const m = {
    raw, key, id: key.id, chat, isGroup, sender, senders, fromMe: !!key.fromMe, type, content,
    body: bodyOf(content), pushName: raw.pushName || '', timestamp: Number(raw.messageTimestamp) || 0,
    mentioned: info.mentionedJid || []
  }
  m.download = () => downloadMediaMessage({ key, message: content }, 'buffer', {}, { logger, reuploadRequest: sock.updateMediaMessage })
  m.reply = (text, opts = {}) => sock.sendMessage(chat, { text, ...opts }, { quoted: raw })
  if (info.quotedMessage) {
    const qm = normalizeMessageContent(info.quotedMessage)
    const qkey = { remoteJid: chat, id: info.stanzaId, fromMe: false, participant: info.participant }
    m.quoted = {
      key: qkey, sender: info.participant, type: getContentType(qm), message: qm, text: bodyOf(qm),
      download: () => downloadMediaMessage({ key: qkey, message: qm }, 'buffer', {}, { logger, reuploadRequest: sock.updateMediaMessage })
    }
  }
  return m
}
