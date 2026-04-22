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

export const parseCurrencyInput = (value: string): number => {
  if (!value) return 0;

  if (typeof value === 'number') return Math.round(value * 100) / 100;

  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;

  return parseInt(digits, 10) / 100;
};