import { useEffect, useRef, useState } from 'react'
import './App.css'

const LOCATIONS = [
  { id: 'auto', name: 'Otomatik Yönlendirme', detail: 'En düşük gecikme', flag: '◎' },
  { id: 'tr', name: 'İstanbul', detail: 'TR · 12 ms', flag: '🇹🇷' },
  { id: 'de', name: 'Frankfurt', detail: 'DE · 34 ms', flag: '🇩🇪' },
  { id: 'us', name: 'New York', detail: 'US · 118 ms', flag: '🇺🇸' },
  { id: 'sg', name: 'Singapur', detail: 'SG · 201 ms', flag: '🇸🇬' },
]

const LOG_LINES = [
  'tünel::negotiate  ChaCha20-Poly1305',
  'anahtar::değişim  x25519  OK',
  'paket::yönlendir  0x9f2a → düğüm-14',
  'bütünlük::doğrula  sha256  geçti',
  'gizlilik::ip-maskele  aktif',
]

function formatDuration(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function RadarField({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let sweep = 0
    const nodes = Array.from({ length: 14 }, (_, i) => ({
      angle: (i / 14) * Math.PI * 2 + i * 0.37,
      radius: 60 + ((i * 53) % 130),
      blink: Math.random() * Math.PI * 2,
    }))

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    function resize() {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      const { width, height } = canvas.getBoundingClientRect()
      const cx = width / 2
      const cy = height / 2
      ctx.clearRect(0, 0, width, height)

      const signal = getComputedStyle(canvas).getPropertyValue('--signal-rgb').trim()

      for (let r = 40; r < Math.min(width, height) / 2; r += 44) {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${signal}, ${active ? 0.14 : 0.07})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      nodes.forEach((n) => {
        const x = cx + Math.cos(n.angle) * n.radius
        const y = cy + Math.sin(n.angle) * n.radius
        const pulse = active ? (Math.sin(sweep * 1.6 + n.blink) + 1) / 2 : 0.15
        ctx.beginPath()
        ctx.arc(x, y, 1.6 + pulse * 1.4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${signal}, ${0.25 + pulse * 0.55})`
        ctx.fill()
      })

      if (active) {
        const grad = ctx.createConicGradient
          ? ctx.createConicGradient(sweep, cx, cy)
          : null
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        const sweepWidth = 0.9
        ctx.arc(cx, cy, Math.min(width, height) / 2, sweep, sweep + sweepWidth)
        ctx.closePath()
        if (grad) {
          grad.addColorStop(0, `rgba(${signal}, 0.16)`)
          grad.addColorStop(0.5, `rgba(${signal}, 0)`)
          ctx.fillStyle = grad
        } else {
          ctx.fillStyle = `rgba(${signal}, 0.08)`
        }
        ctx.fill()
        ctx.restore()
      }

      if (!reduceMotion) sweep += 0.012
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  return <canvas ref={canvasRef} className="radar-field" aria-hidden="true" />
}

function LogTicker({ active }) {
  const [lines, setLines] = useState([])

  useEffect(() => {
    if (!active) return undefined
    let i = 0
    const id = window.setInterval(() => {
      setLines((prev) => {
        const next = [...prev, LOG_LINES[i % LOG_LINES.length]]
        i += 1
        return next.slice(-3)
      })
    }, 1600)
    return () => window.clearInterval(id)
  }, [active])

  if (!active) return <div className="log-ticker log-ticker-idle">tünel kapalı — trafik korumasız</div>

  return (
    <div className="log-ticker">
      {lines.map((line, idx) => (
        <div key={idx} className="log-line" style={{ opacity: (idx + 1) / lines.length }}>
          <span className="log-caret">›</span> {line}
        </div>
      ))}
    </div>
  )
}

function App() {
  const [connected, setConnected] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [location, setLocation] = useState(LOCATIONS[0])
  const [pickerOpen, setPickerOpen] = useState(false)

  const handleToggle = () => {
    if (connecting) return
    if (connected) {
      setConnected(false)
      return
    }
    setConnecting(true)
    window.setTimeout(() => {
      setConnecting(false)
      setConnected(true)
    }, 1400)
  }

  const statusLabel = connecting ? 'BAĞLANIYOR' : connected ? 'GÜVENDESİN' : 'AÇIKTASIN'

  return (
    <div className="stage">
      <RadarField active={connected || connecting} />

      <div className="phone">
        <div className="statusbar">
          <span>9:41</span>
          <span className="statusbar-icons">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
              <rect x="0" y="7" width="3" height="5" rx="0.5" fill="currentColor" />
              <rect x="5" y="5" width="3" height="7" rx="0.5" fill="currentColor" />
              <rect x="10" y="3" width="3" height="9" rx="0.5" fill="currentColor" />
              <rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor" opacity="0.4" />
            </svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
              <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor" opacity="0.4" />
              <rect x="2" y="2" width="15" height="8" rx="1.5" fill="currentColor" />
              <rect x="21.5" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" />
            </svg>
          </span>
        </div>

        <header className="app-header">
          <div className="wordmark">
            <span className="wordmark-text">cipher</span>
            <span className="wordmark-sep">::</span>
            <span className="wordmark-sub">vpn</span>
          </div>
          <button className="icon-btn" aria-label="Ayarlar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M19.4 13.5c.06-.5.06-1 0-1.5l1.9-1.4-1.9-3.3-2.2.8a7.6 7.6 0 0 0-1.3-.75l-.3-2.3H9.4l-.3 2.3c-.47.2-.9.45-1.3.75l-2.2-.8-1.9 3.3 1.9 1.4a5.9 5.9 0 0 0 0 1.5l-1.9 1.4 1.9 3.3 2.2-.8c.4.3.83.55 1.3.75l.3 2.3h5.2l.3-2.3c.47-.2.9-.45 1.3-.75l2.2.8 1.9-3.3-1.9-1.4Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </header>

        <main className="app-main">
          <button
            type="button"
            className={`power-ring ${connected ? 'is-on' : ''} ${connecting ? 'is-connecting' : ''}`}
            onClick={handleToggle}
            aria-pressed={connected}
          >
            <span className="power-ring-glow" />
            <span className="power-ring-core">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M6.3 5.5a8 8 0 1 0 11.4 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
          </button>

          <h1 className="status-title">{statusLabel}</h1>
          <p className="status-sub">
            {connecting
              ? 'anahtar değişimi yapılıyor…'
              : connected
                ? `${location.name} üzerinden şifreli`
                : 'trafiğin açık ağda görünür'}
          </p>

          <LogTicker active={connected && !connecting} />

          {connected && !connecting && (
            <div className="stats-row">
              <div className="stat-pill">
                <span className="stat-label">süre</span>
                <span className="stat-value">{formatDuration(4562)}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">hız</span>
                <span className="stat-value">86mb/s</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">ip</span>
                <span className="stat-value">••••••</span>
              </div>
            </div>
          )}

          <button className="location-card" onClick={() => setPickerOpen(true)}>
            <span className="location-flag">{location.flag}</span>
            <span className="location-text">
              <span className="location-name">{location.name}</span>
              <span className="location-detail">{location.detail}</span>
            </span>
            <svg className="location-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </main>

        <nav className="tabbar">
          <button className="tab-item is-active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3 3 10.5V21h6v-6h6v6h6V10.5L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            <span>ana</span>
          </button>
          <button className="tab-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s-7-4.6-9.4-9.6C1.2 7.6 3 4 6.6 4c2 0 3.4 1.1 5.4 3 2-1.9 3.4-3 5.4-3 3.6 0 5.4 3.6 4 7.4C19 16.4 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
            <span>konum</span>
          </button>
          <button className="tab-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 19V10M12 19V5M20 19v-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <span>veri</span>
          </button>
          <button className="tab-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
              <path d="M4.5 20c1.4-3.4 4.3-5.3 7.5-5.3s6.1 1.9 7.5 5.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <span>profil</span>
          </button>
        </nav>

        {pickerOpen && (
          <div className="sheet-overlay" onClick={() => setPickerOpen(false)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-handle" />
              <h2 className="sheet-title">düğüm seç</h2>
              <div className="sheet-list">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    className={`sheet-row ${loc.id === location.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      setLocation(loc)
                      setPickerOpen(false)
                    }}
                  >
                    <span className="location-flag">{loc.flag}</span>
                    <span className="location-text">
                      <span className="location-name">{loc.name}</span>
                      <span className="location-detail">{loc.detail}</span>
                    </span>
                    {loc.id === location.id && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="m5 13 4 4 10-10" stroke="var(--signal)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
