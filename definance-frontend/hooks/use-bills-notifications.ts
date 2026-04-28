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
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [billsData, analysisData] = await Promise.all([
        apiClient<any[]>("/api/bills"),
        apiClient<any>("/api/Analysis")
      ])
      setBills(billsData || [])
      setAnalysis(analysisData || null)
    } catch (err) {
      console.error("Erro ao buscar notificações:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    const handleUpdate = () => fetchData()
    window.addEventListener("finance-update", handleUpdate)

    const interval = setInterval(fetchData, 1000 * 60 * 5)
    return () => {
      window.removeEventListener("finance-update", handleUpdate)
      clearInterval(interval)
    }
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

    const dueSoonBills = bills.filter(b => {
      if (b.status === "Pago") return false
      if (!b.dueDate) return false
      const dueDate = new Date(b.dueDate)
      dueDate.setHours(0, 0, 0, 0)

      const diffTime = dueDate.getTime() - hoje.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays === 2
    })

    const setupBills = bills.filter(b => b.dueDay === null && b.dueDate === null)

    // Alerta de gastos por categoria
    const budgetAlerts = analysis?.categoryAnalysis?.filter((c: any) => {
      if (!c.monthlyLimit || c.monthlyLimit <= 0) return false
      const spent = c.Valor ?? c.valor ?? 0
      return spent >= c.monthlyLimit * 0.8
    }) || []

    // Alerta de gastos totais vs receita
    const totalReceitas = analysis?.totalReceitas ?? analysis?.TotalReceitas ?? 0
    const totalDespesas = analysis?.totalDespesas ?? analysis?.TotalDespesas ?? 0
    const spendingPct = totalReceitas > 0 ? totalDespesas / totalReceitas : 0
    const spendingAlert = totalReceitas > 0 && spendingPct >= 0.8

    return {
      overdueCount: overdueBills.length,
      setupCount: setupBills.length,
      dueSoonCount: dueSoonBills.length,
      budgetAlertsCount: budgetAlerts.length,
      budgetAlerts: budgetAlerts,
      spendingAlert,
      spendingPct,
      totalReceitas,
      totalDespesas,
      totalCount: overdueBills.length + setupBills.length + dueSoonBills.length + budgetAlerts.length + (spendingAlert ? 1 : 0),
      isLoading
    }
  }, [bills, analysis, isLoading])

  return {
    ...notifications,
    refresh: fetchData
  }
}