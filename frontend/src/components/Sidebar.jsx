import { ShieldCheck, Globe2, Radar, Fingerprint, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel', icon: ShieldCheck },
  { id: 'servers', label: 'Sunucular', icon: Globe2 },
  { id: 'route', label: 'Rota', icon: Radar },
  { id: 'privacy', label: 'Gizlilik', icon: Fingerprint },
]

export function Sidebar({ active, onSelect }) {
  return (
    <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-white/5 lg:bg-neutral-950/60 lg:px-4 lg:py-6">
      <div className="mb-8 flex items-center gap-1 px-2 font-mono text-lg font-bold">
        <span className="text-neutral-100">cipher</span>
        <span className="text-emerald-400">::</span>
        <span className="text-neutral-500">vpn</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left font-mono text-[13px] tracking-wide transition-colors ${
              active === id
                ? 'bg-emerald-400/10 text-emerald-400'
                : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
            }`}
          >
            <Icon size={17} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </nav>

      <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left font-mono text-[13px] tracking-wide text-neutral-500 hover:bg-white/5 hover:text-neutral-200">
        <Settings size={17} strokeWidth={1.8} />
        Ayarlar
      </button>
    </aside>
  )
}
