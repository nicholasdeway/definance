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
    <div className="grid gap-4 sm:grid-cols-4">
      <Link href="/dashboard/entradas" className="block">
        <Card 
          className="border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/30 group"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-2">
              Total Receitas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold text-primary transition-opacity duration-300",
              (loading || discreetMode) && "discreet-mode-blur"
            )}>
              {formatCurrency(totalReceitas)}
            </div>
            <p className="text-xs text-muted-foreground">Período selecionado</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/dashboard/saidas" className="block">
        <Card 
          className="border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-destructive/30 group"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-destructive transition-colors flex items-center gap-2">
              Total Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold text-card-foreground transition-opacity duration-300",
              (loading || discreetMode) && "discreet-mode-blur"
            )}>
              {formatCurrency(totalDespesas)}
            </div>
            <p className="text-xs text-muted-foreground">Período selecionado</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/dashboard" className="block">
        <Card 
          className="border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/30 group"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-2">
              Saldo Líquido
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold text-primary transition-opacity duration-300",
              (loading || discreetMode) && "discreet-mode-blur"
            )}>
              {formatCurrency(saldoFinal)}
            </div>
            <p className="text-xs text-muted-foreground">Resultado do período</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/dashboard/contas?tab=atrasadas" className="block">
        <Card 
          className="border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-destructive/30 group"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-destructive transition-colors flex items-center gap-2">
              Contas Atrasadas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold text-destructive transition-opacity duration-300",
              (loading || discreetMode) && "discreet-mode-blur"
            )}>
              {formatCurrency(totalAtrasadas)}
            </div>
            <p className="text-xs text-muted-foreground">Atenção necessária</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}