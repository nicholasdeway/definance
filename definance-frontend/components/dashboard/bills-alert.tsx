"use client"

import { ArrowRight, CalendarClock, AlertTriangle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { useBillsNotifications } from "@/hooks/use-bills-notifications"
import { useSettings } from "@/lib/settings-context"

interface BillsAlertProps {
  onAction?: (type: "overdue" | "setup" | "dueSoon" | "budget" | "spending") => void
  className?: string
  showOnly?: "overdue" | "setup" | "dueSoon" | "budget" | "spending"
}

export function BillsAlert({ onAction, className, showOnly }: BillsAlertProps) {
  const { overdueCount, setupCount, dueSoonCount, budgetAlertsCount, spendingAlert, spendingPct, isLoading } = useBillsNotifications()
  const { showOverdueAlerts, showSetupAlerts, showDueSoonAlerts, showBudgetAlerts, showSpendingAlerts } = useSettings()
  
  if (isLoading) return null

  // Filtro de exibição
  const hasOverdue = (showOnly === undefined || showOnly === "overdue") && overdueCount > 0 && showOverdueAlerts
  const hasSetup = (showOnly === undefined || showOnly === "setup") && setupCount > 0 && showSetupAlerts
  const hasDueSoon = (showOnly === undefined || showOnly === "dueSoon") && dueSoonCount > 0 && showDueSoonAlerts
  const hasBudget = (showOnly === undefined || showOnly === "budget") && budgetAlertsCount > 0 && showBudgetAlerts
  const hasSpending = (showOnly === undefined || showOnly === "spending") && spendingAlert && showSpendingAlerts

  if (!hasOverdue && !hasSetup && !hasDueSoon && !hasBudget && !hasSpending) return null

  return (
    <div className={cn("space-y-2", className)}>
      {/* Alerta de Atraso - Prioridade Máxima (Vermelho) */}
      {hasOverdue && (
        <Card className="border-destructive/30 bg-destructive/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-destructive/80 leading-none mb-0.5">Pagamento Atrasado</h4>
                  <p className="text-[11px] font-medium text-foreground/90">
                    {overdueCount} {overdueCount === 1 ? 'fatura vencida' : 'faturas vencidas'}
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => onAction?.("overdue")}
                className="h-7 text-[10px] font-bold px-3 shadow-none active:scale-95 transition-transform"
                asChild={!onAction}
              >
                {!onAction ? (
                  <Link href="/dashboard/contas?tab=atrasadas" className="flex items-center gap-1 whitespace-nowrap">
                    Ver <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 whitespace-nowrap cursor-pointer">
                    Ver <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Vencimento Próximo - Médio (Laranja) */}
      {hasDueSoon && (
        <Card className="border-amber-500/30 bg-amber-500/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 leading-none mb-0.5">Atenção</h4>
                  <p className="text-[11px] font-medium text-foreground/90">
                    {dueSoonCount} {dueSoonCount === 1 ? 'conta vence em 2 dias' : 'contas vencem em 2 dias'}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onAction?.("dueSoon")}
                className="h-7 text-[10px] font-bold px-3 border-amber-500/20 text-amber-600 hover:bg-amber-500/10 shadow-none active:scale-95 transition-transform"
                asChild={!onAction}
              >
                {!onAction ? (
                  <Link href="/dashboard/contas?tab=vencer" className="flex items-center gap-1 whitespace-nowrap">
                    Ver <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 whitespace-nowrap cursor-pointer">
                    Ver <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Limite de Categorias (Budget) - Azul */}
      {hasBudget && (
        <Card className="border-blue-500/30 bg-blue-500/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 leading-none mb-0.5">Limite de Categorias</h4>
                  <p className="text-[11px] font-medium text-foreground/90">
                    {budgetAlertsCount} {budgetAlertsCount === 1 ? 'categoria atingiu 80% do limite' : 'categorias atingiram 80% do limite'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction?.("budget")}
                className="h-7 text-[10px] font-bold px-3 border-blue-500/20 text-blue-600 hover:bg-blue-500/10 shadow-none active:scale-95 transition-transform"
                asChild={!onAction}
              >
                {!onAction ? (
                  <Link href="/dashboard/relatorios" className="flex items-center gap-1 whitespace-nowrap">
                    Ver <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 whitespace-nowrap cursor-pointer">
                    Ver <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Despesas vs Receita - Laranja */}
      {hasSpending && (
        <Card className="border-orange-500/30 bg-orange-500/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-600 leading-none mb-0.5">Gastos Elevados</h4>
                  <p className="text-[11px] font-medium text-foreground/90">
                    {Math.round(spendingPct * 100)}% da receita mensal consumida em despesas
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction?.("spending")}
                className="h-7 text-[10px] font-bold px-3 border-orange-500/20 text-orange-600 hover:bg-orange-500/10 shadow-none active:scale-95 transition-transform"
                asChild={!onAction}
              >
                {!onAction ? (
                  <Link href="/dashboard/relatorios" className="flex items-center gap-1 whitespace-nowrap">
                    Ver <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 whitespace-nowrap cursor-pointer">
                    Ver <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Configuração - Último da lista */}
      {hasSetup && (
        <Card className="border-primary/20 bg-primary/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-400">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/20">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80 leading-none mb-0.5">Ação Necessária</h4>
                  <p className="text-[11px] font-medium text-foreground/90">
                    {setupCount} {setupCount === 1 ? 'conta sincronizada sem data de vencimento' : 'contas sincronizadas sem data de vencimento'}
                  </p>
                </div>
              </div>
              <Button 
                variant="default"
                size="sm"
                onClick={() => onAction?.("setup")}
                className="h-7 text-[10px] font-bold px-3 shadow-none active:scale-95 transition-transform bg-primary/70 text-primary-foreground hover:bg-primary cursor-pointer"
                asChild={!onAction}
              >
                {!onAction ? (
                  <Link href="/dashboard/contas?tutorial=true" className="flex items-center gap-1 whitespace-nowrap">
                    Resolver <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 whitespace-nowrap cursor-pointer">
                    Resolver <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}