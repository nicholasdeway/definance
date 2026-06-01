"use client"

import React from "react"
import { AlertCircle, CalendarDays, Coins, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn, generateId } from "@/lib/utils"
import { CurrencyInput } from "@/components/ui/currency-input"
import { useOnboarding } from "@/components/onboarding/hooks/use-onboarding"
import { incomeTypes, incomeFrequencies } from "@/components/onboarding/constants"
import { IncomeDetail, IncomeFrequency } from "@/components/onboarding/types"
import { useAutoSave } from "@/components/onboarding/hooks/use-auto-save"
import { parseCurrencyInput, formatCurrency } from "@/lib/currency"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const MonthlyIncomeSection = ({ onSavingStateChange }: { onSavingStateChange?: (saving: boolean) => void }) => {
  const {
    selectedIncomeTypes,
    incomes,
    setIncomes,
    wasAttempted,
    setWasAttempted,
    lastSavedHashesRef
  } = useOnboarding()
  const { persistStep } = useAutoSave()
  const { toast } = useToast()

  const baselineMapRef = React.useRef<Record<string, IncomeDetail>>({})

  // Inicializa o baseline para cada tipo de renda individualmente
  // Captura a primeira versão que encontrar na sessão para cada tipo
  React.useEffect(() => {
    incomes.forEach(inc => {
      if (!baselineMapRef.current[inc.tipo]) {
        baselineMapRef.current[inc.tipo] = JSON.parse(JSON.stringify(inc))
      }
    })
  }, [incomes])

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

  const handleSave = async () => {
    if (isSaving) return;

    // Validação antes de salvar
    const hasErrors = incomes.some(inc => {
      if (!selectedIncomeTypes.includes(inc.tipo)) return false;
      const isMissingValue = !inc.valor || inc.valor === 0;
      const isMissingFreq = !inc.frequencia;
      const isMissingDays = (inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL) &&
        (!inc.diasRecebimento || inc.diasRecebimento.trim() === "");
      const isMissingWeeklyDay = inc.frequencia === IncomeFrequency.SEMANAL && (!inc.diaSemana || inc.diaSemana.trim() === "");

      return isMissingValue || isMissingFreq || isMissingDays || isMissingWeeklyDay;
    });

    if (hasErrors) {
      setWasAttempted(true);
      toast({
        title: "Campos pendentes",
        description: "Por favor, preencha todos os campos obrigatórios das suas rendas.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    onSavingStateChange?.(true);
    try {
      // Usamos o baseline individual por tipo para detectar o que mudou desde o último "Salvar" manual

      const incomesWithHistory = incomes.map(income => {
        const prev = baselineMapRef.current[income.tipo]

        // Se algo fundamental mudou (valor, frequencia, diasRecebimento, diaSemana)
        const hasChanged = prev && (
          prev.valor !== income.valor ||
          prev.frequencia !== income.frequencia ||
          prev.diasRecebimento !== income.diasRecebimento ||
          prev.diaSemana !== income.diaSemana
        )

        if (hasChanged) {
          // Extraímos a data de início da nova configuração para definir até quando a antiga era válida
          const newStartDateStr = income.diasRecebimento?.split(',')[0].trim()
          let validoAte = new Date().toISOString()

          if (newStartDateStr) {
            try {
              const datePart = newStartDateStr.includes('T') ? newStartDateStr.split('T')[0] : newStartDateStr
              const [y, m, d] = datePart.split('-').map(Number)
              // A configuração antiga é válida até o último dia do mês anterior ao novo início
              // Criamos a data ao meio-dia para evitar problemas de fuso horário na conversão
              const lastDayOfPrevMonth = new Date(y, m - 1, 0, 12, 0, 0)
              validoAte = lastDayOfPrevMonth.toISOString()
            } catch (e) {
              console.error("Erro ao processar data para histórico:", e)
            }
          }

          const newPreviousConfig = {
            valor: prev.valor,
            frequencia: prev.frequencia,
            diasRecebimento: prev.diasRecebimento,
            diaSemana: prev.diaSemana,
            validoAte: validoAte
          }

          // Mantém o histórico existente e adiciona a nova configuração
          const hMin = prev.historicoConfiguracoes || []
          const hMaj = prev.HistoricoConfiguracoes || []
          const prevHistoryList = hMin.length > 0 ? hMin : hMaj

          // Filtramos duplicatas (mesmo valor e mesma validade) por segurança
          const updatedHistory = [...prevHistoryList]
          const isDuplicate = updatedHistory.some(h => h.validoAte === validoAte && h.valor === newPreviousConfig.valor)

          if (!isDuplicate) {
            updatedHistory.push(newPreviousConfig)
          }

          return {
            ...income,
            configuradoEm: new Date().toISOString(),
            configuracaoAnterior: newPreviousConfig,
            historicoConfiguracoes: updatedHistory,
            HistoricoConfiguracoes: updatedHistory
          }
        }
        return income
      })

      const success = await persistStep(3, incomesWithHistory);
      if (success) {
        await persistStep(2, selectedIncomeTypes);
        await apiClient("/api/onboarding/sync-incomes", { method: "POST" });

        // CRITICAL: Atualiza o baseline após um salvamento manual bem-sucedido
        // Limpamos o mapa para que o useEffect o preencha com o novo estado estável
        baselineMapRef.current = {}
        incomesWithHistory.forEach(inc => {
          baselineMapRef.current[inc.tipo] = JSON.parse(JSON.stringify(inc))
        })

        setIncomes(incomesWithHistory);

        window.dispatchEvent(new CustomEvent("finance-update"));
        toast({ title: "Perfil financeiro atualizado", description: "Suas rendas e histórico foram sincronizados." });
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
        <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest">Fontes de Renda</p>
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
            ((inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL) && (!inc.diasRecebimento || inc.diasRecebimento.trim() === "")) ||
            (inc.frequencia === IncomeFrequency.SEMANAL && (!inc.diaSemana || inc.diaSemana.trim() === ""))
          )

          if (!typeInfo) return null

          return (
            <div key={typeInfo.value} className={cn(
              "rounded-2xl border bg-background/50 overflow-hidden transition-all duration-300 relative",
              hasError ? "border-destructive/20" : "border-border/60 hover:border-primary/20"
            )}>
              {/* Mini Header dentro do Card */}
              <div className="bg-muted/20 px-3 py-2.5 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <typeInfo.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-medium text-card-foreground uppercase tracking-wide">{typeInfo.label}</span>
                </div>
                {hasError && <AlertCircle className="h-3 w-3 text-destructive animate-pulse" />}
              </div>

              <div className="p-4 space-y-4">
                {/* Valor */}
                <div className="space-y-1.5">
                  <Label className="text-[9px] uppercase text-muted-foreground/60 tracking-widest">
                    Valor do Salário / Pro-labore
                    {(!inc.valor || inc.valor === 0) && wasAttempted && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <CurrencyInput
                    id={`income-${typeInfo.value}`}
                    placeholder="R$ 0,00"
                    value={inc.valor ? Math.round(Number(inc.valor) * 100).toString() : ""}
                    onChange={(value) => updateIncomeValue(typeInfo.value, value)}
                    className={cn(
                      "h-10 text-base bg-muted/5 focus:bg-background transition-colors cursor-pointer",
                      wasAttempted && (!inc.valor || inc.valor === 0) && "border-destructive/50"
                    )}
                  />

                  {/* Resumo Mensal Estimado */}
                  {!!inc.valor && inc.frequencia !== IncomeFrequency.FIXO_MENSAL && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 border border-primary/10 w-fit animate-in fade-in slide-in-from-left-2">
                      <span className="text-[10px] font-bold text-primary uppercase">Total Mensal:</span>
                      <span className="text-xs font-bold text-primary">
                        {formatCurrency(inc.frequencia === IncomeFrequency.SEMANAL ? inc.valor * 4 : inc.valor * 2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Frequencia */}
                <div className="space-y-1.5">
                  <Label className="text-[9px] uppercase text-muted-foreground/60 tracking-widest">Frequência</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {incomeFrequencies.map(freq => {
                      const isSelected = inc.frequencia === freq.value
                      return (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() => updateIncome(typeInfo.value, "frequencia", freq.value)}
                          className={cn(
                            "text-center text-[10px] py-2.5 px-2 leading-tight rounded-lg border font-bold uppercase tracking-tighter transition-all duration-200 cursor-pointer",
                            isSelected
                              ? "bg-primary/70 text-primary-foreground border-primary/70 shadow-sm"
                              : "bg-muted/30 border-transparent text-muted-foreground/70 hover:bg-muted/50"
                          )}
                        >
                          {freq.label}
                        </button>
                      )
                    })}
                  </div>
                </div>



                {/* Dias de Recebimento (Definance Helper) */}
                {(inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL || inc.frequencia === IncomeFrequency.SEMANAL) && (
                  <div className="bg-primary/[0.02] border border-primary/10 rounded-xl p-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-400">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center flex-none">
                        <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
                      </div>
                      <Label className="text-[8px] text-primary/70 uppercase tracking-wider">Ciclo:</Label>
                    </div>

                    {inc.frequencia === IncomeFrequency.SEMANAL ? (
                      <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground/70">
                          Qual dia da semana?
                        </Label>
                        <Select
                          value={inc.diaSemana || ""}
                          onValueChange={(value) => updateIncome(typeInfo.value, "diaSemana", value)}
                        >
                          <SelectTrigger className="w-full h-10 bg-background/50 border-primary/20 text-sm">
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
                      </div>
                    ) : inc.frequencia === IncomeFrequency.FIXO_MENSAL ? (
                      <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground/70">Data do Próximo Recebimento</Label>
                        <DatePicker
                          date={inc.diasRecebimento}
                          onChange={(date) => updateIncome(typeInfo.value, "diasRecebimento", date)}
                          className={cn(
                            "h-10 bg-background border-primary/20 hover:border-primary/40"
                          )}
                          placeholder="Escolha a data (DD/MM/AAAA)"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground/70">1º Recebimento</Label>
                          <DatePicker
                            date={inc.diasRecebimento?.split(',')[0]}
                            onChange={(date) => {
                              const dates = inc.diasRecebimento?.split(',') || ["", ""]
                              updateIncome(typeInfo.value, "diasRecebimento", `${date},${dates[1] || ""}`)
                            }}
                            className="h-10 bg-background border-primary/20 hover:border-primary/40 w-full"
                            placeholder="Data 1"
                            size="sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground/70">2º Recebimento</Label>
                          <DatePicker
                            date={inc.diasRecebimento?.split(',')[1]}
                            onChange={(date) => {
                              const dates = inc.diasRecebimento?.split(',') || ["", ""]
                              updateIncome(typeInfo.value, "diasRecebimento", `${dates[0] || ""},${date}`)
                            }}
                            className="h-10 bg-background border-primary/20 hover:border-primary/40 w-full"
                            placeholder="Data 2"
                            size="sm"
                          />
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

      <div className="flex items-center justify-end pt-4 border-t border-border/50 mt-3">
        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={handleSave}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary/70 dark:hover:bg-primary text-xs cursor-pointer"
        >
          {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Informações"}
        </Button>
      </div>
    </div>
  )
}
