"use client"
 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowDownLeft, ArrowUpRight, CreditCard, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardCardsProps {
  data: {
    saldoAtual: number
    totalRecebido: number
    totalGasto: number
    contasAVencer: number
  } | null
  loading?: boolean
  discreetMode?: boolean
}

export function DashboardCards({ data, loading, discreetMode }: DashboardCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50 bg-card/50 h-[80px] sm:h-[102px] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/20" />
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Saldo Atual",
      label: "Saldo em Conta",
      value: data.saldoAtual,
      icon: Wallet,
      color: "text-primary",
      isPrimary: true,
    },
    {
      title: "Total Recebido",
      label: "Entradas",
      value: data.totalRecebido,
      icon: ArrowDownLeft,
      color: "text-primary",
    },
    {
      title: "Total Gasto",
      label: "Saídas",
      value: data.totalGasto,
      icon: ArrowUpRight,
      color: "text-destructive",
    },
    {
      title: "Contas a Vencer",
      label: "Contas a Vencer",
      value: data.contasAVencer,
      icon: CreditCard,
      color: "text-orange-500",
      isCount: true
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className={cn(
            "border-border/50 bg-card overflow-hidden group hover:border-primary/20 transition-all py-3 sm:py-6 gap-0 sm:gap-6",
            card.isPrimary && "bg-gradient-to-br from-primary/10 via-card to-card border-primary/20"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6 pb-0 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
              {card.label}
            </CardTitle>
            <div className={cn("p-1 sm:p-1.5 rounded-lg bg-muted/50 transition-colors group-hover:bg-muted", card.color)}>
              <card.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className={cn(
              "text-lg sm:text-2xl font-bold tracking-tight text-card-foreground transition-all duration-500",
              discreetMode && "discreet-mode-blur"
            )}>
              {card.isCount ? (
                card.value
              ) : (
                <>
                  <span className="sm:hidden">
                    {`R$ ${card.value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
                  </span>
                  <span className="hidden sm:inline">
                    {`R$ ${card.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  </span>
                </>
              )}
            </div>
            <p className="hidden sm:block text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wide opacity-60">
              {card.isCount ? (card.value === 1 ? "Fatura pendente" : "Faturas pendentes") : "Este mês"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}