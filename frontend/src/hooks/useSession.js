import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'

export function useSession() {
  const [session, setSession] = useState(null)
  const [servers, setServers] = useState([])
  const [connecting, setConnecting] = useState(false)
  const [selectedServerId, setSelectedServerId] = useState('ist')
  const [protocol, setProtocol] = useState('WireGuard')
  const [error, setError] = useState(null)

  const refreshServers = useCallback(async () => {
    const { servers } = await api.getServers()
    setServers(servers)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      try {
        const [sessionRes] = await Promise.all([api.getSession(), refreshServers()])
        if (!cancelled) setSession(sessionRes)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }
    bootstrap()
    const interval = setInterval(refreshServers, 8000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [refreshServers])

  const connect = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      const { session } = await api.connect(selectedServerId, protocol)
      setSession(session)
    } catch (err) {
      setError(err.message)
    } finally {
      setConnecting(false)
    }
  }, [selectedServerId, protocol])

  const disconnect = useCallback(async () => {
    try {
      const { session } = await api.disconnect()
      setSession(session)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const setPool = useCallback(async (pool) => {
    const { session } = await api.setPool(pool)
    setSession(session)
  }, [])

  const setFingerprintFlag = useCallback(async (key, value) => {
    const { session } = await api.setFingerprint({ [key]: value })
    setSession(session)
  }, [])

  return {
    session,
    servers,
    connecting,
    selectedServerId,
    setSelectedServerId,
    protocol,
    setProtocol,
    connect,
    disconnect,
    setPool,
    setFingerprintFlag,
    error,
  }
}
