import express from 'express'
import cors from 'cors'
import serversRouter from './routes/servers.js'
import sessionRouter from './routes/session.js'
import statsRouter from './routes/stats.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use('/api/servers', serversRouter)
app.use('/api/session', sessionRouter)
app.use('/api/stats', statsRouter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`cipher::vpn backend listening on http://localhost:${PORT}`)
})
