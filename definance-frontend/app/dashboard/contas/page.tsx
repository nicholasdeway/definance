"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, AlertTriangle, CheckCircle2, Clock, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { formatCurrency } from "@/lib/currency"

interface Conta {
  id: number
  nome: string
  valor: number
  vencimento: string
  status: string
  dias: number
}

const contasIniciais: Conta[] = [
  { id: 1, nome: "Conta de Luz", valor: 180, vencimento: "15/03/2026", status: "vencer", dias: 3 },
  { id: 2, nome: "Internet", valor: 129.90, vencimento: "20/03/2026", status: "vencer", dias: 8 },
  { id: 3, nome: "Cartão de Crédito", valor: 1250, vencimento: "25/03/2026", status: "vencer", dias: 13 },
  { id: 4, nome: "Aluguel", valor: 1800, vencimento: "10/03/2026", status: "paga", dias: 0 },
  { id: 5, nome: "Academia", valor: 120, vencimento: "01/03/2026", status: "paga", dias: 0 },
  { id: 6, nome: "Netflix", valor: 55.90, vencimento: "03/03/2026", status: "paga", dias: 0 },
  { id: 7, nome: "Conta de Água", valor: 95, vencimento: "05/03/2026", status: "atrasada", dias: -7 },
  { id: 8, nome: "Seguro do Carro", valor: 280, vencimento: "01/03/2026", status: "atrasada", dias: -11 },
]

export default function ContasPage() {
  const [contas, setContas] = useState<Conta[]>(contasIniciais)
  const [activeTab, setActiveTab] = useState("vencer")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Conta | null }>({
    open: false,
    item: null,
  })

  const contasAVencer = contas.filter(c => c.status === "vencer")
  const contasPagas = contas.filter(c => c.status === "paga")
  const contasAtrasadas = contas.filter(c => c.status === "atrasada")

  const totalAVencer = contasAVencer.reduce((sum, c) => sum + c.valor, 0)
  const totalAtrasadas = contasAtrasadas.reduce((sum, c) => sum + c.valor, 0)

  const handleDeleteConta = () => {
    if (deleteDialog.item) {
      setContas(contas.filter(c => c.id !== deleteDialog.item!.id))
      setDeleteDialog({ open: false, item: null })
    }
  }

  const openDeleteDialog = (conta: Conta) => {
    setDeleteDialog({ open: true, item: conta })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "vencer":
        return <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
      case "paga":
        return <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
      case "atrasada":
        return <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string, dias: number) => {
    switch (status) {
      case "vencer":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 text-xs sm:text-xs whitespace-nowrap">Vence em {dias} dias</Badge>
      case "paga":
        return <Badge className="bg-primary/10 text-primary text-xs sm:text-xs whitespace-nowrap">Paga</Badge>
      case "atrasada":
        return <Badge variant="destructive" className="text-xs sm:text-xs whitespace-nowrap">{Math.abs(dias)} dias atrasada</Badge>
      default:
        return null
    }
  }

  const renderContas = (lista: Conta[]) => (
    <div className="space-y-2 sm:space-y-3">
      {lista.length === 0 ? (
        <p className="py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">Nenhuma conta encontrada</p>
      ) : (
        lista.map((conta) => (
          <div key={conta.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border/50 p-3 sm:p-4 transition-colors hover:bg-muted/50 gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full flex-shrink-0 ${
                conta.status === "paga" ? "bg-primary/10" :
                conta.status === "atrasada" ? "bg-destructive/10" :
                "bg-yellow-500/10"
              }`}>
                <CreditCard className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  conta.status === "paga" ? "text-primary" :
                  conta.status === "atrasada" ? "text-destructive" :
                  "text-yellow-500"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <p className="font-medium text-card-foreground text-sm sm:text-base break-words">{conta.nome}</p>
                  {getStatusIcon(conta.status)}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Vencimento: {conta.vencimento}</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0">
              {getStatusBadge(conta.status, conta.dias)}
              <span className="font-semibold text-card-foreground text-sm sm:text-base whitespace-nowrap">
                {formatCurrency(conta.valor)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                    <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  <DropdownMenuItem className="text-sm sm:text-base cursor-pointer">Marcar como paga</DropdownMenuItem>
                  <DropdownMenuItem className="text-sm sm:text-base cursor-pointer">Editar</DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive text-sm sm:text-base cursor-pointer"
                    onClick={() => openDeleteDialog(conta)}
                  >
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))
      )}
    </div>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Contas</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Gerencie suas contas a pagar</p>
      </div>

      {/* Cards de Resumo - Grid responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">A Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-500">
              {formatCurrency(totalAVencer)}
            </div>
            <p className="text-xs text-muted-foreground">{contasAVencer.length} contas</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pagas este mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {contasPagas.length}
            </div>
            <p className="text-xs text-muted-foreground">contas quitadas</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-destructive">
              {formatCurrency(totalAtrasadas)}
            </div>
            <p className="text-xs text-muted-foreground">{contasAtrasadas.length} contas</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid w-full grid-cols-3 bg-muted/30 p-1 h-auto">
              <TabsTrigger value="vencer" className="gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 data-[state=active]:bg-background">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">A Vencer</span>
                <span className="sm:hidden">Ven.</span>
                ({contasAVencer.length})
              </TabsTrigger>
              <TabsTrigger value="pagas" className="gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 data-[state=active]:bg-background">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Pagas</span>
                <span className="sm:hidden">Pag.</span>
                ({contasPagas.length})
              </TabsTrigger>
              <TabsTrigger value="atrasadas" className="gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 data-[state=active]:bg-background">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Atrasadas</span>
                <span className="sm:hidden">Atr.</span>
                ({contasAtrasadas.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="vencer">{renderContas(contasAVencer)}</TabsContent>
            <TabsContent value="pagas">{renderContas(contasPagas)}</TabsContent>
            <TabsContent value="atrasadas">{renderContas(contasAtrasadas)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteConta}
        itemName={deleteDialog.item?.nome}
      />
    </div>
  )
}