"use client"

import { Info, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useOnboarding } from "../hooks/use-onboarding"
import { FieldLabel } from "../components/field-label"
import { Debt } from "../types"

export const Step5Debts = () => {
  const { 
    debts, 
    setDebts, 
    wasAttempted 
  } = useOnboarding()

  // Formata dígitos brutos (centavos) para exibição em BRL
  function displayBRL(digits: string): string {
    if (!digits) return ""
    const number = parseInt(digits, 10) / 100
    return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const addDebt = () => {
    setDebts(prev => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        descricao: "",
        valor: "",
        parcelado: false,
        parcelasTotal: "",
        parcelasPagas: "",
      },
    ])
  }

  const removeDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id))
  }

  const updateDebt = (id: string, field: keyof Omit<Debt, "id">, value: string | boolean) => {
    setDebts(prev => prev.map(d => (d.id === id ? { ...d, [field]: value } : d)))
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
      <div className="space-y-3">
        {debts.map((debt, idx) => (
          <div
            key={debt.id || `d-${idx}`}
            className="space-y-3 rounded-xl border border-border/60 bg-background/50 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Dívida {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeDebt(debt.id)}
                className="text-muted-foreground transition-colors hover:text-destructive cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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

                  {/* Resumo calculado da dívida */}
                  {debt.parcelasTotal && debt.parcelasPagas && debt.valor && (
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-primary/10 bg-primary/5 p-3 sm:col-span-2">
                      {(() => {
                        const restantes = Math.max(0, parseInt(debt.parcelasTotal) - parseInt(debt.parcelasPagas))
                        const totalRestante = restantes * (parseInt(debt.valor) / 100)
                        return (
                          <>
                            <div>
                              <p className="text-[10px] text-muted-foreground">Parcelas restantes</p>
                              <p className="text-sm font-semibold text-card-foreground">{restantes}x</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground">Saldo devedor</p>
                              <p className="text-sm font-semibold text-primary">
                                {totalRestante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

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