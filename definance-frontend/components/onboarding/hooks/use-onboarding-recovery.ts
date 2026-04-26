import { useEffect, useRef } from "react"
import { useOnboarding } from "./use-onboarding"
import { apiClient } from "@/lib/api-client"
import { OnboardingProgress } from "../types"

export const useOnboardingRecovery = () => {
  const hasFetchedRef = useRef(false)
  const {
    setMotivations,
    setSelectedIncomeTypes,
    setIncomes,
    setSelectedExpenses,
    setCustomExpenses,
    setBillLoans,
    setVehicles,
    setDebts,
    setCurrentStep,
    setIsLoadingRecovery,
    lastSavedHashesRef
  } = useOnboarding()

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    const getVal = (obj: any, key: string) => {
      if (!obj) return undefined
      return obj[key] ?? obj[key.charAt(0).toUpperCase() + key.slice(1)]
    }

    const sanitizeExtras = (extrasRaw: any) => {
      if (!extrasRaw) return []
      if (Array.isArray(extrasRaw)) return extrasRaw
      if (typeof extrasRaw === 'object') {
        return Object.entries(extrasRaw).map(([k, val]) => ({
          id: Math.random().toString(36).substring(2),
          descricao: k,
          valor: val
        }))
      }
      return []
    }

    const fetchProgress = async () => {
      try {
        const data = await apiClient<OnboardingProgress>("/api/onboarding/progress")
        if (data) {
          // Mapeia os dados usando helper defensivo
          const motivations = getVal(data, "motivations")
          const incomeTypes = getVal(data, "selectedIncomeTypes")
          const incomesList = getVal(data, "incomes")
          const expenses = getVal(data, "selectedExpenses")
          const cExpenses = getVal(data, "customExpenses")
          const loans = getVal(data, "billLoans")
          const vList = getVal(data, "vehicles")
          const dList = getVal(data, "debts")
          const cStep = getVal(data, "currentStep")

          if (motivations) setMotivations(motivations)
          if (incomeTypes) setSelectedIncomeTypes(incomeTypes)
          if (incomesList) setIncomes(incomesList)
          if (expenses) setSelectedExpenses(expenses)
          if (cExpenses) setCustomExpenses(cExpenses)
          if (loans) setBillLoans(loans)

          if (vList) {
            const sanitizedVehicles = vList.map((v: any, index: number) => ({
              ...v,
              id: v.id || `v-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
              nome: v.nome || "",
              ano: v.ano || "",
              ipva: v.ipva || 0,
              multas: v.multas || 0,
              valorParcela: v.valorParcela || 0,
              valorSeguro: v.valorSeguro || 0,
              parcelasTotal: v.parcelasTotal || 0,
              parcelasPagas: v.parcelasPagas || 0,
              extras: sanitizeExtras(v.extras)
            }))
            setVehicles(sanitizedVehicles)
          }

          if (dList) {
            // Sanitize debts to avoid null values in inputs and duplicate keys
            const sanitizedDebts = dList.map((d: any, index: number) => ({
              ...d,
              id: d.id || `d-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
              descricao: d.descricao || "",
              valor: d.valor || 0,
              parcelasTotal: d.parcelasTotal || 0,
              parcelasPagas: d.parcelasPagas || 0,
              extras: sanitizeExtras(d.extras)
            }))
            setDebts(sanitizedDebts)
          }

          if (cStep) {
            const clampedStep = Math.max(1, Math.min(Number(cStep), 6))
            setCurrentStep(clampedStep)
          }

          // Marca o estado inicial como "salvo" para todas as etapas recuperadas
          lastSavedHashesRef.current[1] = JSON.stringify(motivations || [])
          lastSavedHashesRef.current[2] = JSON.stringify(incomeTypes || [])
          lastSavedHashesRef.current[3] = JSON.stringify(incomesList || [])
          lastSavedHashesRef.current[4] = JSON.stringify({
            selectedExpenses: expenses || {},
            customExpenses: cExpenses || [],
            billLoans: loans || {}
          })
          lastSavedHashesRef.current[5] = JSON.stringify(vList || [])
          lastSavedHashesRef.current[6] = JSON.stringify(dList || [])

          console.log("[Recovery] Progresso recuperado e hashes inicializados.")
        }
      } catch (error) {
        console.error("[Recovery Error] Não foi possível recuperar o progresso anterior:", error)
      } finally {
        setIsLoadingRecovery(false)
      }
    }

    fetchProgress()
  }, [
    setMotivations,
    setIncomes,
    setSelectedIncomeTypes,
    setSelectedExpenses,
    setCustomExpenses,
    setBillLoans,
    setVehicles,
    setDebts,
    setCurrentStep,
    setIsLoadingRecovery,
    lastSavedHashesRef
  ])
}