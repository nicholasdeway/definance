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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
      <Card 
        className={cn(
          "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-primary/30 py-3 sm:py-6 gap-0 sm:gap-6 col-span-2 sm:col-span-1",
          filterType === "all" && "ring-2 ring-primary/20 border-primary/40 bg-primary/5"
        )}
        onClick={() => setFilterType("all")}
      >
        <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 sm:text-muted-foreground sm:normal-case sm:tracking-normal">Total Mensal</CardTitle>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className={cn(
            "text-lg sm:text-2xl font-bold transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            <span className="sm:hidden">
              {`R$ ${total.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
            </span>
            <span className="hidden sm:inline">
              {formatCurrency(total)}
            </span>
          </div>
          <p className={cn(
            "hidden sm:block text-[10px] text-muted-foreground font-medium uppercase mt-1 transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            Soma de todas as entradas
          </p>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-emerald-500/30 py-3 sm:py-6 gap-0 sm:gap-6",
          filterType === "recurring" && "ring-2 ring-emerald-500/20 border-emerald-500/40 bg-emerald-500/5"
        )}
        onClick={() => setFilterType("recurring")}
      >
        <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 sm:text-muted-foreground sm:normal-case sm:tracking-normal">Recorrentes</CardTitle>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Wallet2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className={cn(
            "text-lg sm:text-2xl font-bold transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            <span className="sm:hidden">
              {`R$ ${recorrente.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
            </span>
            <span className="hidden sm:inline">
              {formatCurrency(recorrente)}
            </span>
          </div>
          <p className={cn(
            "hidden sm:block text-[10px] text-emerald-600 font-bold uppercase mt-1 transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            Salários e rendas fixas
          </p>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-purple-500/30 py-3 sm:py-6 gap-0 sm:gap-6",
          filterType === "extra" && "ring-2 ring-purple-500/20 border-purple-500/40 bg-purple-500/5"
        )}
        onClick={() => setFilterType("extra")}
      >
        <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 sm:text-muted-foreground sm:normal-case sm:tracking-normal">Variáveis</CardTitle>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className={cn(
            "text-lg sm:text-2xl font-bold transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            <span className="sm:hidden">
              {`R$ ${extra.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
            </span>
            <span className="hidden sm:inline">
              {formatCurrency(extra)}
            </span>
          </div>
          <p className={cn(
            "hidden sm:block text-[10px] text-purple-600 font-bold uppercase mt-1 transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            Freelances e bônus
          </p>
        </CardContent>
      </Card>
    </div>
  )
}