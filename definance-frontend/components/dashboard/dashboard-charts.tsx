"use client"
 
import { useState, useEffect } from "react"
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

export function DashboardCharts({ categoryData, monthlyData, loading }: DashboardChartsProps) {
  const { discreetMode } = useSettings()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

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

  const total = categoryData.reduce((sum, item) => sum + item.valor, 0)

  if (loading || !mounted) {
    return (
      <Card className="border-border/50 bg-card h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/20" />
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card h-full flex flex-col">
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Análise de Gastos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center bg-muted/5 rounded-xl border border-dashed border-border/50">
            <PieIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-medium text-muted-foreground">Sem dados de categorias este mês</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className={cn(
              "relative h-44 w-44 shrink-0 transition-all duration-300",
              discreetMode && "discreet-mode-blur"
            )}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="valor"
                    nameKey="categoria"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                    formatter={tooltipFormatter}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Total</span>
                <span className="text-sm font-black text-card-foreground">
                  {total > 1000 ? `R$ ${(total/1000).toFixed(1)}k` : formatCurrency(total)}
                </span>
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-2.5">
              {categoryData.slice(0, 5).map((item, index) => (
                <div key={item.categoria} className="flex items-center gap-2 group">
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
                    {((item.valor / total) * 100).toFixed(0)}%
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
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontWeight: "bold" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
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