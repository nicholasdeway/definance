// Formata um número para moeda brasileira (R$)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Formata um número para moeda sem símbolo (ex: 1.234,56)
export function formatCurrencyValue(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Converte uma string de input para centavos (number)
// Ex: "1234" -> 12.34
export function parseCurrencyInput(value: string): number {
  const cleanValue = value.replace(/\D/g, "")
  const numericValue = parseInt(cleanValue || "0", 10)
  return numericValue / 100
}

// Formata uma string de input para exibição com centavos
// Ex: "1234" -> "12,34"
export function formatCurrencyInput(value: string): string {
  const cleanValue = value.replace(/\D/g, "")
  const numericValue = parseInt(cleanValue || "0", 10)
  const formatted = (numericValue / 100).toFixed(2)
  return formatted.replace(".", ",")
}

// Converte um valor formatado (string) para number
// Ex: "1.234,56" -> 1234.56
export function currencyToNumber(value: string): number {
  const cleanValue = value
    .replace(/\./g, "") // Remove pontos de milhar
    .replace(",", ".") // Troca vírgula por ponto
  return parseFloat(cleanValue) || 0
}