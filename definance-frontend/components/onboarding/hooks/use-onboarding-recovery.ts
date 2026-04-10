import { useEffect } from "react"
import { useOnboarding } from "./use-onboarding"
import { apiClient } from "@/lib/api-client"
import { OnboardingProgress } from "../types"

export const useOnboardingRecovery = () => {
  const {
    setSelectedIncomeTypes,
    setMonthlyIncome,
    setSelectedExpenses,
    setCustomExpenses,
    setBillLoans,
    setVehicles,
    setDebts,
    setCurrentStep,
    lastSavedHashesRef
  } = useOnboarding()

  useEffect(() => {
    // Helper para mapear propriedades independente de case (camelCase vs PascalCase)
    const getVal = (obj: any, key: string) => {
      if (!obj) return undefined
      return obj[key] ?? obj[key.charAt(0).toUpperCase() + key.slice(1)]
    }

    const fetchProgress = async () => {
      try {
        const data = await apiClient<OnboardingProgress>("/api/onboarding/progress")
        if (data) {
          // Mapeia os dados usando helper defensivo
          const incomeTypes = getVal(data, "selectedIncomeTypes")
          const mIncome = getVal(data, "monthlyIncome")
          const expenses = getVal(data, "selectedExpenses")
          const cExpenses = getVal(data, "customExpenses")
          const loans = getVal(data, "billLoans")
          const vList = getVal(data, "vehicles")
          const dList = getVal(data, "debts")
          const cStep = getVal(data, "currentStep")

          if (incomeTypes) setSelectedIncomeTypes(incomeTypes)
          if (mIncome) setMonthlyIncome(mIncome)
          if (expenses) setSelectedExpenses(expenses)
          if (cExpenses) setCustomExpenses(cExpenses)
          if (loans) setBillLoans(loans)

          if (vList) {
            const sanitizedVehicles = vList.map((v: any, index: number) => ({
              ...v,
              id: v.id || `v-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
              nome: v.nome || "",
              ano: v.ano || "",
              ipva: v.ipva || "",
              multas: v.multas || "",
              valorParcela: v.valorParcela || "",
              valorSeguro: v.valorSeguro || "",
              parcelasTotal: v.parcelasTotal || "",
              parcelasPagas: v.parcelasPagas || ""
            }))
            setVehicles(sanitizedVehicles)
          }

          if (dList) {
            // Sanitize debts to avoid null values in inputs and duplicate keys
            const sanitizedDebts = dList.map((d: any, index: number) => ({
              ...d,
              id: d.id || `d-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
              descricao: d.descricao || "",
              valor: d.valor || "",
              parcelasTotal: d.parcelasTotal || "",
              parcelasPagas: d.parcelasPagas || ""
            }))
            setDebts(sanitizedDebts)
          }

          if (cStep) {
            const clampedStep = Math.max(1, Math.min(Number(cStep), 5))
            setCurrentStep(clampedStep)
          }

          // Marca o estado inicial como "salvo" para todas as etapas recuperadas
          lastSavedHashesRef.current[1] = JSON.stringify(incomeTypes || [])
          lastSavedHashesRef.current[2] = JSON.stringify(mIncome || "")
          lastSavedHashesRef.current[3] = JSON.stringify({
            selectedExpenses: expenses || {},
            customExpenses: cExpenses || [],
            billLoans: loans || {}
          })
          lastSavedHashesRef.current[4] = JSON.stringify(vList || [])
          lastSavedHashesRef.current[5] = JSON.stringify(dList || [])

          console.log("[Recovery] Progresso recuperado e hashes inicializados.")
        }
      } catch (error) {
        console.error("[Recovery Error] Não foi possível recuperar o progresso anterior:", error)
      }
    }

    fetchProgress()
  }, [
    setSelectedIncomeTypes,
    setMonthlyIncome,
    setSelectedExpenses,
    setCustomExpenses,
    setBillLoans,
    setVehicles,
    setDebts,
    setCurrentStep,
    lastSavedHashesRef
  ])
}