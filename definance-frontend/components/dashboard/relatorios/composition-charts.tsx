"use client"

import { useMemo } from "react"
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

  const limitedIncomeAnalysis = useMemo(() => {
    return limitPieData(incomeAnalysis, "tipo");
  }, [incomeAnalysis]);

  const limitedCategoryAnalysis = useMemo(() => {
    return limitPieData(categoryAnalysis, "categoria");
  }, [categoryAnalysis]);

  const totalIncome = useMemo(() => {
    return limitedIncomeAnalysis.reduce((sum, item) => sum + item.valor, 0);
  }, [limitedIncomeAnalysis]);

  const totalCategory = useMemo(() => {
    return limitedCategoryAnalysis.reduce((sum, item) => sum + item.valor, 0);
  }, [limitedCategoryAnalysis]);

  const CustomIncomeTooltip = useMemo(() => {
    const TooltipComponent = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const item = payload[0].payload
        const name = item.tipo || ""
        const percentage = totalIncome > 0 ? ((item.valor / totalIncome) * 100).toFixed(0) : "0"
        const color = payload[0].color || "var(--primary)"

        return (
          <div className="bg-card border border-border px-3 py-2.5 rounded-xl shadow-lg text-xs font-bold space-y-1">
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
    TooltipComponent.displayName = "CustomIncomeTooltip"
    return TooltipComponent
  }, [totalIncome])

  const CustomCategoryTooltip = useMemo(() => {
    const TooltipComponent = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const item = payload[0].payload
        const name = item.categoria || ""
        const percentage = totalCategory > 0 ? ((item.valor / totalCategory) * 100).toFixed(0) : "0"
        const color = payload[0].color || "var(--primary)"

        return (
          <div className="bg-card border border-border px-3 py-2.5 rounded-xl shadow-lg text-xs font-bold space-y-1">
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
    TooltipComponent.displayName = "CustomCategoryTooltip"
    return TooltipComponent
  }, [totalCategory])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Detalhamento da Composição</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Origem das Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "h-[250px] overflow-hidden transition-[filter] duration-300",
                discreetMode && "discreet-mode-blur"
              )}>
                {limitedIncomeAnalysis.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={300}>
                    <PieChart>
                      <Pie
                        data={limitedIncomeAnalysis}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="valor"
                        nameKey="tipo"
                      >
                        {limitedIncomeAnalysis.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomIncomeTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Sem dados de receitas." />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Distribuição de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "h-[250px] overflow-hidden transition-[filter] duration-300",
                discreetMode && "discreet-mode-blur"
              )}>
                {limitedCategoryAnalysis.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={300}>
                    <PieChart>
                      <Pie
                        data={limitedCategoryAnalysis}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="valor"
                        nameKey="categoria"
                      >
                        {limitedCategoryAnalysis.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomCategoryTooltip />} />
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
    </div>
  )
}