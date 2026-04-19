"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, ArrowUpRight, Search, MoreHorizontal, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CurrencyInput } from "@/components/ui/currency-input"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { formatCurrency, parseCurrencyInput } from "@/lib/currency"

interface Despesa {
  id: number
  nome: string
  valor: number
  categoria: string
  data: string
  tipo: string
  status: string
}

const despesasIniciais: Despesa[] = [
  { id: 1, nome: "Aluguel", valor: 1800, categoria: "Moradia", data: "10/03/2026", tipo: "Fixa", status: "Pago" },
  { id: 2, nome: "Supermercado Extra", valor: 450, categoria: "Alimentação", data: "08/03/2026", tipo: "Variável", status: "Pago" },
  { id: 3, nome: "Conta de Luz", valor: 180, categoria: "Moradia", data: "15/03/2026", tipo: "Fixa", status: "Pendente" },
  { id: 4, nome: "Netflix", valor: 55.90, categoria: "Lazer", data: "03/03/2026", tipo: "Fixa", status: "Pago" },
  { id: 5, nome: "Uber", valor: 32.50, categoria: "Transporte", data: "02/03/2026", tipo: "Variável", status: "Pago" },
  { id: 6, nome: "Academia", valor: 120, categoria: "Saúde", data: "01/03/2026", tipo: "Fixa", status: "Pago" },
  { id: 7, nome: "Farmácia", valor: 89.90, categoria: "Saúde", data: "05/03/2026", tipo: "Variável", status: "Pago" },
  { id: 8, nome: "Internet", valor: 129.90, categoria: "Moradia", data: "20/03/2026", tipo: "Fixa", status: "Pendente" },
]

const categorias = ["Moradia", "Alimentação", "Transporte", "Lazer", "Saúde", "Educação", "Outros"]

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>(despesasIniciais)
  const [isOpen, setIsOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [search, setSearch] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Despesa | null }>({
    open: false,
    item: null,
  })
  const [newDespesa, setNewDespesa] = useState({
    nome: "",
    valor: "",
    categoria: "",
    data: "",
    tipo: "Variável",
    status: "Pendente",
    descricao: "",
    observacoes: "",
  })

  const filteredDespesas = despesas.filter(d => 
    d.nome.toLowerCase().includes(search.toLowerCase()) ||
    d.categoria.toLowerCase().includes(search.toLowerCase())
  )

  const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0)
  const despesasPagas = despesas.filter(d => d.status === "Pago").reduce((sum, d) => sum + d.valor, 0)
  const despesasPendentes = despesas.filter(d => d.status === "Pendente").reduce((sum, d) => sum + d.valor, 0)

  const handleAddDespesa = () => {
    if (!newDespesa.nome || !newDespesa.valor) return
    
    const valor = parseCurrencyInput(newDespesa.valor)
    const novaDespesa: Despesa = {
      id: Date.now(),
      nome: newDespesa.nome,
      valor,
      categoria: newDespesa.categoria || "Outros",
      data: newDespesa.data || new Date().toLocaleDateString("pt-BR"),
      tipo: newDespesa.tipo,
      status: newDespesa.status,
    }
    
    setDespesas([novaDespesa, ...despesas])
    setNewDespesa({
      nome: "",
      valor: "",
      categoria: "",
      data: "",
      tipo: "Variável",
      status: "Pendente",
      descricao: "",
      observacoes: "",
    })
    setIsOpen(false)
  }

  const handleDeleteDespesa = () => {
    if (deleteDialog.item) {
      setDespesas(despesas.filter(d => d.id !== deleteDialog.item!.id))
      setDeleteDialog({ open: false, item: null })
    }
  }

  const openDeleteDialog = (despesa: Despesa) => {
    setDeleteDialog({ open: true, item: despesa })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Despesas</h1>
          <p className="text-muted-foreground">Gerencie todas as suas despesas</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/70">
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova Despesa</DialogTitle>
              <DialogDescription>
                Adicione uma nova despesa ao seu controle financeiro
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Supermercado"
                  value={newDespesa.nome}
                  onChange={(e) => setNewDespesa({ ...newDespesa, nome: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valor">Valor</Label>
                  <CurrencyInput
                    id="valor"
                    value={newDespesa.valor}
                    onChange={(value) => setNewDespesa({ ...newDespesa, valor: value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={newDespesa.data}
                    onChange={(e) => setNewDespesa({ ...newDespesa, data: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={newDespesa.categoria}
                    onValueChange={(value) => setNewDespesa({ ...newDespesa, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={newDespesa.tipo}
                    onValueChange={(value) => setNewDespesa({ ...newDespesa, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixa">Fixa</SelectItem>
                      <SelectItem value="Variável">Variável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Já foi pago?</Label>
                <Switch
                  id="status"
                  checked={newDespesa.status === "Pago"}
                  onCheckedChange={(checked) => 
                    setNewDespesa({ ...newDespesa, status: checked ? "Pago" : "Pendente" })
                  }
                />
              </div>
              
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    Adicionar mais detalhes
                    <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      placeholder="Detalhes adicionais"
                      value={newDespesa.descricao}
                      onChange={(e) => setNewDespesa({ ...newDespesa, descricao: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      placeholder="Notas ou lembretes"
                      value={newDespesa.observacoes}
                      onChange={(e) => setNewDespesa({ ...newDespesa, observacoes: e.target.value })}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button className="bg-primary text-primary-foreground" onClick={handleAddDespesa}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatCurrency(totalDespesas)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(despesasPagas)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(despesasPendentes)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base text-card-foreground">Lista de Despesas</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar despesas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDespesas.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <ArrowUpRight className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{d.nome}</p>
                    <p className="text-sm text-muted-foreground">{d.categoria} • {d.data}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden items-center gap-2 sm:flex">
                    <Badge variant={d.tipo === "Fixa" ? "default" : "secondary"} className="text-xs">
                      {d.tipo}
                    </Badge>
                    <Badge variant={d.status === "Pago" ? "default" : "destructive"} className={d.status === "Pago" ? "bg-primary/10 text-primary" : ""}>
                      {d.status}
                    </Badge>
                  </div>
                  <span className="font-semibold text-card-foreground">
                    {formatCurrency(d.valor)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Marcar como pago</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => openDeleteDialog(d)}
                      >
                        Excluir
                      </DropdownMenuItem>
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
        onConfirm={handleDeleteDespesa}
        itemName={deleteDialog.item?.nome}
      />
    </div>
  )
}