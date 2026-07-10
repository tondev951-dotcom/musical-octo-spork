import { Wifi, Paintbrush, Box, Clock } from 'lucide-react'

const TOGGLES = [
  {
    key: 'webrtcBlock',
    icon: Wifi,
    title: 'WebRTC Sızıntı Engeli',
    detail: 'Gerçek IP\'nin WebRTC üzerinden ifşasını engeller',
  },
  {
    key: 'canvasNoise',
    icon: Paintbrush,
    title: 'Canvas Gürültüsü',
    detail: 'Canvas parmak izini her oturumda değiştirir',
  },
  {
    key: 'webglNoise',
    icon: Box,
    title: 'WebGL Gürültüsü',
    detail: 'GPU tabanlı parmak izini bulanıklaştırır',
  },
  {
    key: 'timezoneMatch',
    icon: Clock,
    title: 'Saat Dilimi Eşleştirme',
    detail: 'Tarayıcı saat dilimini seçili sunucuyla hizalar',
  },
]

function Switch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-emerald-400/80' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-neutral-950 transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export function FingerprintPanel({ fingerprint, onToggle }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-neutral-900/40 p-5">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-500">
        Parmak İzi Koruması
      </h2>
      <div className="flex flex-col divide-y divide-white/5">
        {TOGGLES.map(({ key, icon: Icon, title, detail }) => (
          <div key={key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Icon size={17} className="shrink-0 text-neutral-500" strokeWidth={1.8} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-neutral-200">{title}</div>
              <div className="truncate text-xs text-neutral-500">{detail}</div>
            </div>
            <Switch checked={fingerprint?.[key] ?? false} onChange={(v) => onToggle(key, v)} />
          </div>
        ))}
      </div>
    </section>
  )
}
