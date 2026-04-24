"use client"

import { useEffect } from "react"
import { AlertCircle, CalendarDays, Coins } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useOnboarding } from "../hooks/use-onboarding"
import { FieldLabel } from "../components/field-label"
import { incomeTypes, incomeFrequencies } from "../constants"
import { IncomeDetail, IncomeFrequency } from "../types"
import { CurrencyInput } from "@/components/ui/currency-input"
import { parseCurrencyInput } from "@/lib/currency"

export const Step3MonthlyIncome = () => {
  const { 
    selectedIncomeTypes,
    incomes,
    setIncomes,
    wasAttempted 
  } = useOnboarding()

  // Sincronizar array: Se ele escolheu CLT, garantir que exita um IncomeDetail base vazio pra ele preencher
  useEffect(() => {
    setIncomes(prev => {
      const updated = [...prev]
      selectedIncomeTypes.forEach(tipoStr => {
        if (!updated.find(i => i.tipo === tipoStr)) {
          updated.push({
            id: Math.random().toString(36).slice(2),
            tipo: tipoStr,
            valor: 0,
            frequencia: IncomeFrequency.FIXO_MENSAL,
            diasRecebimento: ""
          })
        }
      })
      return updated
    })
  }, [selectedIncomeTypes, setIncomes])

  const updateIncomeValue = (tipo: string, rawValue: string) => {
    const decimalValue = parseCurrencyInput(rawValue)
    updateIncome(tipo, "valor", decimalValue)
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

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground mb-4">
        Detalhe como funcionam seus ciclos de pagamentos para cada fonte de renda.
      </p>

      {selectedIncomeTypes.length === 0 && (
         <div className="flex flex-col items-center justify-center p-6 text-center border rounded-xl border-dashed bg-muted/20">
            <Coins className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma renda foi selecionada.</p>
            <p className="text-xs text-muted-foreground mt-1">Volte pelo botão e marque pelo menos uma.</p>
         </div>
      )}

      {selectedIncomeTypes.map((tipoValue) => {
        const typeInfo = incomeTypes.find(t => t.value === tipoValue)
        const inc = incomes.find(i => i.tipo === tipoValue) || {
          valor: 0, frequencia: IncomeFrequency.FIXO_MENSAL, diasRecebimento: ""
        }
        
        // Verifica se há erro para mostrar na UI da box
        const hasError = wasAttempted && (
          !inc.valor || 
          inc.valor === 0 || 
          !inc.frequencia || 
          ((inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL) && (!inc.diasRecebimento || inc.diasRecebimento.trim() === ""))
        )

        if (!typeInfo) return null

        return (
          <div key={typeInfo.value} className={cn(
             "rounded-xl border bg-background/50 overflow-hidden transition-all duration-300 relative",
             hasError ? "border-destructive/30 ring-1 ring-destructive/10" : "border-border/60"
          )}>
            {/* Header da Renda */}
            <div className="border-b border-border/40 bg-muted/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <typeInfo.icon className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-sm text-card-foreground">Renda {typeInfo.label}</h3>
                    <p className="text-[10px] text-muted-foreground">{typeInfo.description}</p>
                 </div>
              </div>
              {hasError && <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />}
            </div>

            {/* Configurações */}
            <div className="p-4 space-y-4">
               {/* Bloco 1: Valor Máximo ou Estimado */}
               <div className="space-y-1.5">
                 <FieldLabel 
                   label={inc.frequencia === IncomeFrequency.VARIAVEL ? "Valor médio estimado (Mês)" : "Valor do Salário / Recebimento"} 
                   required 
                   isEmpty={!inc.valor || inc.valor === 0} 
                   wasAttempted={wasAttempted} 
                 />
                 <CurrencyInput
                   id={`income-${typeInfo.value}`}
                   placeholder="R$ 0,00"
                   value={inc.valor ? Math.round(inc.valor * 100).toString() : ""}
                   onChange={(value) => updateIncomeValue(typeInfo.value, value)}
                   className={cn(
                     "h-10 bg-background text-sm font-medium",
                     wasAttempted && (!inc.valor || inc.valor === 0) && "border-destructive/50"
                   )}
                 />
               </div>

               {/* Bloco 2: Frequencia */}
               <div className="space-y-1.5 pt-2 border-t border-border/30">
                 <FieldLabel 
                   label="Frequência do pagamento" 
                   required 
                   isEmpty={!inc.frequencia} 
                   wasAttempted={wasAttempted} 
                 />
                 <div className="grid grid-cols-2 gap-2">
                    {incomeFrequencies.map(freq => {
                       const isSelected = inc.frequencia === freq.value
                       return (
                          <button
                             key={freq.value}
                             type="button"
                             onClick={() => updateIncome(typeInfo.value, "frequencia", freq.value)}
                             className={cn(
                                "text-center text-[10px] p-2 leading-tight rounded-md border font-medium transition-all cursor-pointer",
                                isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 border-border/60 hover:bg-muted"
                             )}
                          >
                             {freq.label}
                          </button>
                       )
                    })}
                 </div>
               </div>

               {/* Bloco 3: Dias (Apenas para mensais e quinzenais) */}
               {(inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL) && (
                 <div className="flex bg-primary/5 border border-primary/10 rounded-lg p-3 items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <CalendarDays className="h-5 w-5 text-primary shrink-0 flex-none" />
                    <div className="flex-1 space-y-1">
                       <FieldLabel 
                         label={inc.frequencia === IncomeFrequency.FIXO_MENSAL ? "Que dia cai o salário?" : "Quais os dois dias? (Adiant./Pag.)"} 
                         required 
                         isEmpty={!inc.diasRecebimento || inc.diasRecebimento.trim() === ""} 
                         wasAttempted={wasAttempted} 
                       />
                       <Input
                         type="text"
                         placeholder={inc.frequencia === IncomeFrequency.FIXO_MENSAL ? "Ex: dia 5, ou 5º dia útil..." : "Ex: dia 05 e dia 20"}
                         value={inc.diasRecebimento || ""}
                         onChange={(e) => updateIncome(typeInfo.value, "diasRecebimento", e.target.value)}
                         className={cn(
                           "h-8 text-xs bg-background/50 focus:bg-background",
                           wasAttempted && (!inc.diasRecebimento || inc.diasRecebimento.trim() === "") && "border-destructive/50"
                         )}
                       />
                       <p className="text-[9px] text-muted-foreground/80 leading-tight">
                         O Definance vai lançar as entradas todo mês baseado {inc.frequencia === IncomeFrequency.FIXO_MENSAL ? "neste dia" : "nestes dias"}.
                       </p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )
      })}
    </div>
  )
}