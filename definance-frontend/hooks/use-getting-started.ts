"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

export interface GettingStartedStatus {
  hasCategories: boolean
  hasTransactions: boolean
  completedStepsCount: number
  totalStepsCount: number
  progressPercentage: number
}

export function useGettingStarted() {
  const [status, setStatus] = useState<GettingStartedStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await apiClient<GettingStartedStatus>("/api/onboarding/getting-started-status")
      if (data) {
        setStatus(data)
      }
    } catch (error) {
      console.error("Erro ao buscar status de primeiros passos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    
    // Escuta eventos globais para atualizar o status sem F5
    const handleUpdate = () => fetchStatus()
    window.addEventListener("onboarding:update", handleUpdate)
    window.addEventListener("finance-update", handleUpdate)
    
    return () => {
      window.removeEventListener("onboarding:update", handleUpdate)
      window.removeEventListener("finance-update", handleUpdate)
    }
  }, [fetchStatus])

  return {
    status,
    isLoading,
    refreshStatus: fetchStatus
  }
}
