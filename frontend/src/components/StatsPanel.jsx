import { ArrowDown, ArrowUp } from 'lucide-react'

function Sparkline({ points, color }) {
  const max = Math.max(1, ...points)
  const w = 240
  const h = 48
  const step = w / (points.length - 1)
  const path = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${(h - (v / max) * h).toFixed(1)}`)
    .join(' ')
  const area = `${path} L ${w} ${h} L 0 ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full" preserveAspectRatio="none">
      <path d={area} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function StatsPanel({ history, latest, session }) {
  const downPoints = history.map((p) => p.down)
  const upPoints = history.map((p) => p.up)

  return (
    <section className="rounded-2xl border border-white/5 bg-neutral-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          Canlı Trafik
        </h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-neutral-400">
          {session?.protocol ?? 'WireGuard'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-neutral-500">
            <ArrowDown size={12} className="text-emerald-400" /> indirme
          </div>
          <div className="mb-2 font-mono text-lg font-bold tabular-nums text-neutral-100">
            {latest.down.toFixed(1)} <span className="text-xs font-normal text-neutral-500">Mbps</span>
          </div>
          <Sparkline points={downPoints} color="#34d399" />
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-neutral-500">
            <ArrowUp size={12} className="text-cyan-400" /> yükleme
          </div>
          <div className="mb-2 font-mono text-lg font-bold tabular-nums text-neutral-100">
            {latest.up.toFixed(1)} <span className="text-xs font-normal text-neutral-500">Mbps</span>
          </div>
          <Sparkline points={upPoints} color="#22d3ee" />
        </div>
      </div>
    </section>
  )
}
