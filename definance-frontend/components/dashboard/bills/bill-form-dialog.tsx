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
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"

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
  const isMobile = useIsMobile()
  const [showDetails, setShowDetails] = useState(false)
  const isEditing = !!form.id

  // Filtra as categorias dinâmicas para Saída ou Ambos
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
      description={isEditing ? "Edite as informações desta conta." : "Adicione uma nova conta ao seu calendário financeiro."}
      icon={<CreditCard className="h-8 w-8 text-primary" />}
    >
      <div className={cn("flex flex-col h-full", isMobile ? "space-y-4" : "space-y-8")}>
        <div className={cn("flex-1", isMobile ? "space-y-3" : "space-y-6")}>
          {/* Nome */}
          <div className="space-y-0.5 sm:space-y-2">
            <Label htmlFor="bill-nome" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
              Nome da Conta
            </Label>
            <Input
              id="bill-nome"
              placeholder={isMobile ? "Ex: Luz, Aluguel..." : "Ex: Conta de Luz, Aluguel, Steam..."}
              value={form.nome}
              onChange={(e) => onFormChange({ ...form, nome: e.target.value })}
              className={cn(
                "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all focus:bg-muted/30",
                isMobile ? "h-8 text-[11px] px-2" : "h-12 text-lg px-5"
              )}
            />
          </div>

          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
            {/* Valor */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label htmlFor="bill-valor" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Valor
              </Label>
              <CurrencyInput
                id="bill-valor"
                value={form.valor}
                onChange={(value) => onFormChange({ ...form, valor: value })}
                placeholder="0,00"
                className={cn(
                  "font-black bg-primary/5 border-primary/10 text-primary rounded-lg md:rounded-2xl focus:ring-primary/20",
                  isMobile ? "h-8 text-xs pl-9 pr-1" : "h-12 text-2xl pl-12 pr-5"
                )}
              />
            </div>

            {/* Vencimento */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label htmlFor="bill-due-date" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Vencimento
              </Label>
              <Input
                id="bill-due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => onFormChange({ ...form, dueDate: e.target.value })}
                className={cn(
                  "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                  isMobile ? "h-8 text-[10px] px-1" : "h-12 px-5"
                )}
              />
            </div>
          </div>

          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
            {/* Categoria */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label htmlFor="bill-categoria" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Categoria
              </Label>
              <div className={cn(
                "flex items-center justify-between rounded-lg md:rounded-2xl border border-white/5 bg-muted/20 shadow-sm overflow-hidden",
                isMobile ? "h-8 px-1.5" : "h-12 px-5"
              )}>
                <span className={cn(
                  "font-medium text-muted-foreground min-w-0 mr-1 truncate",
                  isMobile ? "text-[10px]" : "text-sm"
                )}>
                  {form.categoria || (isMobile ? "Selecione" : "Selecione uma categoria")}
                </span>
                <Select
                  value={form.categoria}
                  onValueChange={(value) => onFormChange({ ...form, categoria: value })}
                >
                  <SelectTrigger className={cn(
                    "w-auto shrink-0 border-0 !bg-transparent p-0 shadow-none hover:!bg-transparent focus:ring-0 cursor-pointer transition-colors text-primary/80 hover:text-primary gap-0.5",
                    isMobile ? "h-4.5 ml-2 text-[8px] [&_svg]:size-2.5" : "h-auto ml-4 text-sm [&_svg]:size-4"
                  )}>
                    <SelectValue placeholder={isMobile ? "Sel." : "Selecionar"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
                    {todasCategorias.sort().map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-[11px] md:text-sm py-1 md:py-1.5 px-2">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipo (Fixa/Variável) */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Tipo</Label>
              <div className={cn(
                "flex p-0.5 bg-muted/20 border border-white/5 rounded-lg md:rounded-2xl shadow-sm",
                isMobile ? "h-8" : "h-12"
              )}>
                <button
                  type="button"
                  onClick={() => onFormChange({ ...form, tipo: "Fixa" })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 font-bold uppercase tracking-wider transition-all rounded-md md:rounded-xl",
                    isMobile ? "text-[8px]" : "text-xs",
                    form.tipo === "Fixa"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  📌 {isMobile ? "FIXA" : "Fixa"}
                </button>
                <button
                  type="button"
                  onClick={() => onFormChange({ ...form, tipo: "Variável" })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 font-bold uppercase tracking-wider transition-all rounded-md md:rounded-xl",
                    isMobile ? "text-[8px]" : "text-xs",
                    form.tipo === "Variável"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  🔀 {isMobile ? "VAR." : "Variável"}
                </button>
              </div>
            </div>
          </div>

          {/* Recorrência */}
          <div className="space-y-0.5 sm:space-y-2">
            <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Recorrência</Label>
            <div className={cn(
              "flex items-center justify-between rounded-lg md:rounded-2xl border border-white/5 bg-muted/20 shadow-sm",
              isMobile ? "h-8 px-1.5" : "h-12 px-5"
            )}>
              <span className={isMobile ? "text-[9px] font-medium text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>
                {isMobile ? "Repete todo mês?" : "Esta conta se repete todo mês?"}
              </span>
              <Switch
                id="bill-recorrente"
                className={isMobile ? "scale-[0.6] origin-right" : "scale-100"}
                checked={form.isRecorrente}
                onCheckedChange={(checked) => onFormChange({ ...form, isRecorrente: checked })}
              />
            </div>
          </div>

          {/* Outros */}
          {form.categoria === "Outros" && (
            <div className="space-y-0.5 sm:space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="bill-outro-categoria" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Qual categoria?</Label>
              <Input
                id="bill-outro-categoria"
                placeholder="Especifique..."
                value={form.outroCategoria || ""}
                onChange={(e) => onFormChange({ ...form, outroCategoria: e.target.value })}
                className={cn(
                  "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                  isMobile ? "h-8 text-[10px] px-2" : "h-12 px-5"
                )}
              />
            </div>
          )}

          <Collapsible open={showDetails || isMobile} onOpenChange={setShowDetails} className="w-full">
            {!isMobile && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  {showDetails ? "Ocultar notas" : "Adicionar notas e lembretes"}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent className={cn("space-y-2 md:space-y-6 animate-in fade-in slide-in-from-top-2 duration-300", !isMobile && "pt-6")}>
              <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
                <div className="flex-1 space-y-0.5 sm:space-y-2">
                  <Label htmlFor="bill-descricao" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Descrição</Label>
                  <Input
                    id="bill-descricao"
                    placeholder="Detalhes..."
                    value={form.descricao}
                    onChange={(e) => onFormChange({ ...form, descricao: e.target.value })}
                    className={cn(
                      "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                      isMobile ? "h-8 text-[10px] px-2" : "h-12 text-sm px-5"
                    )}
                  />
                </div>
                <div className="flex-1 space-y-0.5 sm:space-y-2">
                  <Label htmlFor="bill-observacoes" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Obs.</Label>
                  <Input
                    id="bill-observacoes"
                    placeholder="Notas..."
                    value={form.observacoes}
                    onChange={(e) => onFormChange({ ...form, observacoes: e.target.value })}
                    className={cn(
                      "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                      isMobile ? "h-8 text-[10px] px-2" : "h-12 text-sm px-5"
                    )}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 md:pt-6 border-t border-white/5 flex items-center justify-end gap-2 md:gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 md:flex-none min-w-[100px] md:min-w-[140px] h-9 md:h-12 text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-white/5"
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 md:flex-none min-w-[100px] md:min-w-[140px] h-9 md:h-12 bg-primary text-primary-foreground text-xs md:text-sm font-bold rounded-lg md:rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing ? "Salvar" : "Criar"}
          </Button>
        </div>
      </div>
    </PremiumModal>
  )
}