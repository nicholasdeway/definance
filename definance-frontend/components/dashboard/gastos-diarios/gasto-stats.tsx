import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"

interface GastoStatsProps {
  title: string
  value: number
  count: number
  icon: React.ReactNode
  active: boolean
  onClick: () => void
  variant: "emerald" | "orange" | "blue"
  discreetMode: boolean
  isInitialLoad: boolean
}

export function GastoStats({ 
  title, 
  value, 
  count, 
  icon, 
  active, 
  onClick, 
  variant, 
  discreetMode, 
  isInitialLoad 
}: GastoStatsProps) {
  const variants = {
    emerald: "hover:border-emerald-500/30 ring-emerald-500/20 border-emerald-500/40 bg-emerald-500/5",
    orange: "hover:border-orange-500/30 ring-orange-500/20 border-orange-500/40 bg-orange-500/5",
    blue: "hover:border-blue-500/30 ring-blue-500/20 border-blue-500/40 bg-blue-500/5"
  }

  return (
    <Card 
      className={cn(
        "border-border/50 shadow-sm cursor-pointer transition-all duration-300",
        active && variants[variant]
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", 
          variant === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
          variant === 'orange' ? 'bg-orange-500/10 text-orange-500' :
          'bg-blue-500/10 text-blue-500'
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold transition-all duration-300",
          (isInitialLoad || discreetMode) && "discreet-mode-blur"
        )}>
          {formatCurrency(value)}
        </div>
        <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">
          {count} lançamentos
        </p>
      </CardContent>
    </Card>
  )
}