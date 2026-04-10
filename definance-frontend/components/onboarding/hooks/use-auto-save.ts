import { useEffect, useCallback } from "react"
import { useOnboarding } from "./use-onboarding"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export const useAutoSave = () => {
  const {
    currentStep,
    getStepData,
    lastSavedHashesRef,
    setSyncStatus
  } = useOnboarding()
  const { toast } = useToast()

  const persistStep = useCallback(async (step: number, data: any, isAutoSave = false) => {
    const dataString = JSON.stringify(data)

    if (lastSavedHashesRef.current[step] === dataString) return true

    setSyncStatus('saving')
    let attempts = 0
    const maxAttempts = 4

    const executeSave = async (): Promise<boolean> => {
      try {
        await apiClient(`/api/onboarding/save-step/${step}`, {
          method: "POST",
          body: dataString
        })
        lastSavedHashesRef.current[step] = dataString
        setSyncStatus('saved')
        setTimeout(() => setSyncStatus(prev => prev === 'saved' ? 'idle' : prev), 2000)
        return true
      } catch (error) {
        attempts++
        console.error(`[Persist Error] Etapa ${step} (Tentativa ${attempts}):`, error)

        if (attempts < maxAttempts) {
          const timeout = Math.pow(2, attempts) * 1000
          await new Promise(resolve => setTimeout(resolve, timeout))
          return executeSave()
        }

        setSyncStatus('error')
        if (!isAutoSave) {
          toast({
            variant: "destructive",
            title: "Erro de Conexão",
            description: "Não foi possível salvar seu progresso. Tente novamente ou verifique sua internet.",
          })
        }
        return false
      }
    }

    return executeSave()
  }, [setSyncStatus, lastSavedHashesRef, toast])

  useEffect(() => {
    const currentData = getStepData(currentStep)
    const dataString = JSON.stringify(currentData)

    if (lastSavedHashesRef.current[currentStep] === dataString) return

    const timer = setTimeout(() => {
      persistStep(currentStep, currentData, true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentStep, getStepData, persistStep, lastSavedHashesRef])

  return { persistStep }
}