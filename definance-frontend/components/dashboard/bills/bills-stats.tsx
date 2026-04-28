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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
      {/* A Vencer - Destaque (Full width no mobile) */}
      <Card className="col-span-2 sm:col-span-1 border-border/50 shadow-sm transition-all duration-300 hover:border-yellow-500/30 bg-card/50">
        <CardHeader className="pb-1 sm:pb-2 px-4 sm:px-6 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 sm:normal-case sm:tracking-normal">A Vencer</CardTitle>
          <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 border border-yellow-500/20">
            <Clock className="h-3.5 w-3.5 sm:h-4.5 w-4.5" />
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pt-0">
          <div className={cn(
            "text-lg sm:text-2xl font-bold text-yellow-600 transition-opacity duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {formatCurrency(totalAVencer)}
          </div>
          <p className={cn(
            "text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {allAVencerCount} {allAVencerCount === 1 ? "conta pendente" : "contas pendentes"}
          </p>
        </CardContent>
      </Card>

      {/* Pagas - Compacto no mobile */}
      <Card className="border-border/50 shadow-sm transition-all duration-300 hover:border-emerald-500/30 bg-card/50">
        <CardHeader className="pb-1 sm:pb-2 px-4 sm:px-6 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 sm:normal-case sm:tracking-normal">Pagas</CardTitle>
          <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4.5 w-4.5" />
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pt-0">
          <div className={cn(
            "text-lg sm:text-2xl font-bold text-emerald-600 transition-opacity duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {allPagasCount}
          </div>
          <p className={cn(
            "text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            quitadas
          </p>
        </CardContent>
      </Card>

      {/* Atrasadas - Compacto no mobile */}
      <Card className="border-border/50 shadow-sm transition-all duration-300 hover:border-red-500/30 bg-card/50">
        <CardHeader className="pb-1 sm:pb-2 px-4 sm:px-6 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 sm:normal-case sm:tracking-normal">Atrasadas</CardTitle>
          <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 border border-red-500/20">
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4.5 w-4.5" />
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pt-0">
          <div className={cn(
            "text-lg sm:text-2xl font-bold text-red-600 transition-opacity duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {formatCurrency(totalAtrasadas)}
          </div>
          <p className={cn(
            "text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {allAtrasadasCount} {allAtrasadasCount === 1 ? "atraso" : "atrasos"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}