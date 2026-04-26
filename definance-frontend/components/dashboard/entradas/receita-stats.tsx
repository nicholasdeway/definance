"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Coins, Wallet2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"

interface ReceitaStatsProps {
  total: number
  recorrente: number
  extra: number
  filterType: "all" | "recurring" | "extra"
  setFilterType: (type: "all" | "recurring" | "extra") => void
  isLoading: boolean
  discreetMode: boolean
}

export const ReceitaStats = ({
  total,
  recorrente,
  extra,
  filterType,
  setFilterType,
  isLoading,
  discreetMode
}: ReceitaStatsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card 
        className={cn(
          "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-primary/30",
          filterType === "all" && "ring-2 ring-primary/20 border-primary/40 bg-primary/5"
        )}
        onClick={() => setFilterType("all")}
      >
        <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Mensal</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {formatCurrency(total)}
          </div>
          <p className={cn(
            "text-[10px] text-muted-foreground font-medium uppercase mt-1 transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            Soma de todas as entradas
          </p>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-emerald-500/30",
          filterType === "recurring" && "ring-2 ring-emerald-500/20 border-emerald-500/40 bg-emerald-500/5"
        )}
        onClick={() => setFilterType("recurring")}
      >
        <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recorrentes</CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Wallet2 className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {formatCurrency(recorrente)}
          </div>
          <p className={cn(
            "text-[10px] text-emerald-600 font-bold uppercase mt-1 transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            Salários e rendas fixas
          </p>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-purple-500/30",
          filterType === "extra" && "ring-2 ring-purple-500/20 border-purple-500/40 bg-purple-500/5"
        )}
        onClick={() => setFilterType("extra")}
      >
        <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Extras / Variáveis</CardTitle>
          <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Coins className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {formatCurrency(extra)}
          </div>
          <p className={cn(
            "text-[10px] text-purple-600 font-bold uppercase mt-1 transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            Freelances e bônus
          </p>
        </CardContent>
      </Card>
    </div>
  )
}