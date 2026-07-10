export const SERVERS = [
  { id: 'ist', city: 'İstanbul', country: 'Türkiye', code: 'TR', baseLatency: 8, load: 0.31 },
  { id: 'fra', city: 'Frankfurt', country: 'Almanya', code: 'DE', baseLatency: 34, load: 0.52 },
  { id: 'ams', city: 'Amsterdam', country: 'Hollanda', code: 'NL', baseLatency: 38, load: 0.44 },
  { id: 'lon', city: 'Londra', country: 'İngiltere', code: 'GB', baseLatency: 42, load: 0.61 },
  { id: 'nyc', city: 'New York', country: 'ABD', code: 'US', baseLatency: 118, load: 0.58 },
  { id: 'sfo', city: 'San Francisco', country: 'ABD', code: 'US', baseLatency: 156, load: 0.39 },
  { id: 'sin', city: 'Singapur', country: 'Singapur', code: 'SG', baseLatency: 201, load: 0.47 },
  { id: 'tyo', city: 'Tokyo', country: 'Japonya', code: 'JP', baseLatency: 224, load: 0.35 },
]

export function findServer(id) {
  return SERVERS.find((s) => s.id === id)
}
