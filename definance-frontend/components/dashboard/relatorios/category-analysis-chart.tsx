"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { EmptyChart } from "./empty-chart"

export interface CategoryAnalysisData {
  categoria: string
  valor: number
}

interface CategoryAnalysisChartProps {
  data: CategoryAnalysisData[]
  discreetMode: boolean
  cursorFill: string
}

export const CategoryAnalysisChart = ({
  data,
  discreetMode,
  cursorFill
}: CategoryAnalysisChartProps) => {
  // Função para o formatter do Tooltip - Tratando todas as possibilidades do Recharts
  const tooltipFormatter = (value: number | string | undefined | readonly (number | string)[], name?: string | number) => {
    const finalValue = Array.isArray(value) ? value[0] : value
    return [formatCurrency(Number(finalValue || 0)), String(name || "")] as [string, string]
  }
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base text-card-foreground">Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "h-[300px] transition-all duration-300",
          discreetMode && "discreet-mode-blur"
        )}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis 
                  type="number"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickFormatter={(value) => formatCurrency(value)}
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
                  formatter={tooltipFormatter}
                />
                <Bar dataKey="valor" fill="var(--primary)" radius={[0, 4, 4, 0]} name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Nenhuma despesa categorizada neste período." />
          )}
        </div>
      </CardContent>
    </Card>
  )
}