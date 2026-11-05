//Xeno Exe
const express = require('express')
const config = require('./config')
const { startBot } = require('./lib/connect')
const app = express()
const status = {}
app.get('/', (req, res) => res.json({ bot: config.BOT_NAME, sessions: status }))
app.listen(config.PORT, () => console.log('server running on ' + config.PORT))
const ids = config.SESSION_ID.split(',').map(s => s.trim()).filter(Boolean)
if (!ids.length) startBot('main', '', status)
else ids.forEach((s, i) => setTimeout(() => startBot('session-' + (i + 1), s, status), i * 4000))
process.on('uncaughtException', e => console.log('uncaught', e.message))
process.on('unhandledRejection', e => console.log('unhandled', e && e.message ? e.message : e))
