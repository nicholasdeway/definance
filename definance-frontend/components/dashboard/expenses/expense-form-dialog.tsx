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
import { Switch } from "@/components/ui/switch"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CurrencyInput } from "@/components/ui/currency-input"
import { PremiumModal } from "@/components/ui/premium-modal"
import { useCategories } from "@/lib/category-context"
import { ArrowDownCircle, Loader2, Save, Plus, ChevronDown } from "lucide-react"

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
  const { categories } = useCategories()
  const [showDetails, setShowDetails] = useState(false)
  const isEditing = !!form.id

  // Lista final consolidada (Apenas API - Única)
  const todasCategorias = Array.from(new Set(
    categories
      .filter(c => c.type === "Saída" || c.type === "Ambos")
      .map(c => c.name.trim())
  ))

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Despesa" : "Nova Despesa"}
      description={isEditing ? "Ajuste os detalhes desta saída." : "Registre uma nova despesa para manter seu controle financeiro em dia."}
      icon={<ArrowDownCircle className="h-8 w-8 text-primary" />}
    >
      <div className="space-y-8 h-full flex flex-col">
        <div className="flex-1 space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="expense-nome" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
              Nome / Descrição
            </Label>
            <Input
              id="expense-nome"
              placeholder="Ex: Supermercado, Aluguel, Steam..."
              value={form.nome}
              onChange={(e) => onFormChange({ ...form, nome: e.target.value })}
              className="h-12 text-lg bg-muted/20 border-white/5 rounded-2xl px-5 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="expense-valor" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Valor da Despesa
              </Label>
              <CurrencyInput
                id="expense-valor"
                value={form.valor}
                onChange={(value) => onFormChange({ ...form, valor: value })}
                placeholder="0,00"
                className="h-12 text-2xl font-black bg-primary/5 border-primary/10 text-primary rounded-2xl pl-14 pr-5 focus:ring-primary/20"
              />
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="expense-data" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Data do Gasto
              </Label>
              <Input
                id="expense-data"
                type="date"
                value={form.data}
                onChange={(e) => onFormChange({ ...form, data: e.target.value })}
                className="h-12 bg-muted/20 border-white/5 rounded-2xl px-5 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoria - Estilo Linha Switch */}
            <div className="space-y-2">
              <Label htmlFor="expense-categoria" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Categoria da Despesa
              </Label>
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-muted/20 h-12 px-5 shadow-sm overflow-hidden">
                <span className="text-sm font-medium text-muted-foreground truncate min-w-0 mr-2">
                  {form.categoria || "Selecione uma categoria"}
                </span>
                <Select
                  value={form.categoria}
                  onValueChange={(value) => onFormChange({ ...form, categoria: value })}
                >
                  <SelectTrigger className="w-auto shrink-0 border-0 bg-white/5 px-3 h-8 rounded-lg shadow-none hover:bg-white/10 focus:ring-0 cursor-pointer ml-2 transition-colors">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
                    {todasCategorias.sort().map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipo - Estilo Linha Switch */}
            <div className="space-y-2">
              <Label htmlFor="expense-tipo" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Tipo de Gasto
              </Label>
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-muted/20 h-12 px-5 shadow-sm overflow-hidden">
                <span className="text-sm font-medium text-muted-foreground">
                  {form.tipo || "Selecione o tipo"}
                </span>
                <Select
                  value={form.tipo}
                  onValueChange={(value) => onFormChange({ ...form, tipo: value })}
                >
                  <SelectTrigger className="w-auto shrink-0 border-0 bg-white/5 px-3 h-8 rounded-lg shadow-none hover:bg-white/10 focus:ring-0 cursor-pointer ml-2 transition-colors">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
                    <SelectItem value="Fixa">Fixa</SelectItem>
                    <SelectItem value="Variável">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status - Switch Row */}
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Status de Pagamento</Label>
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-muted/20 h-12 px-5 shadow-sm">
              <span className="text-sm font-medium text-muted-foreground">Esta despesa já foi paga?</span>
              <Switch
                id="expense-status"
                checked={form.status === "Pago"}
                onCheckedChange={(checked) =>
                  onFormChange({ ...form, status: checked ? "Pago" : "Pendente" })
                }
              />
            </div>
          </div>

          {/* Detalhes opcionais */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails} className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                {showDetails ? "Ocultar detalhes" : "Adicionar mais detalhes"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="expense-descricao" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Descrição Detalhada</Label>
                  <Input
                    id="expense-descricao"
                    placeholder="Mais detalhes sobre o gasto"
                    value={form.descricao}
                    onChange={(e) => onFormChange({ ...form, descricao: e.target.value })}
                    className="h-12 bg-muted/20 border-white/5 rounded-2xl px-5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-observacoes" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Observações</Label>
                  <Input
                    id="expense-observacoes"
                    placeholder="Notas ou lembretes"
                    value={form.observacoes}
                    onChange={(e) => onFormChange({ ...form, observacoes: e.target.value })}
                    className="h-12 bg-muted/20 border-white/5 rounded-2xl px-5 transition-all"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-6 hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            className="min-w-[160px] h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isEditing ? "Salvar Alterações" : "Criar Despesa"}
          </Button>
        </div>
      </div>
    </PremiumModal>
  )
}