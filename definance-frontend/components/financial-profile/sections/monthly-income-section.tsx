"use client"

import React from "react"
import { AlertCircle, CalendarDays, Coins, Loader2 } from "lucide-react"
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
import { parseCurrencyInput, formatCurrency } from "@/lib/currency"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { useState, useMemo } from "react"
import { format, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { formatDateBR, generateId } from "@/lib/utils"

export const MonthlyIncomeSection = ({ onSavingStateChange }: { onSavingStateChange?: (saving: boolean) => void }) => {
  const { 
    selectedIncomeTypes,
    incomes, 
    setIncomes,
    wasAttempted,
    lastSavedHashesRef
  } = useOnboarding()
  const { persistStep } = useAutoSave()

  // Sincronizar array de rendas: Garantir que cada tipo selecionado tenha um objeto de detalhe
  React.useEffect(() => {
    setIncomes(prev => {
      const existingTypes = new Set(prev.map(i => i.tipo))
      const missingTypes = selectedIncomeTypes.filter(tipo => !existingTypes.has(tipo))

      if (missingTypes.length === 0) return prev

      const newEntries = missingTypes.map(tipo => ({
        id: generateId(),
        tipo,
        valor: 0,
        frequencia: IncomeFrequency.FIXO_MENSAL,
        diasRecebimento: ""
      }))

      return [...prev, ...newEntries]
    })
  }, [selectedIncomeTypes, setIncomes])

  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    onSavingStateChange?.(true);
    try {
      const previousIncomesRaw = lastSavedHashesRef.current[3]
      const previousIncomes: IncomeDetail[] = previousIncomesRaw ? JSON.parse(previousIncomesRaw) : []
      
      const incomesWithHistory = incomes.map(income => {
        const prev = previousIncomes.find((p: any) => p.tipo === income.tipo)
        
        // Se algo fundamental mudou (valor, frequencia, diasRecebimento)
        const hasChanged = prev && (
          prev.valor !== income.valor || 
          prev.frequencia !== income.frequencia || 
          prev.diasRecebimento !== income.diasRecebimento
        )

        if (hasChanged) {
          // Extraímos a data de início da nova configuração para definir até quando a antiga era válida
          const newStartDateStr = income.diasRecebimento?.split(',')[0].trim()
          let validoAte = new Date().toISOString()
          
          if (newStartDateStr) {
            const newStartDate = new Date(newStartDateStr)
            // A configuração antiga é válida até o último dia do mês anterior ao novo início
            const lastDayOfPrevMonth = new Date(newStartDate.getFullYear(), newStartDate.getMonth(), 0)
            validoAte = lastDayOfPrevMonth.toISOString()
          }

          return {
            ...income,
            configuradoEm: new Date().toISOString(),
            configuracaoAnterior: {
              valor: prev.valor,
              frequencia: prev.frequencia,
              diasRecebimento: prev.diasRecebimento,
              validoAte: validoAte
            }
          }
        }
        return income
      })

      const success = await persistStep(3, incomesWithHistory);
      if (success) {
        await apiClient("/api/onboarding/sync-incomes", { method: "POST" });
        setIncomes(incomesWithHistory); // Atualiza o estado local com a história para evitar "perder" na próxima comparação
        window.dispatchEvent(new CustomEvent("finance-update"));
        toast({ title: "Rendas salvas com sucesso!", variant: "default" });
      } else {
        toast({ title: "Erro ao salvar", description: "Tente novamente mais tarde.", variant: "destructive" });
      }
    } catch (e) {
      console.error("Erro ao salvar rendas:", e);
      toast({ title: "Erro inesperado", variant: "destructive" });
    } finally {
      setIsSaving(false);
      onSavingStateChange?.(false);
    }
  }

  const updateIncome = <K extends keyof Omit<IncomeDetail, "id" | "tipo">>(
    tipo: string, 
    field: K, 
    value: IncomeDetail[K]
  ) => {
    setIncomes(prev => prev.map(inc => {
      if (inc.tipo === tipo) {
        return { ...inc, [field]: value }
      }
      return inc
    }))
  }

  const updateIncomeValue = (tipo: string, rawValue: string) => {
    const decimalValue = parseCurrencyInput(rawValue)
    updateIncome(tipo, "valor", decimalValue)
  }

  const totalIncome = incomes?.reduce((acc, curr) => acc + curr.valor, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest opacity-70">Fontes de Renda</p>
        <div className="flex items-center gap-2 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          <span className="text-[10px] font-bold text-primary uppercase">Total:</span>
          <span className="text-[10px] font-black text-primary">{formatCurrency(totalIncome)}</span>
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
                     value={inc.valor ? Math.round(Number(inc.valor) * 100).toString() : ""}
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
                                    ? "bg-primary/70 text-primary-foreground border-primary/50 shadow-sm scale-[1.02]" 
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
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-400">
                       <div className="flex items-center gap-2">
                         <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center flex-none">
                           <CalendarDays className="h-3.5 w-3.5 text-primary" />
                         </div>
                         <Label className="text-[10px] font-black text-primary uppercase tracking-widest">Ajudante de Projeção:</Label>
                       </div>

                       {inc.frequencia === IncomeFrequency.FIXO_MENSAL ? (
                         <div className="space-y-1.5">
                            <Label className="text-[9px] uppercase font-bold text-muted-foreground/70">Data do Próximo Recebimento</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-9 justify-start text-left font-normal text-xs bg-background border-primary/20 hover:border-primary/40",
                                    !inc.diasRecebimento && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                                  {inc.diasRecebimento && isValid(parseISO(inc.diasRecebimento)) ? formatDateBR(inc.diasRecebimento) : <span>Escolha a data (DD/MM/AAAA)</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={(() => {
                                    if (!inc.diasRecebimento) return undefined
                                    try {
                                      const date = parseISO(inc.diasRecebimento)
                                      return isValid(date) ? date : undefined
                                    } catch { return undefined }
                                  })()}
                                  onSelect={(date) => {
                                    if (date && isValid(date)) {
                                      updateIncome(typeInfo.value, "diasRecebimento", format(date, "yyyy-MM-dd"))
                                    }
                                  }}
                                  locale={ptBR}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                         </div>
                       ) : (
                         <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1.5">
                              <Label className="text-[9px] uppercase font-bold text-muted-foreground/70">1º Recebimento</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-9 justify-start text-left font-normal text-xs bg-background border-primary/20 hover:border-primary/40",
                                      !inc.diasRecebimento?.split(',')[0] && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                                    {inc.diasRecebimento?.split(',')[0] ? formatDateBR(inc.diasRecebimento.split(',')[0]) : <span>Data 1</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={(() => {
                                       const dateStr = inc.diasRecebimento?.split(',')[0]
                                       if (!dateStr) return undefined
                                       try {
                                         const date = parseISO(dateStr)
                                         return isValid(date) ? date : undefined
                                       } catch { return undefined }
                                     })()}
                                    onSelect={(date) => {
                                      if (date && isValid(date)) {
                                        const dates = inc.diasRecebimento?.split(',') || ["", ""]
                                        updateIncome(typeInfo.value, "diasRecebimento", `${format(date, "yyyy-MM-dd")},${dates[1] || ""}`)
                                      }
                                    }}
                                    locale={ptBR}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                           </div>
                           <div className="space-y-1.5">
                              <Label className="text-[9px] uppercase font-bold text-muted-foreground/70">2º Recebimento</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-9 justify-start text-left font-normal text-xs bg-background border-primary/20 hover:border-primary/40",
                                      !inc.diasRecebimento?.split(',')[1] && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                                    {inc.diasRecebimento?.split(',')[1] ? formatDateBR(inc.diasRecebimento.split(',')[1]) : <span>Data 2</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={(() => {
                                       const dateStr = inc.diasRecebimento?.split(',')[1]
                                       if (!dateStr) return undefined
                                       try {
                                         const date = parseISO(dateStr)
                                         return isValid(date) ? date : undefined
                                       } catch { return undefined }
                                     })()}
                                    onSelect={(date) => {
                                      if (date && isValid(date)) {
                                        const dates = inc.diasRecebimento?.split(',') || ["", ""]
                                        updateIncome(typeInfo.value, "diasRecebimento", `${dates[0] || ""},${format(date, "yyyy-MM-dd")}`)
                                      }
                                    }}
                                    locale={ptBR}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                           </div>
                         </div>
                       )}
                       
                       <p className="text-[9px] text-muted-foreground italic font-medium leading-tight">
                          O Definance usará {inc.frequencia === IncomeFrequency.FIXO_MENSAL ? "esta data" : "estas datas"} para projetar suas entradas automaticamente nos próximos meses.
                       </p>
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
          disabled={isSaving}
          onClick={handleSave}
          className="w-full sm:w-auto bg-primary/70 text-primary-foreground hover:bg-primary font-bold cursor-pointer"
        >
          {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Informações"}
        </Button>
      </div>
    </div>
  )
}