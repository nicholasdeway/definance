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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useCategories } from "@/lib/category-context"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn, capitalize } from "@/lib/utils"
import { ArrowDownCircle, Loader2, Save, Plus, ChevronDown, Calendar as CalendarIcon } from "lucide-react"

export interface ExpenseFormState {
  id?: string
  nome: string
  valor: string
  categoria: string
  data: string
  hora: string
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
  const isMobile = useIsMobile()
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
      <div className={cn("flex flex-col h-full", isMobile ? "space-y-4" : "space-y-8")}>
        <div className={cn("flex-1", isMobile ? "space-y-3" : "space-y-6")}>
          {/* Nome */}
          <div className="space-y-0.5 sm:space-y-2">
            <Label htmlFor="expense-nome" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
              Nome / Descrição
            </Label>
            <Input
              id="expense-nome"
              placeholder={isMobile ? "Ex: Mercado, Aluguel..." : "Ex: Supermercado, Aluguel, Steam..."}
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
              <Label htmlFor="expense-valor" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Valor
              </Label>
              <CurrencyInput
                id="expense-valor"
                value={form.valor}
                onChange={(value) => onFormChange({ ...form, valor: value })}
                placeholder="0,00"
                className={cn(
                  "font-bold bg-primary/5 border-primary/10 text-primary rounded-lg md:rounded-2xl focus:ring-primary/20",
                  isMobile ? "h-8 text-xs pl-9 pr-1" : "h-12 text-lg pl-12 pr-5"
                )}
              />
            </div>

            {/* Data e Hora */}
            <div className="flex-1 flex gap-2 md:gap-6">
              <div className="flex-1 space-y-0.5 sm:space-y-2">
                <Label htmlFor="expense-data" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                  Data
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                        isMobile ? "h-8 px-2 text-[10px]" : "h-12 px-5 text-sm",
                        !form.data && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className={cn("shrink-0 text-primary opacity-50", isMobile ? "h-3.3 w-3.3 mr-1.5" : "h-4 w-4 mr-2")} />
                      <span className="truncate">
                        {form.data ? format(parseISO(form.data), "dd/MM/yy") : "Selecionar"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-[#0a0a0a]" align="start">
                    <Calendar
                      mode="single"
                      selected={form.data ? parseISO(form.data) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          onFormChange({ ...form, data: format(date, "yyyy-MM-dd") })
                        }
                      }}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-[70px] md:w-[120px] space-y-0.5 sm:space-y-2">
                <Label htmlFor="expense-hora" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Hora</Label>
                <Input
                  id="expense-hora"
                  type="time"
                  value={form.hora}
                  onChange={(e) => onFormChange({ ...form, hora: e.target.value })}
                  className={cn(
                    "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                    isMobile ? "h-8 text-[10px] px-1" : "h-12 px-5"
                  )}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
            {/* Categoria */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label htmlFor="expense-categoria" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
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
                  {form.categoria || (isMobile ? "Categoria" : "Selecione uma categoria")}
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

            {/* Tipo */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label htmlFor="expense-tipo" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Tipo
              </Label>
              <div className={cn(
                "flex items-center justify-between rounded-lg md:rounded-2xl border border-white/5 bg-muted/20 shadow-sm overflow-hidden",
                isMobile ? "h-8 px-1.5" : "h-12 px-5"
              )}>
                <span className={cn(
                  "font-medium text-muted-foreground min-w-0 mr-1 truncate",
                  isMobile ? "text-[10px]" : "text-sm"
                )}>
                  {form.tipo || (isMobile ? "Tipo" : "Selecione o tipo")}
                </span>
                <Select
                  value={form.tipo}
                  onValueChange={(value) => onFormChange({ ...form, tipo: value })}
                >
                  <SelectTrigger className={cn(
                    "w-auto shrink-0 border-0 !bg-transparent p-0 shadow-none hover:!bg-transparent focus:ring-0 cursor-pointer transition-colors text-primary/80 hover:text-primary gap-0.5",
                    isMobile ? "h-4.5 ml-2 text-[8px] [&_svg]:size-2.5" : "h-auto ml-4 text-sm [&_svg]:size-4"
                  )}>
                    <SelectValue placeholder={isMobile ? "Sel." : "Selecionar"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
                    <SelectItem value="Fixa" className="text-[11px] md:text-sm py-1 md:py-1.5 px-2">Fixa</SelectItem>
                    <SelectItem value="Variável" className="text-[11px] md:text-sm py-1 md:py-1.5 px-2">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-0.5 sm:space-y-2">
            <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Status</Label>
            <div className={cn(
              "flex items-center justify-between rounded-lg md:rounded-2xl border border-white/5 bg-muted/20 shadow-sm",
              isMobile ? "h-8 px-1.5" : "h-12 px-5"
            )}>
              <span className={isMobile ? "text-[9px] font-medium text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>
                {isMobile ? "Já foi paga?" : "Esta despesa já foi paga?"}
              </span>
              <Switch
                id="expense-status"
                className={isMobile ? "scale-[0.6] origin-right" : "scale-100"}
                checked={form.status === "Pago"}
                onCheckedChange={(checked) =>
                  onFormChange({ ...form, status: checked ? "Pago" : "Pendente" })
                }
              />
            </div>
          </div>

          {/* Detalhes */}
          <Collapsible open={showDetails || isMobile} onOpenChange={setShowDetails} className="w-full">
            {!isMobile && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  {showDetails ? "Ocultar detalhes" : "Adicionar mais detalhes"}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent className={cn("space-y-2 md:space-y-6 animate-in fade-in slide-in-from-top-2 duration-300", !isMobile && "pt-6")}>
              <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
                <div className="flex-1 space-y-0.5 sm:space-y-2">
                  <Label htmlFor="expense-descricao" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Descrição</Label>
                  <Input
                    id="expense-descricao"
                    placeholder="Ex: Referente a compra de material, prestação..."
                    value={form.descricao}
                    onChange={(e) => onFormChange({ ...form, descricao: e.target.value })}
                    className={cn(
                      "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all focus:bg-muted/30",
                      isMobile ? "h-8 text-[10px] px-2" : "h-12 text-sm px-5"
                    )}
                  />
                </div>
                <div className="flex-1 space-y-0.5 sm:space-y-2">
                  <Label htmlFor="expense-observacoes" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Obs.</Label>
                  <Input
                    id="expense-observacoes"
                    placeholder="Ex: Notas, lembretes ou informações adicionais..."
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