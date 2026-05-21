import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(str: string | undefined | null) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatDateBR(dateStr: string | undefined | null) {
  if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") return ""

  // Se já estiver no formato brasileiro (DD/MM/AAAA), apenas retorna
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr

  // Remove a parte do tempo se houver (ex: 2026-05-15T12:00:00Z)
  const cleanDate = dateStr.split('T')[0]

  // Se estiver no formato ISO (AAAA-MM-DD)
  if (cleanDate.includes("-")) {
    const parts = cleanDate.split("-")
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${day}/${month}/${year}`
    }
  }

  return cleanDate
}

export const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`