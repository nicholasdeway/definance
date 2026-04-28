"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  History,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { useCategories } from "@/lib/category-context"
import { apiClient } from "@/lib/api-client"
import { PeriodFilter, type PeriodFilterState } from "@/components/dashboard/period-filter"
import { FilterBar, type SortOption } from "@/components/dashboard/filter-bar"
import { filterAndSortItems } from "@/lib/filter-utils"
import { TransactionItem } from "@/components/dashboard/historico/transaction-item"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ReceitaDialog, type ReceitaFormState } from "@/components/dashboard/entradas/receita-dialog"
import { ExpenseFormDialog, type ExpenseFormState } from "@/components/dashboard/expenses/expense-form-dialog"
import { TransactionDetailsModal } from "@/components/dashboard/historico/transaction-details-modal"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Transaction {
  id: string
  nome: string
  valor: number
  tipo: "receita" | "despesa"
  categoria: string
  data: string
  rawDate: Date
  status?: string
  descricao?: string | null
  observacoes?: string | null
  recorrente?: boolean
  subtipo?: string // Para receitas (Recorrente/Extra)
}

interface ExpenseApiResponse {
  id: string
  name: string
  amount: number
  category: string
  date: string
  transactionType: string
  isRecurring?: boolean
  status?: string
  description?: string | null
  observations?: string | null
}

interface IncomeApiResponse {
  id: string
  name: string
  amount: number
  type: string
  category?: string
  date: string
  isRecurring?: boolean
  description?: string | null
  observations?: string | null
}

export default function HistoricoPage() {
  const { discreetMode } = useSettings()
  const { categories: dynamicCategories } = useCategories()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodFilterState>({
    type: "monthly",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("data-recente")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [customLimit, setCustomLimit] = useState("50")
  const [typeFilter, setTypeFilter] = useState<"all" | "receita" | "despesa">("all")
  
  // Estados para Detalhes e Edição
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<ReceitaFormState | null>(null)
  const [editingExpense, setEditingExpense] = useState<ExpenseFormState | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const todasCategoriasParaFiltro = useMemo(() => {
    return Array.from(new Set(dynamicCategories.map(c => c.name.trim()))).sort()
  }, [dynamicCategories])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      let queryParams = ""
      if (period.type === "monthly") {
        queryParams = `month=${period.month}&year=${period.year}`
      } else if (period.type === "custom" && period.startDate && period.endDate) {
        queryParams = `startDate=${new Date(period.startDate).toISOString()}&endDate=${new Date(period.endDate).toISOString()}`
      } else {
        queryParams = `month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`
      }

      const [expensesData, incomesData] = await Promise.all([
        apiClient<ExpenseApiResponse[]>(`/api/expenses?${queryParams}`),
        apiClient<IncomeApiResponse[]>(`/api/incomes?${queryParams}`)
      ])

      const all: Transaction[] = []
      
      const formatSpecialCategory = (cat: string) => {
        if (!cat) return cat;
        const lowered = cat.toLowerCase().trim();
        if (lowered === "clt" || lowered === "pj") return lowered.toUpperCase();
        return cat;
      }

      const safeParseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        const normalizedDate = (dateStr.includes('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.length > 10)) 
          ? dateStr 
          : `${dateStr}Z`;
        return new Date(normalizedDate);
      }

      if (expensesData) {
        all.push(...expensesData.map(e => {
          const dateObj = safeParseDate(e.date);
          return {
            id: e.id,
            nome: e.name,
            valor: e.amount,
            tipo: "despesa" as const,
            categoria: formatSpecialCategory(e.category),
            data: dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " • " + dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            rawDate: dateObj,
            status: e.status,
            recorrente: e.isRecurring,
            descricao: e.description,
            observacoes: e.observations
          }
        }))
      }

      if (incomesData) {
        all.push(...incomesData.map(i => {
          const dateObj = safeParseDate(i.date);
          const name = i.name?.toLowerCase()
          const formattedName = (name === "clt" || name === "pj") ? name.toUpperCase() : i.name
          return {
            id: i.id,
            nome: formattedName,
            valor: i.amount,
            tipo: "receita" as const,
            categoria: formatSpecialCategory(i.type || i.category || "Outros"),
            data: dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " • " + dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            rawDate: dateObj,
            recorrente: i.isRecurring,
            descricao: i.description,
            observacoes: i.observations,
            subtipo: i.type
          }
        }))
      }

      setTransactions(all)
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
      toast.error("Erro ao carregar dados do histórico")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period])

  const filteredTransactions = useMemo(() => {
    let result = transactions

    // Filtro por tipo (Card)
    if (typeFilter !== "all") {
      result = result.filter(t => t.tipo === typeFilter)
    }

    return filterAndSortItems(
      result, 
      search, 
      sortBy, 
      selectedCategories,
      "categoria",
      dynamicCategories
    )
  }, [transactions, search, sortBy, selectedCategories, typeFilter])

  // Lógica de Paginação
  const finalItemsPerPage = itemsPerPage === -1 ? (parseInt(customLimit) || 10) : itemsPerPage
  const totalPages = Math.ceil(filteredTransactions.length / finalItemsPerPage)
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * finalItemsPerPage
    return filteredTransactions.slice(start, start + finalItemsPerPage)
  }, [filteredTransactions, currentPage, finalItemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, sortBy, selectedCategories, itemsPerPage, customLimit, typeFilter])

  const stats = useMemo(() => {
    const receitas = transactions.filter(t => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0)
    const despesas = transactions.filter(t => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0)
    return {
      receitas,
      despesas,
      totalCount: transactions.length,
      saldo: receitas - despesas
    }
  }, [transactions])

  const handleDetails = (t: Transaction) => {
    setSelectedTransaction(t)
    setIsDetailsOpen(true)
  }

  const handleEdit = (t: Transaction) => {
    setIsDetailsOpen(false) // Fecha o modal de detalhes se estiver aberto
    if (t.tipo === "receita") {
      setEditingIncome({
        id: t.id,
        nome: t.nome,
        valor: (t.valor * 100).toFixed(0),
        tipo: t.categoria,
        outroTipo: "",
        data: t.rawDate.toISOString().split("T")[0],
        hora: t.rawDate.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
        recorrente: t.recorrente ?? false,
        descricao: t.descricao || "",
        observacoes: t.observacoes || ""
      })
      setIsIncomeDialogOpen(true)
    } else {
      setEditingExpense({
        id: t.id,
        nome: t.nome,
        valor: (t.valor * 100).toFixed(0),
        categoria: t.categoria,
        data: t.rawDate.toISOString().split("T")[0],
        tipo: t.status === "Pago" ? "Variável" : "Variável",
        status: t.status || "Pendente",
        descricao: t.descricao || "",
        observacoes: t.observacoes || ""
      })
      setIsExpenseDialogOpen(true)
    }
  }

  const handleSaveIncome = async (data: ReceitaFormState) => {
    if (!editingIncome) return
    try {
      setIsSaving(true)
      const payload = {
        name: data.nome,
        amount: parseFloat(data.valor.replace(",", ".")),
        type: data.tipo,
        date: new Date(data.data).toISOString(),
        description: data.descricao,
        observations: data.observacoes
      }
      await apiClient(`/api/incomes/${editingIncome.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })
      toast.success("Receita atualizada!")
      setIsIncomeDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Erro ao salvar alteração")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveExpense = async () => {
    if (!editingExpense) return
    try {
      setIsSaving(true)
      const payload = {
        name: editingExpense.nome,
        amount: parseFloat(editingExpense.valor.replace(",", ".")),
        category: editingExpense.categoria,
        date: new Date(editingExpense.data).toISOString(),
        status: editingExpense.status,
        description: editingExpense.descricao,
        observations: editingExpense.observacoes
      }
      await apiClient(`/api/expenses/${editingExpense.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })
      toast.success("Despesa atualizada!")
      setIsExpenseDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Erro ao salvar alteração")
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      const endpoint = itemToDelete.tipo === "receita" ? `/api/incomes/${itemToDelete.id}` : `/api/expenses/${itemToDelete.id}`
      await apiClient(endpoint, { method: "DELETE" })
      toast.success("Registro excluído com sucesso!")
      setIsDeleteDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Erro ao excluir registro")
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-6 items-start">
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Histórico de Transações</h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">Visualize e gerencie todo o seu fluxo financeiro</p>
          </div>

          <PeriodFilter value={period} onChange={setPeriod}>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-2 hover:bg-primary/5 transition-colors cursor-pointer px-3 sm:px-4 shrink-0"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </PeriodFilter>
        </div>
      </div>

      {/* Stats Summary Cards - Grid 2x2 no mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Card: Todas */}
        <Card 
          className={cn(
            "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-primary/30 py-3 sm:py-6",
            typeFilter === "all" && "ring-2 ring-primary/20 border-primary/40 bg-primary/5"
          )}
          onClick={() => setTypeFilter("all")}
        >
          <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 sm:text-muted-foreground sm:normal-case sm:tracking-normal">Movimentações</CardTitle>
            <div className={cn(
              "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-colors shrink-0",
              typeFilter === "all" ? "bg-primary text-white" : "bg-primary/10 text-primary"
            )}>
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className={cn(
              "text-lg sm:text-2xl font-bold transition-all duration-300",
              (isLoading || discreetMode) && "discreet-mode-blur"
            )}>
              {stats.totalCount}
            </div>
            <p className={cn(
              "hidden sm:block text-[10px] text-muted-foreground font-medium uppercase mt-1",
              (isLoading || discreetMode) && "discreet-mode-blur"
            )}>
              Soma de todos os registros
            </p>
          </CardContent>
        </Card>

        {/* Card: Entradas */}
        <Card 
          className={cn(
            "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-emerald-500/30 py-3 sm:py-6",
            typeFilter === "receita" && "ring-2 ring-emerald-500/20 border-emerald-500/40 bg-emerald-500/5"
          )}
          onClick={() => setTypeFilter("receita")}
        >
          <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 sm:text-muted-foreground sm:normal-case sm:tracking-normal">Entradas</CardTitle>
            <div className={cn(
              "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-colors shrink-0",
              typeFilter === "receita" ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-600"
            )}>
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className={cn(
              "text-lg sm:text-2xl font-bold transition-all duration-300 text-emerald-600",
              (isLoading || discreetMode) && "discreet-mode-blur"
            )}>
              {formatCurrency(stats.receitas)}
            </div>
            <p className={cn(
              "hidden sm:block text-[10px] text-emerald-600 font-bold uppercase mt-1",
              (isLoading || discreetMode) && "discreet-mode-blur"
            )}>
              Todos os recebimentos
            </p>
          </CardContent>
        </Card>
        
        {/* Card: Saídas */}
        <Card 
          className={cn(
            "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-destructive/30 py-3 sm:py-6",
            typeFilter === "despesa" && "ring-2 ring-destructive/20 border-destructive/40 bg-destructive/5"
          )}
          onClick={() => setTypeFilter("despesa")}
        >
          <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 sm:text-muted-foreground sm:normal-case sm:tracking-normal">Saídas</CardTitle>
            <div className={cn(
              "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-colors shrink-0",
              typeFilter === "despesa" ? "bg-destructive text-white" : "bg-destructive/10 text-destructive"
            )}>
              <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className={cn(
              "text-lg sm:text-2xl font-bold transition-all duration-300 text-destructive",
              (isLoading || discreetMode) && "discreet-mode-blur"
            )}>
              {formatCurrency(stats.despesas)}
            </div>
            <p className={cn(
              "hidden sm:block text-[10px] text-destructive font-bold uppercase mt-1",
              (isLoading || discreetMode) && "discreet-mode-blur"
            )}>
              Todos os pagamentos
            </p>
          </CardContent>
        </Card>

        {/* Card: Saldo */}
        <Card 
          className="border-border/50 shadow-sm transition-all duration-300 py-3 sm:py-6"
        >
          <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 sm:text-muted-foreground sm:normal-case sm:tracking-normal">Saldo</CardTitle>
            <div className={cn(
              "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shrink-0",
              stats.saldo >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            )}>
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className={cn(
              "text-lg sm:text-2xl font-bold transition-all duration-300",
              stats.saldo >= 0 ? "text-primary" : "text-destructive",
              (isLoading || discreetMode) && "discreet-mode-blur"
            )}>
              {formatCurrency(stats.saldo)}
            </div>
            <p className={cn(
              "hidden sm:block text-[10px] text-muted-foreground font-medium uppercase mt-1",
              (isLoading || discreetMode) && "discreet-mode-blur"
            )}>
              Balanço final do período
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <CardTitle className="text-base text-card-foreground">Listagem de Movimentações</CardTitle>
              <div className="lg:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/50 whitespace-nowrap">Exibir</span>
                  <select 
                    className="bg-muted/20 border border-white/5 rounded-lg text-[10px] font-bold h-8 px-2 focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer hover:bg-muted/30 transition-colors"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={-1}>Personalizado</option>
                  </select>
                  {itemsPerPage === -1 && (
                    <input 
                      type="number"
                      className="w-12 bg-muted/20 border border-white/5 rounded-lg text-[10px] font-bold h-8 px-2 focus:outline-none focus:ring-1 focus:ring-primary/30"
                      value={customLimit}
                      onChange={(e) => setCustomLimit(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="w-full lg:max-w-[520px]">
              <FilterBar 
                search={search}
                onSearchChange={setSearch}
                sortBy={sortBy}
                onSortChange={setSortBy}
                categories={todasCategoriasParaFiltro}
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                placeholder="Buscar por nome ou categoria..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "space-y-3 transition-all duration-500",
            isLoading && "opacity-50 blur-[2px] pointer-events-none"
          )}>
            {paginatedTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id}
                transaction={transaction}
                discreetMode={discreetMode}
                onDetails={handleDetails}
                onEdit={handleEdit}
                onDelete={(t) => {
                  setItemToDelete(t)
                  setIsDeleteDialogOpen(true)
                }}
              />
            ))}
            
            {paginatedTransactions.length === 0 && !isLoading && (
              <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
                <History className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma transação encontrada para este filtro.</p>
              </div>
            )}

            {/* Rodapé com Paginação e Seletor de Itens */}
            {(transactions.length > 0 || isLoading) && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-white/5 gap-4">
                <div className="flex items-center gap-3 order-2 sm:order-1 w-full sm:w-auto justify-start">
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/50 whitespace-nowrap">Exibir</span>
                    <select 
                      className="bg-muted/20 border border-white/5 rounded-lg text-[10px] font-bold h-8 px-2 focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer hover:bg-muted/30 transition-colors"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={-1}>Personalizado</option>
                    </select>
                    {itemsPerPage === -1 && (
                      <input 
                        type="number"
                        className="w-12 bg-muted/20 border border-white/5 rounded-lg text-[10px] font-bold h-8 px-2 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        value={customLimit}
                        onChange={(e) => setCustomLimit(e.target.value)}
                      />
                    )}
                  </div>
                  
                  {totalPages > 1 && (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest sm:border-l sm:border-white/10 sm:pl-3">
                      Pág. {currentPage} / {totalPages}
                    </p>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[10px] font-bold uppercase flex-1 sm:flex-none px-4"
                      disabled={currentPage === 1 || isLoading}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[10px] font-bold uppercase flex-1 sm:flex-none px-4"
                      disabled={currentPage === totalPages || isLoading}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Próximo
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <TransactionDetailsModal 
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        transaction={selectedTransaction}
        onEdit={() => selectedTransaction && handleEdit(selectedTransaction)}
        onDelete={() => {
          setIsDetailsOpen(false)
          setItemToDelete(selectedTransaction)
          setIsDeleteDialogOpen(true)
        }}
      />

      {/* Modais de Edição */}
      {editingIncome && (
        <ReceitaDialog 
          open={isIncomeDialogOpen}
          onOpenChange={setIsIncomeDialogOpen}
          initialData={editingIncome}
          onSave={handleSaveIncome}
          isSaving={isSaving}
        />
      )}

      {editingExpense && (
        <ExpenseFormDialog 
          open={isExpenseDialogOpen}
          onOpenChange={setIsExpenseDialogOpen}
          form={editingExpense}
          onFormChange={setEditingExpense}
          onSave={handleSaveExpense}
          isSaving={isSaving}
        />
      )}

      {/* Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Excluir Registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro de "{itemToDelete?.nome}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Registro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
