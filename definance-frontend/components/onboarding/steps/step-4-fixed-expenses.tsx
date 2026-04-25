"use client"

import React, { Fragment } from "react"
import { Check, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn, generateId } from "@/lib/utils"
import { CurrencyInput } from "@/components/ui/currency-input"
import { useOnboarding } from "../hooks/use-onboarding"
import { fixedExpenseCategories } from "../constants"
import { FieldLabel } from "../components/field-label"
import { parseCurrencyInput, formatCurrency } from "@/lib/currency"

export const Step4FixedExpenses = () => {
  const { 
    selectedExpenses, 
    setSelectedExpenses, 
    customExpenses, 
    setCustomExpenses, 
    billLoans, 
    setBillLoans, 
    wasAttempted 
  } = useOnboarding()


  const toggleExpense = (key: string) => {
    setSelectedExpenses(prev => {
      const next = { ...prev }
      if (key in next) delete next[key]
      else next[key] = 0
      return next
    })
  }

  const setExpenseValue = (key: string, raw: string) => {
    setSelectedExpenses(prev => ({ ...prev, [key]: parseCurrencyInput(raw) }))
  }

  const toggleBillLoan = (key: string) => {
    setBillLoans(prev => ({
      ...prev,
      [key]: { hasLoan: !prev[key]?.hasLoan, valor: prev[key]?.valor || 0 }
    }))
  }

  const setBillLoanValue = (key: string, raw: string) => {
    setBillLoans(prev => ({
      ...prev,
      [key]: { ...prev[key], valor: parseCurrencyInput(raw) }
    }))
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
    let finalValue = value
    if (field === "valor" && typeof value === "string") {
      try {
        finalValue = parseCurrencyInput(value)
      } catch (error) {
        console.error("Erro ao converter valor:", error)
        finalValue = 0
      }
    }

    setCustomExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, [field]: finalValue } : e))
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Toque nas categorias que se aplicam a você e informe o valor mensal.
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
              className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all hover:border-primary/50 cursor-pointer ${
                isSelected ? "border-primary bg-primary/5" : "border-border bg-background/50"
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/70">
                  <Check className="h-2 w-2 text-primary-foreground" />
                </div>
              )}
              <cat.icon className={cn("h-6 w-6 transition-colors", isSelected ? "text-primary" : "text-muted-foreground")} />
              <span className="text-xs font-medium leading-tight text-card-foreground">{cat.label}</span>
              {isSelected && selectedExpenses[cat.key] !== undefined && selectedExpenses[cat.key] > 0 && (
                <span className="text-[10px] font-semibold text-primary">
                  {formatCurrency(selectedExpenses[cat.key])}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Inputs de valor para categorias pré-definidas selecionadas */}
      {Object.keys(selectedExpenses).length > 0 && (
        <div className="space-y-6 border-t border-border/50 pt-4">
          {/* Seção 1: Contas com Opção de Empréstimo */}
          {fixedExpenseCategories.some(c => ["luz", "agua", "celular"].includes(c.key) && c.key in selectedExpenses) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-border/40" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contas de Consumo (Com Empréstimo)</span>
                <span className="h-px flex-1 bg-border/40" />
              </div>
              <div className="grid gap-4">
                {fixedExpenseCategories
                  .filter((cat) => ["luz", "agua", "celular"].includes(cat.key) && cat.key in selectedExpenses)
                  .map((cat) => (
                    <Fragment key={cat.key}>
                      <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/30 p-3">
                        <cat.icon className="h-6 w-6 text-primary" />
                        <div className="flex-1 space-y-1">
                          <FieldLabel 
                            label={cat.label} 
                            required 
                            isEmpty={!selectedExpenses[cat.key]} 
                            wasAttempted={wasAttempted} 
                          />
                          <CurrencyInput
                            id={`exp-${cat.key}`}
                            placeholder={cat.placeholder}
                            value={selectedExpenses[cat.key] !== undefined ? Math.round(Number(selectedExpenses[cat.key]) * 100).toString() : ""}
                            onChange={(value) => setExpenseValue(cat.key, value)}
                            className={cn(
                              "h-9 bg-background text-sm",
                              wasAttempted && !selectedExpenses[cat.key] && "border-destructive/50"
                            )}
                          />
                        </div>
                      </div>

                      {/* Sub-triagem para Empréstimo embutido em Contas de Consumo */}
                      {["luz", "agua", "celular"].includes(cat.key) && (
                        <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <div className="space-y-0.5">
                              <Label htmlFor={`loan-toggle-${cat.key}`} className="text-[11px] font-semibold text-primary/80 uppercase tracking-tight">
                                Empréstimo embutido?
                              </Label>
                              <p className="text-[9px] text-muted-foreground">Parcelas descontadas diretamente na conta</p>
                            </div>
                            <Switch
                              id={`loan-toggle-${cat.key}`}
                              checked={billLoans[cat.key]?.hasLoan || false}
                              onCheckedChange={() => toggleBillLoan(cat.key)}
                            />
                          </div>
                          {billLoans[cat.key]?.hasLoan && (
                            <div className="space-y-2 pt-2 border-t border-primary/10 animate-in zoom-in-95 duration-200">
                              <div className="space-y-1">
                                <FieldLabel 
                                  label="Valor da parcela de empréstimo" 
                                  required 
                                  isEmpty={!billLoans[cat.key]?.valor} 
                                  wasAttempted={wasAttempted} 
                                />
                                <CurrencyInput
                                  id={`loan-value-${cat.key}`}
                                  placeholder="R$ 0,00"
                                  value={billLoans[cat.key]?.valor ? Math.round(Number(billLoans[cat.key].valor) * 100).toString() : ""}
                                  onChange={(value) => setBillLoanValue(cat.key, value)}
                                  className={cn(
                                    "h-8 bg-background/50 text-xs font-medium",
                                    wasAttempted && !billLoans[cat.key]?.valor && "border-destructive/50"
                                  )}
                                />
                              </div>
                              {!!selectedExpenses[cat.key] && !!billLoans[cat.key]?.valor && (
                                <div className="rounded-lg bg-background/40 p-2 border border-primary/5 animate-in zoom-in-95 duration-200">
                                  <p className="text-[10px] text-muted-foreground flex justify-between items-center">
                                    <span className="opacity-80">Consumo real estimado:</span>
                                    <span className="font-bold text-primary text-xs">
                                      {formatCurrency(Math.max(0, (selectedExpenses[cat.key] || 0) - billLoans[cat.key].valor))}
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Fragment>
                  ))}
              </div>
            </div>
          )}

          {/* Seção 2: Moradia, Serviços e Outros (Grid compacto) */}
          {fixedExpenseCategories.some(c => !["luz", "agua", "celular"].includes(c.key) && c.key in selectedExpenses) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-border/40" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Moradia, Assinaturas e Serviços</span>
                <span className="h-px flex-1 bg-border/40" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {fixedExpenseCategories
                  .filter((cat) => !["luz", "agua", "celular"].includes(cat.key) && cat.key in selectedExpenses)
                  .map((cat) => (
                    <div key={cat.key} className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/30 p-2.5">
                      <cat.icon className="h-5 w-5 text-primary" />
                      <div className="flex-1 space-y-1">
                        <FieldLabel 
                          label={cat.label} 
                          required 
                          isEmpty={!selectedExpenses[cat.key]} 
                          wasAttempted={wasAttempted} 
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
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gastos personalizados */}
      {customExpenses.length > 0 && (
        <div className="space-y-4 border-t border-border/50 pt-4">
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-border/20" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gastos Personalizados</span>
            <span className="h-px flex-1 bg-border/20" />
          </div>
          <div className="space-y-3">
            {customExpenses.map((exp, idx) => (
              <div key={exp.id} className="group relative space-y-3 rounded-xl border border-border/40 bg-background/30 p-3 pb-4">
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
                    />
                    <CurrencyInput
                      id={`custom-valor-${exp.id}`}
                      placeholder="R$ 0,00"
                      value={exp.valor ? Math.round(Number(exp.valor) * 100).toString() : ""}
                      onChange={(value) => updateCustomExpense(exp.id, "valor", value)}
                      className={cn(
                        "h-8 bg-background text-sm font-medium",
                        wasAttempted && (!exp.valor || exp.valor === 0) && "border-destructive/50"
                      )}
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
        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 p-3 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary cursor-pointer"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
        Adicionar outra despesa fixa
      </button>
    </div>
  )
}