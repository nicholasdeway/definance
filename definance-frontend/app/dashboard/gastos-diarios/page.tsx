"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Send, Trash2 } from "lucide-react"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/lib/settings-context"
import { cn } from "@/lib/utils"

interface Gasto {
  id: number
  descricao: string
  valor: number
  data: string
  hora: string
}

const gastosIniciais: Gasto[] = [
  { id: 1, descricao: "Café da manhã", valor: 15.00, data: "Hoje", hora: "08:30" },
  { id: 2, descricao: "Uber para trabalho", valor: 22.50, data: "Hoje", hora: "09:15" },
  { id: 3, descricao: "Almoço restaurante", valor: 45.00, data: "Hoje", hora: "12:30" },
  { id: 4, descricao: "Gasolina", valor: 200.00, data: "Ontem", hora: "18:00" },
  { id: 5, descricao: "Supermercado", valor: 85.90, data: "Ontem", hora: "19:30" },
  { id: 6, descricao: "Farmácia", valor: 32.00, data: "Ontem", hora: "20:00" },
]

export default function GastosDiariosPage() {
  const { discreetMode } = useSettings()

  const [gastos, setGastos] = useState<Gasto[]>(gastosIniciais)
  const [inputValue, setInputValue] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Gasto | null }>({
    open: false,
    item: null,
  })

  const parseInput = (input: string) => {
    // Aceita formatos: "Café 15,50" ou "Café 15.50" ou "Café 1550" (centavos)
    const regex = /(.+?)\s+(\d+(?:[.,]\d{1,2})?)\s*(hoje|ontem)?/i
    const match = input.match(regex)
    if (match) {
      const descricao = match[1].trim()
      let valorStr = match[2].replace(",", ".")
      // Se não tem ponto, assume que é centavos apenas se tiver mais de 2 dígitos
      let valor = parseFloat(valorStr)
      if (!valorStr.includes(".") && valorStr.length > 2) {
        valor = valor / 100
      }
      const data = match[3]?.toLowerCase() === "ontem" ? "Ontem" : "Hoje"
      return { descricao, valor, data }
    }
    return null
  }

  const handleAddGasto = () => {
    if (!inputValue.trim()) return
    
    const parsed = parseInput(inputValue)
    if (parsed) {
      const now = new Date()
      const hora = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      
      setGastos([
        { id: Date.now(), ...parsed, hora },
        ...gastos,
      ])
      setInputValue("")
    }
  }

  const handleDeleteGasto = () => {
    if (deleteDialog.item) {
      setGastos(gastos.filter(g => g.id !== deleteDialog.item!.id))
      setDeleteDialog({ open: false, item: null })
    }
  }

  const openDeleteDialog = (gasto: Gasto) => {
    setDeleteDialog({ open: true, item: gasto })
  }

  const totalHoje = gastos.filter(g => g.data === "Hoje").reduce((sum, g) => sum + g.valor, 0)
  const totalOntem = gastos.filter(g => g.data === "Ontem").reduce((sum, g) => sum + g.valor, 0)

  const gastosHoje = gastos.filter(g => g.data === "Hoje")
  const gastosOntem = gastos.filter(g => g.data === "Ontem")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gastos Diários</h1>
        <p className="text-muted-foreground">Registre seus gastos rapidamente</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base text-card-foreground">Adicionar Gasto Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder='Ex: "Gasolina 200,00 hoje" ou "Almoço 45"'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddGasto()}
              className="flex-1"
            />
            <Button onClick={handleAddGasto} className="bg-primary text-primary-foreground hover:bg-primary/70">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Digite a descrição seguida do valor em R$. Ex: "Café 15,50" ou "Uber 25 ontem"
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Gastos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold text-card-foreground transition-opacity duration-300",
              discreetMode && "discreet-mode-blur"
            )}>
              {formatCurrency(totalHoje)}
            </div>
            <p className="text-xs text-muted-foreground">{gastosHoje.length} lançamentos</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Gastos de Ontem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold text-card-foreground transition-opacity duration-300",
              discreetMode && "discreet-mode-blur"
            )}>
              {formatCurrency(totalOntem)}
            </div>
            <p className="text-xs text-muted-foreground">{gastosOntem.length} lançamentos</p>
          </CardContent>
        </Card>
      </div>

      {gastosHoje.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-card-foreground">Hoje</CardTitle>
              <Badge variant="secondary">{gastosHoje.length} gastos</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gastosHoje.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                      <ArrowUpRight className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{g.descricao}</p>
                      <p className="text-xs text-muted-foreground">{g.hora}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "font-semibold text-card-foreground transition-opacity duration-300",
                      discreetMode && "discreet-mode-blur"
                    )}>
                      {formatCurrency(g.valor)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => openDeleteDialog(g)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {gastosOntem.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-card-foreground">Ontem</CardTitle>
              <Badge variant="secondary">{gastosOntem.length} gastos</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gastosOntem.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                      <ArrowUpRight className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{g.descricao}</p>
                      <p className="text-xs text-muted-foreground">{g.hora}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "font-semibold text-card-foreground transition-opacity duration-300",
                      discreetMode && "discreet-mode-blur"
                    )}>
                      {formatCurrency(g.valor)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => openDeleteDialog(g)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteGasto}
        itemName={deleteDialog.item?.descricao}
      />
    </div>
  )
}