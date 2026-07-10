import { Home, Server } from 'lucide-react'

export function ServerPicker({ servers, selectedServerId, onSelect, pool, onPoolChange, disabled }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-neutral-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">Sunucular</h2>
        <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-0.5 font-mono text-[11px]">
          <button
            onClick={() => onPoolChange('datacenter')}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
              pool === 'datacenter' ? 'bg-emerald-400/15 text-emerald-400' : 'text-neutral-500'
            }`}
          >
            <Server size={12} /> Datacenter
          </button>
          <button
            onClick={() => onPoolChange('residential')}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
              pool === 'residential' ? 'bg-emerald-400/15 text-emerald-400' : 'text-neutral-500'
            }`}
          >
            <Home size={12} /> Residential
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {servers.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            disabled={disabled}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
              selectedServerId === s.id
                ? 'border-emerald-400/40 bg-emerald-400/5'
                : 'border-white/5 bg-neutral-950/40 hover:border-white/10'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <span className="w-8 shrink-0 font-mono text-[11px] text-neutral-500">{s.code}</span>
            <span className="flex-1 truncate text-sm font-medium text-neutral-200">{s.city}</span>
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
              <span
                className="block h-full rounded-full bg-emerald-400/60"
                style={{ width: `${Math.round(s.load * 100)}%` }}
              />
            </span>
            <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-neutral-500">
              {s.latencyMs}ms
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
