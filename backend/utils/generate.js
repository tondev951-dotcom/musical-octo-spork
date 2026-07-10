function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Cosmetic-only placeholder address for the demo UI — not a real assigned IP.
export function fakeIp(pool) {
  if (pool === 'residential') {
    return `${randomInt(24, 189)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(2, 254)}`
  }
  return `${randomInt(190, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(2, 254)}`
}

function jitter(base, spread) {
  return Math.max(1, Math.round(base + (Math.random() * 2 - 1) * spread))
}

export function buildRoute(exitServer) {
  const entryLatency = jitter(6, 3)
  const relayLatency = jitter(exitServer.baseLatency * 0.55, 8)
  const exitLatency = jitter(exitServer.baseLatency, 10)

  return [
    { hop: 'entry', label: 'Giriş Düğümü', city: 'En yakın düğüm', latencyMs: entryLatency },
    { hop: 'relay', label: 'Ara Röle', city: 'Rastgele röle', latencyMs: relayLatency },
    {
      hop: 'exit',
      label: 'Çıkış Sunucusu',
      city: `${exitServer.city}, ${exitServer.code}`,
      latencyMs: exitLatency,
    },
  ]
}

export function totalLatency(route) {
  return route.reduce((sum, hop) => sum + hop.latencyMs, 0)
}

export function statPoint(connected) {
  if (!connected) return { down: 0, up: 0, t: Date.now() }
  return {
    down: Math.round((18 + Math.random() * 70) * 10) / 10,
    up: Math.round((6 + Math.random() * 24) * 10) / 10,
    t: Date.now(),
  }
}
