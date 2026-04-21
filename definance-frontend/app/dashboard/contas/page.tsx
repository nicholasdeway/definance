"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, AlertTriangle, CheckCircle2, Clock, MoreHorizontal, Plus, Pin, Shuffle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { formatCurrency, parseCurrencyInput } from "@/lib/currency"
import { apiClient } from "@/lib/api-client"
import { BillFormDialog, type BillFormState } from "@/components/dashboard/bills/bill-form-dialog"


interface ContaItem {
  id: string
  nome: string
  valor: number
  categoria: string
  vencimento: string      // formatado pt-BR
  rawDueDate: string | null
  status: "vencer" | "paga" | "atrasada"
  dias: number
  tipo: "Fixa" | "Variável"
  isRecorrente: boolean
}

type TypeFilter = "Todas" | "Fixa" | "Variável"

const emptyForm: BillFormState = {
  nome: "",
  valor: "",
  categoria: "",
  tipo: "Fixa",
  dueDate: "",
  isRecorrente: true,
  descricao: "",
  observacoes: "",
}


function mapApiToConta(b: any): ContaItem {
  const rawDue = b.dueDate ?? null
  const dueDate = rawDue ? new Date(rawDue) : null

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const dias = dueDate
    ? Math.ceil((dueDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  let status: "vencer" | "paga" | "atrasada"
  if (b.status === "Pago") {
    status = "paga"
  } else if (b.status === "Atrasado" || dias < 0) {
    status = "atrasada"
  } else {
    status = "vencer"
  }

  return {
    id: b.id,
    nome: b.name,
    valor: b.amount,
    categoria: b.category ?? "",
    vencimento: dueDate ? dueDate.toLocaleDateString("pt-BR") : "—",
    rawDueDate: rawDue,
    status,
    dias,
    tipo: b.billType ?? "Fixa",
    isRecorrente: b.isRecurring ?? false,
  }
}


import { BillsAlert } from "@/components/dashboard/bills-alert"

export default function ContasPage() {
  const [contas, setContas] = useState<ContaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("vencer")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("Todas")
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<BillFormState>(emptyForm)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: ContaItem | null }>({
    open: false,
    item: null,
  })

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setIsLoading(true)
        const data = await apiClient<any[]>("/api/bills") || []
        setContas(data.map(mapApiToConta))
      } catch (err) {
        console.error("Erro ao carregar contas:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBills()
  }, [])

  const setupCount = useMemo(() => 
    contas.filter(c => !c.rawDueDate).length, 
  [contas])

  const overdueCount = useMemo(() => 
    contas.filter(c => c.status === "atrasada").length, 
  [contas])

  const filtered = useMemo(() => {
    if (typeFilter === "Todas") return contas
    return contas.filter((c) => c.tipo === typeFilter)
  }, [contas, typeFilter])

  const contasAVencer   = filtered.filter((c) => c.status === "vencer")
  const contasPagas     = filtered.filter((c) => c.status === "paga")
  const contasAtrasadas = filtered.filter((c) => c.status === "atrasada")

  const allAVencer   = contas.filter((c) => c.status === "vencer")
  const allAtrasadas = contas.filter((c) => c.status === "atrasada")
  const allPagas     = contas.filter((c) => c.status === "paga")

  const totalAVencer   = allAVencer.reduce((s, c) => s + c.valor, 0)
  const totalAtrasadas = allAtrasadas.reduce((s, c) => s + c.valor, 0)

  const openAddDialog = () => {
    setForm(emptyForm)
    setIsOpen(true)
  }

  const openEditDialog = (conta: ContaItem) => {
    const parts = conta.vencimento !== "—" ? conta.vencimento.split("/") : []
    const inputDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : ""

    setForm({
      id: conta.id,
      nome: conta.nome,
      valor: formatCurrency(conta.valor),
      categoria: conta.categoria,
      tipo: conta.tipo,
      dueDate: inputDate,
      isRecorrente: conta.isRecorrente,
      descricao: "",
      observacoes: "",
    })
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome || !form.valor) return
    try {
      setIsSaving(true)
      const amount = parseCurrencyInput(form.valor)
      const dueDate = form.dueDate ? new Date(form.dueDate).toISOString() : null
      const dueDay = form.dueDate ? new Date(form.dueDate).getDate() : null

      const payload = {
        name: form.nome,
        amount,
        category: form.categoria || "Outros",
        billType: form.tipo,
        dueDate,
        dueDay,
        isRecurring: form.isRecorrente,
        status: "Pendente",
        description: form.descricao || null,
        notes: form.observacoes || null,
      }

      const isEditing = !!form.id
      const url = isEditing ? `/api/bills/${form.id}` : "/api/bills"
      const method = isEditing ? "PUT" : "POST"

      const response = await apiClient<any>(url, { method, body: JSON.stringify(payload) })

      if (response && response.id) {
        const updated = mapApiToConta(response)
        if (isEditing) {
          setContas((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        } else {
          setContas((prev) => [updated, ...prev])
        }
        setForm(emptyForm)
        setIsOpen(false)
      }
    } catch (err) {
      console.error("Erro ao salvar conta:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePayBill = async (conta: ContaItem) => {
    try {
      const response = await apiClient<any>(`/api/bills/${conta.id}/pay`, { method: "PUT" })
      if (response?.bill) {
        setContas((prev) =>
          prev.map((c) => (c.id === conta.id ? { ...c, status: "paga" } : c))
        )
        setActiveTab("pagas")
      }
    } catch (err) {
      console.error("Erro ao pagar conta:", err)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.item) return
    try {
      await apiClient(`/api/bills/${deleteDialog.item.id}`, { method: "DELETE" })
      setContas((prev) => prev.filter((c) => c.id !== deleteDialog.item!.id))
    } catch (err) {
      console.error("Erro ao excluir conta:", err)
    } finally {
      setDeleteDialog({ open: false, item: null })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "vencer":   return <Clock       className="h-3.5 w-3.5 text-yellow-500" />
      case "paga":     return <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
      case "atrasada": return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
    }
  }

  const getStatusBadge = (status: string, dias: number, hasDate: boolean) => {
    switch (status) {
      case "vencer":
        if (!hasDate) {
          return (
            <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs whitespace-nowrap animate-pulse">
              Data pendente
            </Badge>
          )
        }
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs whitespace-nowrap">
            {dias === 0 ? "Vence hoje" : `Vence em ${dias}d`}
          </Badge>
        )
      case "paga":
        return <Badge className="bg-primary/10 text-primary border-primary/20 text-xs whitespace-nowrap">Paga</Badge>
      case "atrasada":
        return <Badge variant="destructive" className="text-xs whitespace-nowrap">{Math.abs(dias)}d atrasada</Badge>
    }
  }

  const getTipoBadge = (tipo: string) => (
    <Badge
      variant="outline"
      className={`text-[10px] whitespace-nowrap px-1.5 py-0 ${
        tipo === "Fixa"
          ? "border-primary/30 text-primary bg-primary/5"
          : "border-muted-foreground/30 text-muted-foreground"
      }`}
    >
      {tipo === "Fixa" ? "📌 Fixa" : "🔀 Variável"}
    </Badge>
  )

  const renderContas = (lista: ContaItem[]) => {
    if (isLoading) {
      return (
        <div className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground animate-pulse text-xs sm:text-sm">
            Carregando contas...
          </p>
        </div>
      )
    }

    if (lista.length === 0) {
      return (
        <div className="py-8 text-center text-xs sm:text-sm text-muted-foreground border-2 border-dashed border-border/60 rounded-xl">
          Nenhuma conta encontrada
          {typeFilter !== "Todas" && ` do tipo "${typeFilter}"`}.
        </div>
      )
    }

    return (
      <div className="space-y-2 sm:space-y-3">
        {lista.map((conta) => (
          <div
            key={conta.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border/50 p-3 sm:p-4 transition-colors hover:bg-muted/50 gap-3 sm:gap-4"
          >
            {/* Ícone + Info */}
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <div
                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full flex-shrink-0 ${
                  conta.status === "paga"
                    ? "bg-primary/10"
                    : conta.status === "atrasada"
                    ? "bg-destructive/10"
                    : "bg-yellow-500/10"
                }`}
              >
                <CreditCard
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    conta.status === "paga"
                      ? "text-primary"
                      : conta.status === "atrasada"
                      ? "text-destructive"
                      : "text-yellow-500"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-medium text-card-foreground text-sm sm:text-base break-words">
                    {conta.nome}
                  </p>
                  {getStatusIcon(conta.status)}
                  {getTipoBadge(conta.tipo)}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Vencimento: {conta.vencimento}
                  {conta.categoria && ` • ${conta.categoria}`}
                </p>
              </div>
            </div>

            {/* Badge + Valor + Ações */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0">
              {getStatusBadge(conta.status, conta.dias, !!conta.rawDueDate)}
              <span className="font-semibold text-card-foreground text-sm sm:text-base whitespace-nowrap">
                {formatCurrency(conta.valor)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                    <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  {conta.status !== "paga" && (
                    <DropdownMenuItem
                      className="cursor-pointer text-sm text-primary font-medium"
                      onClick={() => handlePayBill(conta)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar como paga
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer text-sm"
                    onClick={() => openEditDialog(conta)}
                  >
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive font-medium cursor-pointer text-sm"
                    onClick={() => setDeleteDialog({ open: true, item: conta })}
                  >
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 md:space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Minhas Contas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gerencie suas contas a pagar · ao pagar, a despesa vai para Saídas automaticamente
          </p>
        </div>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary/5 w-full sm:w-auto shadow-sm"
          onClick={openAddDialog}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <BillsAlert onAction={() => setActiveTab("atrasadas")} />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              A Vencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-500">
              {formatCurrency(totalAVencer)}
            </div>
            <p className="text-xs text-muted-foreground">{allAVencer.length} contas</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Pagas este mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {allPagas.length}
            </div>
            <p className="text-xs text-muted-foreground">contas quitadas</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-destructive">
              {formatCurrency(totalAtrasadas)}
            </div>
            <p className="text-xs text-muted-foreground">{allAtrasadas.length} contas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista com Tabs + Filtro de Tipo */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-4">

          {/* Filtro Fixas / Variáveis */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1 font-medium">Tipo:</span>
            {(["Todas", "Fixa", "Variável"] as TypeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  typeFilter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f === "Fixa" && <Pin className="h-3 w-3" />}
                {f === "Variável" && <Shuffle className="h-3 w-3" />}
                {f}
              </button>
            ))}
            {typeFilter !== "Todas" && (
              <span className="text-xs text-muted-foreground ml-1">
                ({filtered.length} conta{filtered.length !== 1 ? "s" : ""})
              </span>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid w-full grid-cols-3 bg-muted/30 p-1 h-auto">
              <TabsTrigger
                value="vencer"
                className="gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 data-[state=active]:bg-background"
              >
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">A Vencer</span>
                <span className="sm:hidden">Ven.</span>
                ({contasAVencer.length})
              </TabsTrigger>
              <TabsTrigger
                value="pagas"
                className="gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 data-[state=active]:bg-background"
              >
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Pagas</span>
                <span className="sm:hidden">Pag.</span>
                ({contasPagas.length})
              </TabsTrigger>
              <TabsTrigger
                value="atrasadas"
                className="gap-1 sm:gap-2 text-[10px] sm:text-xs py-2 data-[state=active]:bg-background"
              >
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

      {/* Form Dialog */}
      <BillFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        form={form}
        onFormChange={setForm}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Confirm Delete */}
      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDelete}
        itemName={deleteDialog.item?.nome}
      />
    </div>
  )
}