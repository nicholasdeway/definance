"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Plus, ArrowDownLeft, Search, MoreHorizontal, Landmark, Download } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CurrencyInput } from "@/components/ui/currency-input"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { formatCurrency, parseCurrencyInput } from "@/lib/currency"
import { SyncBadge } from "@/components/dashboard/sync-badge"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { incomeTypes, incomeFrequencies } from "@/components/onboarding/constants"
import { PeriodFilter, type PeriodFilterState } from "@/components/dashboard/period-filter"

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
}

export interface IncomeApiResponse {
  id: string
  name: string
  amount: number
  type: string
  date: string
  isRecurring: boolean
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
}

const tiposReceita = incomeTypes.map(t => t.label).concat(["Investimentos", "Aluguel", "Outros"])

export default function ReceitasPage() {
  const { discreetMode } = useSettings()
  
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
        
        const mappedIncomes = incomesData.map((inc: IncomeApiResponse) => ({
          id: inc.id,
          nome: inc.name,
          valor: inc.amount, 
          tipo: inc.type,
          data: new Date(inc.date).toLocaleDateString("pt-BR"),
          recorrente: inc.isRecurring,
          isSynced: false
        }))

        const progressData = await apiClient<any>("/api/onboarding/progress")
        if (progressData) {
          const isCompleted = progressData.hasCompletedOnboarding || progressData.HasCompletedOnboarding
          const profileIncomes: OnboardingProgressIncome[] = progressData.incomes || progressData.Incomes || []
          
          if (profileIncomes.length > 0 && !isCompleted) {
            const syncedIncomes = profileIncomes
              .filter(inc => {
                const tipo = (inc.tipo || inc.Tipo || "").toLowerCase()
                return !mappedIncomes.some(m => m.tipo.toLowerCase() === tipo)
              })
              .map((inc: OnboardingProgressIncome, index: number) => {
                const incomeTipo = (inc.tipo || inc.Tipo || "").toLowerCase()
                const incomeValor = inc.valor || inc.Valor || 0
                const typeInfo = incomeTypes.find(t => t.value === incomeTipo)
                const freqValue = (inc.frequencia || inc.Frequencia || "").toLowerCase()
                const freqInfo = incomeFrequencies.find(f => f.value === freqValue)

                return {
                  id: `synced-${incomeTipo}-${index}`,
                  nome: typeInfo ? `${typeInfo.label} (${typeInfo.description.split(' ')[0]})` : `Fonte: ${incomeTipo.toUpperCase()}`,
                  valor: incomeValor,
                  tipo: typeInfo?.label || incomeTipo.toUpperCase(),
                  frequencia: freqInfo?.label || "Própria",
                  diasRecebimento: inc.diasRecebimento || inc.DiasRecebimento || "",
                  data: new Date(period.year, period.month - 1, 1).toLocaleDateString("pt-BR"),
                  recorrente: true,
                  isSynced: true
                }
              })

            mappedIncomes.unshift(...syncedIncomes)
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
  const [search, setSearch] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Receita | null }>({
    open: false,
    item: null,
  })
  const [newReceita, setNewReceita] = useState<{
    id?: string;
    nome: string;
    valor: string;
    tipo: string;
    outroTipo?: string;
    data: string;
    recorrente: boolean;
  }>({
    nome: "",
    valor: "",
    tipo: "",
    outroTipo: "",
    data: "",
    recorrente: false,
  })

  const filteredReceitas = receitas.filter(r => {
    const matchesSearch = r.nome.toLowerCase().includes(search.toLowerCase()) ||
                         r.tipo.toLowerCase().includes(search.toLowerCase());
    
    if (filterType === "recurring") return matchesSearch && r.recorrente;
    if (filterType === "extra") return matchesSearch && !r.recorrente;
    return matchesSearch;
  })

  const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0)
  const receitasRecorrentes = receitas.filter(r => r.recorrente).reduce((sum, r) => sum + r.valor, 0)
  const receitasExtras = receitas.filter(r => !r.recorrente).reduce((sum, r) => sum + r.valor, 0)

  const handleSaveReceita = async () => {
    if (!newReceita.nome || !newReceita.valor || isSaving) return
    
    setIsSaving(true)
    const valorReal = parseCurrencyInput(newReceita.valor)
    const dateParsed = newReceita.data ? new Date(newReceita.data).toISOString() : new Date().toISOString()
    
    try {
        const isEditing = !!newReceita.id;
        const url = isEditing ? `/api/incomes/${newReceita.id}` : "/api/incomes";
        const method = isEditing ? "PUT" : "POST";

        const finalType = newReceita.tipo === "Outros" ? (newReceita.outroTipo || "Outros") : newReceita.tipo

        const response = await apiClient<IncomeApiResponse>(url, {
            method: method,
            body: JSON.stringify({
                name: newReceita.nome,
                amount: valorReal,
                type: finalType,
                date: dateParsed,
                isRecurring: newReceita.recorrente
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

            setNewReceita({ nome: "", valor: "", tipo: "", outroTipo: "", data: "", recorrente: false })
            setIsOpen(false)
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
    const isCustomType = receita.tipo && !tiposReceita.includes(receita.tipo)
    
    setNewReceita({
      id: receita.id,
      nome: receita.nome,
      valor: formatCurrency(receita.valor),
      tipo: isCustomType ? "Outros" : (receita.tipo || ""),
      outroTipo: isCustomType ? receita.tipo : "",
      data: inputDate,
      recorrente: receita.recorrente,
    })
    setIsOpen(true)
  }

  const openAddDialog = () => {
    setNewReceita({ nome: "", valor: "", tipo: "", outroTipo: "", data: "", recorrente: false });
    setIsOpen(true);
  }

  const handleDeleteReceita = async () => {
    if (deleteDialog.item) {
      try {
        await apiClient(`/api/incomes/${deleteDialog.item.id}`, { method: "DELETE" })
        setReceitas(receitas.filter(r => r.id !== deleteDialog.item!.id))
      } catch (e) {
        console.error("Erro ao deletar entrada", e)
      } finally {
        setDeleteDialog({ open: false, item: null })
      }
    }
  }

  const openDeleteDialog = (receita: Receita) => {
    setDeleteDialog({ open: true, item: receita })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Entradas</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Gerencie todas as suas fontes de renda</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto shadow-sm active:scale-95 transition-all" 
                onClick={openAddDialog}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-foreground text-lg sm:text-xl">{newReceita.id ? "Editar Receita" : "Nova Receita"}</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {newReceita.id ? "Edite as informações da sua fonte de renda" : "Adicione uma nova fonte de renda"}
                </DialogDescription>
              </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome" className="text-sm sm:text-base">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Salário"
                  value={newReceita.nome}
                  onChange={(e) => setNewReceita({ ...newReceita, nome: e.target.value })}
                  className="text-sm sm:text-base focus-visible:ring-primary"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valor" className="text-sm sm:text-base">Valor</Label>
                  <CurrencyInput
                    id="valor"
                    value={newReceita.valor}
                    onChange={(value) => setNewReceita({ ...newReceita, valor: value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="data" className="text-sm sm:text-base">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={newReceita.data}
                    onChange={(e) => setNewReceita({ ...newReceita, data: e.target.value })}
                    className="text-sm sm:text-base focus-visible:ring-primary"
                  />
                </div>
              </div>
              <div className={cn("grid", newReceita.tipo === "Outros" ? "grid-cols-1 sm:grid-cols-2 gap-4" : "gap-2")}>
                <div className="grid gap-2">
                  <Label htmlFor="tipo" className="text-sm sm:text-base">Tipo</Label>
                  <Select
                    value={newReceita.tipo}
                    onValueChange={(value) => setNewReceita({ ...newReceita, tipo: value, outroTipo: value === "Outros" ? newReceita.outroTipo : "" })}
                  >
                    <SelectTrigger className="text-sm sm:text-base focus:ring-primary">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposReceita.map((tipo) => (
                        <SelectItem key={tipo} value={tipo} className="text-sm sm:text-base">{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newReceita.tipo === "Outros" && (
                  <div className="grid gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Label htmlFor="outroTipo" className="text-sm sm:text-base">Descrição</Label>
                    <Input
                      id="outroTipo"
                      placeholder="Ex: Freelance"
                      value={newReceita.outroTipo || ""}
                      onChange={(e) => setNewReceita({ ...newReceita, outroTipo: e.target.value })}
                      className="text-sm sm:text-base focus-visible:ring-primary"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="recorrente" className="text-sm sm:text-base">Receita recorrente?</Label>
                <Switch
                  id="recorrente"
                  checked={newReceita.recorrente}
                  onCheckedChange={(checked) =>
                    setNewReceita({ ...newReceita, recorrente: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
              <Button 
                className="bg-primary text-primary-foreground w-full sm:w-auto hover:bg-primary/90" 
                onClick={handleSaveReceita}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  newReceita.id ? "Salvar Alterações" : "Salvar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
        
        <div className="flex items-center gap-2">
          <PeriodFilter 
            value={period}
            onChange={setPeriod}
          />
          <Button variant="outline" size="sm" className="h-9 gap-2 hidden sm:flex hover:bg-primary/5 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card 
          className={cn(
            "border-border/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden",
            filterType === "all" ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
          )}
          onClick={() => setFilterType("all")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-between">
              Total de Receitas
              {filterType === "all" && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-xl sm:text-2xl font-bold text-primary transition-opacity duration-300",
              (isLoading || discreetMode) && "discreet-mode-blur"
            )}>
              {formatCurrency(totalReceitas)}
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-border/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden",
            filterType === "recurring" ? "ring-2 ring-blue-500 bg-blue-500/5" : "hover:bg-muted/50"
          )}
          onClick={() => setFilterType(filterType === "recurring" ? "all" : "recurring")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-blue-500 transition-colors flex items-center justify-between">
              Recorrentes
              {filterType === "recurring" && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-xl sm:text-2xl font-bold text-card-foreground group-hover:text-blue-500 transition-all duration-300",
              (isLoading || discreetMode) && "blur-md opacity-50 select-none pointer-events-none"
            )}>
              {formatCurrency(receitasRecorrentes)}
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-border/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden",
            filterType === "extra" ? "ring-2 ring-orange-500 bg-orange-500/5" : "hover:bg-muted/50"
          )}
          onClick={() => setFilterType(filterType === "extra" ? "all" : "extra")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-orange-500 transition-colors flex items-center justify-between">
              Extras
              {filterType === "extra" && <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-xl sm:text-2xl font-bold text-card-foreground group-hover:text-orange-500 transition-all duration-300",
              (isLoading || discreetMode) && "blur-md opacity-50 select-none pointer-events-none"
            )}>
              {formatCurrency(receitasExtras)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm sm:text-base text-card-foreground">Lista de Receitas</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar receitas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 sm:pl-9 sm:w-[250px] text-sm sm:text-base focus-visible:ring-primary"
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
                 <div key={r.id} className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-3 sm:p-4 transition-all gap-3 sm:gap-4",
                r.isSynced 
                  ? "border-primary/20 bg-primary/5 shadow-[inset_0_0_20px_rgba(34,197,94,0.02)] border-dashed border-2" 
                  : "border-border/50 hover:bg-muted/50"
              )}>
                <div className="flex items-start sm:items-center gap-3 flex-1">
                  <div className={cn(
                    "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-transform hover:scale-110 flex-shrink-0",
                    r.isSynced ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {r.isSynced ? <Landmark className="h-4 w-4 sm:h-5 sm:w-5" /> : <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <p className={cn(
                          "font-medium text-card-foreground text-sm sm:text-base break-words transition-opacity duration-300",
                          discreetMode && "discreet-mode-blur"
                        )}>
                          {r.nome}
                        </p>
                        {r.isSynced && <SyncBadge />}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-1">
                        <span>{r.tipo}</span>
                        {r.isSynced && r.frequencia && (
                            <>
                                <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
                                <span className="text-primary/80 font-medium text-xs">{r.frequencia}</span>
                            </>
                        )}
                        {r.isSynced && r.diasRecebimento && (
                            <>
                                <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
                                <span className="italic text-xs break-words">({r.diasRecebimento})</span>
                            </>
                        )}
                        {!r.isSynced && (
                            <>
                                <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
                                <span className="text-xs">{r.data}</span>
                            </>
                        )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0">
                  <Badge variant={r.recorrente ? "default" : "secondary"} className={cn(
                    "text-xs whitespace-nowrap",
                    r.recorrente && !r.isSynced ? "bg-primary/10 text-primary border-primary/20" : ""
                  )}>
                    {r.recorrente ? "Recorrente" : "Única"}
                  </Badge>
                  <span className={cn(
                    "font-semibold text-primary text-sm sm:text-base whitespace-nowrap transition-opacity duration-300",
                    discreetMode && "discreet-mode-blur"
                  )}>
                    + {formatCurrency(r.valor)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-primary/10 hover:text-primary rounded-full flex-shrink-0">
                        <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[140px]">
                      {r.isSynced ? (
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/perfil-financeiro" className="flex items-center gap-2 text-primary font-bold cursor-pointer text-sm">
                                <Landmark className="h-4 w-4" />
                                Ajustar no Perfil
                            </Link>
                        </DropdownMenuItem>
                      ) : (
                        <>
                            <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => openEditDialog(r)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-sm">Duplicar</DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-destructive font-medium cursor-pointer text-sm"
                                onClick={() => openDeleteDialog(r)}
                            >
                                Excluir
                            </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
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

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteReceita}
        itemName={deleteDialog.item?.nome}
      />
    </div>
  )
}