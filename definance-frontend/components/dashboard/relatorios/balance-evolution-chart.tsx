"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { EmptyChart } from "./empty-chart"

interface BalanceEvolutionChartProps {
  data: any[]
  discreetMode: boolean
  isDark: boolean
  formatMonth: (month: any) => string
}

export const BalanceEvolutionChart = ({
  data,
  discreetMode,
  isDark,
  formatMonth
}: BalanceEvolutionChartProps) => {
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
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data}>
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
  )
}