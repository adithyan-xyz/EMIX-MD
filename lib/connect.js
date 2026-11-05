//Xeno Exe
const fs = require('fs')
const path = require('path')
const pino = require('pino')
const qrcode = require('qrcode-terminal')
const config = require('../config')
const restore = require('./session')
const store = require('./store')
const handler = require('./handler')
const events = require('./events')
const settings = require('./settings')
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, Browsers, jidNormalizedUser } = require('./baileys')
const logger = pino({ level: 'silent' })
const announced = {}
const startBot = async (id, rawSession, status) => {
  const dir = path.join(__dirname, '../session', id)
  if (rawSession) await restore(rawSession, dir)
  fs.mkdirSync(dir, { recursive: true })
  const { state, saveCreds } = await useMultiFileAuthState(dir)
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    logger,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    browser: Browsers.ubuntu('Chrome'),
    printQRInTerminal: false,
    markOnlineOnConnect: config.ALWAYS_ONLINE,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    getMessage: async key => (store.get(key.id) || {}).message
  })
  if (!sock.authState.creds.registered && config.PAIR_NUMBER && id === 'main') {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(config.PAIR_NUMBER)
        console.log('PAIRING CODE: ' + (code.match(/.{1,4}/g) || [code]).join('-'))
        status[id] = 'waiting for pairing code'
      } catch (e) { console.log('pairing code failed: ' + e.message) }
    }, 3000)
  }
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async u => {
    const { connection, lastDisconnect, qr } = u
    if (qr && !config.PAIR_NUMBER) { console.log('Scan this QR:'); qrcode.generate(qr, { small: true }) }
    if (connection === 'connecting') status[id] = 'connecting'
    if (connection === 'open') {
      const me = jidNormalizedUser(sock.user.id)
      status[id] = 'connected ' + me.split('@')[0]
      console.log('[' + id + '] connected as ' + me)
      if (!announced[id]) {
        announced[id] = true
        await sock.sendMessage(me, { text: '*' + config.BOT_NAME + '* connected ✅\nMode: ' + settings.get('global', 'mode', config.MODE) + '\nPrefix: ' + settings.get('global', 'prefix', config.PREFIX) + '\nType ' + settings.get('global', 'prefix', config.PREFIX) + 'menu' }).catch(() => {})
      }
    }
    if (connection === 'close') {
      const code = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode
      console.log('[' + id + '] closed, code ' + code)
      if (code === DisconnectReason.loggedOut) {
        status[id] = 'logged out'
        fs.rmSync(dir, { recursive: true, force: true })
        console.log('[' + id + '] logged out, session removed. Generate a new session id.')
        return
      }
      if (code === DisconnectReason.connectionReplaced) { status[id] = 'replaced by another login'; return }
      status[id] = 'reconnecting'
      setTimeout(() => startBot(id, '', status), code === DisconnectReason.restartRequired ? 500 : 5000)
    }
  })
  handler.attach(sock)
  events(sock)
}
module.exports = { startBot }
