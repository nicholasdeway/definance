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

export const categoriasContas = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Veículos",
  "Saúde",
  "Educação",
  "Lazer",
  "Serviços",
  "Assinaturas",
  "Outros",
]

export interface BillFormState {
  id?: string
  nome: string
  valor: string
  categoria: string
  tipo: string        // Fixa | Variável
  dueDate: string     // date input YYYY-MM-DD
  isRecorrente: boolean
  descricao: string
  observacoes: string
}

interface BillFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: BillFormState
  onFormChange: (form: BillFormState) => void
  onSave: () => void
  isSaving: boolean
}

export function BillFormDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  isSaving,
}: BillFormDialogProps) {
  const [showDetails, setShowDetails] = useState(false)
  const isEditing = !!form.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg sm:text-xl">
            {isEditing ? "Editar Conta" : "Nova Conta"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isEditing
              ? "Edite as informações desta conta"
              : "Adicione uma nova conta ao seu calendário financeiro"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nome */}
          <div className="grid gap-2">
            <Label htmlFor="bill-nome" className="text-sm">
              Nome da conta
            </Label>
            <Input
              id="bill-nome"
              placeholder="Ex: Conta de Luz, Aluguel..."
              value={form.nome}
              onChange={(e) => onFormChange({ ...form, nome: e.target.value })}
            />
          </div>

          {/* Valor + Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bill-valor" className="text-sm">
                Valor
              </Label>
              <CurrencyInput
                id="bill-valor"
                value={form.valor}
                onChange={(value) => onFormChange({ ...form, valor: value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bill-due-date" className="text-sm">
                Vencimento
              </Label>
              <Input
                id="bill-due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => onFormChange({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Tipo + Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm">Tipo</Label>
              {/* Toggle visual Fixa / Variável */}
              <div className="flex rounded-md border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => onFormChange({ ...form, tipo: "Fixa" })}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    form.tipo === "Fixa"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  📌 Fixa
                </button>
                <button
                  type="button"
                  onClick={() => onFormChange({ ...form, tipo: "Variável" })}
                  className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-border ${
                    form.tipo === "Variável"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  🔀 Variável
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bill-categoria" className="text-sm">
                Categoria
              </Label>
              <Select
                value={form.categoria}
                onValueChange={(value) => onFormChange({ ...form, categoria: value })}
              >
                <SelectTrigger id="bill-categoria">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasContas.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-sm">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!form.categoria && (
                <p className="text-[10px] text-orange-500 font-medium animate-pulse mt-1">
                  💡 Dica: Vincule uma categoria para organizar melhor suas saídas!
                </p>
              )}
            </div>
          </div>

          {/* Recorrente */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
            <div>
              <Label htmlFor="bill-recorrente" className="text-sm font-medium">
                Conta recorrente
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Repete todo mês (ex: Aluguel, Luz, Internet)
              </p>
            </div>
            <Switch
              id="bill-recorrente"
              checked={form.isRecorrente}
              onCheckedChange={(checked) => onFormChange({ ...form, isRecorrente: checked })}
            />
          </div>

          {/* Detalhes opcionais */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-sm">
                Adicionar notas
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="bill-descricao" className="text-sm">
                  Descrição
                </Label>
                <Input
                  id="bill-descricao"
                  placeholder="Detalhes adicionais"
                  value={form.descricao}
                  onChange={(e) => onFormChange({ ...form, descricao: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bill-observacoes" className="text-sm">
                  Observações
                </Label>
                <Input
                  id="bill-observacoes"
                  placeholder="Notas ou lembretes"
                  value={form.observacoes}
                  onChange={(e) => onFormChange({ ...form, observacoes: e.target.value })}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            className="bg-primary/70 hover:bg-primary text-primary-foreground cursor-pointer w-full sm:w-auto"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Salvar Conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}