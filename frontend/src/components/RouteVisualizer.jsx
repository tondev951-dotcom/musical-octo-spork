import { ArrowRight, CircleDot } from 'lucide-react'

export function RouteVisualizer({ route, connected }) {
  if (!connected || !route) {
    return (
      <section className="rounded-2xl border border-white/5 bg-neutral-900/40 p-5">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-500">
          Çok Aşamalı Rota
        </h2>
        <p className="font-mono text-sm text-neutral-600">bağlantı bekleniyor…</p>
      </section>
    )
  }

  const total = route.reduce((sum, hop) => sum + hop.latencyMs, 0)

  return (
    <section className="rounded-2xl border border-white/5 bg-neutral-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          Çok Aşamalı Rota
        </h2>
        <span className="font-mono text-xs text-emerald-400">{total}ms toplam</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1">
        {route.map((hop, idx) => (
          <div key={hop.hop} className="flex flex-1 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/5 bg-neutral-950/60 px-3 py-3">
              <CircleDot size={15} className="shrink-0 text-emerald-400" strokeWidth={2} />
              <div className="min-w-0">
                <div className="truncate font-mono text-[11px] uppercase tracking-wide text-neutral-500">
                  {hop.label}
                </div>
                <div className="truncate text-sm font-semibold text-neutral-200">{hop.city}</div>
              </div>
              <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-neutral-400">
                {hop.latencyMs}ms
              </span>
            </div>
            {idx < route.length - 1 && (
              <ArrowRight
                size={16}
                className="mx-auto shrink-0 rotate-90 text-neutral-700 sm:mx-0 sm:rotate-0"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
