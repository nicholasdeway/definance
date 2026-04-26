"use client"

import { useEffect } from "react"
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
          ((inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL) && (!inc.diasRecebimento || inc.diasRecebimento.trim() === "")) ||
          (inc.frequencia === IncomeFrequency.SEMANAL && (!inc.diaSemana || inc.diaSemana.trim() === ""))
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
                    value={inc.valor ? Math.round(Number(inc.valor) * 100).toString() : ""}
                    onChange={(value) => updateIncomeValue(typeInfo.value, value)}
                   className={cn(
                     "h-10 bg-background text-sm font-medium",
                     wasAttempted && (!inc.valor || inc.valor === 0) && "border-destructive/50"
                   )}
                 />

                 {/* Resumo Mensal Estimado */}
                 {!!inc.valor && inc.frequencia !== IncomeFrequency.FIXO_MENSAL && inc.frequencia !== IncomeFrequency.VARIAVEL && (
                   <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 border border-primary/10 w-fit animate-in fade-in slide-in-from-left-2">
                     <span className="text-[10px] font-bold text-primary uppercase">Total Mensal:</span>
                     <span className="text-xs font-black text-primary">
                       {formatCurrency(inc.frequencia === IncomeFrequency.SEMANAL ? inc.valor * 4 : inc.valor * 2)}
                     </span>
                   </div>
                 )}
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
                                isSelected ? "bg-primary/70 text-primary-foreground border-primary" : "bg-muted/30 border-border/60 hover:bg-muted"
                             )}
                          >
                             {freq.label}
                          </button>
                       )
                    })}
                 </div>
               </div>

                {/* Bloco 3: Dias (Apenas para mensais e quinzenais) */}
                {(inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL || inc.frequencia === IncomeFrequency.SEMANAL) && (
                  <div className="flex bg-primary/5 border border-primary/10 rounded-lg p-3 items-start gap-3 animate-in fade-in slide-in-from-top-2">
                     <CalendarDays className="h-5 w-5 text-primary shrink-0 flex-none" />
                     <div className="flex-1 space-y-3">
                        <FieldLabel 
                          label={
                            inc.frequencia === IncomeFrequency.FIXO_MENSAL ? "Que dia cai o salário?" : 
                            inc.frequencia === IncomeFrequency.QUINZENAL ? "Quais os dois dias de recebimento?" :
                            "Qual o dia do recebimento na semana?"
                          } 
                          required 
                          isEmpty={
                            inc.frequencia === IncomeFrequency.SEMANAL ? !inc.diaSemana : (!inc.diasRecebimento || inc.diasRecebimento.trim() === "")
                          } 
                          wasAttempted={wasAttempted} 
                        />
                        
                        {inc.frequencia === IncomeFrequency.SEMANAL ? (
                           <Select
                             value={inc.diaSemana || ""}
                             onValueChange={(value) => updateIncome(typeInfo.value, "diaSemana", value)}
                           >
                             <SelectTrigger className="w-full h-9 bg-background/50 border-primary/20 text-xs">
                               <SelectValue placeholder="Selecione o dia" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="segunda">Segunda-feira</SelectItem>
                               <SelectItem value="terca">Terça-feira</SelectItem>
                               <SelectItem value="quarta">Quarta-feira</SelectItem>
                               <SelectItem value="quinta">Quinta-feira</SelectItem>
                               <SelectItem value="sexta">Sexta-feira</SelectItem>
                               <SelectItem value="sabado">Sábado</SelectItem>
                               <SelectItem value="domingo">Domingo</SelectItem>
                             </SelectContent>
                           </Select>
                        ) : inc.frequencia === IncomeFrequency.FIXO_MENSAL ? (
                           <Popover>
                             <PopoverTrigger asChild>
                               <Button
                                 variant="outline"
                                 className={cn(
                                   "w-full h-9 justify-start text-left font-normal text-xs bg-background/50 focus:bg-background border-primary/20",
                                   !inc.diasRecebimento && "text-muted-foreground",
                                   wasAttempted && (!inc.diasRecebimento || inc.diasRecebimento.trim() === "") && "border-destructive/50"
                                 )}
                               >
                                 <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                                 {safeParseISO(inc.diasRecebimento) ? formatDateBR(inc.diasRecebimento) : <span>Escolha a data</span>}
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
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1.5">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground/70">1ª Quinzena</span>
                                <Popover>
                                   <PopoverTrigger asChild>
                                     <Button
                                       variant="outline"
                                       className={cn(
                                         "w-full h-9 justify-start text-left font-normal text-xs bg-background/50 border-primary/20",
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
                             <div className="space-y-1.5">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground/70">2ª Quinzena</span>
                                <Popover>
                                   <PopoverTrigger asChild>
                                     <Button
                                       variant="outline"
                                       className={cn(
                                         "w-full h-9 justify-start text-left font-normal text-xs bg-background/50 border-primary/20",
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