"use client"

import { useState, useEffect, useMemo } from "react"
import { apiClient } from "@/lib/api-client"

export interface BillNotification {
  id: string
  title: string
  description: string
  type: "setup" | "overdue"
  count: number
}

export function useBillsNotifications() {
  const [bills, setBills] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchBills = async () => {
    try {
      const data = await apiClient<any[]>("/api/bills")
      setBills(data || [])
    } catch (err) {
      console.error("Erro ao buscar notificações:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBills()

    // Opcional: Atualizar a cada X minutos ou em eventos específicos
    const interval = setInterval(fetchBills, 1000 * 60 * 5) // 5 min
    return () => clearInterval(interval)
  }, [])

  const notifications = useMemo(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const overdueBills = bills.filter(b => {
      if (b.status === "Pago") return false
      if (!b.dueDate) return false
      const dueDate = new Date(b.dueDate)
      return dueDate < hoje
    })

    const setupBills = bills.filter(b => b.dueDay === null && b.dueDate === null)

    return {
      overdueCount: overdueBills.length,
      setupCount: setupBills.length,
      totalCount: overdueBills.length + setupBills.length,
      isLoading
    }
  }, [bills, isLoading])

  return {
    ...notifications,
    refresh: fetchBills
  }
}