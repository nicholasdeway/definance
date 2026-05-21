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
    <Card className="border-border/50 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base text-card-foreground font-bold">Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className={cn(
          "h-[300px] w-full overflow-hidden transition-[filter] duration-300",
          discreetMode && "discreet-mode-blur"
        )}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={300}>
              <BarChart data={data} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                <XAxis 
                  type="number"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis 
                  dataKey="categoria"
                  type="category"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
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
                  formatter={tooltipFormatter}
                />
                <Bar dataKey="valor" fill="var(--primary)" radius={[0, 4, 4, 0]} name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyChart message="Nenhuma despesa categorizada neste período." />
            </div>
          )}
        </div>
        {/* Spacer para alinhar com a legenda do gráfico vizinho */}
        <div className="mt-4 h-4" />
      </CardContent>
    </Card>
  )
}