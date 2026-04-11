"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Target, Plane, Car, Home, GraduationCap, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CurrencyInput } from "@/components/ui/currency-input"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { formatCurrency, parseCurrencyInput } from "@/lib/currency"
import { LucideIcon } from "lucide-react"

interface Meta {
  id: number
  nome: string
  valorAlvo: number
  valorAtual: number
  prazo: string
  icon: LucideIcon
  cor: string
}

const metasIniciais: Meta[] = [
  { 
    id: 1, 
    nome: "Viagem para Europa", 
    valorAlvo: 15000, 
    valorAtual: 8500, 
    prazo: "Dez 2026",
    icon: Plane,
    cor: "bg-blue-500"
  },
  { 
    id: 2, 
    nome: "Carro Novo", 
    valorAlvo: 50000, 
    valorAtual: 12000, 
    prazo: "Jun 2027",
    icon: Car,
    cor: "bg-purple-500"
  },
  { 
    id: 3, 
    nome: "Entrada do Apartamento", 
    valorAlvo: 80000, 
    valorAtual: 35000, 
    prazo: "Dez 2027",
    icon: Home,
    cor: "bg-primary"
  },
  { 
    id: 4, 
    nome: "Reserva de Emergência", 
    valorAlvo: 20000, 
    valorAtual: 18500, 
    prazo: "Abr 2026",
    icon: Target,
    cor: "bg-yellow-500"
  },
  { 
    id: 5, 
    nome: "Curso de MBA", 
    valorAlvo: 25000, 
    valorAtual: 5000, 
    prazo: "Jan 2027",
    icon: GraduationCap,
    cor: "bg-red-500"
  },
]

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>(metasIniciais)
  const [isOpen, setIsOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Meta | null }>({
    open: false,
    item: null,
  })
  const [newMeta, setNewMeta] = useState({
    nome: "",
    valorAlvo: "",
    prazo: "",
  })

  const totalMetas = metas.reduce((sum, m) => sum + m.valorAlvo, 0)
  const totalAcumulado = metas.reduce((sum, m) => sum + m.valorAtual, 0)
  const progressoGeral = (totalAcumulado / totalMetas) * 100

  const handleAddMeta = () => {
    if (!newMeta.nome || !newMeta.valorAlvo) return
    
    const valor = parseCurrencyInput(newMeta.valorAlvo)
    const novaMeta: Meta = {
      id: Date.now(),
      nome: newMeta.nome,
      valorAlvo: valor,
      valorAtual: 0,
      prazo: newMeta.prazo || "Dez 2026",
      icon: Target,
      cor: "bg-primary",
    }
    
    setMetas([...metas, novaMeta])
    setNewMeta({ nome: "", valorAlvo: "", prazo: "" })
    setIsOpen(false)
  }

  const handleDeleteMeta = () => {
    if (deleteDialog.item) {
      setMetas(metas.filter(m => m.id !== deleteDialog.item!.id))
      setDeleteDialog({ open: false, item: null })
    }
  }

  const openDeleteDialog = (meta: Meta) => {
    setDeleteDialog({ open: true, item: meta })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metas</h1>
          <p className="text-muted-foreground">Acompanhe seus objetivos financeiros</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova Meta</DialogTitle>
              <DialogDescription>
                Defina um objetivo financeiro para alcançar
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome da meta</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Viagem para Europa"
                  value={newMeta.nome}
                  onChange={(e) => setNewMeta({ ...newMeta, nome: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valorAlvo">Valor alvo</Label>
                <CurrencyInput
                  id="valorAlvo"
                  value={newMeta.valorAlvo}
                  onChange={(value) => setNewMeta({ ...newMeta, valorAlvo: value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prazo">Prazo</Label>
                <Input
                  id="prazo"
                  type="month"
                  value={newMeta.prazo}
                  onChange={(e) => setNewMeta({ ...newMeta, prazo: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button className="bg-primary text-primary-foreground" onClick={handleAddMeta}>
                Criar Meta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base text-card-foreground">Progresso Geral</CardTitle>
          <CardDescription>Todas as suas metas combinadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(totalAcumulado)} de {formatCurrency(totalMetas)}
            </span>
            <span className="font-medium text-primary">{progressoGeral.toFixed(0)}%</span>
          </div>
          <Progress value={progressoGeral} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metas.map((meta) => {
          const progresso = (meta.valorAtual / meta.valorAlvo) * 100
          const falta = meta.valorAlvo - meta.valorAtual

          return (
            <Card key={meta.id} className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.cor}/10`}>
                    <meta.icon className={`h-5 w-5 ${meta.cor.replace("bg-", "text-")}`} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Adicionar valor</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => openDeleteDialog(meta)}
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-base text-card-foreground">{meta.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-2xl font-bold text-card-foreground">
                      {progresso.toFixed(0)}%
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Prazo: {meta.prazo}
                    </Badge>
                  </div>
                  <Progress value={progresso} className="h-2" />
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Acumulado</p>
                    <p className="font-semibold text-primary">
                      {formatCurrency(meta.valorAtual)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Falta</p>
                    <p className="font-semibold text-card-foreground">
                      {formatCurrency(falta)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteMeta}
        itemName={deleteDialog.item?.nome}
      />
    </div>
  )
}
