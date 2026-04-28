"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download, ArrowDownCircle } from "lucide-react"
import { parseCurrencyInput, formatCurrency } from "@/lib/currency"
import { apiClient } from "@/lib/api-client"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { ExpensesSummaryCards, type ExpenseFilterType } from "@/components/dashboard/expenses/expenses-summary-cards"
import { ExpenseFormDialog, type ExpenseFormState } from "@/components/dashboard/expenses/expense-form-dialog"
import { ExpenseList, type Despesa } from "@/components/dashboard/expenses/expense-list"
import { PeriodFilter, type PeriodFilterState } from "@/components/dashboard/period-filter"
import { ExportPdfDialog } from "@/components/dashboard/export-pdf-dialog"
import { BillsAlert } from "@/components/dashboard/bills-alert"
import { type SortOption } from "@/components/dashboard/filter-bar"
import { filterAndSortItems } from "@/lib/filter-utils"
import { useCategories } from "@/lib/category-context"


export interface ExpenseApiResponse {
  id: string
  name: string
  amount: number
  category: string
  date: string
  expenseType: string
  status: string
  billId?: string | null
  description?: string | null
  notes?: string | null
}

const emptyForm: ExpenseFormState = {
  nome: "",
  valor: "",
  categoria: "",
  data: "",
  tipo: "Variável",
  status: "Pendente",
  descricao: "",
  observacoes: "",
}

export default function DespesasPage() {
  const { categories: dynamicCategories } = useCategories()
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [period, setPeriod] = useState<PeriodFilterState>({
    type: "monthly",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState<ExpenseFormState>(emptyForm)
  const [filterType, setFilterType] = useState<ExpenseFilterType>("all")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Despesa | null }>({
    open: false,
    item: null,
  })
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("data-recente")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const listRef = useRef<HTMLDivElement>(null)
  const prevFilterType = useRef(filterType)

  useEffect(() => {
    if (prevFilterType.current === filterType) return
    prevFilterType.current = filterType
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [filterType])

  useEffect(() => {
    const fetchExpenses = async () => {
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

        const data = await apiClient<ExpenseApiResponse[]>(`/api/expenses?${queryParams}`) || []

        const mapped: Despesa[] = data.map((e: ExpenseApiResponse) => ({
          id: e.id,
          nome: e.name,
          valor: e.amount,
          categoria: e.category,
          data: new Date(e.date).toLocaleDateString("pt-BR"),
          tipo: e.expenseType,
          status: e.status,
          billId: e.billId ?? null,
          descricao: e.description ?? null,
          observacoes: e.notes ?? null,
        }))

        setDespesas(mapped)
      } catch (error) {
        console.error("Erro ao carregar despesas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenses()
  }, [period])

  const filteredDespesas = useMemo(() => {
    let result = despesas

    // Primeiro aplica o filtro de status (pago/pendente) que vem dos cards
    if (filterType === "paid") {
      result = result.filter(d => d.status === "Pago")
    } else if (filterType === "pending") {
      result = result.filter(d => d.status === "Pendente")
    }

    // Depois aplica a busca, ordenação e filtros de categoria usando a utilitária
    return filterAndSortItems(
      result, 
      search, 
      sortBy, 
      selectedCategories,
      "categoria",
      dynamicCategories
    )
  }, [despesas, search, sortBy, selectedCategories, filterType])

  const totalDespesas    = despesas.reduce((sum, d) => sum + d.valor, 0)
  const despesasPagas    = despesas.filter(d => d.status === "Pago").reduce((sum, d) => sum + d.valor, 0)
  const despesasPendentes = despesas.filter(d => d.status === "Pendente").reduce((sum, d) => sum + d.valor, 0)

  const openAddDialog = () => {
    setForm(emptyForm)
    setIsOpen(true)
  }

  const openEditDialog = (despesa: Despesa) => {
    const parts = despesa.data.split("/")
    const inputDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : ""

    setForm({
      id: despesa.id,
      nome: despesa.nome,
      valor: formatCurrency(despesa.valor),
      categoria: despesa.categoria,
      data: inputDate,
      tipo: despesa.tipo,
      status: despesa.status,
      descricao: despesa.descricao || "",
      observacoes: despesa.observacoes || "",
    })
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome || !form.valor) return

    const amount = parseCurrencyInput(form.valor)
    const now = new Date()
    let dateParsed = now.toISOString()
    
    if (form.data) {
      const [y, m, d] = form.data.split('-').map(Number)
      const selectedDate = new Date(y, m - 1, d)
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
      
      const pad = (n: number) => n.toString().padStart(2, '0')
      dateParsed = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}T${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}:${pad(selectedDate.getSeconds())}`
    }

    const payload = {
      name: form.nome,
      amount,
      category: form.categoria || "Outros",
      date: dateParsed,
      expenseType: form.tipo,
      status: form.status,
      description: form.descricao || null,
      notes: form.observacoes || null,
    }

    try {
      setIsSaving(true)
      const isEditing = !!form.id
      const url = isEditing ? `/api/expenses/${form.id}` : "/api/expenses"
      const method = isEditing ? "PUT" : "POST"

      const response = await apiClient<ExpenseApiResponse>(url, {
        method,
        body: JSON.stringify(payload),
      })

      if (response && response.id) {
        const saved: Despesa = {
          id: response.id,
          nome: response.name,
          valor: response.amount,
          categoria: response.category,
          data: new Date(response.date).toLocaleDateString("pt-BR"),
          tipo: response.expenseType,
          status: response.status,
          descricao: response.description ?? null,
          observacoes: response.notes ?? null,
        }

        if (isEditing) {
          setDespesas(despesas.map(d => d.id === saved.id ? saved : d))
        } else {
          setDespesas([saved, ...despesas])
        }

        setForm(emptyForm)
        setIsOpen(false)
        window.dispatchEvent(new CustomEvent("finance-update"))
      }
    } catch (error) {
      console.error("Erro ao salvar despesa:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleMarkAsPaid = async (despesa: Despesa) => {
    try {
      const response = await apiClient<ExpenseApiResponse>(`/api/expenses/${despesa.id}/pay`, { method: "PUT" })
      if (response && response.id) {
        setDespesas(despesas.map(d =>
          d.id === despesa.id ? { ...d, status: "Pago" } : d
        ))
      }
    } catch (error) {
      console.error("Erro ao marcar despesa como paga:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.item) return
    try {
      setIsDeleting(true)
      await apiClient(`/api/expenses/${deleteDialog.item.id}`, { method: "DELETE" })
      setDespesas(despesas.filter(d => d.id !== deleteDialog.item!.id))
      setDeleteDialog({ open: false, item: null })
      window.dispatchEvent(new CustomEvent("finance-update"))
    } catch (error) {
      console.error("Erro ao excluir despesa:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6 items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Saídas</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">Controle suas despesas e mantenha seu orçamento em dia</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full">
          <Button
            className="bg-primary/70 text-primary-foreground hover:bg-primary cursor-pointer w-full sm:w-auto"
            onClick={openAddDialog}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>

          <PeriodFilter value={period} onChange={setPeriod}>
            <Button 
              variant="outline" 
              className="h-9 gap-2 hover:bg-primary/5 transition-colors cursor-pointer px-3 sm:px-4 shrink-0"
              onClick={() => setIsExportDialogOpen(true)}
              size="sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </PeriodFilter>
        </div>
      </div>

      <BillsAlert />

      {/* Cards de Resumo */}
      <ExpensesSummaryCards
        total={totalDespesas}
        pagas={despesasPagas}
        pendentes={despesasPendentes}
        selectedFilter={filterType}
        onFilterChange={setFilterType}
        isLoading={isLoading}
      />

      {/* Lista de Despesas */}
      <div ref={listRef}>
        <ExpenseList
        despesas={filteredDespesas}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        statusFilter={filterType}
        onEdit={openEditDialog}
        onMarkAsPaid={handleMarkAsPaid}
        onDelete={(d) => setDeleteDialog({ open: true, item: d })}
        isLoading={isLoading}
      />
      </div>

      {/* Dialog de Formulário */}
      <ExpenseFormDialog
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

      <ExportPdfDialog 
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        title="Relatório de Despesas"
        subtitle={`Deseja exportar as ${despesas.length} despesas listadas no PDF?`}
        data={despesas}
        columns={[
          { header: "Nome", key: "nome" },
          { header: "Categoria", key: "categoria" },
          { header: "Data", key: "data" },
          { header: "Tipo", key: "tipo" },
          { header: "Status", key: "status" },
          { header: "Valor", key: "valor", type: "currency" },
        ]}
        fileName={`despesas-${period.month}-${period.year}`}
      />
    </div>
  )
}