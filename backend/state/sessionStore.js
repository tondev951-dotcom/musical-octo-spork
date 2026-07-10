let session = {
  connected: false,
  protocol: 'WireGuard',
  pool: 'datacenter',
  exitServerId: null,
  route: null,
  maskedIp: null,
  connectedAt: null,
  fingerprint: {
    webrtcBlock: true,
    canvasNoise: true,
    webglNoise: false,
    timezoneMatch: true,
  },
}

export function getSession() {
  return session
}

export function setSession(patch) {
  session = { ...session, ...patch }
  return session
}

export function patchFingerprint(patch) {
  session = { ...session, fingerprint: { ...session.fingerprint, ...patch } }
  return session
}

export function resetSession() {
  session = {
    ...session,
    connected: false,
    exitServerId: null,
    route: null,
    maskedIp: null,
    connectedAt: null,
  }
  return session
}
