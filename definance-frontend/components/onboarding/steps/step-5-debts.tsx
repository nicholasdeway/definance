import { Info, Plus, Trash2, CreditCard, Landmark, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useOnboarding } from "../hooks/use-onboarding"
import { FieldLabel } from "../components/field-label"
import { Debt } from "../types"
import { useState } from "react"

export const Step5Debts = () => {
  const { 
    debts, 
    setDebts, 
    wasAttempted 
  } = useOnboarding()

  const [expandedValue, setExpandedValue] = useState<string | undefined>(undefined)

  // Formata dígitos brutos (centavos) para exibição em BRL
  function displayBRL(digits: string): string {
    if (!digits) return ""
    const number = parseInt(digits, 10) / 100
    return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const addDebt = () => {
    const newId = Math.random().toString(36).slice(2)
    setDebts(prev => [
      ...prev,
      {
        id: newId,
        descricao: "",
        valor: "",
        parcelado: false,
        parcelasTotal: "",
        parcelasPagas: "",
      },
    ])
    setExpandedValue(newId)
  }

  const removeDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id))
  }

  const updateDebt = (id: string, field: keyof Omit<Debt, "id">, value: string | boolean) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        // Se trocar para parcelado, reseta o valor (opcionalmente) para evitar multiplicação errada
        if (field === "parcelado" && value === true) {
          return { ...d, [field]: value, valor: "" }
        }
        return { ...d, [field]: value }
      }
      return d
    }))
  }

  const updateDebtValue = (id: string, raw: string) => {
    const digits = raw.replace(/\D/g, "")
    setDebts(prev => prev.map(d => (d.id === id ? { ...d, valor: digits } : d)))
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
            (!debt.valor || parseInt(debt.valor) === 0) ||
            (debt.parcelado && (!debt.parcelasTotal || parseInt(debt.parcelasTotal) === 0))
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
              <div className="flex items-center px-2 sm:px-4 w-full gap-2">
                <AccordionTrigger className="flex-1 hover:no-underline py-4">
                  <div className="flex items-center justify-between w-full pr-2">
                    {/* Lado Esquerdo: Info Básica */}
                    <div className="flex items-center gap-3 text-left">
                      <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
                          isExpanded ? "bg-primary/20 scale-110" : "bg-muted"
                      )}>
                        <CreditCard className={cn("h-5 w-5", isExpanded ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-card-foreground">
                          {debt.descricao || `Dívida ${idx + 1}`}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground mt-0.5">
                          {debt.valor ? displayBRL(debt.valor) : "R$ 0,00"}
                        </span>
                        {hasError && (
                          <div className="flex items-center gap-1 text-[10px] text-destructive mt-0.5 font-medium animate-pulse">
                            <AlertCircle className="h-3 w-3" /> Pendente
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lado Direito: Status e Ações */}
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-1.5">
                        {debt.parcelado && (
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] h-4 px-1.5 flex items-center gap-0.5">
                                <Landmark className="h-2 w-2" /> 
                                {debt.parcelasTotal ? `${debt.parcelasPagas || 0}/${debt.parcelasTotal} parc` : "Parcelado"}
                            </Badge>
                        )}
                      </div>
                      
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider hidden sm:inline-block">
                        {isExpanded ? "Fechar" : "Ver detalhes"}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeDebt(debt.id)
                  }}
                  className="p-2 text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10 rounded-full cursor-pointer shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

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
                      label={debt.parcelado ? "Valor da parcela" : "Valor total"} 
                      required 
                      isEmpty={!debt.valor || parseInt(debt.valor) === 0} 
                      wasAttempted={wasAttempted} 
                    />
                    <Input
                      id={`debt-valor-${debt.id}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={debt.valor ? displayBRL(debt.valor) : ""}
                      onChange={(e) => updateDebtValue(debt.id, e.target.value)}
                      className={cn(
                        "h-9 bg-background font-medium",
                        wasAttempted && (!debt.valor || parseInt(debt.valor) === 0) && "border-destructive/50"
                      )}
                    />
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
                                isEmpty={!debt.parcelasTotal || parseInt(debt.parcelasTotal) === 0} 
                                wasAttempted={wasAttempted} 
                                />
                                <Input
                                id={`debt-ptotal-${debt.id}`}
                                type="text"
                                inputMode="numeric"
                                placeholder="12"
                                value={debt.parcelasTotal || ""}
                                onChange={(e) => updateDebt(debt.id, "parcelasTotal", e.target.value.replace(/\D/g, ""))}
                                className={cn(
                                    "h-9 bg-background text-sm",
                                    wasAttempted && debt.parcelado && (!debt.parcelasTotal || parseInt(debt.parcelasTotal) === 0) && "border-destructive/50"
                                )}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel label="Parcelas pagas" />
                                <Input
                                id={`debt-ppagas-${debt.id}`}
                                type="text"
                                inputMode="numeric"
                                placeholder="3"
                                value={debt.parcelasPagas || ""}
                                onChange={(e) => updateDebt(debt.id, "parcelasPagas", e.target.value.replace(/\D/g, ""))}
                                className="h-9 bg-background text-sm"
                                />
                            </div>
                        </div>

                        {/* Resumo calculado da dívida */}
                        {debt.parcelasTotal && debt.valor && (
                            <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                            {(() => {
                                const pTotal = parseInt(debt.parcelasTotal || "0")
                                const pPagas = parseInt(debt.parcelasPagas || "0")
                                const vParcela = parseInt(debt.valor || "0") / 100
                                const restantes = Math.max(0, pTotal - pPagas)
                                const totalRestante = restantes * vParcela
                                return (
                                <>
                                    <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Resíduo</p>
                                    <p className="text-sm font-semibold text-card-foreground">{restantes}x restantes</p>
                                    </div>
                                    <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Saldo Aberto</p>
                                    <p className="text-sm font-semibold text-primary">
                                        {totalRestante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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