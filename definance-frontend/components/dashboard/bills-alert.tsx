"use client"

import { ArrowRight, CalendarClock, AlertTriangle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { useBillsNotifications } from "@/hooks/use-bills-notifications"

interface BillsAlertProps {
  onAction?: () => void
  className?: string
  showOnly?: "overdue" | "setup"
}

export function BillsAlert({ onAction, className, showOnly }: BillsAlertProps) {
  const { overdueCount, setupCount, isLoading } = useBillsNotifications()
  
  if (isLoading) return null

  // Filtro de exibição
  const hasOverdue = (showOnly === undefined || showOnly === "overdue") && overdueCount > 0
  const hasSetup = (showOnly === undefined || showOnly === "setup") && setupCount > 0

  if (!hasOverdue && !hasSetup) return null

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
                onClick={onAction}
                className="h-7 text-[10px] font-bold px-3 shadow-none active:scale-95 transition-transform"
                asChild={!onAction}
              >
                {!onAction ? (
                  <Link href="/dashboard/contas" className="flex items-center gap-1 whitespace-nowrap">
                    Ver <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    Ver <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Configuração - Secundário (Tema/Verde/Azul) */}
      {hasSetup && (
        <Card className="border-primary/20 bg-primary/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-400">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/20">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80 leading-none mb-0.5">Configuração</h4>
                  <p className="text-[11px] font-medium text-foreground/90">
                    {setupCount} {setupCount === 1 ? 'fatura pendente' : 'faturas pendentes'}
                  </p>
                </div>
              </div>
              <Button 
                variant="default"
                size="sm"
                asChild
                className="h-7 text-[10px] font-bold px-3 shadow-none active:scale-95 transition-transform bg-primary text-primary-foreground hover:bg-primary/80"
              >
                <Link href="/dashboard/contas" className="flex items-center gap-1 whitespace-nowrap">
                  Resolver <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}