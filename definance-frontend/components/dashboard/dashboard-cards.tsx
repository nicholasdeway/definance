"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowDownLeft, ArrowUpRight, CreditCard, TrendingUp, TrendingDown } from "lucide-react"

const cards = [
  {
    title: "Saldo Atual",
    value: 12450.00,
    change: "+12%",
    trend: "up",
    icon: Wallet,
  },
  {
    title: "Total Recebido",
    value: 8500.00,
    change: "+8%",
    trend: "up",
    icon: ArrowDownLeft,
  },
  {
    title: "Total Gasto",
    value: 4350.00,
    change: "-5%",
    trend: "down",
    icon: ArrowUpRight,
  },
  {
    title: "Contas a Vencer",
    value: 3,
    valuePrefix: "",
    change: "próx. 7 dias",
    icon: CreditCard,
  },
]

export function DashboardCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${
              card.title === "Total Recebido" ? "text-primary" : 
              card.title === "Total Gasto" ? "text-destructive" : 
              "text-muted-foreground"
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {typeof card.value === "number" && card.title !== "Contas a Vencer"
                ? `R$ ${card.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                : card.value}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {card.trend === "up" && <TrendingUp className="h-3 w-3 text-primary" />}
              {card.trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
              <span className={
                card.trend === "up" ? "text-primary" : 
                card.trend === "down" ? "text-destructive" : 
                "text-muted-foreground"
              }>
                {card.change}
              </span>
              {card.trend && <span className="text-muted-foreground">vs mês anterior</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}