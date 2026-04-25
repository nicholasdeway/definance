import { LucideIcon } from "lucide-react"

export enum IncomeFrequency {
  FIXO_MENSAL = "fixo_mensal",
  QUINZENAL = "quinzenal",
  VARIAVEL = "variavel",
  SEMANAL = "semanal"
}

export interface IncomeDetail {
  id: string
  tipo: string
  valor: number
  frequencia: IncomeFrequency
  diasRecebimento?: string
  configuradoEm?: string
  configuracaoAnterior?: {
    valor: number
    frequencia: IncomeFrequency
    diasRecebimento?: string
    validoAte: string
  }
}

export interface Debt {
  id: string
  descricao: string
  valor: number
  parcelado: boolean
  parcelasTotal?: number
  parcelasPagas?: number
  extras?: ExtraExpense[]
}

export interface CustomExpense {
  id: string
  titulo: string
  valor: number
}

export interface IpvaInstallment {
  id: string
  valor: number
  vencimento: string
}

export interface IpvaYear {
  id: string
  ano: string
  parcelas: IpvaInstallment[]
}

export interface Vehicle {
  id: string
  tipo: string
  nome: string
  ano: string
  ipva?: number
  multas?: number
  financiado: boolean
  parcelasTotal?: number
  parcelasPagas?: number
  valorParcela?: number
  seguro: boolean
  valorSeguro?: number
  vencimentoSeguro?: string
  seguroRecorrente?: boolean
  extras?: ExtraExpense[]
  ipvaAnos?: IpvaYear[]
}

export interface ExtraExpense {
  id: string
  descricao: string
  valor: number
}

export interface OnboardingProgress {
  currentStep?: number
  motivations?: string[]
  selectedIncomeTypes?: string[]
  incomes?: IncomeDetail[]
  selectedExpenses?: Record<string, number>
  customExpenses?: CustomExpense[]
  billLoans?: Record<string, { hasLoan: boolean; valor: number }>
  vehicles?: Vehicle[]
  debts?: Debt[]
}

export interface Step {
  id: number
  title: string
  icon: LucideIcon
}