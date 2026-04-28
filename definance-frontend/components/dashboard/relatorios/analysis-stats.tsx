"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"

interface AnalysisStatsProps {
  totalReceitas: number
  totalDespesas: number
  saldoFinal: number
  totalAtrasadas: number
  loading: boolean
  discreetMode: boolean
}

export const AnalysisStats = ({
  totalReceitas,
  totalDespesas,
  saldoFinal,
  totalAtrasadas,
  loading,
  discreetMode
}: AnalysisStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {[
        {
          title: "Total Receitas",
          label: "Total Receitas",
          value: totalReceitas,
          icon: TrendingUp,
          color: "text-primary",
          href: "/dashboard/entradas",
          desc: "Período selecionado"
        },
        {
          title: "Total Despesas",
          label: "Total Despesas",
          value: totalDespesas,
          icon: TrendingDown,
          color: "text-destructive",
          href: "/dashboard/saidas",
          desc: "Período selecionado"
        },
        {
          title: "Saldo Líquido",
          label: "Saldo Líquido",
          value: saldoFinal,
          icon: Wallet,
          color: "text-primary",
          href: "/dashboard",
          desc: "Resultado do período"
        },
        {
          title: "Contas Atrasadas",
          label: "Contas Atrasadas",
          value: totalAtrasadas,
          icon: AlertTriangle,
          color: "text-destructive",
          href: "/dashboard/contas?tab=atrasadas",
          desc: "Atenção necessária"
        }
      ].map((card) => (
        <Link key={card.title} href={card.href} className="block group">
          <Card 
            className="border-border/50 bg-card overflow-hidden transition-all hover:border-primary/20 py-3 sm:py-6"
          >
            <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6 pb-0 sm:pb-2 space-y-0">
              <CardTitle className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {card.label}
              </CardTitle>
              <div className={cn("p-1 sm:p-1.5 rounded-lg bg-muted/50 transition-colors group-hover:bg-muted", card.color)}>
                <card.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0">
              <div className={cn(
                "text-lg sm:text-2xl font-bold tracking-tight transition-all duration-500",
                card.color === "text-primary" ? "text-primary" : (card.title === "Total Despesas" ? "text-card-foreground" : "text-destructive"),
                (loading || discreetMode) && "discreet-mode-blur"
              )}>
                {formatCurrency(card.value)}
              </div>
              <p className="hidden sm:block text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wide opacity-60">
                {card.desc}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}