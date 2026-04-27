"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Download,
  ArrowUpCircle
} from "lucide-react"
import { BillsAlert } from "@/components/dashboard/bills-alert"
import { useSettings } from "@/lib/settings-context"
import { useCategories } from "@/lib/category-context"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { parseCurrencyInput } from "@/lib/currency"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { incomeTypes, incomeFrequencies } from "@/components/onboarding/constants"
import { PeriodFilter, type PeriodFilterState } from "@/components/dashboard/period-filter"
import { ExportPdfDialog } from "@/components/dashboard/export-pdf-dialog"
import { ReceitaStats } from "@/components/dashboard/entradas/receita-stats"
import { ReceitaItem } from "@/components/dashboard/entradas/receita-item"
import { ReceitaDialog } from "@/components/dashboard/entradas/receita-dialog"
import { FilterBar, type SortOption } from "@/components/dashboard/filter-bar"
import { filterAndSortItems } from "@/lib/filter-utils"

interface Receita {
  id: string
  nome: string
  valor: number
  tipo: string
  data: string
  recorrente: boolean
  isSynced?: boolean
  frequencia?: string
  diasRecebimento?: string
  diaSemana?: string
}

export interface IncomeApiResponse {
  id: string
  name: string
  amount: number
  type: string
  date: string
  isRecurring: boolean
  description?: string | null
  notes?: string | null
}

export interface OnboardingProgressIncome {
  tipo?: string
  Tipo?: string
  valor?: number
  Valor?: number
  frequencia?: string
  Frequencia?: string
  diasRecebimento?: string
  DiasRecebimento?: string
  configuradoEm?: string
  ConfiguradoEm?: string
  configuracaoAnterior?: {
    valor: number
    frequencia: string
    diasRecebimento?: string
    validoAte: string
  }
  diaSemana?: string
  DiaSemana?: string
}

const baseTiposReceita = incomeTypes.map(t => t.label).concat(["Investimentos", "Aluguel", "Outros"])

export default function ReceitasPage() {
  const { discreetMode } = useSettings()
  const { categories: dynamicCategories } = useCategories()
  
  // Prepara a lista de categorias para o filtro (Padrão + Dinâmicas de Entrada)
  const todasCategoriasParaFiltro = useMemo(() => {
    const dynamicFiltered = dynamicCategories
      .filter(c => c.type === "Entrada" || c.type === "Ambos")
      .map(c => c.name.trim())
    
    return Array.from(new Set([
      ...baseTiposReceita.map(c => c.trim()),
      ...dynamicFiltered
    ].filter(Boolean))).sort()
  }, [dynamicCategories])
  
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "recurring" | "extra">("all")
  const [period, setPeriod] = useState<PeriodFilterState>({
    type: "monthly",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  useEffect(() => {
    const fetchIncomes = async () => {
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

        const incomesData = await apiClient<IncomeApiResponse[]>(`/api/incomes?${queryParams}`) || []
        
        const mappedIncomes = incomesData.map((inc: IncomeApiResponse) => {
          const typeLower = inc.type.toLowerCase()
          const typeInfo = incomeTypes.find(t => t.value === typeLower)
          const isBaseType = !!typeInfo

          // Se for um tipo base (CLT, PJ, etc), tentamos normalizar o nome caso ele não siga o padrão exato do banco
          const isStandardName = inc.name.toLowerCase() === typeLower || 
                               inc.name.toLowerCase().startsWith(`${typeLower} (semana`) || 
                               inc.name.toLowerCase().startsWith(`${typeLower} (quinzena`)

          return {
            id: inc.id,
            nome: isBaseType && isStandardName
              ? `${typeInfo.label} (${typeInfo.description.split(' ')[0]})`
              : inc.name,
            valor: inc.amount, 
            tipo: inc.type,
            data: (() => {
              const datePart = inc.date.split('T')[0]
              const [y, m, d] = datePart.split('-').map(Number)
              return new Date(y, m - 1, d).toLocaleDateString("pt-BR")
            })(),
            recorrente: inc.isRecurring,
            isSynced: isBaseType,
            descricao: inc.description ?? null,
            observacoes: inc.notes ?? null
          }
        })

        const progressData = await apiClient<any>("/api/onboarding/progress")
        if (progressData) {
          const profileIncomes: OnboardingProgressIncome[] = progressData.incomes || progressData.Incomes || []
          
          if (profileIncomes.length > 0) {
            // 1. Calcular as projeções primeiro
            const syncedIncomes = profileIncomes
              .flatMap((inc: OnboardingProgressIncome, index: number) => {
                const incomeTipoValue = (inc.tipo || inc.Tipo || "").toLowerCase()
                const typeInfo = incomeTypes.find(t => t.value === incomeTipoValue)
                const selectedMonthDate = new Date(period.year, period.month - 1, 1)

                // --- Lógica de Histórico ---
                let effectiveValor = inc.valor || inc.Valor || 0
                let effectiveFreq = (inc.frequencia || inc.Frequencia || "").toLowerCase()
                let effectiveDias = inc.diasRecebimento || inc.DiasRecebimento || ""

                if (inc.configuracaoAnterior && inc.configuracaoAnterior.validoAte) {
                  const validoAte = new Date(inc.configuracaoAnterior.validoAte)
                  const validUntilMonth = new Date(validoAte.getFullYear(), validoAte.getMonth(), 1)
                  
                  if (selectedMonthDate < validUntilMonth) {
                    effectiveValor = inc.configuracaoAnterior.valor
                    effectiveFreq = inc.configuracaoAnterior.frequencia.toLowerCase()
                    effectiveDias = inc.configuracaoAnterior.diasRecebimento || ""
                  }
                }

                const freqInfo = incomeFrequencies.find(f => f.value === effectiveFreq)
                
                const isVariable = effectiveFreq === "variavel"
                const firstDateStr = isVariable ? "" : (effectiveDias.split(',')[0] || "").trim()
                const baseDateStr = firstDateStr || inc.configuradoEm || inc.ConfiguradoEm
                
                const startDate = baseDateStr ? (() => {
                  const datePart = baseDateStr.includes('T') ? baseDateStr.split('T')[0] : baseDateStr
                  const [y, m, d] = datePart.split('-').map(Number)
                  return new Date(y, m - 1, d)
                })() : null
                
                if (startDate && selectedMonthDate < new Date(startDate.getFullYear(), startDate.getMonth(), 1)) {
                  return []
                }

                // Gerar as projeções baseadas na frequência
                const multiplier = effectiveFreq === "semanal" ? 4 : (effectiveFreq === "quinzenal" ? 2 : 1)
                const label = typeInfo?.label || incomeTipoValue.toUpperCase()
                const desc = typeInfo ? ` (${typeInfo.description.split(' ')[0]})` : ""
                const diaSemana = inc.diaSemana || inc.DiaSemana

                return Array.from({ length: multiplier }).map((_, i) => {
                  let itemDate: Date
                  
                  if (effectiveFreq === "semanal" && diaSemana) {
                    const daysMap: Record<string, number> = {
                      "domingo": 0, "segunda": 1, "terca": 2, "quarta": 3, "quinta": 4, "sexta": 5, "sabado": 6
                    }
                    const targetDay = daysMap[diaSemana.toLowerCase()]
                    const baseDate = new Date(period.year, period.month - 1, 1 + (i * 7))
                    const daysToAdd = (targetDay - baseDate.getDay() + 7) % 7
                    itemDate = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000))
                  } else {
                    itemDate = startDate 
                      ? new Date(startDate.getTime() + (i * (effectiveFreq === "semanal" ? 7 : 15) * 24 * 60 * 60 * 1000))
                      : new Date(period.year, period.month - 1, 1 + (i * 7))
                  }

                  const suffix = multiplier > 1 
                    ? (effectiveFreq === "semanal" ? ` (Semana ${i + 1})` : ` (Quinzena ${i + 1})`)
                    : ""

                  return {
                    id: `synced-${incomeTipoValue}-${index}-${i}`,
                    nome: `${label}${desc}${suffix}`,
                    valor: effectiveValor,
                    tipo: label,
                    tipoValue: incomeTipoValue,
                    frequencia: freqInfo?.label || "Mensal",
                    diasRecebimento: effectiveDias,
                    diaSemana: diaSemana,
                    data: itemDate.toLocaleDateString("pt-BR"),
                    recorrente: true,
                    isSynced: true
                  }
                })
              })

            // 2. Filtrar mappedIncomes (DB) para remover conflitos com as projeções ativas
            const cleanedMappedIncomes = mappedIncomes.filter(m => {
               const typeLower = m.tipo.toLowerCase()
               const isBaseType = incomeTypes.some(t => t.value === typeLower)
               
               // Se for um tipo base e nós já temos uma projeção ativa para este tipo neste mês, removemos o do banco
               // Agora usamos tipoValue para garantir que o match aconteça corretamente
               if (isBaseType && syncedIncomes.some(s => (s as any).tipoValue === typeLower)) {
                  return false
               }
               return true
            })

            setReceitas([...syncedIncomes, ...cleanedMappedIncomes])
            return
          }
        }
        
        setReceitas(mappedIncomes)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchIncomes()
  }, [period])

  // Abrir modal automaticamente se vier do header com ?action=new
  useEffect(() => {
    if (searchParams?.get('action') === 'new') {
      openAddDialog()
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [search, setSearch] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Receita | null }>({
    open: false,
    item: null,
  })
  
  const [editingReceita, setEditingReceita] = useState<any>(null)
  const [sortBy, setSortBy] = useState<SortOption>("data-recente")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const prevFilterType = useRef(filterType)

  useEffect(() => {
    if (prevFilterType.current === filterType) return
    prevFilterType.current = filterType
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [filterType])

  const filteredReceitas = useMemo(() => {
    let result = receitas

    // Primeiro aplica o filtro de tipo (recorrente/extra)
    if (filterType === "recurring") {
      result = result.filter(r => r.recorrente)
    } else if (filterType === "extra") {
      result = result.filter(r => !r.recorrente)
    }

    // Depois aplica a busca, ordenação e filtros de categoria usando a utilitária
    return filterAndSortItems(
      result, 
      search, 
      sortBy, 
      selectedCategories,
      "tipo", // Em entradas, usamos 'tipo' como categoria
      dynamicCategories
    )
  }, [receitas, search, sortBy, selectedCategories, filterType])

  const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0)
  const receitasRecorrentes = receitas.filter(r => r.recorrente).reduce((sum, r) => sum + r.valor, 0)
  const receitasExtras = receitas.filter(r => !r.recorrente).reduce((sum, r) => sum + r.valor, 0)

  const handleSaveReceita = async (formData: any) => {
    if (!formData.nome || !formData.valor || isSaving) return
    
    setIsSaving(true)
    const valorReal = parseCurrencyInput(formData.valor)
    const dateParsed = formData.data ? new Date(formData.data).toISOString() : new Date().toISOString()
    
    try {
        const isEditing = !!formData.id;
        const url = isEditing ? `/api/incomes/${formData.id}` : "/api/incomes";
        const method = isEditing ? "PUT" : "POST";

        const finalType = formData.tipo === "Outros" ? (formData.outroTipo || "Outros") : formData.tipo

        const response = await apiClient<IncomeApiResponse>(url, {
            method: method,
            body: JSON.stringify({
                name: formData.nome,
                amount: valorReal,
                type: finalType,
                date: dateParsed,
                isRecurring: formData.recorrente
            })
        })
        
        if (response && response.id) {
            const savedItem: Receita = {
              id: response.id,
              nome: response.name,
              valor: response.amount,
              tipo: response.type,
              data: new Date(response.date).toLocaleDateString("pt-BR"),
              recorrente: response.isRecurring,
              isSynced: false
            }
            
            if (isEditing) {
                setReceitas(receitas.map(r => r.id === savedItem.id ? savedItem : r));
            } else {
                setReceitas([savedItem, ...receitas]);
            }

            setIsOpen(false)
            setEditingReceita(null)
            window.dispatchEvent(new CustomEvent("finance-update"))
        }
    } catch (error: any) {
        toast.error(error.message || "Erro ao salvar a renda");
    } finally {
        setIsSaving(false)
    }
  }

  const openEditDialog = (receita: Receita) => {
    const parts = receita.data.split("/");
    const inputDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : "";
    setEditingReceita({ ...receita, data: inputDate })
    setIsOpen(true)
  }

  const openAddDialog = () => {
    setEditingReceita(null)
    setIsOpen(true);
  }

  const handleDeleteReceita = async () => {
    if (deleteDialog.item) {
      try {
        setIsDeleting(true)
        await apiClient(`/api/incomes/${deleteDialog.item.id}`, { method: "DELETE" })
        setReceitas(receitas.filter(r => r.id !== deleteDialog.item!.id))
        setDeleteDialog({ open: false, item: null })
        window.dispatchEvent(new CustomEvent("finance-update"))
      } catch (e) {
        console.error("Erro ao deletar entrada", e)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const openDeleteDialog = (receita: Receita) => {
    setDeleteDialog({ open: true, item: receita })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      
      <div className="flex flex-col gap-6 items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Entradas</h1>
          </div>
          <p className="text-muted-foreground text-sm">Acompanhe e gerencie todos os seus recebimentos</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full justify-between">
          <Button
            className="bg-primary/70 text-primary-foreground hover:bg-primary cursor-pointer w-full sm:w-auto"
            onClick={openAddDialog}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Receita
          </Button>

          <div className="flex items-center gap-2">
            <PeriodFilter 
              value={period}
              onChange={setPeriod}
            />
            <Button 
              variant="outline" 
              className="h-9 gap-2 hidden sm:flex hover:bg-primary/5 transition-colors cursor-pointer"
              onClick={() => setIsExportDialogOpen(true)}
              size="sm"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>
      
      <BillsAlert />

      <ReceitaStats 
        total={totalReceitas}
        recorrente={receitasRecorrentes}
        extra={receitasExtras}
        filterType={filterType}
        setFilterType={setFilterType}
        isLoading={isLoading}
        discreetMode={discreetMode}
      />

      <Card ref={listRef} className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm sm:text-base text-card-foreground">Lista de Receitas</CardTitle>
            <div className="w-full sm:max-w-[520px]">
              <FilterBar 
                search={search}
                onSearchChange={setSearch}
                sortBy={sortBy}
                onSortChange={setSortBy}
                categories={todasCategoriasParaFiltro}
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                placeholder="Buscar receitas ou palavra-chave..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex h-32 items-center justify-center">
                 <p className="text-muted-foreground animate-pulse text-xs sm:text-sm">Carregando entradas...</p>
             </div>
          ) : (
             <div className="space-y-2 sm:space-y-3">
               {filteredReceitas.map((r) => (
                  <ReceitaItem 
                    key={r.id}
                    receita={r}
                    discreetMode={discreetMode}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                  />
               ))}
               
               {!isLoading && filteredReceitas.length === 0 && (
                   <div className="py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground border-2 border-dashed border-border/60 rounded-xl">
                       Nenhuma entrada encontrada.
                   </div>
               )}
             </div>
          )}
        </CardContent>
      </Card>

      <ReceitaDialog 
        open={isOpen}
        onOpenChange={setIsOpen}
        onSave={handleSaveReceita}
        initialData={editingReceita}
        isSaving={isSaving}
      />

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteReceita}
        itemName={deleteDialog.item?.nome}
        loading={isDeleting}
      />

      <ExportPdfDialog 
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        title="Relatório de Entradas"
        subtitle={`Deseja exportar as ${filteredReceitas.length} entradas listadas no PDF?`}
        data={filteredReceitas}
        columns={[
          { header: "Nome", key: "nome" },
          { header: "Tipo", key: "tipo" },
          { header: "Data", key: "data" },
          { header: "Recorrente", key: "recorrente", type: "text" },
          { header: "Valor", key: "valor", type: "currency" },
        ]}
        fileName={`entradas-${period.month}-${period.year}`}
      />
    </div>
  )
}