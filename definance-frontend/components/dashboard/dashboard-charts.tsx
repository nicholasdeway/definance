"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Loader2, PieChart as PieIcon } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

export interface CategoryData {
  categoria: string
  valor: number
}

export interface MonthlyData {
  month: string
  receitas: number
  despesas: number
}

interface DashboardChartsProps {
  categoryData: CategoryData[]
  incomeData?: CategoryData[]
  monthlyData: MonthlyData[]
  loading?: boolean
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]

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

function limitPieData<T extends { valor: number }>(
  data: T[],
  labelKey: keyof T,
  otherLabel: string = "Outro"
): T[] {
  const sorted = [...data].sort((a, b) => b.valor - a.valor);
  if (sorted.length <= 5) return sorted;

  const top4 = sorted.slice(0, 4);
  const remainingSum = sorted.slice(4).reduce((sum, item) => sum + item.valor, 0);

  const otherItem = {
    [labelKey]: otherLabel,
    valor: remainingSum
  } as unknown as T;

  return [...top4, otherItem];
}

export function DashboardCharts({ categoryData, incomeData = [], monthlyData, loading }: DashboardChartsProps) {
  const { discreetMode } = useSettings()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"gastos" | "receitas">("gastos")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Se não houver dados de gastos mas houver de receitas, começa na aba de receitas
  useEffect(() => {
    if (mounted && categoryData.length === 0 && incomeData.length > 0) {
      setActiveTab("receitas")
    }
  }, [mounted, categoryData.length, incomeData.length])

  // Função para formatar o valor do eixo Y
  const formatYAxisTick = (value: number): string => {
    if (Math.abs(value) >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
    return formatCurrency(value)
  }

  // Função para o formatter do Tooltip - Tratando todas as possibilidades do Recharts
  const tooltipFormatter = (value: number | string | undefined | readonly (number | string)[], name?: string | number) => {
    const finalValue = Array.isArray(value) ? value[0] : value
    return [formatCurrency(Number(finalValue || 0)), String(name || "")] as [string, string]
  }

  const formatCategoryName = (name: string): string => {
    if (!name) return ""
    const lower = name.toLowerCase().trim()
    if (lower === "clt") return "CLT"
    if (lower === "pj") return "PJ"
    if (lower === "freelancer") return "Freelancer"
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const currentPieData = useMemo(() => {
    const data = activeTab === "gastos" ? categoryData : incomeData
    const formatted = data.map(item => ({
      ...item,
      categoria: formatCategoryName(item.categoria)
    }))
    return limitPieData(formatted, "categoria")
  }, [activeTab, categoryData, incomeData])

  const total = currentPieData.reduce((sum, item) => sum + item.valor, 0)

  const CustomTooltip = useMemo(() => {
    const TooltipComponent = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const item = payload[0].payload
        const name = item.categoria || ""
        const percentage = total > 0 ? ((item.valor / total) * 100).toFixed(0) : "0"
        const color = payload[0].color || "var(--primary)"

        return (
          <div className="bg-card border border-border px-3 py-2.5 rounded-xl shadow-lg text-xs font-bold space-y-1 relative z-[50]">
            <div className="text-foreground">{name}</div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span>Participação</span>
              <span className="text-foreground">{percentage}%</span>
            </div>
          </div>
        )
      }
      return null
    }
    TooltipComponent.displayName = "CustomPieTooltip"
    return TooltipComponent
  }, [total])

  if (loading || !mounted) {
    return (
      <Card className="border-border/50 bg-card h-full flex flex-col animate-pulse">
        {/* Header Skeleton */}
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="h-3.5 w-32 bg-muted rounded" />
          <div className="h-6 w-28 bg-muted rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-6 flex-1 flex flex-col justify-between pt-2">
          {/* Pie Chart & Legends Skeleton */}
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Circle for Pie Chart */}
            <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
              <div className="h-36 w-36 rounded-full border-[16px] border-muted/30 flex items-center justify-center" />
            </div>
            {/* Legends list */}
            <div className="flex-1 w-full space-y-2.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted shrink-0" />
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="hidden sm:block flex-1 border-b border-dashed border-border/30 mx-1 mb-1" />
                  <div className="h-3 w-8 bg-muted rounded shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Area Chart Skeleton */}
          <div className="pt-4 border-t border-border/50">
            <div className="mx-auto h-3 w-28 bg-muted rounded mb-4" />
            <div className="h-44 w-full bg-muted/10 rounded-xl flex items-end justify-between p-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-full flex flex-col justify-end w-[12%]">
                  <div className="w-full bg-muted/20 rounded-t-lg" style={{ height: `${i * 15}%` }} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card h-full flex flex-col">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Análise de {activeTab === "gastos" ? "Gastos" : "Receitas"}
        </CardTitle>

        <div className="flex bg-muted/20 p-0.5 rounded-lg border border-border/50">
          <button
            onClick={() => setActiveTab("gastos")}
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
              activeTab === "gastos"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Gastos
          </button>
          <button
            onClick={() => setActiveTab("receitas")}
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
              activeTab === "receitas"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Receitas
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between pt-2">
        {currentPieData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center bg-muted/5 rounded-xl border border-dashed border-border/50">
            <PieIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-medium text-muted-foreground">Sem dados de {activeTab} este mês</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className={cn(
              "relative h-44 w-44 shrink-0 transition-all duration-300",
              discreetMode && "discreet-mode-blur"
            )}>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Total</span>
                <span className="text-sm font-black text-card-foreground">
                  {total > 1000 ? `R$ ${(total / 1000).toFixed(1)}k` : formatCurrency(total)}
                </span>
              </div>
              <div className="relative z-10 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="valor"
                      nameKey="categoria"
                    >
                      {currentPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2.5">
              {currentPieData.slice(0, 5).map((item, index) => (
                <div key={`${item.categoria}-${index}`} className="flex items-center gap-2 group">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1 min-w-0">
                    {item.categoria}
                  </span>
                  <div className="hidden sm:block flex-1 border-b border-dashed border-border/30 mx-1 mb-1" />
                  <span className={cn(
                    "text-[11px] font-bold text-card-foreground transition-opacity duration-300 shrink-0 tabular-nums",
                    discreetMode && "discreet-mode-blur"
                  )}>
                    {total > 0 ? ((item.valor / total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border/50">
          <h4 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 text-center">Evolução Mensal</h4>
          <div className={cn(
            "h-44 transition-all duration-300",
            discreetMode && "discreet-mode-blur"
          )}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontWeight: "bold" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                  tickFormatter={formatMonth}
                />
                <YAxis
                  width={70}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontWeight: "bold" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxisTick}
                />
                <Tooltip
                  cursor={{ stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', strokeWidth: 2 }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={tooltipFormatter}
                  labelFormatter={(label) => formatMonth(String(label ?? ""))}
                />
                <Area
                  type="monotone"
                  dataKey="receitas"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorReceitas)"
                  name="Receitas"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  stroke="var(--chart-5)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorDespesas)"
                  name="Despesas"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}