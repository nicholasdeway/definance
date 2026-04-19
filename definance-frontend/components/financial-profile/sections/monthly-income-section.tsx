"use client"

import React from "react"
import { AlertCircle, CalendarDays, Coins } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CurrencyInput } from "@/components/ui/currency-input"
import { useOnboarding } from "@/components/onboarding/hooks/use-onboarding"
import { FieldLabel } from "@/components/onboarding/components/field-label"
import { incomeTypes, incomeFrequencies } from "@/components/onboarding/constants"
import { IncomeDetail, IncomeFrequency } from "@/components/onboarding/types"
import { useAutoSave } from "@/components/onboarding/hooks/use-auto-save"

export const MonthlyIncomeSection = () => {
  const { 
    selectedIncomeTypes,
    incomes, 
    setIncomes,
    wasAttempted 
  } = useOnboarding()
  const { persistStep } = useAutoSave()

  // Sincronizar array de rendas: Garantir que cada tipo selecionado tenha um objeto de detalhe
  React.useEffect(() => {
    setIncomes(prev => {
      const updated = [...prev]
      let changed = false
      selectedIncomeTypes.forEach(tipoStr => {
        if (!updated.find(i => i.tipo === tipoStr)) {
          updated.push({
            id: Math.random().toString(36).slice(2),
            tipo: tipoStr,
            valor: 0,
            frequencia: IncomeFrequency.FIXO_MENSAL,
            diasRecebimento: ""
          })
          changed = true
        }
      })
      return changed ? updated : prev
    })
  }, [selectedIncomeTypes, setIncomes])

  function displayBRL(value: number): string {
    if (!value) return ""
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const updateIncome = (tipo: string, field: keyof Omit<IncomeDetail, "id" | "tipo">, value: any) => {
    setIncomes(prev => prev.map(inc => {
      if (inc.tipo === tipo) {
        if (field === "frequencia" && (value === IncomeFrequency.VARIAVEL || value === IncomeFrequency.SEMANAL)) {
           return { ...inc, [field]: value, diasRecebimento: "" }
        }
        return { ...inc, [field]: value }
      }
      return inc
    }))
  }

  const updateIncomeValue = (tipo: string, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "")
    const decimalValue = Number(digits) / 100
    updateIncome(tipo, "valor", decimalValue)
  }

  const totalIncome = incomes?.reduce((acc, curr) => acc + curr.valor, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest opacity-70">Fontes de Renda</p>
        <div className="flex items-center gap-2 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          <span className="text-[10px] font-bold text-primary uppercase">Total:</span>
          <span className="text-[10px] font-black text-primary">{displayBRL(totalIncome)}</span>
        </div>
      </div>

      {selectedIncomeTypes.length === 0 && (
         <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-2xl bg-muted/20 border-border/40">
            <Coins className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Nenhuma renda básica definida</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Vá na aba "Modelo Renda" e escolha como você recebe.</p>
         </div>
      )}

      <div className="grid gap-4">
        {selectedIncomeTypes.map((tipoValue) => {
          const typeInfo = incomeTypes.find(t => t.value === tipoValue)
          const inc = incomes.find(i => i.tipo === tipoValue) || {
            valor: 0, frequencia: IncomeFrequency.FIXO_MENSAL, diasRecebimento: ""
          }
          
          const hasError = wasAttempted && (
            !inc.valor || 
            inc.valor === 0 || 
            !inc.frequencia || 
            ((inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL) && (!inc.diasRecebimento || inc.diasRecebimento.trim() === ""))
          )

          if (!typeInfo) return null

          return (
            <div key={typeInfo.value} className={cn(
               "rounded-xl border bg-background overflow-hidden transition-all duration-300",
               hasError ? "border-destructive/40 shadow-[0_0_10px_rgba(239,68,68,0.05)]" : "border-border/60 hover:border-primary/30"
            )}>
              {/* Mini Header dentro do Card */}
              <div className="bg-muted/30 px-4 py-3 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <typeInfo.icon className="h-4 w-4 text-primary" />
                   <span className="text-xs font-bold text-card-foreground uppercase tracking-wide">{typeInfo.label}</span>
                </div>
                {hasError && <AlertCircle className="h-3 w-3 text-destructive animate-pulse" />}
              </div>

              <div className="p-4 space-y-4">
                 {/* Valor */}
                 <div className="space-y-1.5">
                   <FieldLabel 
                     label={inc.frequencia === IncomeFrequency.VARIAVEL ? "Valor médio mensal" : "Valor do Salário / Pro-labore"} 
                     required 
                     isEmpty={!inc.valor || inc.valor === 0} 
                     wasAttempted={wasAttempted} 
                   />
                   <CurrencyInput
                     id={`income-${typeInfo.value}`}
                     placeholder="R$ 0,00"
                     value={inc.valor ? (inc.valor * 100).toString() : ""}  // Multiplicar por 100 para exibir
                     onChange={(value) => updateIncomeValue(typeInfo.value, value)}
                     className="h-11 text-base font-bold bg-muted/5 focus:bg-background transition-colors"
                   />
                 </div>

                 {/* Frequencia */}
                 <div className="space-y-1.5">
                   <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-70">Frequência de Recebimento</Label>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {incomeFrequencies.map(freq => {
                         const isSelected = inc.frequencia === freq.value
                         return (
                            <button
                               key={freq.value}
                               type="button"
                               onClick={() => updateIncome(typeInfo.value, "frequencia", freq.value)}
                               className={cn(
                                  "text-[10px] p-2 leading-tight rounded-lg border font-bold transition-all uppercase tracking-tighter",
                                  isSelected 
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]" 
                                    : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50 hover:border-border"
                               )}
                            >
                               {freq.label}
                            </button>
                         )
                      })}
                   </div>
                 </div>

                 {/* Dias de Recebimento (Definance Helper) */}
                 {(inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL) && (
                   <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-400">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-none mt-1">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                         <Label className="text-[10px] font-black text-primary uppercase tracking-widest">Ajudante Definance:</Label>
                         <Input
                           type="text"
                           placeholder={inc.frequencia === IncomeFrequency.FIXO_MENSAL ? "Qual o dia do pagamento? (Ex: dia 5 ou todo dia 1)" : "Quais os dois dias? (Ex: dia 5 e dia 20)"}
                           value={inc.diasRecebimento || ""}
                           onChange={(e) => updateIncome(typeInfo.value, "diasRecebimento", e.target.value)}
                           className="h-8 text-xs bg-background border-primary/20 focus:border-primary/40"
                         />
                         <p className="text-[9px] text-muted-foreground italic font-medium">
                            O Definance usará esta data para projetar seu saldo futuro automaticamente.
                         </p>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-end pt-6 border-t border-border/20 mt-4">
        <Button 
          type="button" 
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
          onClick={async () => {
            const btn = document.activeElement as HTMLButtonElement
            if (btn) {
              const originalText = btn.innerText
              btn.innerText = "Salvando..."
              btn.disabled = true
              
              const success = await persistStep(3, incomes)
              
              btn.disabled = false
              if (success) {
                btn.innerText = "Salvo!"
                setTimeout(() => { if (btn) btn.innerText = originalText }, 2000)
              } else {
                btn.innerText = "Erro ao Salvar"
                setTimeout(() => { if (btn) btn.innerText = originalText }, 3000)
              }
            }
          }}
        >
          Salvar Informações
        </Button>
      </div>
    </div>
  )
}