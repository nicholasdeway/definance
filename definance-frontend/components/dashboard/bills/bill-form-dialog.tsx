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
import { CreditCard, Loader2, Save, Plus, ChevronDown } from "lucide-react"

export interface BillFormState {
  id?: string
  nome: string
  valor: string
  categoria: string
  outroCategoria?: string
  tipo: string
  dueDate: string
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
  const { categories } = useCategories()
  const [showDetails, setShowDetails] = useState(false)
  const isEditing = !!form.id

  // Filtra as categorias dinâmicas para Saída ou Ambos consumindo 100% da API
  const todasCategorias = Array.from(new Set(
    categories
      .filter(c => c.type === "Saída" || c.type === "Ambos")
      .map(c => c.name.trim())
  ))

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Conta" : "Nova Conta"}
      description={isEditing ? "Edite as informações desta conta." : "Adicione uma nova conta ao seu calendário financeiro para não perder prazos."}
      icon={<CreditCard className="h-8 w-8 text-primary" />}
    >
      <div className="space-y-8 h-full flex flex-col">
        <div className="flex-1 space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="bill-nome" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
              Nome da Conta
            </Label>
            <Input
              id="bill-nome"
              placeholder="Ex: Conta de Luz, Aluguel, Steam..."
              value={form.nome}
              onChange={(e) => onFormChange({ ...form, nome: e.target.value })}
              className="h-12 text-lg bg-muted/20 border-white/5 rounded-2xl px-5 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="bill-valor" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Valor da Conta
              </Label>
              <CurrencyInput
                id="bill-valor"
                value={form.valor}
                onChange={(value) => onFormChange({ ...form, valor: value })}
                placeholder="0,00"
                className="h-12 text-2xl font-black bg-primary/5 border-primary/10 text-primary rounded-2xl pl-14 pr-5 focus:ring-primary/20"
              />
            </div>

            {/* Vencimento */}
            <div className="space-y-2">
              <Label htmlFor="bill-due-date" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Data de Vencimento
              </Label>
              <Input
                id="bill-due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => onFormChange({ ...form, dueDate: e.target.value })}
                className="h-12 bg-muted/20 border-white/5 rounded-2xl px-5 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoria - Consumindo apenas a API */}
            <div className="space-y-2">
              <Label htmlFor="bill-categoria" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Categoria da Conta
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

            {/* Tipo (Fixa/Variável) - Estilo Premium Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Tipo de Conta</Label>
              <div className="flex p-1 h-12 bg-muted/20 border border-white/5 rounded-2xl shadow-sm">
                <button
                  type="button"
                  onClick={() => onFormChange({ ...form, tipo: "Fixa" })}
                  className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all rounded-xl ${
                    form.tipo === "Fixa"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  📌 Fixa
                </button>
                <button
                  type="button"
                  onClick={() => onFormChange({ ...form, tipo: "Variável" })}
                  className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all rounded-xl ${
                    form.tipo === "Variável"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  🔀 Variável
                </button>
              </div>
            </div>
          </div>

          {/* Recorrência Switch Row */}
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Recorrência Mensal</Label>
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-muted/20 h-12 px-5 shadow-sm">
              <span className="text-sm font-medium text-muted-foreground">Esta conta se repete todo mês?</span>
              <Switch
                id="bill-recorrente"
                checked={form.isRecorrente}
                onCheckedChange={(checked) => onFormChange({ ...form, isRecorrente: checked })}
              />
            </div>
          </div>

          {/* Outros / Detalhes */}
          {form.categoria === "Outros" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="bill-outro-categoria" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Especifique a categoria</Label>
              <Input
                id="bill-outro-categoria"
                placeholder="Ex: Presente, Venda..."
                value={form.outroCategoria || ""}
                onChange={(e) => onFormChange({ ...form, outroCategoria: e.target.value })}
                className="h-12 bg-muted/20 border-white/5 rounded-2xl px-5 transition-all"
              />
            </div>
          )}

          <Collapsible open={showDetails} onOpenChange={setShowDetails} className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                {showDetails ? "Ocultar notas" : "Adicionar notas e lembretes"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bill-descricao" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Descrição</Label>
                  <Input
                    id="bill-descricao"
                    placeholder="Detalhes adicionais"
                    value={form.descricao}
                    onChange={(e) => onFormChange({ ...form, descricao: e.target.value })}
                    className="h-12 bg-muted/20 border-white/5 rounded-2xl px-5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bill-observacoes" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Observações</Label>
                  <Input
                    id="bill-observacoes"
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
            {isEditing ? "Salvar Alterações" : "Salvar Conta"}
          </Button>
        </div>
      </div>
    </PremiumModal>
  )
}