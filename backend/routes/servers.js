import { Router } from 'express'
import { SERVERS } from '../data/servers.js'

const router = Router()

router.get('/', (req, res) => {
  const jittered = SERVERS.map((s) => ({
    ...s,
    latencyMs: Math.max(1, Math.round(s.baseLatency + (Math.random() * 6 - 3))),
    load: Math.min(0.95, Math.max(0.05, s.load + (Math.random() * 0.1 - 0.05))),
  }))
  res.json({ servers: jittered })
})

export default router
