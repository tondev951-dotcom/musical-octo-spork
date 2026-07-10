import { ShieldCheck, Globe2, Radar, Fingerprint } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel', icon: ShieldCheck },
  { id: 'servers', label: 'Sunucular', icon: Globe2 },
  { id: 'route', label: 'Rota', icon: Radar },
  { id: 'privacy', label: 'Gizlilik', icon: Fingerprint },
]

export function BottomNav({ active, onSelect }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-white/5 bg-neutral-950/95 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors ${
            active === id ? 'text-emerald-400' : 'text-neutral-500'
          }`}
        >
          <Icon size={20} strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </nav>
  )
}
