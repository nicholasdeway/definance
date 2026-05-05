"use client"
 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowDownLeft, ArrowUpRight, CreditCard, TrendingUp, TrendingDown, Loader2, ArrowUpRight as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import Link from "next/link"

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
      href: "/dashboard/historico"
    },
    {
      title: "Total Recebido",
      label: "Entradas",
      value: data.totalRecebido,
      icon: ArrowDownLeft,
      color: "text-primary",
      href: "/dashboard/entradas"
    },
    {
      title: "Total Gasto",
      label: "Saídas",
      value: data.totalGasto,
      icon: ArrowUpRight,
      color: "text-destructive",
      href: "/dashboard/saidas"
    },
    {
      title: "Contas a Vencer",
      label: "Contas a Vencer",
      value: data.contasAVencer,
      icon: CreditCard,
      color: "text-orange-500",
      isCount: true,
      href: "/dashboard/contas"
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Link key={card.title} href={card.href} className="block group">
          <Card 
            className={cn(
              "border-border/50 bg-card overflow-hidden transition-all py-2.5 sm:py-6 cursor-pointer relative h-full",
              "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 duration-300",
              card.isPrimary && "bg-gradient-to-br from-primary/10 via-card to-card border-primary/20"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6 pb-0.5 sm:pb-2 pt-0">
              <CardTitle className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {card.label}
              </CardTitle>
              <div className={cn("p-1 sm:p-1.5 rounded-lg bg-muted/50 transition-all group-hover:scale-110", card.color)}>
                <card.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0 pb-0">
              <div className={cn(
                "text-base sm:text-2xl font-bold tracking-tight text-card-foreground transition-all duration-500",
                discreetMode && "discreet-mode-blur"
              )}>
                {card.isCount ? (
                  card.value
                ) : (
                  formatCurrency(card.value)
                )}
              </div>
              <div className="flex items-center justify-between mt-0 sm:mt-1">
                <p className="hidden sm:block text-[10px] text-muted-foreground font-medium uppercase tracking-wide opacity-60">
                  {card.isCount ? (card.value === 1 ? "Fatura pendente" : "Faturas pendentes") : "Este mês"}
                </p>
                <LinkIcon className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}