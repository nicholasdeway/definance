"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const pieData = [
  { name: "Moradia", value: 1800, color: "var(--chart-1)" },
  { name: "Alimentação", value: 1200, color: "var(--chart-2)" },
  { name: "Transporte", value: 600, color: "var(--chart-3)" },
  { name: "Lazer", value: 450, color: "var(--chart-4)" },
  { name: "Outros", value: 300, color: "var(--chart-5)" },
]

const lineData = [
  { month: "Jan", receitas: 6500, despesas: 4200 },
  { month: "Fev", receitas: 7200, despesas: 4800 },
  { month: "Mar", receitas: 8500, despesas: 4350 },
]

export function DashboardCharts() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const total = pieData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-base text-card-foreground">Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="relative h-48 w-48">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-card-foreground">
                R$ {total.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
          
          <div className="grid flex-1 grid-cols-2 gap-2 text-sm md:grid-cols-1">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="ml-auto font-medium text-card-foreground">
                  {((item.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="mb-4 text-sm font-medium text-card-foreground">Evolução Mensal</h4>
          <div className="h-48">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis 
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "var(--card-foreground)" }}
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, ""]}
                  />
                  <Line
                    type="monotone"
                    dataKey="receitas"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ fill: "var(--chart-1)" }}
                    name="Receitas"
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    stroke="var(--chart-5)"
                    strokeWidth={2}
                    dot={{ fill: "var(--chart-5)" }}
                    name="Despesas"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">Receitas</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-chart-5" />
              <span className="text-muted-foreground">Despesas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}