import { Power, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react'

export function ConnectPanel({ session, connecting, protocol, onToggle, onProtocolChange }) {
  const connected = session?.connected
  const activeProtocol = connected ? session.protocol : protocol
  const label = connecting ? 'BAĞLANIYOR' : connected ? 'GÜVENDESİN' : 'AÇIKTASIN'

  return (
    <section className="flex flex-col items-center rounded-2xl border border-white/5 bg-neutral-900/40 px-6 py-10">
      <button
        onClick={onToggle}
        disabled={connecting}
        className={`group relative flex h-40 w-40 items-center justify-center rounded-full border transition-all duration-300 ${
          connected
            ? 'border-emerald-400/60 shadow-[0_0_50px_-10px_rgba(52,211,153,0.55)]'
            : 'border-white/10'
        }`}
      >
        {connected && (
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/10" />
        )}
        <span
          className={`flex h-28 w-28 items-center justify-center rounded-full border transition-colors duration-300 ${
            connected
              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
              : 'border-white/10 bg-neutral-800/60 text-neutral-500'
          }`}
        >
          {connecting ? (
            <Loader2 size={30} className="animate-spin" />
          ) : (
            <Power size={30} strokeWidth={2.2} />
          )}
        </span>
      </button>

      <h1 className="mt-6 font-mono text-2xl font-bold tracking-wider text-neutral-100">
        {label}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {connecting
          ? 'anahtar değişimi yapılıyor…'
          : connected
            ? `${session.maskedIp} olarak görünüyorsun`
            : 'trafiğin açık ağda görünür'}
      </p>

      <div className="mt-6 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs ${
            connected
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400'
              : 'border-white/10 bg-white/5 text-neutral-400'
          }`}
        >
          {connected ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
          {connected ? 'Şifreli' : 'Korumasız'}
        </span>

        <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-0.5 font-mono text-xs">
          {['WireGuard', 'OpenVPN'].map((proto) => (
            <button
              key={proto}
              onClick={() => onProtocolChange(proto)}
              disabled={connected}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                activeProtocol === proto
                  ? 'bg-emerald-400/15 text-emerald-400'
                  : 'text-neutral-500'
              } ${connected ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              {proto}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
