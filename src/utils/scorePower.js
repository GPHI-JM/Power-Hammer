/**
 * Maps meter impact strength (0–1) to power points (1–10000). 1 = lowest, 10000 = peak.
 */
export function impactStrengthToPowerPoints(impactStrength) {
  const strength = Math.max(0, Math.min(1, Number(impactStrength)))
  return Math.max(1, Math.min(10000, Math.round(1 + strength * 9999)))
}

/**
 * Formats a score for display: values ≥ 1000 use k (e.g. 1000 → 1k, 2500 → 2.5k).
 */
export function formatScoreCompact(points) {
  const rounded = Math.round(Number(points))
  if (!Number.isFinite(rounded) || rounded < 0) {
    return '0'
  }
  if (rounded < 1000) {
    return String(rounded)
  }
  const thousands = rounded / 1000
  if (thousands < 1000) {
    const trimmed = Math.round(thousands * 10) / 10
    const text = Number.isInteger(trimmed)
      ? String(trimmed)
      : trimmed.toFixed(1).replace(/\.0$/, '')
    return `${text}k`
  }
  return `${(rounded / 1000000).toFixed(1)}M`
}
