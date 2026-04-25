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

  // Se estiver no formato ISO (AAAA-MM-DD)
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${day}/${month}/${year}`
    }
  }
  
  return dateStr
}

export const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`