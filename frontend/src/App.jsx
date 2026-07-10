import { useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { BottomNav } from './components/BottomNav.jsx'
import { ConnectPanel } from './components/ConnectPanel.jsx'
import { RouteVisualizer } from './components/RouteVisualizer.jsx'
import { StatsPanel } from './components/StatsPanel.jsx'
import { ServerPicker } from './components/ServerPicker.jsx'
import { FingerprintPanel } from './components/FingerprintPanel.jsx'
import { useSession } from './hooks/useSession.js'
import { useLiveStats } from './hooks/useLiveStats.js'

const SECTION_LABEL = {
  dashboard: 'Panel',
  servers: 'Sunucular',
  route: 'Rota',
  privacy: 'Gizlilik',
}

function App() {
  const [active, setActive] = useState('dashboard')
  const {
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
  } = useSession()

  const { history, latest } = useLiveStats(Boolean(session?.connected))

  const handleToggleConnect = () => {
    if (session?.connected) {
      disconnect()
    } else {
      connect()
    }
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 font-mono text-sm text-neutral-500">
        yükleniyor…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-neutral-950 text-neutral-200">
      <Sidebar active={active} onSelect={setActive} />

      <div className="min-w-0 flex-1 pb-20 lg:pb-0">
        <header className="flex items-center justify-between border-b border-white/5 px-5 py-4 lg:px-8">
          <div>
            <h1 className="font-mono text-sm uppercase tracking-widest text-neutral-500">
              {SECTION_LABEL[active]}
            </h1>
            <p className="font-mono text-lg font-bold text-neutral-100 lg:hidden">
              cipher<span className="text-emerald-400">::</span>
              <span className="text-neutral-500">vpn</span>
            </p>
          </div>
          {error && (
            <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 font-mono text-xs text-rose-300">
              {error}
            </span>
          )}
        </header>

        <main className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-6 lg:px-8">
          {(active === 'dashboard' || active === 'route') && (
            <ConnectPanel
              session={session}
              connecting={connecting}
              protocol={protocol}
              onToggle={handleToggleConnect}
              onProtocolChange={setProtocol}
            />
          )}

          {(active === 'dashboard' || active === 'route') && (
            <RouteVisualizer route={session.route} connected={session.connected} />
          )}

          {active === 'dashboard' && (
            <StatsPanel history={history} latest={latest} session={session} />
          )}

          {(active === 'dashboard' || active === 'servers') && (
            <ServerPicker
              servers={servers}
              selectedServerId={selectedServerId}
              onSelect={setSelectedServerId}
              pool={session.pool}
              onPoolChange={setPool}
              disabled={connecting}
            />
          )}

          {(active === 'dashboard' || active === 'privacy') && (
            <FingerprintPanel fingerprint={session.fingerprint} onToggle={setFingerprintFlag} />
          )}
        </main>
      </div>

      <BottomNav active={active} onSelect={setActive} />
    </div>
  )
}

export default App
