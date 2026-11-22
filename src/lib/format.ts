export function formatFee(value: number) {
  return `EGP ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`
}
