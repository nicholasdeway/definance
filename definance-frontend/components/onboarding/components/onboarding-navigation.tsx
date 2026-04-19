"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useOnboarding } from "../hooks/use-onboarding"
import { useOnboardingValidation } from "../hooks/use-onboarding-validation"
import { useAutoSave } from "../hooks/use-auto-save"
import { steps } from "../constants"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-provider"

export const OnboardingNavigation = () => {
  const router = useRouter()
  const { 
    currentStep, 
    setCurrentStep, 
    setWasAttempted, 
    setStepErrors, 
    getStepData,
    motivations,
    selectedIncomeTypes,
    incomes,
    selectedExpenses,
    customExpenses,
    billLoans,
    vehicles,
    debts
  } = useOnboarding()
  const { refreshUser } = useAuth()
  const { validateStep } = useOnboardingValidation()
  const { persistStep } = useAutoSave()
  const [isFinishing, setIsFinishing] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  const handleNext = async () => {
    if (isNavigating || isFinishing) return
    
    if (validateStep(currentStep)) {
      setIsNavigating(true)
      try {
        const currentData = getStepData(currentStep)
        const success = await persistStep(currentStep, currentData)
        
        if (success && currentStep < steps.length) {
          setCurrentStep(s => s + 1)
          setWasAttempted(false)
          setStepErrors([])
        }
      } catch (error: any) {
        console.error("Erro ao avançar de etapa:", error)
      } finally {
        setIsNavigating(false)
      }
    }
  }

  const handleBack = async () => {
    if (isNavigating || isFinishing) return
    if (currentStep > 1) {
      setIsNavigating(true)
      try {
        const currentData = getStepData(currentStep)
        await persistStep(currentStep, currentData)
        setCurrentStep(s => s - 1)
        setWasAttempted(false)
        setStepErrors([])
      } catch (error: any) {
        console.error("Erro ao voltar de etapa:", error)
      } finally {
        setIsNavigating(false)
      }
    }
  }

  const handleFinish = async () => {
    if (!validateStep(currentStep)) return

    setIsFinishing(true)
    try {
      // Salva a última etapa primeiro
      const currentData = getStepData(currentStep)
      const success = await persistStep(currentStep, currentData)

      if (!success) {
        return
      }

      const mappedIncomes = incomes.map(inc => ({ ...inc, valor: inc.valor }))
      const mappedSelectedExpenses = Object.fromEntries(Object.entries(selectedExpenses).map(([k, v]) => [k, v]))
      const mappedCustomExpenses = customExpenses.map(exp => ({ ...exp, valor: exp.valor }))
      const mappedBillLoans = Object.fromEntries(Object.entries(billLoans).map(([k, v]) => [k, { ...v, valor: v.valor }]))
      const mappedVehicles = vehicles.map(v => ({ 
        ...v, 
        ipva: v.ipva || 0, 
        multas: v.multas || 0,
        valorParcela: v.valorParcela || 0,
        valorSeguro: v.valorSeguro || 0,
      }))
      const mappedDebts = debts.map(d => ({ ...d, valor: d.valor }))

      const submissionData = {
        currentStep,
        motivations,
        selectedIncomeTypes,
        incomes: mappedIncomes,
        selectedExpenses: mappedSelectedExpenses,
        customExpenses: mappedCustomExpenses,
        billLoans: mappedBillLoans,
        vehicles: mappedVehicles,
        debts: mappedDebts
      }

      // Finaliza processo enviando todos os dados
      await apiClient("/api/onboarding/complete", { 
        method: "POST",
        body: JSON.stringify(submissionData)
      })
      
      // Atualiza o estado global do usuário para que o AuthProvider perceba a mudança
      await refreshUser(true)
      
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Erro ao finalizar:", error)
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <div className="flex gap-3 pt-4 border-t border-border/10">
      {currentStep > 1 && (
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isFinishing || isNavigating}
          className="flex-1 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      )}

      {currentStep < steps.length ? (
        <Button 
          onClick={handleNext} 
          disabled={isFinishing || isNavigating}
          className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/70 cursor-pointer"
        >
          {isNavigating ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <>
              Próximo
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      ) : (
        <Button 
          onClick={handleFinish} 
          disabled={isFinishing}
          className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/70 cursor-pointer"
        >
          {isFinishing ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <>
              Finalizar
              <CheckCircle2 className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}