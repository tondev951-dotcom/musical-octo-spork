import { useState } from 'react'
import './App.css'

const LOCATIONS = [
  { id: 'auto', name: 'Otomatik', detail: 'En hızlı konum' },
  { id: 'tr', name: 'İstanbul, TR', flag: '🇹🇷' },
  { id: 'de', name: 'Frankfurt, DE', flag: '🇩🇪' },
  { id: 'us', name: 'New York, US', flag: '🇺🇸' },
  { id: 'sg', name: 'Singapur, SG', flag: '🇸🇬' },
]

function formatDuration(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
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
    }, 1200)
  }

  const statusLabel = connecting
    ? 'Bağlanıyor…'
    : connected
      ? 'Bağlandı'
      : 'Bağlı Değil'

  const subLabel = connecting
    ? 'Güvenli tünel kuruluyor'
    : connected
      ? 'İnternetin özel.'
      : 'Korumasız bağlantı'

  return (
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
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 2.5C10.9 2.5 13.4 3.6 15 5.3l-1.4 1.5C12.2 5.2 10.2 4.3 8 4.3s-4.2.9-5.6 2.5L1 5.3C2.6 3.6 5.1 2.5 8 2.5Z" fill="currentColor" />
            <path d="M8 6.3c1.6 0 3 .6 4 1.7l-1.4 1.5C10 8.8 9 8.4 8 8.4s-2 .4-2.6 1.1L4 8c1-1.1 2.4-1.7 4-1.7Z" fill="currentColor" />
            <circle cx="8" cy="10.4" r="1.4" fill="currentColor" />
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
          <span className="wordmark-text">nova</span>
          <span className="wordmark-plus">VPN</span>
        </div>
        <button className="icon-btn" aria-label="Ayarlar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
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
        >
          <span className="power-ring-glow" />
          <span className="power-ring-core">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2v9"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M6.3 5.5a8 8 0 1 0 11.4 0"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>

        <h1 className="status-title">{statusLabel}</h1>
        <p className="status-sub">
          {connected ? (
            <>
              İnternetin <span className="accent-word">özel</span>.
            </>
          ) : (
            subLabel
          )}
        </p>

        {connected && !connecting && (
          <div className="stats-row">
            <div className="stat-pill">
              <span className="stat-label">Süre</span>
              <span className="stat-value">{formatDuration(4562)}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Hız</span>
              <span className="stat-value">86 Mbps</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">IP</span>
              <span className="stat-value">Gizli</span>
            </div>
          </div>
        )}

        <button className="location-card" onClick={() => setPickerOpen(true)}>
          <span className="location-flag">{location.flag ?? '🌐'}</span>
          <span className="location-text">
            <span className="location-name">{location.name}</span>
            <span className="location-detail">
              {location.detail ?? 'Konumu değiştir'}
            </span>
          </span>
          <svg
            className="location-chevron"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="m9 6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </main>

      <nav className="tabbar">
        <button className="tab-item is-active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3 3 10.5V21h6v-6h6v6h6V10.5L12 3Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          <span>Ana Sayfa</span>
        </button>
        <button className="tab-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21s-7-4.6-9.4-9.6C1.2 7.6 3 4 6.6 4c2 0 3.4 1.1 5.4 3 2-1.9 3.4-3 5.4-3 3.6 0 5.4 3.6 4 7.4C19 16.4 12 21 12 21Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          <span>Konumlar</span>
        </button>
        <button className="tab-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 19V10M12 19V5M20 19v-6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <span>İstatistik</span>
        </button>
        <button className="tab-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
            <path
              d="M4.5 20c1.4-3.4 4.3-5.3 7.5-5.3s6.1 1.9 7.5 5.3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <span>Profil</span>
        </button>
      </nav>

      {pickerOpen && (
        <div className="sheet-overlay" onClick={() => setPickerOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h2 className="sheet-title">Konum Seç</h2>
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
                  <span className="location-flag">{loc.flag ?? '🌐'}</span>
                  <span className="location-name">{loc.name}</span>
                  {loc.id === location.id && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="m5 13 4 4 10-10"
                        stroke="#ff5b2e"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
