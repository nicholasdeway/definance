"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Download, Wallet, Loader2, BarChart3 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { PeriodFilter, type PeriodFilterState } from "@/components/dashboard/period-filter"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"
import { capitalize } from "@/lib/utils"
import { useCategories } from "@/lib/category-context"
import { ExportPdfDialog } from "@/components/dashboard/export-pdf-dialog"
import { BillsAlert } from "@/components/dashboard/bills-alert"
import { incomeTypes } from "@/components/onboarding/constants"
import { AnalysisStats } from "@/components/dashboard/relatorios/analysis-stats"
import { MonthlyComparisonChart } from "@/components/dashboard/relatorios/monthly-comparison-chart"
import { CategoryAnalysisChart } from "@/components/dashboard/relatorios/category-analysis-chart"
import { BalanceEvolutionChart } from "@/components/dashboard/relatorios/balance-evolution-chart"
import { CompositionCharts } from "@/components/dashboard/relatorios/composition-charts"
import { useAuth } from "@/lib/auth-provider"
import { CategoryLimitsCard, type BudgetLimitInfo } from "@/components/dashboard/relatorios/category-limits-card"

interface MonthlyData {
  month: string
  receitas: number
  despesas: number
}

interface CategoryData {
  categoria: string
  valor: number
  monthlyLimit?: number
}

interface BalanceData {
  month: string
  receitas: number
  despesas: number
  saldo: number
}

interface IncomeDetailData {
  tipo: string
  valor: number
}

interface AnalysisData {
  totalReceitas: number
  totalDespesas: number
  totalAtrasadas: number
  saldoFinal: number
  monthlyComparison: MonthlyData[]
  categoryAnalysis: CategoryData[]
  incomeAnalysis: IncomeDetailData[]
  balanceEvolution: BalanceData[]
}

const monthTranslations: Record<string, string> = {
  Jan: "Jan",
  Feb: "Fev",
  Mar: "Mar",
  Apr: "Abr",
  May: "Mai",
  Jun: "Jun",
  Jul: "Jul",
  Aug: "Ago",
  Sep: "Set",
  Oct: "Out",
  Nov: "Nov",
  Dec: "Dez",
}

const formatMonth = (month: any) => {
  const monthStr = String(month || "")
  return monthTranslations[monthStr] || monthStr
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export default function RelatoriosPage() {
  const { user } = useAuth()
  const { discreetMode } = useSettings()
  const { resolvedTheme } = useTheme()
  const { categories: dynamicCategories } = useCategories()
  const isDark = resolvedTheme === "dark"
  const cursorFill = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"

  const [mounted, setMounted] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<AnalysisData | null>(null)
  const [period, setPeriod] = React.useState<PeriodFilterState>({
    type: "monthly",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
    fetchAnalysis()
  }, [period])

  const fetchAnalysis = async () => {
    setLoading(true)
    try {
      let queryParams = ""
      if (period.type === "monthly") {
        queryParams = `month=${period.month}&year=${period.year}`
      } else if (period.type === "60_days") {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 60)
        queryParams = `startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      } else if (period.type === "90_days") {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 90)
        queryParams = `startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      } else if (period.type === "custom") {
        if (period.startDate && period.endDate) {
          queryParams = `startDate=${new Date(period.startDate).toISOString()}&endDate=${new Date(period.endDate).toISOString()}`
        } else {
          queryParams = `month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`
        }
      }

      const response = await apiClient<AnalysisData>(`/api/Analysis?${queryParams}`)
      
      if (response) {
        let categoriesList = dynamicCategories || []
        
        // 1. Buscar progresso do onboarding e Contas (Bills) para projeção
        try {
          const [progressData, billsData, fetchedCategories] = await Promise.all([
            apiClient<any>("/api/onboarding/progress"),
            apiClient<any[]>("/api/Bills"),
            dynamicCategories.length > 0 ? Promise.resolve(dynamicCategories) : apiClient<any[]>("/api/categories")
          ])

          if (fetchedCategories) {
            categoriesList = fetchedCategories
          }

          if (progressData) {
            const profileIncomes: any[] = progressData.incomes || progressData.Incomes || []
            const bills: any[] = billsData || []
            
            // Função auxiliar para calcular a renda projetada de um tipo específico em um mês/ano específico
            const getProjectedForMonth = (pInc: any, year: number, month: number) => {
              const selectedMonthDate = new Date(year, month - 1, 1)
              let effectiveValor = pInc.valor || pInc.Valor || 0
              let effectiveFreq = (pInc.frequencia || pInc.Frequencia || "").toLowerCase()
              let effectiveDias = pInc.diasRecebimento || pInc.DiasRecebimento || ""

              const parseDateSafe = (dateStr: string) => {
                if (!dateStr) return null
                const cleaned = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
                
                let parts = cleaned.split('-').map(Number)
                if (parts.length === 3 && !parts.some(isNaN)) {
                  return parts[0] > 1000 
                    ? new Date(parts[0], parts[1] - 1, parts[2]) 
                    : new Date(parts[2], parts[1] - 1, parts[0])
                }
                
                parts = cleaned.split('/').map(Number)
                if (parts.length === 3 && !parts.some(isNaN)) {
                  return parts[0] > 1000 
                    ? new Date(parts[0], parts[1] - 1, parts[2]) 
                    : new Date(parts[2], parts[1] - 1, parts[0])
                }
                
                const parsed = new Date(dateStr)
                return isNaN(parsed.getTime()) ? null : parsed
              }

              const hMin = pInc.historicoConfiguracoes || []
              const hMaj = pInc.HistoricoConfiguracoes || []
              const history = hMin.length > 0 ? hMin : hMaj

              if (history.length > 0) {
                const configHistorica = [...history]
                  .sort((a: any, b: any) => {
                    const dateA = parseDateSafe(a.validoAte || a.ValidoAte)
                    const dateB = parseDateSafe(b.validoAte || b.ValidoAte)
                    return (dateA?.getTime() || 0) - (dateB?.getTime() || 0)
                  })
                  .find((h: any) => {
                    const vDate = parseDateSafe(h.validoAte || h.ValidoAte)
                    if (!vDate) return false
                    const validUntilMonth = new Date(vDate.getFullYear(), vDate.getMonth(), 1)
                    return selectedMonthDate <= validUntilMonth
                  })

                if (configHistorica) {
                  effectiveValor = configHistorica.valor
                  effectiveFreq = (configHistorica.frequencia || "").toLowerCase()
                  effectiveDias = configHistorica.diasRecebimento || ""
                }
              }

              if (effectiveFreq === "semanal") effectiveValor *= 4
              else if (effectiveFreq === "quinzenal") effectiveValor *= 2

              const firstDateStr = effectiveDias.split(',')[0]?.trim()
              const baseDateStr = firstDateStr || pInc.configuradoEm || pInc.ConfiguradoEm
              if (baseDateStr) {
                const pDate = parseDateSafe(baseDateStr)
                if (pDate) {
                  const limitMonth = new Date(pDate.getFullYear(), pDate.getMonth(), 1)
                  if (selectedMonthDate < limitMonth) return 0
                }
              }

              return effectiveValor
            }

            // --- AJUSTE DOS CHARTS (MonthlyComparison e BalanceEvolution) ---
            response.monthlyComparison.forEach(mEntry => {
               const rDate = (mEntry as any).rawDate || (mEntry as any).RawDate
               let monthNum = 0
               let yearNum = period.year

               if (rDate) {
                 const d = new Date(rDate)
                 monthNum = d.getMonth() + 1
                 yearNum = d.getFullYear()
               } else {
                 const monthMap: Record<string, number> = {
                   "jan": 1, "feb": 2, "fev": 2, "mar": 3, "apr": 4, "abr": 4,
                   "may": 5, "mai": 5, "jun": 6, "jul": 7, "aug": 8, "ago": 8,
                   "sep": 9, "set": 9, "oct": 10, "out": 10, "nov": 11, "dec": 12, "dez": 12
                 }
                 monthNum = monthMap[mEntry.month.toLowerCase()] || 0
               }
               
               if (monthNum > 0) {
                  // Evitar projeções de onboarding/contas recorrentes antes da data de criação do usuário
                  if (user?.createdAt) {
                    const uCreated = new Date(user.createdAt)
                    const targetMonthDate = new Date(yearNum, monthNum - 1, 1)
                    const limitMonthDate = new Date(uCreated.getFullYear(), uCreated.getMonth(), 1)
                    if (targetMonthDate < limitMonthDate) {
                      const bEntry = response.balanceEvolution.find(b => b.month === mEntry.month)
                      if (bEntry) {
                        (bEntry as any).receitas = mEntry.receitas;
                        (bEntry as any).despesas = mEntry.despesas;
                        bEntry.saldo = mEntry.receitas - mEntry.despesas
                      }
                      return
                    }
                  }

                 // 1. Ajustar Receitas (Onboarding)
                 let totalProjectedIncomes = 0
                 profileIncomes.forEach(pInc => {
                    totalProjectedIncomes += getProjectedForMonth(pInc, yearNum, monthNum)
                 })
                 if (mEntry.receitas < totalProjectedIncomes) mEntry.receitas = totalProjectedIncomes

                 // 2. Ajustar Despesas (Projetar Bills Recorrentes ou Pendentes)
                 let totalProjectedBills = 0
                 bills.forEach(bill => {
                   const status = (bill.status || bill.Status || "").toLowerCase()
                   if (status === "pago" || status === "extinta") return

                   const dueDate = new Date(bill.dueDate || bill.DueDate)
                   const isRecurring = bill.isRecurring || bill.IsRecurring
                   
                   // Se for recorrente e começou antes ou neste mês
                   if (isRecurring) {
                     const startMonth = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1)
                     const targetMonth = new Date(yearNum, monthNum - 1, 1)
                     if (targetMonth >= startMonth) {
                       totalProjectedBills += (bill.amount || bill.Amount || 0)
                     }
                   } 
                   // Se for fixa (não recorrente) e cair exatamente neste mês
                   else if (dueDate.getMonth() + 1 === monthNum && dueDate.getFullYear() === yearNum) {
                     totalProjectedBills += (bill.amount || bill.Amount || 0)
                   }
                 })
                 
                 // Se o total de contas for maior que as despesas já pagas, usamos o total de contas
                 if (mEntry.despesas < totalProjectedBills) mEntry.despesas = totalProjectedBills

                 // 3. Atualizar BalanceEvolution (Agora com Receitas e Despesas detalhadas)
                 const bEntry = response.balanceEvolution.find(b => b.month === mEntry.month)
                 if (bEntry) {
                   (bEntry as any).receitas = mEntry.receitas;
                   (bEntry as any).despesas = mEntry.despesas;
                   bEntry.saldo = mEntry.receitas - mEntry.despesas
                 }
               }
            })

            // --- ORDENAÇÃO EXPLÍCITA PARA GARANTIR PASSADO -> PRESENTE ---
            const sortByDate = (a: any, b: any) => {
              const dateA = new Date(a.rawDate || a.RawDate || 0).getTime()
              const dateB = new Date(b.rawDate || b.RawDate || 0).getTime()
              return dateA - dateB
            }
            response.monthlyComparison.sort(sortByDate)
            response.balanceEvolution.sort(sortByDate)

            // --- AJUSTE DOS STATS (Mês Selecionado) ---
            let totalAdjustmentStats = 0
            let shouldAdjustStats = true
            if (user?.createdAt) {
              const uCreated = new Date(user.createdAt)
              const selectedMonthDate = new Date(period.year, period.month - 1, 1)
              const limitMonthDate = new Date(uCreated.getFullYear(), uCreated.getMonth(), 1)
              if (selectedMonthDate < limitMonthDate) {
                shouldAdjustStats = false
              }
            }

            if (shouldAdjustStats) {
              profileIncomes.forEach(pInc => {
                const projectedValue = getProjectedForMonth(pInc, period.year, period.month)
                const pTipo = (pInc.tipo || pInc.Tipo || "").toLowerCase()
                
                const existingIndex = response.incomeAnalysis.findIndex(i => {
                  const iTipo = i.tipo.toLowerCase()
                  const pTipoLower = pTipo.toLowerCase()
                  return iTipo === pTipoLower || 
                         (incomeTypes.find(t => t.value === pTipoLower)?.label.toLowerCase() === iTipo)
                })

                if (existingIndex !== -1) {
                  const dbValor = response.incomeAnalysis[existingIndex].valor
                  if (dbValor < projectedValue) {
                    const diff = projectedValue - dbValor
                    response.incomeAnalysis[existingIndex].valor = projectedValue
                    totalAdjustmentStats += diff
                  }
                } else if (projectedValue > 0) {
                  response.incomeAnalysis.push({ tipo: pTipo, valor: projectedValue })
                  totalAdjustmentStats += projectedValue
                }
              })
            }

            response.totalReceitas = response.incomeAnalysis.reduce((sum, i) => sum + i.valor, 0)
            response.saldoFinal = response.totalReceitas - response.totalDespesas
          }
        } catch (e) {
          console.error("Erro ao sincronizar rendas do perfil na análise:", e)
        }

        // 2. Agrupar e normalizar tipos de renda (evita duplicidade clt vs CLT e usa labels amigáveis)
        response.incomeAnalysis = response.incomeAnalysis.reduce((acc, curr) => {
          const typeLower = curr.tipo.toLowerCase()
          const typeInfo = incomeTypes.find(t => t.value === typeLower)
          const label = typeInfo ? typeInfo.label : capitalize(curr.tipo)
          
          const existing = acc.find(a => a.tipo === label)
          if (existing) {
            existing.valor += curr.valor
          } else {
            acc.push({ tipo: label, valor: curr.valor })
          }
          return acc
        }, [] as IncomeDetailData[])

        // 3. Agrupar e normalizar categorias de despesa (evita duplicidade de maiúsculas/minúsculas/acentos)
        const normalizeStr = (str: string) => 
          str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

        const groupedCategories = response.categoryAnalysis.reduce((acc, curr) => {
          const catNameRaw = curr.categoria || ""
          const catNameNormalized = normalizeStr(catNameRaw)
          if (!catNameNormalized) return acc
          
          const matchedCategory = categoriesList.find((c: any) => normalizeStr(c.name || "") === catNameNormalized)
          let nameToUse = matchedCategory ? matchedCategory.name : capitalize(catNameRaw)
          
          const nameNormalized = normalizeStr(nameToUse)
          if (nameNormalized === "outros" || nameNormalized === "outro" || nameNormalized === "outroe") {
            nameToUse = "Outros"
          } else if (nameNormalized.startsWith("filho")) {
            nameToUse = "Filho"
          }
          
          const existing = acc.find(c => c.categoria === nameToUse)
          if (existing) {
            existing.valor += curr.valor
          } else {
            const limit = curr.monthlyLimit !== undefined ? curr.monthlyLimit : (curr as any).MonthlyLimit;
            acc.push({ 
              categoria: nameToUse, 
              valor: curr.valor,
              monthlyLimit: limit ?? matchedCategory?.monthlyLimit ?? (matchedCategory as any)?.MonthlyLimit
            })
          }
          return acc
        }, [] as CategoryData[])

        response.categoryAnalysis = groupedCategories.sort((a, b) => b.valor - a.valor)
      }
      setData(response)
    } catch (error) {
      toast.error("Erro ao carregar análises financeiras")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const budgetLimits = React.useMemo(() => {
    if (!data) return []
    const categoriesList = dynamicCategories || []
    const normalizeStr = (str: string) => 
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    return categoriesList
      .filter((c: any) => {
        const limit = c.monthlyLimit ?? c.MonthlyLimit
        return limit !== null && limit !== undefined && limit > 0
      })
      .map((c: any) => {
        const limit = c.monthlyLimit ?? c.MonthlyLimit
        const analysisEntry = data.categoryAnalysis.find(
          (a: any) => normalizeStr(a.categoria) === normalizeStr(c.name || "")
        )
        const spent = analysisEntry ? analysisEntry.valor : 0
        const pct = Math.round((spent / limit) * 100)
        return {
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          monthlyLimit: limit,
          spent,
          pct
        }
      })
      .sort((a, b) => b.pct - a.pct)
  }, [data, dynamicCategories])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 items-start">
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Análises</h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">Relatórios e insights detalhados do seu dinheiro</p>
          </div>

          <PeriodFilter value={period} onChange={setPeriod}>
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(true)}
              className="h-9 gap-2 bg-card hover:bg-muted border-border/50 transition-colors cursor-pointer px-3 sm:px-4 shrink-0"
              size="sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </PeriodFilter>
        </div>
      </div>

      <BillsAlert />

      {loading ? (
        <div className="flex h-[40vh] sm:h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2 sm:gap-4">
            <Loader2 className="h-5 w-5 sm:h-8 sm:w-8 animate-spin text-primary" />
            <p className="text-[11px] sm:text-sm text-muted-foreground/70">Processando...</p>
          </div>
        </div>
      ) : data ? (
        <>
          <AnalysisStats 
            totalReceitas={data.totalReceitas}
            totalDespesas={data.totalDespesas}
            saldoFinal={data.saldoFinal}
            totalAtrasadas={data.totalAtrasadas}
            loading={loading}
            discreetMode={discreetMode}
          />

          <CategoryLimitsCard limits={budgetLimits} discreetMode={discreetMode} />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="min-w-0">
              <MonthlyComparisonChart 
                data={data.monthlyComparison}
                discreetMode={discreetMode}
                cursorFill={cursorFill}
                formatMonth={formatMonth}
              />
            </div>

            <div className="min-w-0">
              <CategoryAnalysisChart 
                data={data.categoryAnalysis}
                discreetMode={discreetMode}
                cursorFill={cursorFill}
              />
            </div>
          </div>

          <div className="min-w-0">
            <BalanceEvolutionChart 
              data={data.balanceEvolution}
              discreetMode={discreetMode}
              isDark={isDark}
              formatMonth={formatMonth}
            />
          </div>

          <CompositionCharts 
            incomeAnalysis={data.incomeAnalysis}
            categoryAnalysis={data.categoryAnalysis}
            discreetMode={discreetMode}
            chartColors={CHART_COLORS}
          />
        </>
      ) : (
        <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-muted p-4">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">Nenhuma análise disponível</h3>
            <p className="text-sm text-muted-foreground">Comece a lançar suas receitas e despesas para ver relatórios aqui.</p>
          </div>
        </div>
      )}
      <ExportPdfDialog 
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        title="Relatório Consolidado"
        subtitle="Deseja exportar o resumo financeiro do período selecionado em PDF?"
        data={[
          { item: "Total Receitas", valor: data?.totalReceitas || 0 },
          { item: "Total Despesas", valor: data?.totalDespesas || 0 },
          { item: "Contas Atrasadas", valor: data?.totalAtrasadas || 0 },
          { item: "Saldo Líquido", valor: data?.saldoFinal || 0 },
          ...(data?.categoryAnalysis || []).map(c => ({ item: `Despesa: ${c.categoria}`, valor: c.valor })),
          ...(data?.incomeAnalysis || []).map(i => ({ item: `Receita: ${i.tipo}`, valor: i.valor }))
        ] as any}
        columns={[
          { header: "Descrição", key: "item" },
          { header: "Valor", key: "valor", type: "currency" },
        ]}
        fileName={`analise-${period.month}-${period.year}`}
      />
    </div>
  )
}