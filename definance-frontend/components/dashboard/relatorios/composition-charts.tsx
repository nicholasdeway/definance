"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { EmptyChart } from "./empty-chart"

export interface IncomeDetailData {
  tipo: string
  valor: number
}

export interface CategoryDetailData {
  categoria: string
  valor: number
}

interface CompositionChartsProps {
  incomeAnalysis: IncomeDetailData[]
  categoryAnalysis: CategoryDetailData[]
  discreetMode: boolean
  chartColors: string[]
}

export const CompositionCharts = ({
  incomeAnalysis,
  categoryAnalysis,
  discreetMode,
  chartColors
}: CompositionChartsProps) => {
  // Função para o formatter do Tooltip - Tratando todas as possibilidades do Recharts
  const tooltipFormatter = (value: number | string | undefined | readonly (number | string)[], name?: string | number) => {
    const finalValue = Array.isArray(value) ? value[0] : value
    return formatCurrency(Number(finalValue || 0))
  }
  return (
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
              {incomeAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeAnalysis}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="valor"
                      nameKey="tipo"
                    >
                      {incomeAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={tooltipFormatter} 
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
              {categoryAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryAnalysis}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="valor"
                      nameKey="categoria"
                    >
                      {categoryAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={tooltipFormatter} 
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
                <EmptyChart message="Sem dados de despesas." />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}