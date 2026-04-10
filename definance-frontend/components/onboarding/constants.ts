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
  GraduationCap
} from "lucide-react"
import { Step } from "./types"

export const steps: Step[] = [
  { id: 1, title: "Renda", icon: CircleUser },
  { id: 2, title: "Valor", icon: Wallet2 },
  { id: 3, title: "Fixos", icon: Receipt },
  { id: 4, title: "Veículos", icon: CarFront },
  { id: 5, title: "Dívidas", icon: CreditCard },
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

const numberToWords = (n: number) => {
  const words = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"]
  return words[n] || n.toString()
}

export const ONBOARDING_ERRORS = {
  income: {
    selection: "Selecione pelo menos um tipo de renda para continuar",
    empty: "Informe o valor da sua renda mensal líquida",
    zero: "O valor da renda mensal deve ser maior que zero",
    excessive: "O valor informado parece muito alto. Confirme se digitou corretamente",
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