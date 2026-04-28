"use client"

import * as React from "react"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { DashboardCharts, type CategoryData, type MonthlyData } from "@/components/dashboard/dashboard-charts"
import { RecentTransactions, type Transaction } from "@/components/dashboard/recent-transactions"
import { BillsAlert } from "@/components/dashboard/bills-alert"
import { LayoutDashboard, RefreshCcw } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { useSettings } from "@/lib/settings-context"
import { useBillsNotifications } from "@/hooks/use-bills-notifications"
import { Button } from "@/components/ui/button"
import { PeriodFilter, type PeriodFilterState } from "@/components/dashboard/period-filter"
import { cn } from "@/lib/utils"

interface AnalysisResponse {
  totalReceitas: number
  totalDespesas: number
  totalAtrasadas: number
  saldoFinal: number
  monthlyComparison: MonthlyData[]
  categoryAnalysis: CategoryData[]
}

interface ExpenseApiResponse {
  id: string
  name: string
  amount: number
  category: string
  date: string
  transactionType: string
}

interface IncomeApiResponse {
  id: string
  name: string
  amount: number
  type: string
  category?: string
  date: string
}

export default function DashboardPage() {
  const { discreetMode } = useSettings()
  const { overdueCount } = useBillsNotifications()
  const [loading, setLoading] = React.useState(true)
  const [analysis, setAnalysis] = React.useState<AnalysisResponse | null>(null)
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [period, setPeriod] = React.useState<PeriodFilterState>({
    type: "monthly",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = `month=${period.month}&year=${period.year}`
      
      const [analysisData, expensesData, incomesData] = await Promise.all([
        apiClient<AnalysisResponse>(`/api/Analysis?${queryParams}`),
        apiClient<ExpenseApiResponse[]>(`/api/Expenses?limit=10&${queryParams}`),
        apiClient<IncomeApiResponse[]>(`/api/Incomes?limit=10&${queryParams}`)
      ])

      if (analysisData) {
        setAnalysis(analysisData)
      }

      const allMovements: Transaction[] = []

      if (expensesData) {
        const mappedExpenses: Transaction[] = expensesData.map(exp => ({
          id: exp.id,
          nome: exp.name,
          valor: exp.amount,
          tipo: (exp.transactionType?.toLowerCase() === "entrada" || exp.transactionType?.toLowerCase() === "receita") ? "receita" : "despesa",
          categoria: exp.category || "Outros",
          data: new Date(exp.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " • " + new Date(exp.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          rawDate: new Date(exp.date)
        }))
        allMovements.push(...mappedExpenses)
      }

      if (incomesData) {
        const mappedIncomes: Transaction[] = incomesData.map(inc => {
          const name = inc.name?.toLowerCase()
          const formattedName = (name === "clt" || name === "pj") ? name.toUpperCase() : inc.name
          
          return {
            id: inc.id,
            nome: formattedName,
            valor: inc.amount,
            tipo: "receita",
            categoria: (inc.type || inc.category || "Salário").toUpperCase(),
            data: new Date(inc.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " • " + new Date(inc.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            rawDate: new Date(inc.date)
          }
        })
        allMovements.push(...mappedIncomes)
      }

      // Ordenar por data (mais recente primeiro)
      allMovements.sort((a, b) => {
        const timeA = a.rawDate?.getTime() || 0
        const timeB = b.rawDate?.getTime() || 0
        return timeB - timeA
      })
      
      setTransactions(allMovements)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao carregar dashboard"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [period])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const cardsData = analysis ? {
    saldoAtual: analysis.saldoFinal,
    totalRecebido: analysis.totalReceitas,
    totalGasto: analysis.totalDespesas,
    contasAVencer: overdueCount
  } : null

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">Bem-vindo de volta! Aqui está o resumo das suas finanças.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full">
          <PeriodFilter value={period} onChange={setPeriod}>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchData} 
              disabled={loading}
              className="rounded-xl border-border/50 hover:bg-primary/5 transition-all active:scale-95 h-9 w-9 shrink-0"
            >
              <RefreshCcw className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin")} />
            </Button>
          </PeriodFilter>
        </div>
      </div>
      
      <BillsAlert />
      
      <DashboardCards 
        data={cardsData} 
        loading={loading} 
        discreetMode={discreetMode} 
      />
      
      <div className="grid gap-6 lg:grid-cols-5 w-full overflow-hidden">
        <div className="lg:col-span-3 min-w-0">
          <DashboardCharts 
            categoryData={analysis?.categoryAnalysis || []} 
            monthlyData={analysis?.monthlyComparison || []}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-2 min-w-0">
          <RecentTransactions 
            transactions={transactions} 
            loading={loading} 
          />
        </div>
      </div>
    </div>
  )
}