const BASE = '/api'

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  return res.json()
}

export const api = {
  getSession: () => request('/session'),
  getServers: () => request('/servers'),
  getStats: () => request('/stats'),
  connect: (exitServerId, protocol) =>
    request('/session/connect', {
      method: 'POST',
      body: JSON.stringify({ exitServerId, protocol }),
    }),
  disconnect: () => request('/session/disconnect', { method: 'POST' }),
  setPool: (pool) =>
    request('/session/pool', { method: 'PATCH', body: JSON.stringify({ pool }) }),
  setFingerprint: (patch) =>
    request('/session/fingerprint', { method: 'PATCH', body: JSON.stringify(patch) }),
}
