export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatCurrencyValue(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function parseCurrencyInput(value: string): number {
  if (!value) return 0


  if (typeof value === 'number') return value / 100

  const cleanValue = value.replace(/\D/g, "")
  const numericValue = parseInt(cleanValue || "0", 10)
  return numericValue / 100
}

export function toCents(value: number | string): number {
  if (typeof value === 'string') {
    const clean = value.replace(/\D/g, "")
    return parseInt(clean || "0", 10)
  }
  return Math.round(value * 100)
}

export function formatCurrencyInput(value: string): string {
  const cleanValue = value.replace(/\D/g, "")
  const numericValue = parseInt(cleanValue || "0", 10)
  const formatted = (numericValue / 100).toFixed(2)
  return formatted.replace(".", ",")
}

export function currencyToNumber(value: string): number {
  if (!value) return 0
  const cleanValue = value
    .replace(/\D/g, "")
  return parseInt(cleanValue, 10) / 100
}