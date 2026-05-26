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
import { useAuth } from "@/lib/auth-provider"
import { filterAndSortItems } from "@/lib/filter-utils"

interface Receita {
  id: string
  nome: string
  valor: number
  tipo: string
  data: string
  dataReal: string
  hora: string
  recorrente: boolean
  isSynced?: boolean
  frequencia?: string
  diasRecebimento?: string
  diaSemana?: string
  descricao?: string | null
  observacoes?: string | null
  rawDate?: Date
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
  historicoConfiguracoes?: any[]
  HistoricoConfiguracoes?: any[]
}

const baseTiposReceita = incomeTypes.map(t => t.label).concat(["Investimentos", "Aluguel", "Outros"])

export default function ReceitasPage() {
  const { user } = useAuth()
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
        let startDate: Date | null = null
        let endDate: Date | null = null

        if (period.type === "monthly") {
          startDate = new Date(period.year, period.month - 1, 1)
          endDate = new Date(period.year, period.month, 0, 23, 59, 59)
          queryParams = `month=${period.month}&year=${period.year}`
        } else if (period.type === "60_days") {
          const end = new Date()
          const start = new Date()
          start.setDate(end.getDate() - 60)
          startDate = start
          endDate = end
          queryParams = `startDate=${start.toISOString()}&endDate=${end.toISOString()}`
        } else if (period.type === "90_days") {
          const end = new Date()
          const start = new Date()
          start.setDate(end.getDate() - 90)
          startDate = start
          endDate = end
          queryParams = `startDate=${start.toISOString()}&endDate=${end.toISOString()}`
        } else if (period.type === "custom") {
          if (period.startDate && period.endDate) {
            startDate = new Date(period.startDate)
            endDate = new Date(period.endDate)
            queryParams = `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
          } else {
            startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)
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

          const displayDate = new Date(inc.date)

          return {
            id: inc.id,
            nome: isBaseType && isStandardName
              ? `${typeInfo.label} (${typeInfo.description.split(' ')[0]})`
              : (inc.name ? inc.name.charAt(0).toUpperCase() + inc.name.slice(1) : inc.name),
            valor: inc.amount, 
            tipo: isBaseType ? typeInfo.label : inc.type,
            data: displayDate.toLocaleDateString("pt-BR"),
            dataReal: displayDate.toISOString(),
            hora: new Date(inc.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
            recorrente: inc.isRecurring,
            isSynced: isBaseType && isStandardName,
            descricao: inc.description ?? null,
            observacoes: inc.notes ?? null,
            rawDate: displayDate
          }
        })

        const progressData = await apiClient<any>("/api/onboarding/progress")
        if (progressData) {
          const profileIncomes: OnboardingProgressIncome[] = progressData.incomes || progressData.Incomes || []
          
          if (profileIncomes.length > 0) {
            // Helper para obter todos os meses no intervalo
            const getMonthsInRange = (start: Date, end: Date) => {
              const months: Date[] = []
              const current = new Date(start.getFullYear(), start.getMonth(), 1)
              const last = new Date(end.getFullYear(), end.getMonth(), 1)
              while (current <= last) {
                months.push(new Date(current))
                current.setMonth(current.getMonth() + 1)
              }
              return months
            }

            const targetMonths = startDate && endDate
              ? getMonthsInRange(startDate, endDate)
              : [new Date(period.year, period.month - 1, 1)]

            // 1. Calcular as projeções para cada mês do período
            const syncedIncomes = targetMonths.flatMap((targetMonthDate) => {
              if (user?.createdAt) {
                const uCreated = new Date(user.createdAt)
                const limitMonthDate = new Date(uCreated.getFullYear(), uCreated.getMonth(), 1)
                if (targetMonthDate < limitMonthDate) {
                  return []
                }
              }

              return profileIncomes.flatMap((inc: OnboardingProgressIncome, index: number) => {
                const incomeTipoValue = (inc.tipo || inc.Tipo || "").toLowerCase()
                const typeInfo = incomeTypes.find(t => t.value === incomeTipoValue)

                // --- Lógica de Histórico ---
                let effectiveValor = inc.valor || inc.Valor || 0
                let effectiveFreq = (inc.frequencia || inc.Frequencia || "").toLowerCase()
                let effectiveDias = inc.diasRecebimento || inc.DiasRecebimento || ""
                let effectiveDiaSemana = inc.diaSemana || inc.DiaSemana || ""

                // --- Lógica de Histórico (Cadeia de alterações) ---
                const hMin = inc.historicoConfiguracoes || []
                const hMaj = inc.HistoricoConfiguracoes || []
                const history = (hMin.length > 0 ? hMin : hMaj).length > 0 
                  ? (hMin.length > 0 ? hMin : hMaj) 
                  : (inc.configuracaoAnterior ? [inc.configuracaoAnterior] : [])
                
                // Procurar a primeira configuração que era válida para este mês (do mais antigo para o mais recente)
                const configHistorica = [...history]
                  .sort((a, b) => {
                    const da = a.validoAte || a.ValidoAte
                    const db = b.validoAte || b.ValidoAte
                    return new Date(da).getTime() - new Date(db).getTime()
                  })
                  .find(h => {
                    const vDateStr = (h.validoAte || h.ValidoAte).split('T')[0]
                    const [vy, vm] = vDateStr.split('-').map(Number)
                    const validUntilMonth = new Date(vy, vm - 1, 1)
                    return targetMonthDate <= validUntilMonth
                  })

                if (configHistorica) {
                  effectiveValor = configHistorica.valor || configHistorica.Valor || 0
                  effectiveFreq = (configHistorica.frequencia || configHistorica.Frequencia || "").toLowerCase()
                  effectiveDias = configHistorica.diasRecebimento || configHistorica.DiasRecebimento || ""
                  effectiveDiaSemana = configHistorica.diaSemana || configHistorica.DiaSemana || ""
                }

                // Se NÃO estamos no período do histórico, verificamos se a nova configuração já começou
                const isHistoryPeriod = !!configHistorica;
                
                if (!isHistoryPeriod) {
                  const firstDateStr = effectiveFreq === "variavel" ? "" : (effectiveDias.split(',')[0] || "").trim()
                  const baseDateStr = firstDateStr || inc.configuradoEm || inc.ConfiguradoEm
                  
                  const startDateObj = baseDateStr ? (() => {
                    const datePart = baseDateStr.includes('T') ? baseDateStr.split('T')[0] : baseDateStr
                    const [y, m, d] = datePart.split('-').map(Number)
                    return new Date(y, m - 1, d)
                  })() : null
                  
                  if (startDateObj && targetMonthDate < new Date(startDateObj.getFullYear(), startDateObj.getMonth(), 1)) {
                    return []
                  }
                }

                const freqInfo = incomeFrequencies.find(f => f.value === effectiveFreq)

                // Gerar as projeções baseadas na frequência
                const multiplier = effectiveFreq === "semanal" ? 4 : (effectiveFreq === "quinzenal" ? 2 : 1)
                const label = typeInfo?.label || incomeTipoValue.toUpperCase()
                const desc = typeInfo ? ` (${typeInfo.description.split(' ')[0]})` : ""
                const diaSemana = effectiveDiaSemana

                return Array.from({ length: multiplier }).map((_, i) => {
                  let itemDate: Date
                  
                  if (effectiveFreq === "semanal" && diaSemana) {
                    const daysMap: Record<string, number> = {
                      "domingo": 0, "segunda": 1, "terca": 2, "quarta": 3, "quinta": 4, "sexta": 5, "sabado": 6
                    }
                    const targetDay = daysMap[diaSemana.toLowerCase()]
                    const baseDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), 1 + (i * 7))
                    const daysToAdd = (targetDay - baseDate.getDay() + 7) % 7
                    itemDate = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000))
                  } else {
                    // Extraímos o dia original da configuração (ex: dia 05)
                    const firstDateStr = effectiveFreq === "variavel" ? "" : (effectiveDias.split(',')[0] || "").trim()
                    const baseDateStr = firstDateStr || inc.configuradoEm || inc.ConfiguradoEm
                    const startDay = baseDateStr ? parseInt(baseDateStr.split('-')[2]) || 1 : 1
                    
                    // Aplicamos o dia ao mês do targetMonthDate
                    itemDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), startDay + (i * (effectiveFreq === "quinzenal" ? 15 : 0)))
                  }

                  // Garantir que a projeção fique no intervalo de datas do filtro de período
                  if (startDate && endDate && (itemDate < startDate || itemDate > endDate)) {
                    return null
                  }

                  const suffix = multiplier > 1 
                    ? (effectiveFreq === "semanal" ? ` (Semana ${i + 1})` : ` (Quinzena ${i + 1})`)
                    : ""

                  return {
                    id: `synced-${incomeTipoValue}-${index}-${targetMonthDate.getFullYear()}-${targetMonthDate.getMonth()}-${i}`,
                    nome: `${label}${desc}${suffix}`,
                    valor: effectiveValor,
                    tipo: label,
                    tipoValue: incomeTipoValue,
                    frequencia: freqInfo?.label || "Mensal",
                    diasRecebimento: effectiveDias,
                    diaSemana: diaSemana,
                    data: itemDate.toLocaleDateString("pt-BR"),
                    dataReal: itemDate.toISOString(),
                    hora: "00:00",
                    recorrente: true,
                    isSynced: true,
                    rawDate: itemDate
                  }
                }).filter((item): item is Exclude<typeof item, null> => item !== null)
              })
            })

            // 2. Filtrar syncedIncomes (Projeções) para remover se já existir algo no banco para aquele tipo NESTE MES especificamente
            const finalSyncedIncomes = syncedIncomes.filter(s => {
               const syncedTipo = s.tipoValue;
               const projectedDate = new Date(s.dataReal);
               
               const hasRealEntry = mappedIncomes.some(m => {
                 if (m.tipo.toLowerCase() !== syncedTipo) return false;
                 const realDate = new Date(m.dataReal);
                 return realDate.getFullYear() === projectedDate.getFullYear() &&
                        realDate.getMonth() === projectedDate.getMonth();
               });
               return !hasRealEntry;
            });

            setReceitas([...finalSyncedIncomes, ...mappedIncomes])
            return;
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
      "tipo",
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
    const now = new Date()
    let dateParsed = now.toISOString()
    
    if (formData.data) {
      const [y, m, d] = formData.data.split('-').map(Number)
      const selectedDate = new Date(y, m - 1, d)
      
      if (formData.hora) {
        const [hh, mm] = formData.hora.split(':').map(Number)
        selectedDate.setHours(hh, mm, 0, 0)
      } else {
        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
      }
      
      // Formata como ISO Local (yyyy-MM-ddTHH:mm:ss)
      const pad = (n: number) => n.toString().padStart(2, '0')
      dateParsed = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}T${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}:${pad(selectedDate.getSeconds())}`
    }
    
    try {
        const isEditing = !!formData.id;
        const url = isEditing ? `/api/incomes/${formData.id}` : "/api/incomes";
        const method = isEditing ? "PUT" : "POST";

        const finalType = formData.tipo?.toLowerCase() === "outros" ? (formData.outroTipo || "Outros") : formData.tipo

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
            const savedDate = new Date(response.date)
            const savedItem: Receita = {
              id: response.id,
              nome: response.name ? response.name.charAt(0).toUpperCase() + response.name.slice(1) : response.name,
              valor: response.amount,
              tipo: response.type,
              data: savedDate.toLocaleDateString("pt-BR"),
              dataReal: response.date,
              hora: savedDate.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
              recorrente: response.isRecurring,
              isSynced: false,
              rawDate: savedDate
            }
            
            // Verifica se o item salvo pertence ao período que o usuário está visualizando agora
            const isSameMonth = savedDate.getMonth() + 1 === period.month
            const isSameYear = savedDate.getFullYear() === period.year
            const isVisibleInCurrentPeriod = period.type === "monthly" ? (isSameMonth && isSameYear) : true

            if (isEditing) {
                setReceitas(receitas.map(r => r.id === savedItem.id ? savedItem : r));
                toast.success("Renda atualizada com sucesso!")
            } else {
                if (isVisibleInCurrentPeriod) {
                    setReceitas([savedItem, ...receitas]);
                    toast.success("Renda registrada com sucesso!")
                } else {
                    const monthName = savedDate.toLocaleString('pt-BR', { month: 'long' })
                    toast.info(`Renda salva! Ela aparecerá no filtro de ${monthName}/${savedDate.getFullYear()}.`, {
                        duration: 5000
                    })
                }
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
    
    // Se tiver dataReal, usamos ela para pegar a hora correta
    let inputTime = receita.hora || "";
    if (receita.dataReal) {
      const d = new Date(receita.dataReal);
      inputTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }

    setEditingReceita({ ...receita, data: inputDate, hora: inputTime })
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
        
        if (deleteDialog.item.recorrente) {
          setReceitas(receitas.filter(r => r.nome !== deleteDialog.item!.nome || !r.recorrente))
        } else {
          setReceitas(receitas.filter(r => r.id !== deleteDialog.item!.id))
        }
        window.dispatchEvent(new CustomEvent("finance-update"))
        setDeleteDialog({ open: false, item: null })
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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Entradas</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">Acompanhe e gerencie todos os seus recebimentos</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary/70 dark:hover:bg-primary cursor-pointer w-full sm:w-auto"
            onClick={openAddDialog}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Receita
          </Button>

          <PeriodFilter value={period} onChange={setPeriod}>
            <Button 
              variant="outline" 
              className="h-9 gap-2 bg-card hover:bg-muted border-border/50 transition-colors cursor-pointer px-3 sm:px-4 shrink-0"
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
        description={
          deleteDialog.item?.recorrente
            ? `Esta conta é recorrente. Tem certeza que deseja excluir "${deleteDialog.item.nome}"? Todas as entradas futuras também serão apagadas.`
            : undefined
        }
        loading={isDeleting}
      />

      <ExportPdfDialog 
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        title="Relatório de Entradas"
        subtitle={`Deseja exportar as ${filteredReceitas.length} entradas listadas no PDF?`}
        data={filteredReceitas as any}
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