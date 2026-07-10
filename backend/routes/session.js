import { Router } from 'express'
import { findServer } from '../data/servers.js'
import { getSession, setSession, patchFingerprint, resetSession } from '../state/sessionStore.js'
import { buildRoute, totalLatency, fakeIp } from '../utils/generate.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(getSession())
})

router.post('/connect', (req, res) => {
  const { exitServerId, protocol } = req.body ?? {}
  const server = findServer(exitServerId) ?? findServer('ist')
  const session = getSession()

  const route = buildRoute(server)
  const updated = setSession({
    connected: true,
    protocol: protocol === 'OpenVPN' ? 'OpenVPN' : 'WireGuard',
    exitServerId: server.id,
    route,
    maskedIp: fakeIp(session.pool),
    connectedAt: Date.now(),
  })

  res.json({ session: updated, totalLatencyMs: totalLatency(route) })
})

router.post('/disconnect', (req, res) => {
  res.json({ session: resetSession() })
})

router.patch('/pool', (req, res) => {
  const { pool } = req.body ?? {}
  if (pool !== 'residential' && pool !== 'datacenter') {
    return res.status(400).json({ error: 'pool must be "residential" or "datacenter"' })
  }
  const session = getSession()
  const patch = { pool }
  if (session.connected) {
    patch.maskedIp = fakeIp(pool)
  }
  res.json({ session: setSession(patch) })
})

router.patch('/fingerprint', (req, res) => {
  const allowed = ['webrtcBlock', 'canvasNoise', 'webglNoise', 'timezoneMatch']
  const patch = {}
  for (const key of allowed) {
    if (typeof req.body?.[key] === 'boolean') patch[key] = req.body[key]
  }
  res.json({ session: patchFingerprint(patch) })
})

export default router
