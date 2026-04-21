"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { ChevronDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CurrencyInput } from "@/components/ui/currency-input"

export const categorias = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Lazer",
  "Saúde",
  "Educação",
  "Outros",
]

export interface ExpenseFormState {
  id?: string
  nome: string
  valor: string
  categoria: string
  data: string
  tipo: string
  status: string
  descricao: string
  observacoes: string
}

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: ExpenseFormState
  onFormChange: (form: ExpenseFormState) => void
  onSave: () => void
  isSaving: boolean
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  isSaving,
}: ExpenseFormDialogProps) {
  const [showDetails, setShowDetails] = useState(false)
  const isEditing = !!form.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg sm:text-xl">
            {isEditing ? "Editar Despesa" : "Nova Despesa"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isEditing
              ? "Edite as informações da sua despesa"
              : "Adicione uma nova despesa ao seu controle financeiro"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nome */}
          <div className="grid gap-2">
            <Label htmlFor="expense-nome" className="text-sm sm:text-base">
              Nome
            </Label>
            <Input
              id="expense-nome"
              placeholder="Ex: Supermercado"
              value={form.nome}
              onChange={(e) => onFormChange({ ...form, nome: e.target.value })}
              className="text-sm sm:text-base"
            />
          </div>

          {/* Valor + Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="expense-valor" className="text-sm sm:text-base">
                Valor
              </Label>
              <CurrencyInput
                id="expense-valor"
                value={form.valor}
                onChange={(value) => onFormChange({ ...form, valor: value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expense-data" className="text-sm sm:text-base">
                Data
              </Label>
              <Input
                id="expense-data"
                type="date"
                value={form.data}
                onChange={(e) => onFormChange({ ...form, data: e.target.value })}
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Categoria + Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="expense-categoria" className="text-sm sm:text-base">
                Categoria
              </Label>
              <Select
                value={form.categoria}
                onValueChange={(value) => onFormChange({ ...form, categoria: value })}
              >
                <SelectTrigger id="expense-categoria" className="text-sm sm:text-base">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-sm sm:text-base">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expense-tipo" className="text-sm sm:text-base">
                Tipo
              </Label>
              <Select
                value={form.tipo}
                onValueChange={(value) => onFormChange({ ...form, tipo: value })}
              >
                <SelectTrigger id="expense-tipo" className="text-sm sm:text-base">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixa" className="text-sm sm:text-base">
                    Fixa
                  </SelectItem>
                  <SelectItem value="Variável" className="text-sm sm:text-base">
                    Variável
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <Label htmlFor="expense-status" className="text-sm sm:text-base">
              Já foi pago?
            </Label>
            <Switch
              id="expense-status"
              checked={form.status === "Pago"}
              onCheckedChange={(checked) =>
                onFormChange({ ...form, status: checked ? "Pago" : "Pendente" })
              }
            />
          </div>

          {/* Detalhes opcionais */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-sm sm:text-base">
                Adicionar mais detalhes
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="expense-descricao" className="text-sm sm:text-base">
                  Descrição
                </Label>
                <Input
                  id="expense-descricao"
                  placeholder="Detalhes adicionais"
                  value={form.descricao}
                  onChange={(e) => onFormChange({ ...form, descricao: e.target.value })}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expense-observacoes" className="text-sm sm:text-base">
                  Observações
                </Label>
                <Input
                  id="expense-observacoes"
                  placeholder="Notas ou lembretes"
                  value={form.observacoes}
                  onChange={(e) => onFormChange({ ...form, observacoes: e.target.value })}
                  className="text-sm sm:text-base"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            className="bg-primary text-primary-foreground w-full sm:w-auto"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}