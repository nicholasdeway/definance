"use client"

import { Fragment } from "react"
import { Check, Plus, Trash2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn, generateId } from "@/lib/utils"
import { useOnboarding } from "@/components/onboarding/hooks/use-onboarding"
import { fixedExpenseCategories } from "@/components/onboarding/constants"
import { FieldLabel } from "@/components/onboarding/components/field-label"
import { Button } from "@/components/ui/button"
import { useAutoSave } from "@/components/onboarding/hooks/use-auto-save"
import { parseCurrencyInput, formatCurrency } from "@/lib/currency"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { useState } from "react"

export const FixedExpensesSection = ({ onSavingStateChange }: { onSavingStateChange?: (saving: boolean) => void }) => {
  const { 
    selectedExpenses, 
    setSelectedExpenses, 
    customExpenses, 
    setCustomExpenses, 
    wasAttempted 
  } = useOnboarding()
  const { persistStep } = useAutoSave()

  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    onSavingStateChange?.(true);
    try {
      const success = await persistStep(4, { selectedExpenses, customExpenses });
      if (success) {
        await apiClient("/api/onboarding/sync-fixed-expenses", { method: "POST" });
        window.dispatchEvent(new CustomEvent("finance-update"));
        toast({ title: "Despesas salvas com sucesso!", variant: "default" });
      } else {
        toast({ title: "Erro ao salvar", description: "Tente novamente mais tarde.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Erro inesperado", variant: "destructive" });
    } finally {
      setIsSaving(false);
      onSavingStateChange?.(false);
    }
  }
  const toggleExpense = (key: string) => {
    setSelectedExpenses(prev => {
      const next = { ...prev }
      if (key in next) delete next[key]
      else next[key] = 0
      return next
    })
  }

  const setExpenseValue = (key: string, raw: string) => {
    const decimalValue = parseCurrencyInput(raw)
    setSelectedExpenses(prev => ({ ...prev, [key]: decimalValue }))
  }



  const addCustomExpense = () => {
    setCustomExpenses(prev => [
      ...prev,
      { id: generateId(), titulo: "", valor: 0 }
    ])
  }

  const removeCustomExpense = (id: string) => {
    setCustomExpenses(prev => prev.filter(e => e.id !== id))
  }

  const updateCustomExpense = (id: string, field: "titulo" | "valor", value: string | number) => {
    if (field === "valor") {
        value = parseCurrencyInput(String(value))
    }
    setCustomExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, [field]: value } : e))
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest">
        Selecione as categorias e informe o valor mensal.
      </p>

      {/* Grade de categorias */}
      <div className="grid grid-cols-3 gap-2">
        {fixedExpenseCategories.map((cat) => {
          const isSelected = cat.key in selectedExpenses
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => toggleExpense(cat.key)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all cursor-pointer",
                isSelected
                  ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/10"
                  : "border-border/50 bg-muted/20 hover:border-primary/20 hover:bg-primary/5"
              )}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/20">
                  <Check className="h-2 w-2 text-primary" />
                </div>
              )}
              <cat.icon className={cn("h-4 w-4 transition-colors", isSelected ? "text-primary" : "text-muted-foreground/60")} />
              <span className={cn("text-[9px] font-medium leading-tight tracking-tight", isSelected ? "text-primary" : "text-muted-foreground")}>{cat.label}</span>
              {isSelected && selectedExpenses[cat.key] !== undefined && selectedExpenses[cat.key] > 0 && (
                <span className="text-[8px] text-primary">
                  {formatCurrency(selectedExpenses[cat.key])}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Inputs de valor para categorias pré-definidas selecionadas */}
      {Object.keys(selectedExpenses).length > 0 && (
        <div className="space-y-3 border-t border-border/50 pt-4">
          {/* Seção 1: Contas de Consumo */}
          {fixedExpenseCategories.some(c => ["luz", "agua", "celular"].includes(c.key) && c.key in selectedExpenses) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-border/50" />
                <span className="text-[8px] text-muted-foreground/40 uppercase tracking-wider">Contas de Consumo</span>
                <span className="h-px flex-1 bg-border/50" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {fixedExpenseCategories
                  .filter((cat) => ["luz", "agua", "celular"].includes(cat.key) && cat.key in selectedExpenses)
                  .map((cat, idx, arr) => {
                    const isLastAndOdd = arr.length % 2 !== 0 && idx === arr.length - 1;
                    return (
                      <div 
                        key={cat.key} 
                        className={cn(
                          "flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-2.5",
                          isLastAndOdd && "sm:col-span-2"
                        )}
                      >
                        <cat.icon className="h-5 w-5 text-primary transition-colors" />
                        <div className="flex-1 space-y-1">
                          <FieldLabel 
                            label={cat.label} 
                            required 
                            isEmpty={!selectedExpenses[cat.key]} 
                            wasAttempted={wasAttempted} 
                            className="text-xs"
                          />
                          <CurrencyInput
                            id={`exp-${cat.key}`}
                            placeholder={cat.placeholder}
                            value={selectedExpenses[cat.key] !== undefined ? Math.round(Number(selectedExpenses[cat.key]) * 100).toString() : ""}
                            onChange={(value) => setExpenseValue(cat.key, value)}
                            className={cn(
                              "h-8 bg-background text-sm",
                              wasAttempted && !selectedExpenses[cat.key] && "border-destructive/50"
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Seção 2: Moradia, Serviços e Outros (Grid compacto) */}
          {fixedExpenseCategories.some(c => !["luz", "agua", "celular"].includes(c.key) && c.key in selectedExpenses) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-border/50" />
                <span className="text-[8px] text-muted-foreground/40 uppercase tracking-wider">Moradia, Assinaturas e Serviços</span>
                <span className="h-px flex-1 bg-border/50" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {fixedExpenseCategories
                  .filter((cat) => !["luz", "agua", "celular"].includes(cat.key) && cat.key in selectedExpenses)
                  .map((cat, idx, arr) => {
                    const isLastAndOdd = arr.length % 2 !== 0 && idx === arr.length - 1;
                    return (
                      <div 
                        key={cat.key} 
                        className={cn(
                          "flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-2.5",
                          isLastAndOdd && "sm:col-span-2"
                        )}
                      >
                        <cat.icon className="h-5 w-5 text-primary" />
                        <div className="flex-1 space-y-1">
                          <FieldLabel 
                            label={cat.label} 
                            required 
                            isEmpty={!selectedExpenses[cat.key]} 
                            wasAttempted={wasAttempted} 
                            className="text-xs"
                          />
                          <CurrencyInput
                            id={`exp-${cat.key}`}
                            placeholder={cat.placeholder}
                            value={selectedExpenses[cat.key] !== undefined ? Math.round(Number(selectedExpenses[cat.key]) * 100).toString() : ""}
                            onChange={(value) => setExpenseValue(cat.key, value)}
                            className={cn(
                              "h-8 bg-background text-sm",
                              wasAttempted && !selectedExpenses[cat.key] && "border-destructive/50"
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gastos personalizados */}
      {customExpenses.length > 0 && (
        <div className="space-y-4 border-t border-border/50 pt-4">
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-border/50" />
            <span className="text-[8px] text-muted-foreground/40 uppercase tracking-wider">Gastos Personalizados</span>
            <span className="h-px flex-1 bg-border/50" />
          </div>
          <div className="space-y-3">
            {customExpenses.map((exp, idx) => (
              <div key={exp.id} className="group relative space-y-3 rounded-xl border border-border/50 bg-muted/20 p-3 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Item {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomExpense(exp.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive cursor-pointer"
                    aria-label={`Remover gasto ${idx + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <FieldLabel 
                      label="Nome do gasto" 
                      required 
                      isEmpty={!exp.titulo} 
                      wasAttempted={wasAttempted} 
                      className="text-xs"
                    />
                    <Input
                      id={`custom-titulo-${exp.id}`}
                      type="text"
                      placeholder="Ex: Condomínio, Seguro..."
                      value={exp.titulo || ""}
                      onChange={(e) => updateCustomExpense(exp.id, "titulo", e.target.value)}
                      className={cn(
                        "h-8 bg-background text-sm font-medium",
                        wasAttempted && !exp.titulo && "border-destructive/50"
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel 
                      label="Valor mensal" 
                      required 
                      isEmpty={!exp.valor || exp.valor === 0} 
                      wasAttempted={wasAttempted} 
                      className="text-xs"
                    />
                    <CurrencyInput
                      id={`custom-valor-${exp.id}`}
                      placeholder="R$ 0,00"
                      value={exp.valor ? Math.round(Number(exp.valor) * 100).toString() : ""}
                      onChange={(value) => updateCustomExpense(exp.id, "valor", value)}
                      className="h-8 bg-background text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão adicionar personalizado */}
      <button
        type="button"
        onClick={addCustomExpense}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 p-3 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-primary cursor-pointer"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
        Adicionar outra despesa fixa
      </button>

      <div className="flex items-center justify-end pt-4 border-t border-border/50 mt-3">
        <Button 
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={handleSave}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary/70 dark:hover:bg-primary text-xs cursor-pointer"
        >
          {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Despesas"}
        </Button>
      </div>
    </div>
  )
}