import { LucideIcon } from "lucide-react"

export interface Debt {
  id: string
  descricao: string
  valor: string
  parcelado: boolean
  parcelasTotal: string
  parcelasPagas: string
}

export interface CustomExpense {
  id: string
  titulo: string
  valor: string
}

export interface Vehicle {
  id: string
  tipo: string
  nome: string
  ano: string
  ipva: string
  multas: string
  financiado: boolean
  parcelasTotal: string
  parcelasPagas: string
  valorParcela: string
  seguro: boolean
  valorSeguro: string
}

export interface OnboardingProgress {
  currentStep?: number
  selectedIncomeTypes?: string[]
  monthlyIncome?: string
  selectedExpenses?: Record<string, string>
  customExpenses?: CustomExpense[]
  billLoans?: Record<string, { hasLoan: boolean; valor: string }>
  vehicles?: Vehicle[]
  debts?: Debt[]
}

export interface Step {
  id: number
  title: string
  icon: LucideIcon
}