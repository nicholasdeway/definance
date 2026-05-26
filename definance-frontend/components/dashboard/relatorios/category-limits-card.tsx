"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Sliders } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface BudgetLimitInfo {
  id: string
  name: string
  color: string | null
  icon: string | null
  monthlyLimit: number
  spent: number
  pct: number
}

interface CategoryLimitsCardProps {
  limits: BudgetLimitInfo[]
  discreetMode: boolean
}

export function CategoryLimitsCard({ limits, discreetMode }: CategoryLimitsCardProps) {
  const alertsCount = React.useMemo(() => limits.filter(l => l.pct >= 80).length, [limits])
  const criticalCount = React.useMemo(() => limits.filter(l => l.pct >= 100).length, [limits])

  return (
    <Card className="border-border/50 bg-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-card-foreground">Orçamentos por Categoria</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {limits.length === 0
              ? "Defina limites mensais para suas categorias de despesa."
              : `${limits.length} ${limits.length === 1 ? 'categoria monitorada' : 'categorias monitoradas'} com limites de gastos.`
            }
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-[11px] font-bold border-border/50 cursor-pointer" asChild>
          <Link href="/dashboard/categorias">
            <Sliders className="h-3.5 w-3.5" />
            Configurar
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {limits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border/50 rounded-xl bg-muted/20">
            <Sliders className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs font-semibold text-foreground/80 mb-1">Nenhum limite configurado</p>
            <p className="text-[10px] text-muted-foreground max-w-[280px]">
              Defina tetos de gastos na tela de Categorias para visualizar alertas de orçamento aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Alertas em destaque se houver */}
            {(alertsCount > 0) && (
              <div className={cn(
                "p-3 rounded-xl border flex items-start gap-2.5 animate-in fade-in duration-300",
                criticalCount > 0
                  ? "bg-destructive/5 border-destructive/20 text-destructive"
                  : "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-500"
              )}>
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <p className="font-bold uppercase tracking-wider leading-none mb-1">Atenção com os Gastos</p>
                  <p className="text-foreground/90 font-medium leading-normal">
                    {criticalCount > 0
                      ? `${criticalCount} ${criticalCount === 1 ? 'categoria ultrapassou' : 'categorias ultrapassaram'} o teto de gastos configurado.`
                      : `${alertsCount} ${alertsCount === 1 ? 'categoria está próxima de atingir' : 'categorias estão próximas de atingir'} o teto de gastos (acima de 80%).`
                    }
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {limits.map((item) => {
                const isExceeded = item.pct >= 100
                const isWarning = item.pct >= 80 && item.pct < 100

                // Determinar classes de cor
                const barColor = isExceeded
                  ? "bg-destructive"
                  : isWarning
                    ? "bg-amber-500"
                    : "bg-primary"

                return (
                  <div
                    key={item.id}
                    className="p-3 border border-border/30 rounded-xl bg-muted/10 hover:bg-muted/30 transition-colors flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Indicador de cor da categoria */}
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color || "var(--primary)" }}
                        />
                        <span className="text-xs font-bold text-foreground tracking-tight truncate">
                          {item.name}
                        </span>
                      </div>

                      {/* Badge de status */}
                      {isExceeded ? (
                        <Badge variant="destructive" className="h-5 text-[9px] font-extrabold px-1.5 py-0 select-none">
                          Excedido
                        </Badge>
                      ) : isWarning ? (
                        <Badge variant="outline" className="h-5 text-[9px] font-extrabold px-1.5 py-0 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-500 select-none">
                          Aviso
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="h-5 text-[9px] font-bold px-1.5 py-0 bg-primary/10 text-primary border border-primary/5 select-none">
                          Seguro
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline text-[10px] text-muted-foreground font-medium">
                        <span className={cn(discreetMode && "discreet-mode-blur")}>
                          {formatCurrency(item.spent)} <span className="text-[9px] opacity-60">/ {formatCurrency(item.monthlyLimit)}</span>
                        </span>
                        <span className={cn("font-bold text-foreground", isExceeded && "text-destructive", isWarning && "text-amber-500")}>
                          {item.pct}%
                        </span>
                      </div>

                      {/* Custom progress bar */}
                      <div className="w-full h-1.5 bg-muted/60 dark:bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full transition-all duration-500 rounded-full", barColor)}
                          style={{ width: `${Math.min(item.pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
