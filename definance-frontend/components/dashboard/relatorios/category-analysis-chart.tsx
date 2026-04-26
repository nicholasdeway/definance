"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { EmptyChart } from "./empty-chart"

interface CategoryAnalysisChartProps {
  data: any[]
  discreetMode: boolean
  cursorFill: string
}

export const CategoryAnalysisChart = ({
  data,
  discreetMode,
  cursorFill
}: CategoryAnalysisChartProps) => {
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
  )
}