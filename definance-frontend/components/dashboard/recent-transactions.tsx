"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownLeft, ArrowUpRight, ArrowRight } from "lucide-react"
import Link from "next/link"

const transactions = [
  { id: 1, nome: "Salário", valor: 5500, tipo: "receita", categoria: "Trabalho", data: "15 Mar 2026" },
  { id: 2, nome: "Aluguel", valor: -1800, tipo: "despesa", categoria: "Moradia", data: "10 Mar 2026" },
  { id: 3, nome: "Supermercado Extra", valor: -450, tipo: "despesa", categoria: "Alimentação", data: "08 Mar 2026" },
  { id: 4, nome: "Freelance Design", valor: 2000, tipo: "receita", categoria: "Trabalho", data: "05 Mar 2026" },
  { id: 5, nome: "Netflix", valor: -55.90, tipo: "despesa", categoria: "Lazer", data: "03 Mar 2026" },
  { id: 6, nome: "Uber", valor: -32.50, tipo: "despesa", categoria: "Transporte", data: "02 Mar 2026" },
]

export function RecentTransactions() {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base text-card-foreground">Últimas Movimentações</CardTitle>
        <Link href="/dashboard/despesas">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  t.tipo === "receita" ? "bg-primary/10" : "bg-destructive/10"
                }`}>
                  {t.tipo === "receita" ? (
                    <ArrowDownLeft className="h-4 w-4 text-primary" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">{t.categoria} • {t.data}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${
                t.valor > 0 ? "text-primary" : "text-card-foreground"
              }`}>
                {t.valor > 0 ? "+" : ""} R$ {Math.abs(t.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
