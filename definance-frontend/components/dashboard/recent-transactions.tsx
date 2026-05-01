"use client"
 
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownLeft, ArrowUpRight, ArrowRight, Wallet, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { CategoryIcon } from "@/components/dashboard/shared/category-icon"

export interface Transaction {
  id: string
  nome: string
  valor: number
  tipo: "receita" | "despesa"
  categoria: string
  data: string
  rawDate?: Date
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  loading?: boolean
}

const ITEMS_PER_PAGE = 8

export function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
  const [currentPage, setCurrentPage] = React.useState(1)
  
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset to page 1 if transactions change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [transactions.length])

  return (
    <Card className="border-border/50 bg-card flex flex-col h-full overflow-hidden w-full max-w-full">
      <CardHeader className="flex flex-row items-center justify-between py-4 shrink-0 overflow-hidden">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 truncate mr-2">Últimas Movimentações</CardTitle>
        <Link href="/dashboard/historico">
          <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all cursor-pointer">
            Ver todas
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto px-4 sm:px-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-2 w-16 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Wallet className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Nenhuma movimentação este mês</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {currentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between group gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    t.tipo === "receita" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  )}>
                    <CategoryIcon name={t.categoria} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">{t.nome}</p>
                    <p className="text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider truncate">
                      {t.categoria} • {t.data}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={cn(
                    "text-[13px] font-semibold tracking-tight whitespace-nowrap tabular-nums",
                    t.tipo === "receita" ? "text-primary" : "text-card-foreground"
                  )}>
                    {t.tipo === "receita" ? "+" : "-"} {formatCurrency(Math.abs(t.valor))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {totalPages > 1 && (
        <CardFooter className="py-3 border-t border-border/30 flex items-center justify-center gap-2 shrink-0 bg-muted/5">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="h-8 w-8 rounded-lg text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "h-8 w-8 text-[11px] font-bold rounded-lg transition-all",
                  currentPage === i + 1 ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="h-8 w-8 rounded-lg text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}