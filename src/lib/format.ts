export const vnd = (n: number): string => {
  const a = Math.abs(n)
  const s = n < 0 ? '-' : ''
  if (a >= 1_000_000_000) return `${s}${(a / 1_000_000_000).toFixed(2)}B`
  if (a >= 1_000_000) return `${s}${(a / 1_000_000).toFixed(a >= 10_000_000 ? 1 : 2)}M`
  if (a >= 1_000) return `${s}${Math.round(a / 1_000).toLocaleString('en-US')}K`
  return `${s}${Math.round(a)}`
}
export const vndFull = (n: number): string => `${Math.round(n).toLocaleString('en-US')} VND`
export const pct = (n: number, d = 1): string => `${n.toFixed(d)}%`
export const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n))
