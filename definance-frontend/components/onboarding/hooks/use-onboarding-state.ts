"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import {
  Debt,
  Vehicle,
  CustomExpense
} from "../types"

export interface OnboardingState {
  // States
  currentStep: number
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  selectedIncomeTypes: string[]
  setSelectedIncomeTypes: React.Dispatch<React.SetStateAction<string[]>>
  monthlyIncome: string
  setMonthlyIncome: React.Dispatch<React.SetStateAction<string>>
  selectedExpenses: Record<string, string>
  setSelectedExpenses: React.Dispatch<React.SetStateAction<Record<string, string>>>
  customExpenses: CustomExpense[]
  setCustomExpenses: React.Dispatch<React.SetStateAction<CustomExpense[]>>
  billLoans: Record<string, { hasLoan: boolean; valor: string }>
  setBillLoans: React.Dispatch<React.SetStateAction<Record<string, { hasLoan: boolean; valor: string }>>>
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
  const [selectedIncomeTypes, setSelectedIncomeTypes] = useState<string[]>([])
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const [selectedExpenses, setSelectedExpenses] = useState<Record<string, string>>({})
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([])
  const [billLoans, setBillLoans] = useState<Record<string, { hasLoan: boolean; valor: string }>>({
    luz: { hasLoan: false, valor: "" },
    agua: { hasLoan: false, valor: "" },
    celular: { hasLoan: false, valor: "" }
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
      case 1: return selectedIncomeTypes
      case 2: return monthlyIncome
      case 3: return { selectedExpenses, customExpenses, billLoans }
      case 4: return vehicles
      case 5: return debts
      default: return null
    }
  }, [selectedIncomeTypes, monthlyIncome, selectedExpenses, customExpenses, billLoans, vehicles, debts])

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
            next[key] = { hasLoan: false, valor: "" }
          }
        })
        return next
      })
    }
  }, [selectedExpenses, billLoans])

  return {
    currentStep,
    setCurrentStep,
    selectedIncomeTypes,
    setSelectedIncomeTypes,
    monthlyIncome,
    setMonthlyIncome,
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
  }
}