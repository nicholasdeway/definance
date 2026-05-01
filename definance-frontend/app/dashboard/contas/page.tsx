"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Download,
  MoreHorizontal,
  CreditCard
} from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { formatCurrency, parseCurrencyInput } from "@/lib/currency"
import { apiClient } from "@/lib/api-client"
import { BillFormDialog, type BillFormState } from "@/components/dashboard/bills/bill-form-dialog"
import { ConfirmPayDialog } from "@/components/dashboard/bills/confirm-pay-dialog"
import { PeriodFilter, type PeriodFilterState } from "@/components/dashboard/period-filter"
import { useSearchParams, useRouter } from "next/navigation"
import { useCategories } from "@/lib/category-context"
import { ExportPdfDialog } from "@/components/dashboard/export-pdf-dialog"
import { BillsStats } from "@/components/dashboard/bills/bills-stats"
import { BillItem, type ContaItem } from "@/components/dashboard/bills/bill-item"
import { BillTypeFilter } from "@/components/dashboard/bills/bill-type-filter"
import { FilterBar, type SortOption } from "@/components/dashboard/filter-bar"
import { filterAndSortItems } from "@/lib/filter-utils"
import { BillDetailsModal } from "@/components/dashboard/bills/bill-details-modal"

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

export interface ApiBill {
  id: string
  name: string
  amount: number
  category?: string | null
  dueDate?: string | null
  status: string
  billType?: string | null
  isRecurring?: boolean | null
  description?: string | null
}

function mapApiToConta(b: ApiBill, targetMonth?: number, targetYear?: number): ContaItem {
  const rawDue = b.dueDate ?? null
  let dueDate: Date | null = null
  
  if (rawDue) {
    const datePart = rawDue.split('T')[0]
    const [year, month, day] = datePart.split('-').map(Number)
    
    // Se for recorrente e estivermos em um filtro mensal, projetamos o dia para o mês/ano alvo
    if (b.isRecurring && targetMonth && targetYear) {
      dueDate = new Date(targetYear, targetMonth - 1, day)
    } else {
      dueDate = new Date(year, month - 1, day)
    }
  }

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
    tipo: b.billType === "Variável" ? "Variável" : "Fixa",
    isRecorrente: b.isRecurring ?? false,
    isSynced: b.description?.includes("Perfil Financeiro") || b.description?.includes("Onboarding"),
  }
}


import { BillsAlert } from "@/components/dashboard/bills-alert"

export default function ContasPage() {
  const { discreetMode } = useSettings()
  const { categories: dynamicCategories } = useCategories()

  // Prepara a lista de categorias para o filtro (Apenas Saída ou Ambos)
  const todasCategoriasParaFiltro = useMemo(() => {
    return Array.from(new Set(
      dynamicCategories
        .filter(c => c.type === "Saída" || c.type === "Ambos")
        .map(c => c.name.trim())
    )).sort()
  }, [dynamicCategories])
  
  const [contas, setContas] = useState<ContaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [period, setPeriod] = useState<PeriodFilterState>({
    type: "monthly",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
  const [activeTab, setActiveTab] = useState("vencer")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("Todas")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("data-recente")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<BillFormState>(emptyForm)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: ContaItem | null }>({
    open: false,
    item: null,
  })
  const [payDialog, setPayDialog] = useState<{ open: boolean; item: ContaItem | null }>({
    open: false,
    item: null,
  })
  const [showTutorial, setShowTutorial] = useState(false)
  const [hasTriggeredTutorial, setHasTriggeredTutorial] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; item: ContaItem | null }>({
    open: false,
    item: null
  })
  const searchParams = useSearchParams()
  const router = useRouter()



  useEffect(() => {
    const fetchBills = async () => {
      try {
        setIsLoading(true)
        
        let queryParams = ""
        if (period.type === "monthly") {
          queryParams = `month=${period.month}&year=${period.year}`
        } else if (period.type === "60_days") {
          const end = new Date()
          const start = new Date()
          start.setDate(end.getDate() - 60)
          queryParams = `startDate=${start.toISOString()}&endDate=${end.toISOString()}`
        } else if (period.type === "90_days") {
          const end = new Date()
          const start = new Date()
          start.setDate(end.getDate() - 90)
          queryParams = `startDate=${start.toISOString()}&endDate=${end.toISOString()}`
        } else if (period.type === "custom") {
          if (period.startDate && period.endDate) {
            queryParams = `startDate=${new Date(period.startDate).toISOString()}&endDate=${new Date(period.endDate).toISOString()}`
          } else {
            queryParams = `month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}` // fallback
          }
        }

        const data = await apiClient<ApiBill[]>(`/api/bills?${queryParams}`) || []
        
        // Passamos o mês e ano do período para a projeção de contas recorrentes
        const targetMonth = period.type === "monthly" ? period.month : undefined
        const targetYear = period.type === "monthly" ? period.year : undefined
        
        setContas(data.map(b => mapApiToConta(b, targetMonth, targetYear)))
      } catch (err) {
        console.error("Erro ao carregar contas:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBills()
  }, [period])

  const setupCount = useMemo(() => 
    contas.filter(c => !c.rawDueDate).length, 
  [contas])

  const firstPendingBillId = useMemo(() => 
    contas.find(c => !c.rawDueDate)?.id, 
  [contas])

  const scrollToTabs = () => {
    setTimeout(() => {
      const el = document.getElementById("bills-list-section")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "atrasadas") {
      setActiveTab("atrasadas")
      scrollToTabs()
    }
    else if (tab === "pagas") setActiveTab("pagas")
    else if (tab === "vencer") setActiveTab("vencer")
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get("tutorial") === "true" && setupCount > 0 && !hasTriggeredTutorial) {
      setActiveTab("vencer")
      setTypeFilter("Todas")
      setShowTutorial(true)
      setHasTriggeredTutorial(true)
    }
  }, [searchParams, setupCount, hasTriggeredTutorial])

  const overdueCount = useMemo(() => 
    contas.filter(c => c.status === "atrasada").length, 
  [contas])

  // Scroll smooth para o tutorial
  useEffect(() => {
    if (showTutorial && firstPendingBillId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`bill-${firstPendingBillId}`)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [showTutorial, firstPendingBillId])

  const filtered = useMemo(() => {
    let result = contas

    // Filtro por tipo de conta (Fixa/Variável)
    if (typeFilter !== "Todas") {
      result = result.filter((c) => c.tipo === typeFilter)
    }

    // Filtro por busca, ordenação e categoria
    return filterAndSortItems(
      result,
      search,
      sortBy,
      selectedCategories
    )
  }, [contas, typeFilter, search, sortBy, selectedCategories])

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
    const inputDate = conta.rawDueDate ? conta.rawDueDate.split('T')[0] : ""
    const isCustomCategory = conta.categoria && !todasCategoriasParaFiltro.includes(conta.categoria) && conta.categoria !== "Outros"

    setForm({
      id: conta.id,
      nome: conta.nome,
      valor: formatCurrency(conta.valor),
      categoria: isCustomCategory ? "Outros" : (conta.categoria || "Outros"),
      outroCategoria: isCustomCategory ? conta.categoria : "",
      tipo: conta.tipo,
      dueDate: inputDate,
      isRecorrente: conta.isRecorrente,
      descricao: "",
      observacoes: "",
    })
    setIsOpen(true)
    setShowTutorial(false)
  }

  const handleSave = async () => {
    if (!form.nome || !form.valor) return
    try {
      setIsSaving(true)
      const amount = parseCurrencyInput(form.valor)
      
      let dueDate = null
      let dueDay = null
      
      if (form.dueDate) {
        const [y, m, d] = form.dueDate.split("-").map(Number)
        // Criar data ao meio-dia para evitar problemas de fuso horário ao converter para ISO
        const dateObj = new Date(y, m - 1, d, 12, 0, 0)
        dueDate = dateObj.toISOString()
        dueDay = d
      }

      const payload = {
        name: form.nome,
        amount,
        category: form.categoria === "Outros" ? (form.outroCategoria || "Outros") : (form.categoria || "Outros"),
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

      const response = await apiClient<ApiBill>(url, { method, body: JSON.stringify(payload) })

      if (response && response.id) {
        const updated = mapApiToConta(response)
        if (isEditing) {
          setContas((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        } else {
          setContas((prev) => [updated, ...prev])
        }
        setForm(emptyForm)
        setIsOpen(false)
        window.dispatchEvent(new CustomEvent("finance-update"))
      }
    } catch (err) {
      console.error("Erro ao salvar conta:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePayBill = async (date?: string) => {
    if (!payDialog.item) return
    try {
      setIsPaying(true)
      const payload = date ? { paymentDate: new Date(date).toISOString() } : {}
      const response = await apiClient<{ bill: ApiBill }>(`/api/bills/${payDialog.item.id}/pay`, { 
        method: "PUT",
        body: JSON.stringify(payload)
      })
      if (response?.bill) {
        setContas((prev) =>
          prev.map((c) => (c.id === payDialog.item!.id ? { ...c, status: "paga", rawDueDate: date ? `${date}T12:00:00Z` : c.rawDueDate } : c))
        )
        setActiveTab("pagas")
        window.dispatchEvent(new CustomEvent("finance-update"))
      }
    } catch (err) {
      console.error("Erro ao pagar conta:", err)
    } finally {
      setIsPaying(false)
      setPayDialog({ open: false, item: null })
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.item) return
    try {
      setIsDeleting(true)
      await apiClient(`/api/bills/${deleteDialog.item.id}`, { method: "DELETE" })
      setContas((prev) => prev.filter((c) => c.id !== deleteDialog.item!.id))
      setDeleteDialog({ open: false, item: null })
      window.dispatchEvent(new CustomEvent("finance-update"))
    } catch (err) {
      console.error("Erro ao excluir conta:", err)
    } finally {
      setIsDeleting(false)
    }
  }


  const handleAlertAction = (type: "overdue" | "setup" | "dueSoon" | "budget" | "spending") => {
    if (type === "overdue") {
      setActiveTab("atrasadas")
      setTypeFilter("Todas")
      scrollToTabs()
    } else if (type === "setup") {
      setActiveTab("vencer")
      setTypeFilter("Todas")
      setShowTutorial(true)
      setHasTriggeredTutorial(true)
    } else if (type === "dueSoon") {
      setActiveTab("vencer")
      setTypeFilter("Todas")
      scrollToTabs()
    } else if (type === "budget" || type === "spending") {
      router.push("/dashboard/relatorios")
    }
  }

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
          <BillItem 
            key={conta.id}
            conta={conta}
            discreetMode={discreetMode}
            showTutorial={showTutorial}
            isFirstPending={conta.id === firstPendingBillId}
            onEdit={openEditDialog}
            onDelete={(item) => setDeleteDialog({ open: true, item })}
            onPay={(item) => setPayDialog({ open: true, item })}
            onShowDetails={(item) => setDetailsModal({ open: true, item })}
          />
        ))}
      </div>
    )
  }

  // Render
  return (
    <div className="space-y-4 md:space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-6 items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Minhas Contas</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">Gerencie suas contas e boletos</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full">
          <Button
            className="bg-primary/70 text-primary-foreground hover:bg-primary cursor-pointer w-full sm:w-auto h-9 text-xs sm:text-sm font-bold shadow-lg shadow-primary/20"
            onClick={openAddDialog}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>

          <PeriodFilter 
            value={period}
            onChange={setPeriod}
          >
            <Button 
              variant="outline" 
              className="h-9 gap-2 hover:bg-primary/5 transition-colors cursor-pointer border-white/10 sm:border-border/50 text-xs sm:text-sm font-medium"
              onClick={() => setIsExportDialogOpen(true)}
            >
              <Download className="h-3.5 w-3.5 sm:h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </PeriodFilter>
        </div>
      </div>

      <BillsAlert onAction={handleAlertAction} />

      <BillsStats 
        totalAVencer={totalAVencer}
        allAVencerCount={allAVencer.length}
        allPagasCount={allPagas.length}
        totalAtrasadas={totalAtrasadas}
        allAtrasadasCount={allAtrasadas.length}
        isLoading={isLoading}
        discreetMode={discreetMode}
      />

      {/* Lista com Tabs + Filtro de Tipo */}
      <Card id="bills-list-section" className="border-border/50 shadow-sm scroll-mt-20">
        <CardContent className="pt-4 space-y-4">
          <FilterBar 
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categories={todasCategoriasParaFiltro}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            placeholder="Buscar contas..."
          />

          <BillTypeFilter 
            currentFilter={typeFilter}
            onFilterChange={setTypeFilter}
            filteredCount={filtered.length}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid w-full grid-cols-3 bg-muted/30 p-2 h-auto rounded-2xl border border-white/5 gap-2">
              <TabsTrigger
                value="vencer"
                className="relative gap-1 sm:gap-2 text-[10px] sm:text-xs py-3 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:scale-[1.02] data-[state=active]:z-10 transition-all duration-300 hover:bg-background/40 rounded-xl"
              >
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">A Vencer</span>
                <span className="sm:hidden">Ven.</span>
                <span className="font-bold opacity-70">({contasAVencer.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="pagas"
                className="relative gap-1 sm:gap-2 text-[10px] sm:text-xs py-3 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:scale-[1.02] data-[state=active]:z-10 transition-all duration-300 hover:bg-background/40 rounded-xl"
              >
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Pagas</span>
                <span className="sm:hidden">Pag.</span>
                <span className="font-bold opacity-70">({contasPagas.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="atrasadas"
                className="relative gap-1 sm:gap-2 text-[10px] sm:text-xs py-3 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:scale-[1.02] data-[state=active]:z-10 transition-all duration-300 hover:bg-background/40 rounded-xl"
              >
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Atrasadas</span>
                <span className="sm:hidden">Atr.</span>
                <span className="font-bold opacity-70">({contasAtrasadas.length})</span>
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
        loading={isDeleting}
      />

      <ConfirmPayDialog
        open={payDialog.open}
        onOpenChange={(open) => setPayDialog({ ...payDialog, open })}
        onConfirm={handlePayBill}
        itemName={payDialog.item?.nome}
        loading={isPaying}
        hasDate={!!payDialog.item?.rawDueDate}
      />

      <ExportPdfDialog 
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        title="Relatório de Contas"
        subtitle={`Deseja exportar as ${contas.length} contas listadas no PDF?`}
        data={contas.map(c => ({
          ...c,
          statusLabel: c.status === 'paga' ? 'Paga' : c.status === 'atrasada' ? 'Atrasada' : 'A Vencer'
        }))}
        columns={[
          { header: "Nome", key: "nome" },
          { header: "Vencimento", key: "vencimento" },
          { header: "Categoria", key: "categoria" },
          { header: "Tipo", key: "tipo" },
          { header: "Status", key: "statusLabel" },
          { header: "Valor", key: "valor", type: "currency" },
        ]}
        fileName={`contas-${period.month}-${period.year}`}
      />

      <BillDetailsModal
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ ...detailsModal, open })}
        conta={detailsModal.item}
        onEdit={() => {
          if (detailsModal.item) {
            openEditDialog(detailsModal.item)
            setDetailsModal({ ...detailsModal, open: false })
          }
        }}
        onDelete={() => {
          if (detailsModal.item) {
            setDeleteDialog({ open: true, item: detailsModal.item })
            setDetailsModal({ ...detailsModal, open: false })
          }
        }}
        onPay={() => {
          if (detailsModal.item) {
            setPayDialog({ open: true, item: detailsModal.item })
            setDetailsModal({ ...detailsModal, open: false })
          }
        }}
      />

      {/* Tutorial Hint Overlay */}
      {showTutorial && (
        <>
          <div 
            className="fixed inset-0 z-[100] cursor-pointer" 
            onClick={() => {
              setShowTutorial(false)
              scrollToTabs()
            }}
          />
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] w-[90%] max-w-md animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-zinc-900/95 backdrop-blur-md text-zinc-100 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 flex items-start gap-4 ring-1 ring-white/5">
              <div className="bg-primary/20 p-2.5 rounded-2xl shrink-0">
                <MoreHorizontal className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base mb-1 text-white">Como configurar o vencimento?</h4>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Clique nos <strong className="text-primary">três pontinhos</strong> da conta destacada acima e escolha <strong>"Editar"</strong> para definir a data de vencimento.
                </p>
                <div className="flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowTutorial(false)
                      scrollToTabs()
                    }}
                    className="h-8 text-xs font-bold px-5 bg-white/5 hover:bg-white/10 text-white rounded-xl cursor-pointer"
                  >
                    Entendi!
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}