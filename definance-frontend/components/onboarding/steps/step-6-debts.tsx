import { Info, Plus, Trash2, CreditCard, Landmark, AlertCircle, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn, generateId } from "@/lib/utils"
import { useOnboarding } from "../hooks/use-onboarding"
import { FieldLabel } from "../components/field-label"
import { parseCurrencyInput, formatCurrency } from "@/lib/currency"
import { Debt } from "../types"
import { useState } from "react"

export const Step6Debts = () => {
  const { 
    debts, 
    setDebts, 
    wasAttempted 
  } = useOnboarding()

  const [expandedValue, setExpandedValue] = useState<string | undefined>(undefined)



  const addDebt = () => {
    const newId = generateId()
    setDebts(prev => [
      ...prev,
      {
        id: newId,
        descricao: "",
        valor: 0,
        parcelado: false,
        parcelasTotal: 0,
        parcelasPagas: 0,
        vencimento: "",
      },
    ])
    setExpandedValue(newId)
  }

  const removeDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id))
  }

  const updateDebt = (id: string, field: keyof Omit<Debt, "id">, value: any) => {
    setDebts(prev => prev.map(d => (d.id === id ? { ...d, [field]: value } : d)))
  }

  const updateDebtValue = (id: string, raw: string) => {
    try {
      const val = parseCurrencyInput(raw)
      setDebts(prev => prev.map(d => (d.id === id ? { ...d, valor: val } : d)))
    } catch (error) {
      console.error("Erro ao converter valor da dívida:", error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Aviso */}
      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          Adicione suas dívidas principais aqui. Você pode detalhar com mais informações depois nas{" "}
          <span className="font-medium text-primary">configurações</span>.
        </p>
      </div>

      {/* Lista de dívidas */}
      <Accordion 
        type="single" 
        collapsible 
        value={expandedValue} 
        onValueChange={setExpandedValue} 
        className="space-y-3"
      >
        {debts.map((debt, idx) => {
          // Validação simples para indicador de erro no Trigger
          const hasError = wasAttempted && (
            (!debt.descricao || debt.descricao.trim().length === 0) ||
            (!debt.valor || debt.valor === 0) ||
            !debt.vencimento ||
            (debt.parcelado && (!debt.parcelasTotal || debt.parcelasTotal === 0))
          )

          const isExpanded = expandedValue === debt.id

          return (
            <AccordionItem 
              key={debt.id || `d-${idx}`} 
              value={debt.id} 
              className={cn(
                "rounded-xl border border-border/60 bg-background/50 overflow-hidden transition-all duration-300",
                isExpanded && "border-primary/30 ring-1 ring-primary/10 shadow-lg bg-background",
                hasError && "border-destructive/30"
              )}
            >
              <AccordionTrigger className="hover:no-underline px-5 py-5 group data-[state=open]:pb-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4 text-left">
                    <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all shadow-sm ring-1 ring-border/50",
                        isExpanded ? "bg-primary/20 scale-105 ring-primary/30" : "bg-muted/80"
                    )}>
                      <CreditCard className={cn("h-6 w-6", isExpanded ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-card-foreground tracking-tight">
                          {debt.descricao || `Dívida ${idx + 1}`}
                        </span>
                        {debt.parcelado && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider">
                                {debt.parcelasTotal ? `${debt.parcelasPagas || 0}/${debt.parcelasTotal}` : "Parcelado"}
                            </Badge>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground/60 mt-1">
                        {debt.valor ? formatCurrency(debt.valor) : "R$ 0,00"}
                      </span>
                      {hasError && (
                        <div className="flex items-center gap-1 text-[10px] text-destructive mt-1 font-semibold animate-pulse">
                          <AlertCircle className="h-3 w-3" /> Preenchimento pendente
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-6">
                    <span className="text-[10px] uppercase font-black text-muted-foreground/40 tracking-[0.2em] hidden sm:inline-block transition-colors hover:text-primary whitespace-nowrap">
                      {isExpanded ? "Recolher" : "Ver detalhes"}
                    </span>

                    <div className="h-6 w-px bg-border/40 hidden sm:block" />

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeDebt(debt.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          removeDebt(debt.id)
                        }
                      }}
                      className="p-2 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer shrink-0 z-10"
                      title="Remover dívida"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                <div className="pt-2 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <FieldLabel 
                      label="Descrição da dívida" 
                      required 
                      isEmpty={!debt.descricao || debt.descricao.trim().length === 0} 
                      wasAttempted={wasAttempted} 
                    />
                    <Input
                      id={`debt-desc-${debt.id}`}
                      type="text"
                      placeholder="Ex: Cartão de crédito, empréstimo..."
                      value={debt.descricao || ""}
                      onChange={(e) => updateDebt(debt.id, "descricao", e.target.value)}
                      className={cn(
                        "h-9 bg-background text-sm font-medium",
                        wasAttempted && (!debt.descricao || debt.descricao.trim().length === 0) && "border-destructive/50"
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel 
                      label="Valor Total" 
                      required 
                      isEmpty={!debt.valor || debt.valor === 0} 
                      wasAttempted={wasAttempted} 
                    />
                    <CurrencyInput
                      id={`debt-valor-${debt.id}`}
                      placeholder="R$ 0,00"
                      value={debt.valor ? Math.round(Number(debt.valor) * 100).toString() : ""}
                      onChange={(value) => updateDebtValue(debt.id, value)}
                      className={cn(
                        "h-9 bg-background font-medium",
                        wasAttempted && (!debt.valor || debt.valor === 0) && "border-destructive/50"
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel 
                      label="Vencimento / Início" 
                      required 
                      isEmpty={!debt.vencimento} 
                      wasAttempted={wasAttempted} 
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background h-9 px-3",
                            !debt.vencimento && "text-muted-foreground",
                            wasAttempted && !debt.vencimento && "border-destructive/50"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary opacity-70" />
                          <span className="text-sm">
                            {debt.vencimento ? format(parseISO(debt.vencimento), "dd/MM/yyyy") : "Selecione a data"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-[#0a0a0a]" align="start">
                        <Calendar
                          mode="single"
                          selected={debt.vencimento ? parseISO(debt.vencimento) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              updateDebt(debt.id, "vencimento", format(date, "yyyy-MM-dd"))
                            }
                          }}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor={`debt-parc-${debt.id}`} className="text-xs font-semibold text-primary/80 uppercase">
                      Parcelada?
                    </Label>
                    <Switch
                      id={`debt-parc-${debt.id}`}
                      checked={debt.parcelado}
                      onCheckedChange={(checked) => updateDebt(debt.id, "parcelado", checked)}
                    />
                  </div>
                  {debt.parcelado && (
                    <>
                      <div className="space-y-1.5 border-t border-border/50 pt-4 sm:col-span-2">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <FieldLabel 
                                label="Total de parcelas" 
                                required 
                                isEmpty={!debt.parcelasTotal || debt.parcelasTotal === 0} 
                                wasAttempted={wasAttempted} 
                                />
                                <Input
                                id={`debt-parcelas-total-${debt.id}`}
                                type="text"
                                inputMode="numeric"
                                placeholder="12"
                                value={debt.parcelasTotal || ""}
                                onChange={(e) => updateDebt(debt.id, "parcelasTotal", Number(e.target.value.replace(/\D/g, "")))}
                                className={cn(
                                    "h-9 bg-background text-sm",
                                    wasAttempted && debt.parcelado && (!debt.parcelasTotal || debt.parcelasTotal === 0) && "border-destructive/50"
                                )}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel label="Parcelas pagas" />
                                <Input
                                id={`debt-parcelas-pagas-${debt.id}`}
                                type="text"
                                inputMode="numeric"
                                placeholder="3"
                                value={debt.parcelasPagas || ""}
                                onChange={(e) => updateDebt(debt.id, "parcelasPagas", Number(e.target.value.replace(/\D/g, "")))}
                                className="h-9 bg-background text-sm"
                                />
                            </div>
                        </div>

                        {/* Resumo calculado da dívida */}
                        {!!debt.parcelasTotal && !!debt.valor && (
                          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in zoom-in-95 duration-300">
                            {(() => {
                                const pTotal = debt.parcelasTotal || 1
                                const pPagas = debt.parcelasPagas || 0
                                const valorTotal = debt.valor || 0
                                const vParcela = valorTotal / pTotal
                                const restantes = Math.max(0, pTotal - pPagas)
                                const totalRestante = restantes * vParcela
                                return (
                                <>
                                    <div className="space-y-0.5">
                                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Resíduo</p>
                                      <p className="text-base font-bold text-card-foreground">{restantes}x restantes</p>
                                    </div>
                                    <div className="space-y-0.5 border-l border-primary/10 pl-3">
                                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Saldo Aberto</p>
                                      <p className="text-base font-bold text-primary">
                                          {formatCurrency(totalRestante)}
                                      </p>
                                    </div>
                                </>
                                )
                            })()}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {/* Botão adicionar */}
      <button
        type="button"
        onClick={addDebt}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 p-3 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-primary cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Adicionar dívida
      </button>

      {debts.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Sem dívidas? Ótimo! Você pode pular esta etapa.
        </p>
      )}
    </div>
  )
}