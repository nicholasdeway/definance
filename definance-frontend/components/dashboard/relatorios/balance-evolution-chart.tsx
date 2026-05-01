"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { EmptyChart } from "./empty-chart"

export interface BalanceData {
  month: string
  saldo: number
}

interface BalanceEvolutionChartProps {
  data: BalanceData[]
  discreetMode: boolean
  isDark: boolean
  formatMonth: (month: string) => string
}

export const BalanceEvolutionChart = ({
  data,
  discreetMode,
  isDark,
  formatMonth
}: BalanceEvolutionChartProps) => {
  // Função para formatar o valor do eixo Y
  const formatYAxisTick = (value: number): string => {
    if (Math.abs(value) >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
    return `R$ ${value}`
  }

  // Função para o formatter do Tooltip - Tratando todas as possibilidades do Recharts (incluindo name como number)
  const tooltipFormatter = (value: number | string | undefined | readonly (number | string)[], name?: string | number) => {
    const finalValue = Array.isArray(value) ? value[0] : value
    return [formatCurrency(Number(finalValue || 0)), String(name || "")] as [string, string]
  }

  // Função para o labelFormatter do Tooltip - usando unknown para segurança
  const tooltipLabelFormatter = (label: unknown): string => {
    return formatMonth(String(label ?? ""))
  }

  return (
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
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart 
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatMonth}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 'auto']}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxisTick}
                />
                <Tooltip
                  labelFormatter={tooltipLabelFormatter}
                  cursor={{ stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', strokeWidth: 2 }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  formatter={tooltipFormatter}
                />
                <Area 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSaldo)" 
                  name="Saldo"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Realize lançamentos para ver a evolução do seu saldo." />
          )}
        </div>
      </CardContent>
    </Card>
  )
}