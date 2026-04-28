"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Send, 
  Download, 
  CalendarDays,
  CalendarFold,
  ListChecks,
  Loader2
} from "lucide-react"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { useSettings } from "@/lib/settings-context"
import { useCategories } from "@/lib/category-context"
import { ExportPdfDialog } from "@/components/dashboard/export-pdf-dialog"
import { BillsAlert } from "@/components/dashboard/bills-alert"
import { FilterBar, type SortOption } from "@/components/dashboard/filter-bar"
import { PeriodFilter, type PeriodFilterState } from "@/components/dashboard/period-filter"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

// Standardized Components
import { GastoStats } from "@/components/dashboard/gastos-diarios/gasto-stats"
import { GastoList } from "@/components/dashboard/gastos-diarios/gasto-list"
import { GastoDialog } from "@/components/dashboard/gastos-diarios/gasto-dialog"
import { GastoDetailsModal } from "@/components/dashboard/gastos-diarios/gasto-details-modal"

// Standardized Utils
import { formatGastoDate } from "@/lib/gastos-utils"

// Interfaces
interface Gasto {
  id: string
  descricao: string
  valor: number
  data: string
  dataReal: string
  hora: string
  categoria?: string
}

interface ExpenseApiResponse {
  id: string
  name: string
  amount: number
  date: string
  category: string
  status: string
}

interface QuickExpenseApiResponse {
  id: string
  name: string
  amount: number
  category: string
  date: string
  status: string
}

export default function GastosDiariosPage() {
  const { discreetMode } = useSettings()
  const { categories: dynamicCategories } = useCategories()

  const todasCategoriasParaFiltro = useMemo(() => {
    return Array.from(new Set(
      dynamicCategories
        .filter(c => c.type === "Saída" || c.type === "Ambos")
        .map(c => c.name.trim())
    )).sort()
  }, [dynamicCategories])

  const [gastos, setGastos] = useState<Gasto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Gasto | null }>({
    open: false,
    item: null,
  })
  const [editDialog, setEditDialog] = useState<{ open: boolean; item: Gasto | null }>({
    open: false,
    item: null,
  })
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; item: Gasto | null }>({
    open: false,
    item: null,
  })
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("data-recente")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [period, setPeriod] = useState<PeriodFilterState>({
    type: "monthly",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  const [dayFilter, setDayFilter] = useState<"all" | "hoje" | "ontem">("all")
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const listRef = useRef<HTMLDivElement>(null)

  const fetchGastos = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        month: period.month.toString(),
        year: period.year.toString()
      })
      const data = await apiClient<ExpenseApiResponse[]>(`/api/Expenses?${params}`)
      const mappedData: Gasto[] = data.map(item => ({
        id: item.id,
        descricao: item.name,
        valor: item.amount,
        categoria: item.category,
        data: formatGastoDate(item.date),
        dataReal: item.date, // Preserva a data ISO
        hora: new Date(item.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })
      }))
      setGastos(mappedData)
    } catch (error) {
      toast.error("Não foi possível carregar os gastos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGastos()
  }, [period])

  const handleAddGasto = async () => {
    if (!inputValue.trim() || isSaving) return
    try {
      setIsSaving(true)
      const result = await apiClient<QuickExpenseApiResponse>("/api/DailyExpenses/quick", {
        method: "POST",
        body: JSON.stringify({ input: inputValue })
      })
      const newGasto: Gasto = {
        id: result.id,
        descricao: result.name,
        valor: result.amount,
        categoria: result.category,
        data: formatGastoDate(result.date),
        dataReal: result.date,
        hora: new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })
      }
      setGastos([newGasto, ...gastos])
      setInputValue("")
      toast.success("Gasto registrado com sucesso!")
      window.dispatchEvent(new CustomEvent("finance-update"))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar gasto."
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEdit = async (data: any) => {
    try {
      setIsSaving(true)
      await apiClient(`/api/Expenses/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      })
      
      toast.success("Gasto atualizado com sucesso!")
      setEditDialog({ open: false, item: null })
      fetchGastos() // Recarrega a lista
      window.dispatchEvent(new CustomEvent("finance-update"))
    } catch (error) {
      toast.error("Erro ao atualizar gasto.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGasto = async () => {
    if (deleteDialog.item) {
      try {
        setIsDeleting(true)
        await apiClient(`/api/Expenses/${deleteDialog.item.id}`, { method: "DELETE" })
        setGastos(gastos.filter(g => g.id !== deleteDialog.item!.id))
        setDeleteDialog({ open: false, item: null })
        toast.success("Gasto excluído.")
        window.dispatchEvent(new CustomEvent("finance-update"))
      } catch (error) {
        toast.error("Erro ao excluir gasto.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const totalHoje = gastos.filter(g => g.data === "Hoje").reduce((sum, g) => sum + g.valor, 0)
  const totalOntem = gastos.filter(g => g.data === "Ontem").reduce((sum, g) => sum + g.valor, 0)
  const totalTodos = gastos.reduce((sum, g) => sum + g.valor, 0)

  const gastosHoje = gastos.filter(g => g.data === "Hoje")
  const gastosOntem = gastos.filter(g => g.data === "Ontem")

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-6 items-start">
        <div className="flex flex-wrap items-center gap-4 w-full justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Gastos Diários</h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">Registre seus gastos rápidos do dia a dia</p>
          </div>

          <PeriodFilter value={period} onChange={setPeriod}>
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(true)}
              className="h-9 gap-2 hover:bg-primary/5 transition-colors cursor-pointer px-3 sm:px-4 shrink-0"
              size="sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </PeriodFilter>
        </div>
      </div>

      <BillsAlert />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <GastoStats 
          title="Todos os Gastos" 
          value={totalTodos} 
          count={gastos.length} 
          icon={<ListChecks className="h-4 w-4" />}
          active={dayFilter === "all"}
          onClick={() => setDayFilter("all")}
          variant="emerald"
          discreetMode={discreetMode}
          isInitialLoad={isInitialLoad}
          className="col-span-2 sm:col-span-1"
        />
        <GastoStats 
          title="Gastos de Hoje" 
          value={totalHoje} 
          count={gastosHoje.length} 
          icon={<CalendarFold className="h-4 w-4" />}
          active={dayFilter === "hoje"}
          onClick={() => setDayFilter("hoje")}
          variant="orange"
          discreetMode={discreetMode}
          isInitialLoad={isInitialLoad}
        />
        <GastoStats 
          title="Gastos de Ontem" 
          value={totalOntem} 
          count={gastosOntem.length} 
          icon={<CalendarDays className="h-4 w-4" />}
          active={dayFilter === "ontem"}
          onClick={() => setDayFilter("ontem")}
          variant="blue"
          discreetMode={discreetMode}
          isInitialLoad={isInitialLoad}
        />
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardContent className="pt-4 pb-3 px-4">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Lançamento Rápido</h3>
              <span className="text-[9px] text-muted-foreground/50 italic">Pressione Enter para salvar</span>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder='Ex: "Mercado 150" ou "Uber 25"'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGasto()}
                className="flex-1 h-9 bg-muted/20 border-border/50 text-xs truncate placeholder:text-[10px] sm:placeholder:text-xs"
                disabled={isSaving}
              />
              <Button 
                onClick={handleAddGasto} 
                className="bg-primary/80 hover:bg-primary h-9 w-9 p-0 shrink-0 shadow-lg shadow-primary/20" 
                disabled={isSaving}
                size="icon"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="text-[12px] text-muted-foreground/50 italic">
              Dica: "Gasolina 50 hoje" ou "Lanche 30 ontem"
            </p>
          </div>
        </CardContent>
      </Card>

      <div ref={listRef} className="space-y-4 md:space-y-6">
        <FilterBar 
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categories={todasCategoriasParaFiltro}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          placeholder="Buscar gasto ou palavra-chave..."
        />

        <GastoList 
          title="Hoje" 
          gastos={gastosHoje} 
          visible={dayFilter === "all" || dayFilter === "hoje"}
          isLoading={isLoading}
          isInitialLoad={isInitialLoad}
          discreetMode={discreetMode}
          onEdit={(g) => setEditDialog({ open: true, item: g })}
          onDelete={(g) => setDeleteDialog({ open: true, item: g })}
          onDetails={(g) => setDetailsDialog({ open: true, item: g })}
        />

        <GastoList 
          title="Ontem" 
          gastos={gastosOntem} 
          visible={dayFilter === "all" || dayFilter === "ontem"}
          isLoading={isLoading}
          isInitialLoad={isInitialLoad}
          discreetMode={discreetMode}
          onEdit={(g) => setEditDialog({ open: true, item: g })}
          onDelete={(g) => setDeleteDialog({ open: true, item: g })}
          onDetails={(g) => setDetailsDialog({ open: true, item: g })}
        />
      </div>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteGasto}
        itemName={deleteDialog.item?.descricao}
        loading={isDeleting}
      />

      <GastoDialog 
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
        onSave={handleSaveEdit}
        initialData={editDialog.item}
        isSaving={isSaving}
      />

      <ExportPdfDialog 
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        title="Gastos Diários Rápidos"
        subtitle={`Deseja exportar os ${gastos.length} lançamentos rápidos para PDF?`}
        data={gastos}
        columns={[
          { header: "Descrição", key: "descricao" },
          { header: "Valor", key: "valor", type: "currency" },
          { header: "Data", key: "data" },
          { header: "Hora", key: "hora" },
        ]}
        fileName="gastos-diarios"
      />

      <GastoDetailsModal
        open={detailsDialog.open}
        onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}
        gasto={detailsDialog.item}
        onEdit={() => {
          setDetailsDialog({ open: false, item: null })
          if (detailsDialog.item) setEditDialog({ open: true, item: detailsDialog.item })
        }}
        onDelete={() => {
          setDetailsDialog({ open: false, item: null })
          if (detailsDialog.item) setDeleteDialog({ open: true, item: detailsDialog.item })
        }}
      />
    </div>
  )
}