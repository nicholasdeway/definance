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

interface Receita {
  id: number
  nome: string
  valor: number
  tipo: string
  data: string
  recorrente: boolean
  isSynced?: boolean
}

const tiposReceita = ["CLT", "PJ", "Freelance", "Investimentos", "Aluguel", "Outros"]

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([
    { id: 1, nome: "Salário Base", valor: 0, tipo: "---", data: "Calculando...", recorrente: true, isSynced: true },
    { id: 2, nome: "Freelance Design", valor: 2000, tipo: "Freelance", data: "15/03/2026", recorrente: false },
    { id: 3, nome: "Dividendos", valor: 350, tipo: "Investimentos", data: "10/03/2026", recorrente: true },
  ])

  useEffect(() => {
    const syncProfileData = async () => {
      try {
        const data = await apiClient<any>("/api/onboarding/progress")
        if (data) {
          const profileIncome = data.monthlyIncome || data.MonthlyIncome
          const incomeTypes = data.selectedIncomeTypes || data.SelectedIncomeTypes || []
          
          if (profileIncome) {
            setReceitas(prev => prev.map(r => 
              r.isSynced ? {
                ...r,
                valor: parseInt(profileIncome),
                tipo: incomeTypes[0] || "CLT",
                data: new Date().toLocaleDateString("pt-BR")
              } : r
            ))
          }
        }
      } catch (error) {
        console.error("Erro ao sincronizar perfil:", error)
      }
    }
    syncProfileData()
  }, [])
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Receita | null }>({
    open: false,
    item: null,
  })
  const [newReceita, setNewReceita] = useState({
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

  const handleAddReceita = () => {
    if (!newReceita.nome || !newReceita.valor) return
    
    const valor = parseCurrencyInput(newReceita.valor)
    const novaReceita: Receita = {
      id: Date.now(),
      nome: newReceita.nome,
      valor,
      tipo: newReceita.tipo || "Outros",
      data: newReceita.data || new Date().toLocaleDateString("pt-BR"),
      recorrente: newReceita.recorrente,
    }
    
    setReceitas([novaReceita, ...receitas])
    setNewReceita({
      nome: "",
      valor: "",
      tipo: "",
      data: "",
      recorrente: false,
    })
    setIsOpen(false)
  }

  const handleDeleteReceita = () => {
    if (deleteDialog.item) {
      setReceitas(receitas.filter(r => r.id !== deleteDialog.item!.id))
      setDeleteDialog({ open: false, item: null })
    }
  }

  const openDeleteDialog = (receita: Receita) => {
    setDeleteDialog({ open: true, item: receita })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Entradas</h1>
          <p className="text-muted-foreground">Gerencie todas as suas fontes de renda</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova Receita</DialogTitle>
              <DialogDescription>
                Adicione uma nova fonte de renda
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Salário"
                  value={newReceita.nome}
                  onChange={(e) => setNewReceita({ ...newReceita, nome: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valor">Valor</Label>
                  <CurrencyInput
                    id="valor"
                    value={newReceita.valor}
                    onChange={(value) => setNewReceita({ ...newReceita, valor: value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={newReceita.data}
                    onChange={(e) => setNewReceita({ ...newReceita, data: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={newReceita.tipo}
                  onValueChange={(value) => setNewReceita({ ...newReceita, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposReceita.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="recorrente">Receita recorrente?</Label>
                <Switch
                  id="recorrente"
                  checked={newReceita.recorrente}
                  onCheckedChange={(checked) =>
                    setNewReceita({ ...newReceita, recorrente: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button className="bg-primary text-primary-foreground" onClick={handleAddReceita}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalReceitas)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recorrentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatCurrency(receitasRecorrentes)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatCurrency(receitasExtras)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base text-card-foreground">Lista de Receitas</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar receitas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredReceitas.map((r) => (
              <div key={r.id} className={cn(
                "flex items-center justify-between rounded-lg border p-4 transition-all",
                r.isSynced 
                  ? "border-primary/20 bg-primary/5 shadow-[inset_0_0_20px_rgba(34,197,94,0.02)] border-dashed border-2" 
                  : "border-border/50 hover:bg-muted/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110",
                    r.isSynced ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {r.isSynced ? <Landmark className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-card-foreground">{r.nome}</p>
                        {r.isSynced && <SyncBadge />}
                    </div>
                    <p className="text-sm text-muted-foreground">{r.tipo} • {r.data}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={r.recorrente ? "default" : "secondary"} className={r.recorrente && !r.isSynced ? "bg-primary/10 text-primary border-primary/20" : ""}>
                    {r.recorrente ? "Recorrente" : "Única"}
                  </Badge>
                  <span className="font-semibold text-primary">
                    + {formatCurrency(r.valor)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {r.isSynced ? (
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/perfil-financeiro" className="flex items-center gap-2 text-primary font-bold cursor-pointer">
                                <Landmark className="h-4 w-4" />
                                Ajustar no Perfil
                            </Link>
                        </DropdownMenuItem>
                      ) : (
                        <>
                            <DropdownMenuItem className="cursor-pointer">Editar</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">Duplicar</DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-destructive font-medium cursor-pointer"
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
          </div>
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
