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
import { Plus, ArrowDownLeft, Search, MoreHorizontal, Landmark } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CurrencyInput } from "@/components/ui/currency-input"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { formatCurrency, parseCurrencyInput } from "@/lib/currency"
import { SyncBadge } from "@/components/dashboard/sync-badge"
import { apiClient } from "@/lib/api-client"
import { incomeTypes, incomeFrequencies } from "@/components/onboarding/constants"
import { MonthYearPicker } from "@/components/dashboard/month-year-picker"
import { Download } from "lucide-react"

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

const tiposReceita = incomeTypes.map(t => t.label).concat(["Investimentos", "Aluguel", "Outros"])

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        setIsLoading(true)
        
        // 1. Busca dados do backend (Incomes reais) com filtro de mês/ano
        const incomesData = await apiClient<any[]>(`/api/incomes?month=${selectedMonth}&year=${selectedYear}`) || []
        
        const mappedIncomes = incomesData.map((inc: any) => ({
          id: inc.id,
          nome: inc.name,
          valor: inc.amount, 
          tipo: inc.type,
          data: new Date(inc.date).toLocaleDateString("pt-BR"),
          recorrente: inc.isRecurring,
          isSynced: false
        }))

        // 2. Tenta buscar rendas base do Onboarding
        const progressData = await apiClient<any>("/api/onboarding/progress")
        if (progressData) {
          const profileIncomes: any[] = progressData.incomes || progressData.Incomes || []
          
          if (profileIncomes.length > 0) {
            // Mapeia cada renda do perfil para um formato compatível com a lista de receitas
            const syncedIncomes = profileIncomes.map((inc: any, index: number) => {
               const incomeTipo = (inc.tipo || inc.Tipo || "").toLowerCase()
               const incomeValor = inc.valor || inc.Valor || 0
               
               // Busca informações ricas das constantes
               const typeInfo = incomeTypes.find(t => t.value === incomeTipo)
               
               const freqValue = (inc.frequencia || inc.Frequencia || "").toLowerCase()
               const freqInfo = incomeFrequencies.find(f => f.value === freqValue)

               return {
                  id: `synced-${incomeTipo}-${index}`,
                  nome: typeInfo ? `${typeInfo.label} (${typeInfo.description.split(' ')[0]})` : `Fonte: ${incomeTipo.toUpperCase()}`,
                  valor: incomeValor, // Removido / 100: O banco já armazena o valor no formato padrão (ex: 3100 para 3.1k)
                  tipo: typeInfo?.label || incomeTipo.toUpperCase(),
                  frequencia: freqInfo?.label || "Própria",
                  diasRecebimento: inc.diasRecebimento || inc.DiasRecebimento || "",
                  data: new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString("pt-BR"),
                  recorrente: true,
                  isSynced: true
               }
            })

            // Adiciona as rendas sincronizadas no topo da lista
            mappedIncomes.unshift(...syncedIncomes)
          } else {
            // Apenas mostra legado se não houver o novo array 'incomes'
            const legacyIncome = progressData.monthlyIncome || progressData.MonthlyIncome
            if (legacyIncome) {
                mappedIncomes.unshift({
                    id: "synced-salary-legacy",
                    nome: "Renda Configurada",
                    valor: parseInt(legacyIncome),
                    tipo: "Geral",
                    data: new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString("pt-BR"),
                    recorrente: true,
                    isSynced: true
                })
            }
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
  }, [selectedMonth, selectedYear])
  const [isOpen, setIsOpen] = useState(false)
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
    data: string;
    recorrente: boolean;
  }>({
    nome: "",
    valor: "",
    tipo: "",
    data: "",
    recorrente: false,
  })

  const filteredReceitas = receitas.filter(r =>
    r.nome.toLowerCase().includes(search.toLowerCase()) ||
    r.tipo.toLowerCase().includes(search.toLowerCase())
  )

  const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0)
  const receitasRecorrentes = receitas.filter(r => r.recorrente).reduce((sum, r) => sum + r.valor, 0)
  const receitasExtras = receitas.filter(r => !r.recorrente).reduce((sum, r) => sum + r.valor, 0)

  const handleSaveReceita = async () => {
    if (!newReceita.nome || !newReceita.valor) return
    
    // O parseCurrencyInput já me retorna o valor decimal em Reais puro (ex: 2500.00)
    const valorReal = parseCurrencyInput(newReceita.valor)
    
    // Converte a data do formato input YYYY-MM-DD para ISO ou usa a data de hoje
    const dateParsed = newReceita.data ? new Date(newReceita.data).toISOString() : new Date().toISOString()
    
    try {
        const isEditing = !!newReceita.id;
        const url = isEditing ? `/api/incomes/${newReceita.id}` : "/api/incomes";
        const method = isEditing ? "PUT" : "POST";

        const response = await apiClient<any>(url, {
            method: method,
            body: JSON.stringify({
                name: newReceita.nome,
                amount: valorReal,
                type: newReceita.tipo || "Outros",
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

            setNewReceita({
              nome: "",
              valor: "",
              tipo: "",
              data: "",
              recorrente: false,
            })
            setIsOpen(false)
        }
    } catch (error) {
        console.error("Erro ao salvar a renda:", error)
    }
  }

  const openEditDialog = (receita: Receita) => {
    const parts = receita.data.split("/");
    const inputDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : "";
    
    setNewReceita({
      id: receita.id,
      nome: receita.nome,
      valor: formatCurrency(receita.valor),
      tipo: receita.tipo,
      data: inputDate,
      recorrente: receita.recorrente,
    })
    setIsOpen(true)
  }

  const openAddDialog = () => {
    setNewReceita({ nome: "", valor: "", tipo: "", data: "", recorrente: false });
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
      {/* Header Section - Responsivo */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Entradas</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Gerencie todas as suas fontes de renda</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/70 w-full sm:w-auto" 
              onClick={openAddDialog}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
            <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
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
                  className="text-sm sm:text-base"
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
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo" className="text-sm sm:text-base">Tipo</Label>
                <Select
                  value={newReceita.tipo}
                  onValueChange={(value) => setNewReceita({ ...newReceita, tipo: value })}
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposReceita.map((tipo) => (
                      <SelectItem key={tipo} value={tipo} className="text-sm sm:text-base">{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button className="bg-primary text-primary-foreground w-full sm:w-auto" onClick={handleSaveReceita}>
                {newReceita.id ? "Salvar Alterações" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <MonthYearPicker 
          month={selectedMonth} 
          year={selectedYear} 
          onMonthChange={setSelectedMonth} 
          onYearChange={setSelectedYear} 
        />
        <Button variant="outline" size="sm" className="h-9 gap-2 hidden sm:flex">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>
    </div>

      {/* Cards de Resumo - Grid responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {formatCurrency(totalReceitas)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Recorrentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-card-foreground">
              {formatCurrency(receitasRecorrentes)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-card-foreground">
              {formatCurrency(receitasExtras)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Receitas */}
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
                className="w-full pl-8 sm:pl-9 sm:w-[250px] text-sm sm:text-base"
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
                        <p className="font-medium text-card-foreground text-sm sm:text-base break-words">{r.nome}</p>
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
                  <span className="font-semibold text-primary text-sm sm:text-base whitespace-nowrap">
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