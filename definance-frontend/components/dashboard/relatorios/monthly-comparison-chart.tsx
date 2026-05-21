"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { EmptyChart } from "./empty-chart"

export interface MonthlyComparisonData {
  month: string
  receitas: number
  despesas: number
}

interface MonthlyComparisonChartProps {
  data: MonthlyComparisonData[]
  discreetMode: boolean
  cursorFill: string
  formatMonth: (month: string) => string
}

export const MonthlyComparisonChart = ({
  data,
  discreetMode,
  cursorFill,
  formatMonth
}: MonthlyComparisonChartProps) => {
  // Função para formatar o valor do eixo Y
  const formatYAxisTick = (value: number): string => {
    if (Math.abs(value) >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
    return formatCurrency(value)
  }

  // Função para o formatter do Tooltip
  const tooltipFormatter = (value: number | string | undefined | readonly (number | string)[], name?: string | number) => {
    const finalValue = Array.isArray(value) ? value[0] : value
    return [formatCurrency(Number(finalValue || 0)), String(name || "")] as [string, string]
  }

  // Função para o labelFormatter do Tooltip
  const tooltipLabelFormatter = (label: unknown): string => {
    return formatMonth(String(label ?? ""))
  }
  return (
    <Card className="border-border/50 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base text-card-foreground font-bold">Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className={cn(
          "h-[300px] w-full overflow-hidden transition-[filter] duration-300",
          discreetMode && "discreet-mode-blur"
        )}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={300}>
              <BarChart data={data} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatMonth}
                />
                <YAxis 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxisTick}
                />
                <Tooltip
                  cursor={{ fill: cursorFill }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                  labelStyle={{ color: "var(--card-foreground)" }}
                  labelFormatter={tooltipLabelFormatter}
                  formatter={tooltipFormatter}
                />
                <Bar dataKey="receitas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="despesas" fill="var(--chart-5)" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyChart message="Sem dados históricos para comparação." />
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-chart-1" />
            <span className="text-muted-foreground/80">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-chart-5" />
            <span className="text-muted-foreground/80">Despesas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}