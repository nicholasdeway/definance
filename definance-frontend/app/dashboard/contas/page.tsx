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
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "paga":
        return <CheckCircle2 className="h-4 w-4 text-primary" />
      case "atrasada":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string, dias: number) => {
    switch (status) {
      case "vencer":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Vence em {dias} dias</Badge>
      case "paga":
        return <Badge className="bg-primary/10 text-primary">Paga</Badge>
      case "atrasada":
        return <Badge variant="destructive">{Math.abs(dias)} dias atrasada</Badge>
      default:
        return null
    }
  }

  const renderContas = (lista: Conta[]) => (
    <div className="space-y-3">
      {lista.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhuma conta encontrada</p>
      ) : (
        lista.map((conta) => (
          <div key={conta.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                conta.status === "paga" ? "bg-primary/10" :
                conta.status === "atrasada" ? "bg-destructive/10" :
                "bg-yellow-500/10"
              }`}>
                <CreditCard className={`h-5 w-5 ${
                  conta.status === "paga" ? "text-primary" :
                  conta.status === "atrasada" ? "text-destructive" :
                  "text-yellow-500"
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-card-foreground">{conta.nome}</p>
                  {getStatusIcon(conta.status)}
                </div>
                <p className="text-sm text-muted-foreground">Vencimento: {conta.vencimento}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(conta.status, conta.dias)}
              <span className="font-semibold text-card-foreground">
                {formatCurrency(conta.valor)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Marcar como paga</DropdownMenuItem>
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contas</h1>
        <p className="text-muted-foreground">Gerencie suas contas a pagar</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {formatCurrency(totalAVencer)}
            </div>
            <p className="text-xs text-muted-foreground">{contasAVencer.length} contas</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagas este mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {contasPagas.length}
            </div>
            <p className="text-xs text-muted-foreground">contas quitadas</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalAtrasadas)}
            </div>
            <p className="text-xs text-muted-foreground">{contasAtrasadas.length} contas</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="vencer" className="gap-2">
                <Clock className="h-4 w-4" />
                A Vencer ({contasAVencer.length})
              </TabsTrigger>
              <TabsTrigger value="pagas" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Pagas ({contasPagas.length})
              </TabsTrigger>
              <TabsTrigger value="atrasadas" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Atrasadas ({contasAtrasadas.length})
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
