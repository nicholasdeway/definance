import {
  CircleUser,
  Wallet2,
  Receipt,
  CarFront,
  CreditCard,
  Briefcase,
  Building2,
  User,
  Laptop,
  GraduationCap,
  Target,
  PiggyBank,
  CircleDollarSign,
  Lightbulb,
  TrendingUp
} from "lucide-react"
import { Step, IncomeFrequency } from "./types"

export const steps: Step[] = [
  { id: 1, title: "Motivação", icon: Target },
  { id: 2, title: "Renda", icon: CircleUser },
  { id: 3, title: "Valor", icon: Wallet2 },
  { id: 4, title: "Fixos", icon: Receipt },
  { id: 5, title: "Veículos", icon: CarFront },
  { id: 6, title: "Dívidas", icon: CreditCard },
]

export const motivationTypes = [
  { value: "gastos", label: "Controlar meus gastos", icon: CircleDollarSign },
  { value: "economizar", label: "Juntar e economizar", icon: PiggyBank },
  { value: "objetivo", label: "Alcançar um objetivo", icon: Target },
  { value: "financas", label: "Entender minhas finanças", icon: Lightbulb },
  { value: "investir", label: "Começar a investir", icon: TrendingUp },
  { value: "dividas", label: "Pagar dívidas", icon: CreditCard },
]

export const incomeTypes = [
  { value: "clt", label: "CLT", description: "Trabalho com carteira assinada", icon: Briefcase },
  { value: "pj", label: "PJ", description: "Pessoa Jurídica / Empresa", icon: Building2 },
  { value: "autonomo", label: "Autônomo", description: "Trabalho independente", icon: User },
  { value: "freelancer", label: "Freelancer", description: "Projetos por demanda", icon: Laptop },
  { value: "mesada", label: "Mesada / Auxílio", description: "Estudantes ou apoio financeiro", icon: GraduationCap },
]

export const fixedExpenseCategories = [
  { key: "aluguel", label: "Aluguel", emoji: "🏠", placeholder: "R$ 1.500,00" },
  { key: "luz", label: "Energia", emoji: "⚡", placeholder: "R$ 200,00" },
  { key: "agua", label: "Água", emoji: "💧", placeholder: "R$ 80,00" },
  { key: "internet", label: "Internet", emoji: "🌐", placeholder: "R$ 120,00" },
  { key: "celular", label: "Celular", emoji: "📱", placeholder: "R$ 80,00" },
  { key: "streaming", label: "Streaming", emoji: "🎬", placeholder: "R$ 50,00" },
  { key: "academia", label: "Academia", emoji: "🏋️", placeholder: "R$ 100,00" },
  { key: "transporte", label: "Transporte", emoji: "🚌", placeholder: "R$ 200,00" },
  { key: "alimentacao", label: "Alimentação", emoji: "🍽️", placeholder: "R$ 800,00" },
  { key: "saude", label: "Saúde", emoji: "❤️‍🩹", placeholder: "R$ 300,00" },
  { key: "educacao", label: "Educação", emoji: "📚", placeholder: "R$ 500,00" },
]

export const vehicleTypes = [
  { key: "bicicleta", label: "Bicicleta", emoji: "🚲" },
  { key: "bike_eletrica", label: "Bike Elét.", emoji: "⚡" },
  { key: "scooter", label: "Scooter", emoji: "🛵" },
  { key: "moto", label: "Moto", emoji: "🏍️" },
  { key: "carro", label: "Carro", emoji: "🚗" },
  { key: "suv_picape", label: "SUV/Picape", emoji: "🚙" },
  { key: "van", label: "Van", emoji: "🚐" },
  { key: "caminhao", label: "Caminhão", emoji: "🚛" },
  { key: "trator", label: "Trator", emoji: "🚜" },
  { key: "lancha", label: "Lancha", emoji: "🚤" },
  { key: "jetski", label: "Jetski", emoji: "🛥️" },
  { key: "helicoptero", label: "Helicóptero", emoji: "🚁" },
  { key: "aeronave", label: "Aeronave", emoji: "✈️" },
  { key: "outro", label: "Outro", emoji: "➕" },
]

export const incomeFrequencies = [
  { value: IncomeFrequency.FIXO_MENSAL, label: "Mensal (Fixo nas mesmas datas)" },
  { value: IncomeFrequency.QUINZENAL, label: "Quinzenal (Adiantamento + Pagamento)" },
  { value: IncomeFrequency.SEMANAL, label: "Semanal (Por semana)" },
  { value: IncomeFrequency.VARIAVEL, label: "Variável / Sem data fixa" }
]

const numberToWords = (n: number) => {
  const words = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"]
  return words[n] || n.toString()
}

export const ONBOARDING_ERRORS = {
  motivations: {
    selection: "Selecione pelo menos uma motivação para continuar",
  },
  income: {
    selection: "Selecione pelo menos um tipo de renda para continuar",
    missingValue: (tipo: string) => `Informe o valor, ou expectativa média, para a renda de ${tipo}`,
    zeroValue: (tipo: string) => `O valor da renda de ${tipo} deve ser maior que zero`,
    missingFreq: (tipo: string) => `Selecione de quanto em quanto tempo você recebe na renda de ${tipo}`,
    missingDays: (tipo: string) => `Informe os dias de recebimento para a renda de ${tipo}`,
  },
  expenses: {
    empty: (label: string) => `Informe um valor válido para ${label}`,
    customNoName: (index: number) => `O gasto personalizado número ${numberToWords(index)} precisa de um nome`,
    customNoValue: (name: string) => `Informe um valor válido para ${name}`,
    loanEmpty: (label: string) => `Informe o valor da parcela do empréstimo para ${label}`,
    loanConsistency: (label: string) => `O valor do empréstimo não pode ser maior que o valor total da conta (${label})`,
  },
  vehicles: {
    noType: (index: number) => `Selecione o tipo do veículo número ${numberToWords(index)}`,
    noName: (index: number) => `Informe o nome do veículo personalizado número ${numberToWords(index)}`,
    invalidYear: (index: number, currentYear: number) =>
      `Ano inválido para o veículo número ${numberToWords(index)}. Use um ano entre mil novecentos e ${currentYear}`,
    invalidNumeric: (index: number) => `Verifique se o IPVA e Multas do veículo número ${numberToWords(index)} contém apenas números`,
    financingIncomplete: (index: number) => `Informe o total de parcelas e o valor da parcela para o veículo número ${numberToWords(index)}`,
    financingConsistency: (index: number) => `Parcelas pagas não pode ser maior que o total no veículo número ${numberToWords(index)}`,
    insuranceIncomplete: (index: number) => `Informe o valor do seguro para o veículo número ${numberToWords(index)}`,
  },
  debts: {
    noDescription: (index: number) => `Informe a descrição da dívida número ${numberToWords(index)}`,
    noValue: (index: number) => `Informe um valor válido para a dívida número ${numberToWords(index)}`,
    parcelsIncomplete: (index: number) => `Informe o total de parcelas para a dívida número ${numberToWords(index)}`,
    parcelsConsistency: (index: number) => `Parcelas pagas não pode ser maior que o total na dívida número ${numberToWords(index)}`,
  }
}