"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { EmptyChart } from "./empty-chart"

interface MonthlyComparisonChartProps {
  data: any[]
  discreetMode: boolean
  cursorFill: string
  formatMonth: (month: any) => string
}

export const MonthlyComparisonChart = ({
  data,
  discreetMode,
  cursorFill,
  formatMonth
}: MonthlyComparisonChartProps) => {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base text-card-foreground">Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "h-[300px] transition-all duration-300",
          discreetMode && "discreet-mode-blur"
        )}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data}>
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
  )
}