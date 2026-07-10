import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

const HISTORY_LENGTH = 30

export function useLiveStats(connected) {
  const [history, setHistory] = useState(() =>
    Array.from({ length: HISTORY_LENGTH }, () => ({ down: 0, up: 0 })),
  )
  const timerRef = useRef(null)

  useEffect(() => {
    async function tick() {
      try {
        const point = await api.getStats()
        setHistory((prev) => [...prev.slice(1), point])
      } catch {
        // demo polling — ignore transient failures
      }
    }

    tick()
    timerRef.current = setInterval(tick, connected ? 1000 : 3000)
    return () => clearInterval(timerRef.current)
  }, [connected])

  const latest = history[history.length - 1]
  return { history, latest }
}
