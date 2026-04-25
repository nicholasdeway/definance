"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Download, TrendingUp, TrendingDown, Wallet, Loader2, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/currency"
import { PeriodFilter, type PeriodFilterState } from "@/components/dashboard/period-filter"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"
import { cn, capitalize } from "@/lib/utils"
import { ExportPdfDialog } from "@/components/dashboard/export-pdf-dialog"
import { incomeTypes } from "@/components/onboarding/constants"

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

const EmptyChart = ({ message }: { message: string }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 py-10 animate-in fade-in duration-500">
    <div className="rounded-full bg-muted/30 p-4 border border-dashed border-border/60">
      <TrendingUp className="h-6 w-6 text-muted-foreground/40" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-sm font-semibold text-foreground/80">Sem dados</p>
      <p className="text-[11px] text-muted-foreground/70 max-w-[180px]">
        {message}
      </p>
    </div>
  </div>
)

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
              
              const isVariable = (pInc.frequencia || pInc.Frequencia || "").toLowerCase() === "variavel"
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
                return iTipo === pTipo || (incomeTypes.find(t => t.value === pTipo)?.label.toLowerCase() === iTipo)
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Análises</h1>
          <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
        </div>
        <div className="flex gap-2">
          <PeriodFilter 
            value={period}
            onChange={setPeriod}
          />
          <Button 
            variant="outline" 
            onClick={() => setIsExportDialogOpen(true)}
            className="cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processando dados...</p>
          </div>
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Link href="/dashboard/entradas" className="block">
              <Card 
                className="border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/30 group"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    Total Receitas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold text-primary transition-opacity duration-300",
                    (loading || discreetMode) && "discreet-mode-blur"
                  )}>
                    {formatCurrency(data.totalReceitas)}
                  </div>
                  <p className="text-xs text-muted-foreground">Período selecionado</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/saidas" className="block">
              <Card 
                className="border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-destructive/30 group"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-destructive transition-colors flex items-center gap-2">
                    Total Despesas
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold text-card-foreground transition-opacity duration-300",
                    (loading || discreetMode) && "discreet-mode-blur"
                  )}>
                    {formatCurrency(data.totalDespesas)}
                  </div>
                  <p className="text-xs text-muted-foreground">Período selecionado</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard" className="block">
              <Card 
                className="border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/30 group"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    Saldo Líquido
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold text-primary transition-opacity duration-300",
                    (loading || discreetMode) && "discreet-mode-blur"
                  )}>
                    {formatCurrency(data.saldoFinal)}
                  </div>
                  <p className="text-xs text-muted-foreground">Resultado do período</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/contas?tab=atrasadas" className="block">
              <Card 
                className="border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-destructive/30 group"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-destructive transition-colors flex items-center gap-2">
                    Contas Atrasadas
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold text-destructive transition-opacity duration-300",
                    (loading || discreetMode) && "discreet-mode-blur"
                  )}>
                    {formatCurrency(data.totalAtrasadas)}
                  </div>
                  <p className="text-xs text-muted-foreground">Atenção necessária</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base text-card-foreground">Receitas vs Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "h-[300px] transition-all duration-300",
                  discreetMode && "discreet-mode-blur"
                )}>
                  {(data.monthlyComparison || []).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={data.monthlyComparison}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                          axisLine={{ stroke: "var(--border)" }}
                          tickFormatter={formatMonth}
                        />
                        <YAxis 
                          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                          axisLine={{ stroke: "var(--border)" }}
                          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          cursor={{ fill: cursorFill }}
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "var(--card-foreground)" }}
                          labelFormatter={formatMonth}
                          formatter={(value: any) => [formatCurrency(Number(value || 0)), ""]}
                        />
                        <Bar dataKey="receitas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Receitas" />
                        <Bar dataKey="despesas" fill="var(--chart-5)" radius={[4, 4, 0, 0]} name="Despesas" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="Sem dados históricos para comparação." />
                  )}
                </div>
                <div className="mt-4 flex justify-center gap-6 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-chart-1" />
                    <span className="text-muted-foreground">Receitas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-chart-5" />
                    <span className="text-muted-foreground">Despesas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base text-card-foreground">Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "h-[300px] transition-all duration-300",
                  discreetMode && "discreet-mode-blur"
                )}>
                  {(data.categoryAnalysis || []).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={data.categoryAnalysis} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                        <XAxis 
                          type="number"
                          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                          axisLine={{ stroke: "var(--border)" }}
                          tickFormatter={(value) => `R$ ${value}`}
                        />
                        <YAxis 
                          dataKey="categoria"
                          type="category"
                          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                          axisLine={{ stroke: "var(--border)" }}
                          width={80}
                        />
                        <Tooltip
                          cursor={{ fill: cursorFill }}
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any) => [formatCurrency(Number(value || 0)), "Valor"]}
                        />
                        <Bar dataKey="valor" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="Nenhuma despesa categorizada neste período." />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Evolução do Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "h-[300px] transition-all duration-300",
                discreetMode && "discreet-mode-blur"
              )}>
                {(data.balanceEvolution || []).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={data.balanceEvolution}>
                      <defs>
                        <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                        axisLine={{ stroke: "var(--border)" }}
                        tickFormatter={formatMonth}
                      />
                      <YAxis 
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                        axisLine={{ stroke: "var(--border)" }}
                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        labelFormatter={formatMonth}
                        cursor={{ stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', strokeWidth: 2 }}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => [formatCurrency(Number(value || 0)), "Saldo"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="saldo" 
                        stroke="var(--primary)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSaldo)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Realize lançamentos para ver a evolução do seu saldo." />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Detalhamento da Composição</h2>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Origem das Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn(
                      "h-[250px] transition-all duration-300",
                      discreetMode && "discreet-mode-blur"
                    )}>
                    {(data.incomeAnalysis || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={data.incomeAnalysis}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="valor"
                            nameKey="tipo"
                            >
                            {(data.incomeAnalysis || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any) => formatCurrency(Number(value || 0))} 
                              contentStyle={{
                                backgroundColor: "var(--card)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }}/>
                        </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="Sem dados de receitas." />
                    )}
                    </div>
                </CardContent>
                </Card>

                <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Distribuição de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn(
                      "h-[250px] transition-all duration-300",
                      discreetMode && "discreet-mode-blur"
                    )}>
                    {(data.categoryAnalysis || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={data.categoryAnalysis}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="valor"
                            nameKey="categoria"
                            >
                            {(data.categoryAnalysis || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }}/>
                        </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="Sem dados de despesas." />
                    )}
                    </div>
                </CardContent>
                </Card>
            </div>
          </div>
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