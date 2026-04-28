"use client"

import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOnboarding } from "@/components/onboarding/hooks/use-onboarding"
import { incomeTypes } from "@/components/onboarding/constants"
import { FieldLabel } from "@/components/onboarding/components/field-label"
import { Button } from "@/components/ui/button"
import { useAutoSave } from "@/components/onboarding/hooks/use-auto-save"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export const IncomeTypeSection = () => {
  const { 
    selectedIncomeTypes, 
    setSelectedIncomeTypes, 
    wasAttempted 
  } = useOnboarding()
  const { persistStep } = useAutoSave()
  
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const success = await persistStep(2, selectedIncomeTypes);
      if (success) {
        toast({ title: "Seleção salva com sucesso!", variant: "default" });
      } else {
        toast({ title: "Erro ao salvar", description: "Tente novamente mais tarde.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Erro inesperado", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  const toggleIncomeType = (value: string) => {
    setSelectedIncomeTypes(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    )
  }

  return (
    <div className="grid gap-3">
      <FieldLabel 
        label="Selecione uma ou mais opções" 
        required 
        isEmpty={selectedIncomeTypes.length === 0} 
        wasAttempted={wasAttempted} 
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {incomeTypes.map((type) => {
          const isSelected = selectedIncomeTypes.includes(type.value)
          const isInvalid = wasAttempted && selectedIncomeTypes.length === 0
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => toggleIncomeType(type.value)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl border p-2.5 transition-all duration-200 cursor-pointer group h-[60px]",
                isSelected
                  ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/10"
                  : isInvalid
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-white/5 bg-white/5 hover:border-primary/20 hover:bg-primary/5"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-white/10 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                <type.icon className="h-4 w-4" />
              </div>

              <div className="flex-1 text-left min-w-0">
                <p className={cn(
                  "text-[11px] font-medium leading-tight truncate transition-colors",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {type.label}
                </p>
                <p className="text-[9px] text-muted-foreground/70 leading-tight truncate mt-0.5">
                  {type.description}
                </p>
              </div>

              {isSelected && (
                <div className="shrink-0 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-end pt-6 border-t border-white/5 mt-4">
        <Button 
          type="button" 
          disabled={isSaving}
          onClick={handleSave}
          className="w-full sm:w-auto bg-primary/70 text-primary-foreground hover:bg-primary text-xs cursor-pointer"
        >
          {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Seleção"}
        </Button>
      </div>
    </div>
  )
}