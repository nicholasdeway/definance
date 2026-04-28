"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CalendarDays, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOnboarding } from "../hooks/use-onboarding"
import { FieldLabel } from "../components/field-label"
import { incomeTypes, incomeFrequencies } from "../constants"
import { IncomeDetail, IncomeFrequency } from "../types"
import { CurrencyInput } from "@/components/ui/currency-input"
import { parseCurrencyInput, formatCurrency } from "@/lib/currency"
import { format, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDateBR, generateId } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Step3MonthlyIncome = () => {
  const safeParseISO = (dateStr: string | undefined | null) => {
    if (!dateStr) return undefined
    try {
      const date = parseISO(dateStr)
      return isValid(date) ? date : undefined
    } catch (e) {
      return undefined
    }
  }

  const { 
    selectedIncomeTypes,
    incomes,
    setIncomes,
    wasAttempted 
  } = useOnboarding()

  // Sincronizar array: Se ele escolheu CLT, garantir que exista um IncomeDetail base vazio pra ele preencher
  useEffect(() => {
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

  const updateIncomeValue = (tipo: string, rawValue: string) => {
    const decimalValue = parseCurrencyInput(rawValue)
    updateIncome(tipo, "valor", decimalValue)
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

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-0 sm:gap-0.5 px-1">
        <h3 className="text-[13px] sm:text-sm font-bold text-foreground tracking-tight">Detalhes das Entradas</h3>
        <p className="text-[10px] sm:text-[10.5px] text-muted-foreground leading-relaxed">
          Configure seus ciclos de pagamentos.
        </p>
      </div>

      {selectedIncomeTypes.length === 0 && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="flex flex-col items-center justify-center p-8 sm:p-9 text-center border border-dashed rounded-2xl sm:rounded-[2rem] border-white/10 bg-white/5"
         >
            <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-3.5">
              <Coins className="h-5 sm:h-6 w-5 sm:w-6 text-primary/60" />
            </div>
            <p className="text-sm sm:text-sm font-bold text-foreground">Nenhuma renda selecionada</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 sm:mt-1 max-w-[180px] sm:max-w-[200px]">
              Selecione uma fonte de renda para prosseguir.
            </p>
         </motion.div>
      )}

      <div className={cn(
        "grid gap-3 sm:gap-4",
        selectedIncomeTypes.length > 1 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {selectedIncomeTypes.map((tipoValue, index) => {
          const typeInfo = incomeTypes.find(t => t.value === tipoValue)
          const inc = incomes.find(i => i.tipo === tipoValue) || {
            valor: 0, frequencia: IncomeFrequency.FIXO_MENSAL, diasRecebimento: ""
          }
          
          const hasError = wasAttempted && (
            !inc.valor || 
            inc.valor === 0 || 
            !inc.frequencia || 
            ((inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL) && (!inc.diasRecebimento || inc.diasRecebimento.trim() === "")) ||
            (inc.frequencia === IncomeFrequency.SEMANAL && (!inc.diaSemana || inc.diaSemana.trim() === ""))
          )

          if (!typeInfo) return null

          return (
            <motion.div 
              key={typeInfo.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "rounded-2xl sm:rounded-[1.8rem] border bg-white/[0.02] overflow-hidden transition-all duration-300 relative",
                hasError 
                  ? "border-destructive/20 bg-destructive/[0.01]" 
                  : "border-white/5 shadow-sm sm:shadow-lg sm:shadow-black/5"
              )}
            >
              {/* Header Compacto/Premium */}
              <div className="bg-white/[0.02] sm:bg-white/[0.03] p-3.5 sm:p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3 sm:gap-3.5">
                   <div className="flex h-9 sm:h-11 w-9 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      <typeInfo.icon className="h-4.5 sm:h-5.5 w-4.5 sm:w-5.5" />
                   </div>
                   <div className="space-y-0">
                      <h4 className="font-bold sm:font-black text-[13px] sm:text-[13px] text-foreground leading-none">{typeInfo.label}</h4>
                      <p className="text-[9px] sm:text-[9px] text-muted-foreground uppercase tracking-wider font-medium sm:font-bold">Fonte de Renda</p>
                   </div>
                </div>
                {hasError && <AlertCircle className="h-3.5 sm:h-3.5 w-3.5 sm:w-3.5 text-destructive animate-pulse" />}
              </div>

              {/* Form Content */}
              <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                 {/* Input de Valor */}
                 <div className="space-y-1.5 sm:space-y-2">
                   <div className="flex items-center justify-between">
                     <FieldLabel 
                       label={inc.frequencia === IncomeFrequency.VARIAVEL ? "Média Mensal" : "Valor"} 
                       required 
                       isEmpty={!inc.valor || inc.valor === 0} 
                       wasAttempted={wasAttempted} 
                       className="text-[10px] sm:text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider"
                     />
                     {!!inc.valor && inc.frequencia !== IncomeFrequency.FIXO_MENSAL && inc.frequencia !== IncomeFrequency.VARIAVEL && (
                       <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/10">
                         <span className="text-[8px] font-bold text-primary uppercase">Mês:</span>
                         <span className="text-[9px] sm:text-[9.5px] font-bold text-primary">
                           {formatCurrency(inc.frequencia === IncomeFrequency.SEMANAL ? inc.valor * 4 : inc.valor * 2)}
                         </span>
                       </div>
                     )}
                   </div>
                   
                   <CurrencyInput
                      id={`income-${typeInfo.value}`}
                      placeholder="R$ 0,00"
                      value={inc.valor ? Math.round(Number(inc.valor) * 100).toString() : ""}
                      onChange={(value) => updateIncomeValue(typeInfo.value, value)}
                      className={cn(
                        "h-10 sm:h-11 bg-white/[0.03] sm:bg-white/[0.04] border-white/10 sm:border-2 sm:border-white/5 text-sm sm:text-base font-bold sm:font-black rounded-xl sm:rounded-2xl transition-all focus:bg-white/[0.05]",
                        wasAttempted && (!inc.valor || inc.valor === 0) && "border-destructive/30 bg-destructive/[0.02]"
                      )}
                   />
                 </div>

                 {/* Seletor de Frequência */}
                 <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4 border-t border-white/5">
                   <FieldLabel 
                     label="Frequência" 
                     required 
                     isEmpty={!inc.frequencia} 
                     wasAttempted={wasAttempted} 
                     className="text-[10px] sm:text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider"
                   />
                   <div className="grid grid-cols-2 gap-2 sm:gap-2">
                      {incomeFrequencies.map(freq => {
                         const isSelected = inc.frequencia === freq.value
                         return (
                            <button
                               key={freq.value}
                               type="button"
                               onClick={() => updateIncome(typeInfo.value, "frequencia", freq.value)}
                               className={cn(
                                  "text-center text-[10px] sm:text-[10.5px] py-2 sm:py-3 px-1 rounded-xl sm:rounded-xl border font-bold sm:font-black transition-all duration-200",
                                  isSelected 
                                    ? "bg-primary/70 text-primary-foreground border-primary shadow-md sm:shadow-lg shadow-primary/10" 
                                    : "bg-white/[0.03] border-transparent text-muted-foreground hover:bg-white/[0.06] cursor-pointer"
                               )}
                            >
                               {freq.label.split(' (')[0]}
                            </button>
                         )
                      })}
                   </div>
                 </div>

                  {/* Detalhes do Ciclo */}
                  {(inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL || inc.frequencia === IncomeFrequency.SEMANAL) && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/[0.02] border border-primary/10 rounded-xl sm:rounded-[1.5rem] p-3.5 sm:p-4 space-y-3 sm:space-y-3.5"
                    >
                       <div className="flex items-center gap-2 sm:gap-2">
                          <CalendarDays className="h-3.5 sm:h-3.5 w-3.5 sm:w-3.5 text-primary/70" />
                          <span className="text-[9px] sm:text-[9.5px] font-bold sm:font-black text-primary uppercase tracking-wider">Ciclo Automático</span>
                       </div>

                       <div className="space-y-2.5">
                          <FieldLabel 
                            label={
                              inc.frequencia === IncomeFrequency.FIXO_MENSAL ? "Data do recebimento" : 
                              inc.frequencia === IncomeFrequency.QUINZENAL ? "Datas (quinzenas)" :
                              "Dia da semana"
                            } 
                            required 
                            isEmpty={
                              inc.frequencia === IncomeFrequency.SEMANAL ? !inc.diaSemana : (!inc.diasRecebimento || inc.diasRecebimento.trim() === "")
                            } 
                            wasAttempted={wasAttempted} 
                            className="text-[9px] font-bold"
                          />
                          
                          {inc.frequencia === IncomeFrequency.SEMANAL ? (
                             <Select
                               value={inc.diaSemana || ""}
                               onValueChange={(value) => updateIncome(typeInfo.value, "diaSemana", value)}
                             >
                               <SelectTrigger className="w-full h-9 bg-white/[0.04] border-primary/10 text-[11px] font-bold rounded-lg">
                                 <SelectValue placeholder="Escolha o dia" />
                               </SelectTrigger>
                               <SelectContent>
                                 {["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"].map((day) => (
                                   <SelectItem key={day} value={day} className="text-[11px] font-medium capitalize">
                                     {day === "terca" ? "Terça" : day === "sabado" ? "Sábado" : day.charAt(0).toUpperCase() + day.slice(1)}-feira
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                          ) : inc.frequencia === IncomeFrequency.FIXO_MENSAL ? (
                             <Popover>
                               <PopoverTrigger asChild>
                                 <Button
                                   variant="outline"
                                   className={cn(
                                     "w-full h-9 justify-start text-left font-bold text-[11px] bg-white/[0.04] border-primary/10 rounded-lg hover:bg-white/[0.06] transition-all",
                                     !inc.diasRecebimento && "text-muted-foreground",
                                     wasAttempted && (!inc.diasRecebimento || inc.diasRecebimento.trim() === "") && "border-destructive/30"
                                   )}
                                 >
                                   <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary/60" />
                                   {safeParseISO(inc.diasRecebimento) ? formatDateBR(inc.diasRecebimento) : <span>Definir data</span>}
                                 </Button>
                               </PopoverTrigger>
                               <PopoverContent className="w-auto p-0" align="start">
                                 <Calendar
                                   mode="single"
                                   selected={safeParseISO(inc.diasRecebimento)}
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
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                               <div className="space-y-1">
                                  <Popover>
                                     <PopoverTrigger asChild>
                                       <Button
                                         variant="outline"
                                         className={cn(
                                           "w-full h-8 justify-start text-left font-bold text-[10px] bg-white/[0.04] border-primary/10 rounded-lg px-2",
                                           !inc.diasRecebimento?.split(',')[0] && "text-muted-foreground"
                                         )}
                                       >
                                         {inc.diasRecebimento?.split(',')[0] ? formatDateBR(inc.diasRecebimento.split(',')[0]) : <span>Data 1</span>}
                                       </Button>
                                     </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={safeParseISO(inc.diasRecebimento?.split(',')[0])}
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
                               <div className="space-y-1">
                                  <Popover>
                                     <PopoverTrigger asChild>
                                       <Button
                                         variant="outline"
                                         className={cn(
                                           "w-full h-8 justify-start text-left font-bold text-[10px] bg-white/[0.04] border-primary/10 rounded-lg px-2",
                                           !inc.diasRecebimento?.split(',')[1] && "text-muted-foreground"
                                         )}
                                       >
                                         {inc.diasRecebimento?.split(',')[1] ? formatDateBR(inc.diasRecebimento.split(',')[1]) : <span>Data 2</span>}
                                       </Button>
                                     </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={safeParseISO(inc.diasRecebimento?.split(',')[1])}
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

                          <p className="text-[9px] text-muted-foreground/60 leading-tight italic font-medium pl-1 border-l border-primary/20">
                            Lançamentos automáticos.
                          </p>
                       </div>
                    </motion.div>
                  )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}