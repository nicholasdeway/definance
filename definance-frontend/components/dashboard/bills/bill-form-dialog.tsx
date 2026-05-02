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
import { parseCurrencyInput, formatCurrency } from "@/lib/currency"
import { CreditCard, Loader2, Save, Plus, ChevronDown, Calendar as CalendarIcon, AlertCircle } from "lucide-react"
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
  isParcelado?: boolean
  parcelasTotal?: number
  parcelasPagas?: number
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isEditing = !!form.id

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    if (!form.nome.trim()) {
      newErrors.nome = "Informe o nome"
    }

    if (!form.valor || form.valor === "0,00" || form.valor === "0") {
      newErrors.valor = "Informe o valor"
    }

    if (!form.dueDate) {
      newErrors.dueDate = "Selecione a data"
    }

    if (!form.categoria) {
      newErrors.categoria = "Selecione a categoria"
    }

    if (form.isParcelado && (!form.parcelasTotal || form.parcelasTotal <= 0)) {
      newErrors.parcelasTotal = "Obrigatório"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    onSave()
  }

  // Limpa o erro de um campo quando ele é alterado
  const handleFieldChange = (field: keyof BillFormState, value: any) => {
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
    onFormChange({ ...form, [field]: value })
  }

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
            <div className="flex items-center justify-between">
              <Label htmlFor="bill-nome" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Nome da Conta
              </Label>
              {errors.nome && <span className="text-[8px] md:text-[10px] font-bold text-destructive animate-pulse uppercase">{errors.nome}</span>}
            </div>
            <Input
              id="bill-nome"
              placeholder={isMobile ? "Ex: Luz, Aluguel..." : "Ex: Conta de Luz, Aluguel, Steam..."}
              value={form.nome}
              onChange={(e) => handleFieldChange("nome", e.target.value)}
              className={cn(
                "bg-muted/20 rounded-lg md:rounded-2xl transition-all focus:bg-muted/30",
                isMobile ? "h-8 text-[11px] px-2" : "h-12 text-lg px-5",
                errors.nome ? "border-destructive/50 ring-1 ring-destructive/20" : "border-white/5"
              )}
            />
          </div>

          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
            {/* Valor */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bill-valor" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                  Valor
                </Label>
                {errors.valor && <span className="text-[8px] md:text-[10px] font-bold text-destructive animate-pulse uppercase">{errors.valor}</span>}
              </div>
              <CurrencyInput
                id="bill-valor"
                value={form.valor}
                onChange={(value) => handleFieldChange("valor", value)}
                placeholder="0,00"
                className={cn(
                  "font-black bg-primary/5 text-primary rounded-lg md:rounded-2xl focus:ring-primary/20",
                  isMobile ? "h-8 text-xs pl-9 pr-1" : "h-12 text-2xl pl-12 pr-5",
                  errors.valor ? "border-destructive/50 ring-1 ring-destructive/20" : "border-primary/10"
                )}
              />
            </div>

            {/* Vencimento */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bill-due-date" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                  Vencimento
                </Label>
                {errors.dueDate && <span className="text-[8px] md:text-[10px] font-bold text-destructive animate-pulse uppercase">{errors.dueDate}</span>}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-muted/20 rounded-lg md:rounded-2xl transition-all",
                      isMobile ? "h-8 px-2 text-[10px]" : "h-12 px-5 text-sm",
                      !form.dueDate && "text-muted-foreground",
                      errors.dueDate ? "border-destructive/50 ring-1 ring-destructive/20" : "border-white/5"
                    )}
                  >
                    <CalendarIcon className={cn("shrink-0 text-primary opacity-50", isMobile ? "h-3.3 w-3.3 mr-1.5" : "h-4 w-4 mr-2")} />
                    <span className="truncate">
                      {form.dueDate ? format(parseISO(form.dueDate), "dd/MM/yy") : "Selecionar data"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-[#0a0a0a]" align="start">
                  <Calendar
                    mode="single"
                    selected={form.dueDate ? parseISO(form.dueDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleFieldChange("dueDate", format(date, "yyyy-MM-dd"))
                      }
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
            {/* Categoria */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bill-categoria" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                  Categoria
                </Label>
                {errors.categoria && <span className="text-[8px] md:text-[10px] font-bold text-destructive animate-pulse uppercase">{errors.categoria}</span>}
              </div>
              <div className={cn(
                "flex items-center justify-between rounded-lg md:rounded-2xl bg-muted/20 shadow-sm overflow-hidden transition-all",
                isMobile ? "h-8 px-1.5" : "h-12 px-5",
                errors.categoria ? "border-destructive/50 ring-1 ring-destructive/20" : "border-white/5"
              )}>
                <span className={cn(
                  "font-medium text-muted-foreground min-w-0 mr-1 truncate",
                  isMobile ? "text-[10px]" : "text-sm"
                )}>
                  {form.categoria || (isMobile ? "Selecione" : "Selecione uma categoria")}
                </span>
                <Select
                  value={form.categoria}
                  onValueChange={(value) => handleFieldChange("categoria", value)}
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
                  onClick={() => handleFieldChange("tipo", "Fixa")}
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
                  onClick={() => handleFieldChange("tipo", "Variável")}
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

          {/* Configuração de Pagamento */}
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="space-y-0.5 sm:space-y-2">
              <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Configuração de Pagamento</Label>
              <div className="flex flex-col gap-2">
                <div className={cn(
                  "flex items-center justify-between rounded-lg md:rounded-2xl border border-white/5 bg-muted/20 shadow-sm",
                  isMobile ? "h-8 px-1.5" : "h-12 px-5",
                  form.isRecorrente && "border-primary/30"
                )}>
                  <span className={isMobile ? "text-[9px] font-medium text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>
                    {isMobile ? "Repete todo mês?" : "Esta conta se repete todo mês?"}
                  </span>
                  <Switch
                    id="bill-recorrente"
                    className={isMobile ? "scale-[0.6] origin-right" : "scale-100"}
                    checked={form.isRecorrente}
                    onCheckedChange={(checked) => {
                      onFormChange({ ...form, isRecorrente: checked, isParcelado: checked ? false : form.isParcelado })
                    }}
                    disabled={form.isParcelado}
                  />
                </div>

                {!isEditing && (
                  <div className={cn(
                    "flex items-center justify-between rounded-lg md:rounded-2xl border border-white/5 bg-muted/20 shadow-sm transition-all",
                    isMobile ? "h-8 px-1.5" : "h-12 px-5",
                    form.isParcelado && "border-primary/30 bg-primary/5"
                  )}>
                    <span className={isMobile ? "text-[9px] font-medium text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>
                      {isMobile ? "É uma conta parcelada?" : "Essa conta é parcelada?"}
                    </span>
                    <Switch
                      id="bill-parcelado"
                      className={isMobile ? "scale-[0.6] origin-right" : "scale-100"}
                      checked={form.isParcelado || false}
                      onCheckedChange={(checked) => {
                        onFormChange({ 
                          ...form, 
                          isParcelado: checked, 
                          isRecorrente: checked ? false : form.isRecorrente,
                          parcelasTotal: checked ? form.parcelasTotal || 1 : undefined,
                          parcelasPagas: checked ? form.parcelasPagas || 0 : undefined,
                        })
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Campos de Parcelamento */}
            {form.isParcelado && !isEditing && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex-1 space-y-0.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-primary/80">Total de Parcelas</Label>
                      {errors.parcelasTotal && <span className="text-[8px] md:text-[10px] font-bold text-destructive animate-pulse uppercase">{errors.parcelasTotal}</span>}
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ex: 12"
                      value={form.parcelasTotal || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value.replace(/\D/g, ""));
                        onFormChange({ ...form, parcelasTotal: val > 0 ? val : undefined });
                        if (errors.parcelasTotal) handleFieldChange("parcelasTotal", val);
                      }}
                      className={cn(
                        "bg-primary/5 border-primary/20 rounded-lg md:rounded-2xl text-primary font-bold transition-all",
                        isMobile ? "h-8 text-[10px] px-2" : "h-12 px-5",
                        errors.parcelasTotal ? "border-destructive/50 ring-1 ring-destructive/20" : ""
                      )}
                    />
                  </div>
                  <div className="flex-1 space-y-0.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-primary/80">Parcelas Pagas</Label>
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ex: 2 (opcional)"
                      value={form.parcelasPagas || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value.replace(/\D/g, ""));
                        onFormChange({ ...form, parcelasPagas: val >= 0 ? val : 0 });
                      }}
                      className={cn(
                        "bg-primary/5 border-primary/20 rounded-lg md:rounded-2xl text-primary font-bold transition-all",
                        isMobile ? "h-8 text-[10px] px-2" : "h-12 px-5"
                      )}
                    />
                  </div>
                </div>

                {/* Dica Visual de Parcelamento */}
                {!!form.parcelasTotal && !!parseCurrencyInput(form.valor) && (
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3 mt-1 animate-in zoom-in-95 duration-300">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-70">Restantes</p>
                      <p className="text-sm font-bold text-foreground">{Math.max(0, (form.parcelasTotal || 0) - (form.parcelasPagas || 0))}x</p>
                    </div>
                    <div className="space-y-0.5 border-l border-primary/10 pl-3">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-70">Saldo Devedor</p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(Math.max(0, (form.parcelasTotal || 0) - (form.parcelasPagas || 0)) * parseCurrencyInput(form.valor))}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Outros (Apenas Desktop) */}
          {form.categoria === "Outros" && !isMobile && (
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
            onClick={handleSave}
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