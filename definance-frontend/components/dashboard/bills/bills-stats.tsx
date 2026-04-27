"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react"

interface BillsStatsProps {
  totalAVencer: number
  allAVencerCount: number
  allPagasCount: number
  totalAtrasadas: number
  allAtrasadasCount: number
  isLoading: boolean
  discreetMode: boolean
}

export const BillsStats = ({
  totalAVencer,
  allAVencerCount,
  allPagasCount,
  totalAtrasadas,
  allAtrasadasCount,
  isLoading,
  discreetMode
}: BillsStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <Card className="border-border/50 shadow-sm transition-all duration-300 hover:border-yellow-500/30 hover:shadow-md">
        <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">A Vencer</CardTitle>
          <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-xl sm:text-2xl font-bold text-yellow-500 transition-opacity duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {formatCurrency(totalAVencer)}
          </div>
          <p className={cn(
            "text-xs text-muted-foreground transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {allAVencerCount} contas
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50 shadow-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-md">
        <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pagas este mês</CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl sm:text-3xl font-bold text-emerald-600 transition-opacity duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {allPagasCount}
          </div>
          <p className={cn(
            "text-xs text-muted-foreground transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            contas quitadas
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50 shadow-sm transition-all duration-300 hover:border-red-500/30 hover:shadow-md">
        <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Atrasadas</CardTitle>
          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-xl sm:text-2xl font-bold text-destructive transition-opacity duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {formatCurrency(totalAtrasadas)}
          </div>
          <p className={cn(
            "text-xs text-muted-foreground transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {allAtrasadasCount} contas
          </p>
        </CardContent>
      </Card>
    </div>
  )
}