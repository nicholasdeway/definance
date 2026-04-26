"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"
import { CurrencyInput } from "@/components/ui/currency-input"

interface ReceitaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => Promise<void>
  initialData: any | null
  isSaving: boolean
}

export const ReceitaDialog = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  isSaving
}: ReceitaDialogProps) => {
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    valor: "",
    tipo: "Outros",
    outroTipo: "",
    data: new Date().toISOString().split('T')[0],
    recorrente: true
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || "",
        nome: initialData.nome || "",
        valor: initialData.valor?.toString() || "",
        tipo: initialData.tipo || "Outros",
        outroTipo: initialData.tipo === "Outros" ? "" : "",
        data: initialData.data || new Date().toISOString().split('T')[0],
        recorrente: initialData.recorrente ?? true
      })
    } else {
      setFormData({
        id: "",
        nome: "",
        valor: "",
        tipo: "Outros",
        outroTipo: "",
        data: new Date().toISOString().split('T')[0],
        recorrente: true
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Altere os dados da sua receita.' : 'Adicione uma nova entrada ao seu fluxo de caixa.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome / Descrição</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Salário, Freelance..."
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="valor">Valor</Label>
            <CurrencyInput
              id="valor"
              value={formData.valor}
              onChange={(val) => setFormData({ ...formData, valor: val })}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Categoria</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(val) => setFormData({ ...formData, tipo: val })}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLT">CLT</SelectItem>
                  <SelectItem value="PJ">PJ</SelectItem>
                  <SelectItem value="Investimentos">Investimentos</SelectItem>
                  <SelectItem value="Aluguel">Aluguel</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>
          </div>

          {formData.tipo === "Outros" && (
            <div className="grid gap-2">
              <Label htmlFor="outroTipo">Especifique a categoria</Label>
              <Input
                id="outroTipo"
                value={formData.outroTipo}
                onChange={(e) => setFormData({ ...formData, outroTipo: e.target.value })}
                placeholder="Ex: Presente, Venda..."
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label>Receita Recorrente</Label>
              <p className="text-[10px] text-muted-foreground">Esta renda se repete todo mês?</p>
            </div>
            <Switch
              checked={formData.recorrente}
              onCheckedChange={(val) => setFormData({ ...formData, recorrente: val })}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="min-w-[120px]">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? 'Salvar Alterações' : 'Criar Receita'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}