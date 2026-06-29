export function formatStat(n) {
  if (!n || n === 0) return '0'
  if (n < 1000) return n.toString()

  const magnitude = Math.floor(Math.log10(n))
  const factor    = Math.pow(10, magnitude - 1)
  const rounded   = Math.round(n / factor) * factor

  if (rounded >= 1_000_000) return `${+(rounded / 1_000_000).toFixed(1)}M+`
  return `${rounded / 1000}k+`
}
