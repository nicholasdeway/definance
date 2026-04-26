"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import {
  Debt,
  Vehicle,
  CustomExpense,
  IncomeDetail
} from "../types"

export interface OnboardingState {
  // States
  currentStep: number
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  motivations: string[]
  setMotivations: React.Dispatch<React.SetStateAction<string[]>>
  selectedIncomeTypes: string[]
  setSelectedIncomeTypes: React.Dispatch<React.SetStateAction<string[]>>
  incomes: IncomeDetail[]
  setIncomes: React.Dispatch<React.SetStateAction<IncomeDetail[]>>
  selectedExpenses: Record<string, number>
  setSelectedExpenses: React.Dispatch<React.SetStateAction<Record<string, number>>>
  customExpenses: CustomExpense[]
  setCustomExpenses: React.Dispatch<React.SetStateAction<CustomExpense[]>>
  billLoans: Record<string, { hasLoan: boolean; valor: number }>
  setBillLoans: React.Dispatch<React.SetStateAction<Record<string, { hasLoan: boolean; valor: number }>>>
  vehicles: Vehicle[]
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>
  debts: Debt[]
  setDebts: React.Dispatch<React.SetStateAction<Debt[]>>
  isLoadingRecovery: boolean
  setIsLoadingRecovery: React.Dispatch<React.SetStateAction<boolean>>

  // UI States
  stepErrors: string[]
  setStepErrors: React.Dispatch<React.SetStateAction<string[]>>
  wasAttempted: boolean
  setWasAttempted: React.Dispatch<React.SetStateAction<boolean>>
  syncStatus: 'idle' | 'saving' | 'saved' | 'error'
  setSyncStatus: React.Dispatch<React.SetStateAction<'idle' | 'saving' | 'saved' | 'error'>>

  // Refs
  lastSavedHashesRef: React.MutableRefObject<Record<number, string>>
  formTopRef: React.RefObject<HTMLDivElement | null>

  // Helper Methods
  getStepData: (step: number) => any
}

export const useOnboardingState = (): OnboardingState => {
  const [currentStep, setCurrentStep] = useState(1)
  const [motivations, setMotivations] = useState<string[]>([])
  const [selectedIncomeTypes, setSelectedIncomeTypes] = useState<string[]>([])
  const [incomes, setIncomes] = useState<IncomeDetail[]>([])
  const [selectedExpenses, setSelectedExpenses] = useState<Record<string, number>>({})
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([])
  const [billLoans, setBillLoans] = useState<Record<string, { hasLoan: boolean; valor: number }>>({
    luz: { hasLoan: false, valor: 0 },
    agua: { hasLoan: false, valor: 0 },
    celular: { hasLoan: false, valor: 0 }
  })
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [isLoadingRecovery, setIsLoadingRecovery] = useState(true)

  const [stepErrors, setStepErrors] = useState<string[]>([])
  const [wasAttempted, setWasAttempted] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const lastSavedHashesRef = useRef<Record<number, string>>({})
  const formTopRef = useRef<HTMLDivElement>(null)

  const getStepData = useCallback((step: number) => {
    switch (step) {
      case 1: return motivations
      case 2: return selectedIncomeTypes
      case 3: return incomes
      case 4: return { selectedExpenses, customExpenses, billLoans }
      case 5: return vehicles
      case 6: return debts
      default: return null
    }
  }, [motivations, selectedIncomeTypes, incomes, selectedExpenses, customExpenses, billLoans, vehicles, debts])

  // ── Orphan Data Cleanup
  useEffect(() => {
    const selectedKeys = Object.keys(selectedExpenses)
    const loanKeys = Object.keys(billLoans)

    // Filtra apenas chaves que não estão selecionadas mas possuem empréstimo marcado como ativo
    const orphanedKeys = loanKeys.filter(key =>
      !selectedKeys.includes(key) && billLoans[key].hasLoan
    )

    if (orphanedKeys.length > 0) {
      setBillLoans(prev => {
        const next = { ...prev }
        orphanedKeys.forEach(key => {
          if (next[key]) {
            next[key] = { hasLoan: false, valor: 0 }
          }
        })
        return next
      })
    }

    // Limpa rendas orfãs (caso ele desmarque 'clt' por exemplo, o incomeDetails de 'clt' some)
    setIncomes(prev => prev.filter(inc => selectedIncomeTypes.includes(inc.tipo)))

    // Sanitização Crítica: Se por algum erro de migração de etapa as motivações caíram nos tipos de renda, filtramos aqui.
    const validIncomeValues = ["clt", "pj", "autonomo", "freelancer", "mesada"]
    if (selectedIncomeTypes.some(t => !validIncomeValues.includes(t))) {
      setSelectedIncomeTypes(prev => prev.filter(t => validIncomeValues.includes(t)))
    }
  }, [selectedExpenses, billLoans, selectedIncomeTypes])

  return React.useMemo(() => ({
    currentStep,
    setCurrentStep,
    motivations,
    setMotivations,
    selectedIncomeTypes,
    setSelectedIncomeTypes,
    incomes,
    setIncomes,
    selectedExpenses,
    setSelectedExpenses,
    customExpenses,
    setCustomExpenses,
    billLoans,
    setBillLoans,
    vehicles,
    setVehicles,
    debts,
    setDebts,
    isLoadingRecovery,
    setIsLoadingRecovery,
    stepErrors,
    setStepErrors,
    wasAttempted,
    setWasAttempted,
    syncStatus,
    setSyncStatus,
    lastSavedHashesRef,
    formTopRef,
    getStepData
  }), [
    currentStep,
    motivations,
    selectedIncomeTypes,
    incomes,
    selectedExpenses,
    customExpenses,
    billLoans,
    vehicles,
    debts,
    isLoadingRecovery,
    stepErrors,
    wasAttempted,
    syncStatus,
    getStepData
  ])
}