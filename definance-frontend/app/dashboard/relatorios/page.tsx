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
import { ExportPdfDialog } from "@/components/dashboard/export-pdf-dialog"
import { BillsAlert } from "@/components/dashboard/bills-alert"
import { incomeTypes } from "@/components/onboarding/constants"
import { AnalysisStats } from "@/components/dashboard/relatorios/analysis-stats"
import { MonthlyComparisonChart } from "@/components/dashboard/relatorios/monthly-comparison-chart"
import { CategoryAnalysisChart } from "@/components/dashboard/relatorios/category-analysis-chart"
import { BalanceEvolutionChart } from "@/components/dashboard/relatorios/balance-evolution-chart"
import { CompositionCharts } from "@/components/dashboard/relatorios/composition-charts"

interface MonthlyData {
  month: string
  receitas: number
  despesas: number
}

interface CategoryData {
  categoria: string
  valor: number
}

interface BalanceData {
  month: string
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
  const { discreetMode } = useSettings()
  const { resolvedTheme } = useTheme()
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
        response.categoryAnalysis = response.categoryAnalysis.map(c => ({ ...c, categoria: capitalize(c.categoria) }))
        
        // 1. Buscar progresso do onboarding para incluir rendas "sincronizadas" que ainda não foram salvas no banco
        try {
          const progressData = await apiClient<any>("/api/onboarding/progress")
          if (progressData) {
            const profileIncomes: any[] = progressData.incomes || progressData.Incomes || []
            let totalAdjustment = 0
            
            profileIncomes.forEach(pInc => {
              const pTipo = (pInc.tipo || pInc.Tipo || "").toLowerCase()
              const pDias = pInc.diasRecebimento || pInc.DiasRecebimento || ""
              const pConfigEm = pInc.configuradoEm || pInc.ConfiguradoEm
              
              // --- Lógica de Histórico e Projeção ---
              let effectiveValor = pInc.valor || pInc.Valor || 0
              const freq = (pInc.frequencia || pInc.Frequencia || "").toLowerCase()

              // Aplicar multiplicadores de frequência para o total mensal
              if (freq === "semanal") {
                effectiveValor *= 4
              } else if (freq === "quinzenal") {
                effectiveValor *= 2
              }
              
              const isVariable = freq === "variavel"
              const firstDateStr = pDias.split(',')[0]?.trim()
              const baseDateStr = isVariable ? pConfigEm : (firstDateStr || pConfigEm)
              const selectedMonthDate = new Date(period.year, period.month - 1, 1)

              // 1. Verificar se deve usar a configuração anterior (histórico)
              if (pInc.configuracaoAnterior && pInc.configuracaoAnterior.validoAte) {
                const validoAte = new Date(pInc.configuracaoAnterior.validoAte)
                const validUntilMonth = new Date(validoAte.getFullYear(), validoAte.getMonth(), 1)
                
                if (selectedMonthDate < validUntilMonth) {
                  effectiveValor = pInc.configuracaoAnterior.valor
                }
              }

              // 2. Verificar se a renda já começou neste período
              if (baseDateStr) {
                const datePart = baseDateStr.includes('T') ? baseDateStr.split('T')[0] : baseDateStr
                const [y, m, d] = datePart.split('-').map(Number)
                const startDate = new Date(y, m - 1, d)

                if (selectedMonthDate < new Date(startDate.getFullYear(), startDate.getMonth(), 1)) {
                  effectiveValor = 0 // Ainda não começou, então o valor projetado é 0
                }
              }
              
              // 3. Mesclar com os dados do banco (Analysis)
              const existingIndex = response.incomeAnalysis.findIndex(i => {
                const iTipo = i.tipo.toLowerCase()
                const pTipoLower = pTipo.toLowerCase()
                
                // Match por valor bruto (ex: "clt" === "clt") 
                // OU por label (ex: "clt / salário" === "clt / salário")
                return iTipo === pTipoLower || 
                       (incomeTypes.find(t => t.value === pTipoLower)?.label.toLowerCase() === iTipo) ||
                       (incomeTypes.find(t => t.label.toLowerCase() === iTipo)?.value === pTipoLower)
              })
              
              if (existingIndex !== -1) {
                // Já existe no banco: ajustamos o valor para bater com o Perfil (nossa fonte de verdade)
                const dbValor = response.incomeAnalysis[existingIndex].valor
                const diff = effectiveValor - dbValor
                
                response.incomeAnalysis[existingIndex].valor = effectiveValor
                response.totalReceitas += diff
                response.saldoFinal += diff
                totalAdjustment += diff
              } else if (effectiveValor > 0) {
                // Não existe no banco: adicionamos como novo
                response.incomeAnalysis.push({
                  tipo: pTipo,
                  valor: effectiveValor
                })
                response.totalReceitas += effectiveValor
                response.saldoFinal += effectiveValor
                totalAdjustment += effectiveValor
              }
            })

            // Atualizar o gráfico de comparação mensal (Receitas vs Despesas)
            if (totalAdjustment !== 0) {
              const currentMonthStr = new Date(period.year, period.month - 1, 1).toLocaleString('en-US', { month: 'short' }).toLowerCase()
              const monthEntry = response.monthlyComparison.find(m => m.month.toLowerCase() === currentMonthStr)
              
              if (monthEntry) {
                monthEntry.receitas += totalAdjustment
              } else {
                response.monthlyComparison.push({
                  month: currentMonthStr.charAt(0).toUpperCase() + currentMonthStr.slice(1),
                  receitas: totalAdjustment,
                  despesas: 0
                })
              }
            }
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
      }
      setData(response)
    } catch (error) {
      toast.error("Erro ao carregar análises financeiras")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Análises</h1>
          </div>
          <p className="text-muted-foreground text-sm">Relatórios e insights detalhados do seu dinheiro</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter 
            value={period}
            onChange={setPeriod}
          />
          <Button 
            variant="outline" 
            onClick={() => setIsExportDialogOpen(true)}
            className="h-9 gap-2 hover:bg-primary/5 transition-colors cursor-pointer"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <BillsAlert />

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processando dados...</p>
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

          <div className="grid gap-6 lg:grid-cols-2">
            <MonthlyComparisonChart 
              data={data.monthlyComparison}
              discreetMode={discreetMode}
              cursorFill={cursorFill}
              formatMonth={formatMonth}
            />

            <CategoryAnalysisChart 
              data={data.categoryAnalysis}
              discreetMode={discreetMode}
              cursorFill={cursorFill}
            />
          </div>

          <BalanceEvolutionChart 
            data={data.balanceEvolution}
            discreetMode={discreetMode}
            isDark={isDark}
            formatMonth={formatMonth}
          />

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
        ]}
        columns={[
          { header: "Descrição", key: "item" },
          { header: "Valor", key: "valor", type: "currency" },
        ]}
        fileName={`analise-${period.month}-${period.year}`}
      />
    </div>
  )
}