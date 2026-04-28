"use client"

import React, { Fragment } from "react"
import { Check, Plus, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
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
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-2">
        {fixedExpenseCategories.map((cat, index) => {
          const isSelected = cat.key in selectedExpenses
          return (
            <motion.button
              key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              type="button"
              onClick={() => toggleExpense(cat.key)}
              className={cn(
                "relative flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 rounded-xl border p-2.5 sm:p-2 text-center sm:text-left transition-all duration-200 cursor-pointer group sm:h-[54px]",
                isSelected 
                  ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/10" 
                  : "border-white/5 bg-white/5 hover:border-primary/20 hover:bg-primary/5"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                isSelected 
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                  : "bg-white/10 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                <cat.icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-[10px] sm:text-[11px] font-bold leading-tight truncate block",
                  isSelected ? "text-primary" : "text-card-foreground"
                )}>
                  {cat.label}
                </span>
                {isSelected && selectedExpenses[cat.key] !== undefined && selectedExpenses[cat.key] > 0 && (
                  <span className="text-[9px] sm:text-[10px] font-bold text-primary block mt-0.5 animate-in fade-in slide-in-from-left-1">
                    {formatCurrency(selectedExpenses[cat.key])}
                  </span>
                )}
              </div>

              {isSelected && (
                <div className="absolute top-1 right-1 sm:static sm:shrink-0 h-3 w-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-2 w-2 text-primary" />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Inputs de valor para categorias pré-definidas selecionadas */}
      {Object.keys(selectedExpenses).length > 0 && (
        <div className="space-y-4 sm:space-y-6 border-t border-white/5 pt-4 sm:pt-6">
          {/* Seção 1: Contas com Opção de Empréstimo */}
          {fixedExpenseCategories.some(c => ["luz", "agua", "celular"].includes(c.key) && c.key in selectedExpenses) && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Contas de Consumo</span>
                <span className="h-px flex-1 bg-white/5" />
              </div>
              <div className="grid gap-3 sm:gap-4">
                {fixedExpenseCategories
                  .filter((cat) => ["luz", "agua", "celular"].includes(cat.key) && cat.key in selectedExpenses)
                  .map((cat) => (
                    <Fragment key={cat.key}>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 sm:p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <cat.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1 sm:space-y-1.5">
                          <FieldLabel 
                            label={cat.label} 
                            required 
                            isEmpty={!selectedExpenses[cat.key]} 
                            wasAttempted={wasAttempted} 
                            className="text-[10px] sm:text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider"
                          />
                          <CurrencyInput
                            id={`exp-${cat.key}`}
                            placeholder={cat.placeholder}
                            value={selectedExpenses[cat.key] !== undefined ? Math.round(Number(selectedExpenses[cat.key]) * 100).toString() : ""}
                            onChange={(value) => setExpenseValue(cat.key, value)}
                            className={cn(
                              "h-9 sm:h-10 bg-white/[0.03] border-white/10 text-sm font-medium sm:font-semibold rounded-lg sm:rounded-xl transition-all focus:bg-white/[0.05]",
                              wasAttempted && !selectedExpenses[cat.key] && "border-destructive/50"
                            )}
                          />
                        </div>
                      </motion.div>

                      {/* Sub-triagem para Empréstimo embutido em Contas de Consumo */}
                      {["luz", "agua", "celular"].includes(cat.key) && (
                        <div className="rounded-2xl border border-primary/10 bg-primary/[0.02] p-3 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="space-y-0.5">
                              <Label htmlFor={`loan-toggle-${cat.key}`} className="text-[10px] sm:text-[11px] font-bold text-primary/80 uppercase tracking-tight">
                                Empréstimo embutido?
                              </Label>
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Parcelas descontadas diretamente na conta</p>
                            </div>
                            <Switch
                              id={`loan-toggle-${cat.key}`}
                              checked={billLoans[cat.key]?.hasLoan || false}
                              onCheckedChange={() => toggleBillLoan(cat.key)}
                              className="scale-90 sm:scale-100"
                            />
                          </div>
                          {billLoans[cat.key]?.hasLoan && (
                            <div className="space-y-2.5 pt-3 border-t border-primary/10 animate-in zoom-in-95 duration-200">
                              <div className="space-y-1.5">
                                <FieldLabel 
                                  label="Valor da parcela" 
                                  required 
                                  isEmpty={!billLoans[cat.key]?.valor} 
                                  wasAttempted={wasAttempted} 
                                  className="text-[9px] sm:text-[10px] font-medium text-primary/60 uppercase tracking-wider"
                                />
                                <CurrencyInput
                                  id={`loan-value-${cat.key}`}
                                  placeholder="R$ 0,00"
                                  value={billLoans[cat.key]?.valor ? Math.round(Number(billLoans[cat.key].valor) * 100).toString() : ""}
                                  onChange={(value) => setBillLoanValue(cat.key, value)}
                                  className={cn(
                                    "h-8 sm:h-9 bg-white/[0.04] border-primary/10 text-xs sm:text-sm font-bold",
                                    wasAttempted && !billLoans[cat.key]?.valor && "border-destructive/50"
                                  )}
                                />
                              </div>
                              {!!selectedExpenses[cat.key] && !!billLoans[cat.key]?.valor && (
                                <div className="rounded-xl bg-white/[0.02] p-2.5 border border-primary/5 animate-in zoom-in-95 duration-200">
                                  <p className="text-[10px] sm:text-[11px] text-muted-foreground flex justify-between items-center">
                                    <span className="opacity-80">Consumo real:</span>
                                    <span className="font-bold text-primary text-[11px] sm:text-xs">
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
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Moradia, Assinaturas e Serviços</span>
                <span className="h-px flex-1 bg-white/5" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {fixedExpenseCategories
                  .filter((cat) => !["luz", "agua", "celular"].includes(cat.key) && cat.key in selectedExpenses)
                  .map((cat) => (
                    <motion.div 
                      key={cat.key} 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.02] p-2.5 sm:p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <cat.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <FieldLabel 
                          label={cat.label} 
                          required 
                          isEmpty={!selectedExpenses[cat.key]} 
                          wasAttempted={wasAttempted} 
                          className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                        />
                        <CurrencyInput
                          id={`exp-${cat.key}`}
                          placeholder={cat.placeholder}
                          value={selectedExpenses[cat.key] !== undefined ? Math.round(Number(selectedExpenses[cat.key]) * 100).toString() : ""}
                          onChange={(value) => setExpenseValue(cat.key, value)}
                          className={cn(
                            "h-8 sm:h-9 bg-white/[0.03] border-white/10 text-sm font-medium sm:font-semibold rounded-lg sm:rounded-xl transition-all focus:bg-white/[0.05]",
                            wasAttempted && !selectedExpenses[cat.key] && "border-destructive/50"
                          )}
                        />
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gastos personalizados */}
      {customExpenses.length > 0 && (
        <div className="space-y-4 border-t border-white/5 pt-4 sm:pt-6">
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gastos Personalizados</span>
            <span className="h-px flex-1 bg-white/5" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            {customExpenses.map((exp, idx) => (
              <motion.div 
                key={exp.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative space-y-3 sm:space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3 sm:p-4 pb-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Item #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomExpense(exp.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive cursor-pointer p-1 rounded-lg hover:bg-destructive/10"
                    aria-label={`Remover gasto ${idx + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <FieldLabel 
                      label="Nome do gasto" 
                      required 
                      isEmpty={!exp.titulo} 
                      wasAttempted={wasAttempted} 
                      className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                    />
                    <Input
                      id={`custom-titulo-${exp.id}`}
                      type="text"
                      placeholder="Ex: Condomínio, Seguro..."
                      value={exp.titulo || ""}
                      onChange={(e) => updateCustomExpense(exp.id, "titulo", e.target.value)}
                      className={cn(
                        "h-8 sm:h-9 bg-white/[0.03] border-white/10 text-xs sm:text-sm font-medium sm:font-semibold rounded-lg sm:rounded-xl transition-all focus:bg-white/[0.05]",
                        wasAttempted && !exp.titulo && "border-destructive/50"
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel 
                      label="Valor mensal" 
                      required 
                      isEmpty={!exp.valor || exp.valor === 0} 
                      wasAttempted={wasAttempted} 
                      className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                    />
                    <CurrencyInput
                      id={`custom-valor-${exp.id}`}
                      placeholder="R$ 0,00"
                      value={exp.valor ? Math.round(Number(exp.valor) * 100).toString() : ""}
                      onChange={(value) => updateCustomExpense(exp.id, "valor", value)}
                      className={cn(
                        "h-8 sm:h-9 bg-white/[0.03] border-white/10 text-xs sm:text-sm font-medium sm:font-semibold rounded-lg sm:rounded-xl transition-all focus:bg-white/[0.05]",
                        wasAttempted && (!exp.valor || exp.valor === 0) && "border-destructive/50"
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Botão adicionar personalizado */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="button"
        onClick={addCustomExpense}
        className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 p-3 sm:p-4 text-xs sm:text-[13px] font-bold text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary cursor-pointer mt-2"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-primary/20 group-hover:text-primary">
          <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
        </div>
        Adicionar outra despesa fixa
      </motion.button>
    </div>
  )
}