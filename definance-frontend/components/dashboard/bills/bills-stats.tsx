"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"

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
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
            A Vencer
          </CardTitle>
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
            isLoading && "blur-sm opacity-50"
          )}>
            {allAVencerCount} contas
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
            Pagas este mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl sm:text-3xl font-bold text-primary transition-opacity duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {allPagasCount}
          </div>
          <p className={cn(
            "text-xs text-muted-foreground transition-all duration-300",
            isLoading && "blur-sm opacity-50"
          )}>
            contas quitadas
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
            Atrasadas
          </CardTitle>
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
            isLoading && "blur-sm opacity-50"
          )}>
            {allAtrasadasCount} contas
          </p>
        </CardContent>
      </Card>
    </div>
  )
}