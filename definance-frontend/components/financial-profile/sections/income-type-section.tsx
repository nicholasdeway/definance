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
      {incomeTypes.map((type) => {
        const isSelected = selectedIncomeTypes.includes(type.value)
        const isInvalid = wasAttempted && selectedIncomeTypes.length === 0
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => toggleIncomeType(type.value)}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 relative group cursor-pointer",
              isSelected 
                ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                : isInvalid
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-border bg-background/50 hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
              isSelected ? "bg-primary/70 text-primary-foreground scale-110" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
            )}>
              <type.icon className="h-6 w-6" />
            </div>
            <div className="flex-1 text-left">
              <p className={cn(
                "font-bold transition-colors",
                isSelected ? "text-primary" : "text-card-foreground"
              )}>{type.label}</p>
              <p className="text-sm text-muted-foreground leading-tight">{type.description}</p>
            </div>
            {isSelected && (
              <div className="h-6 w-6 rounded-full bg-primary/70 flex items-center justify-center animate-in zoom-in duration-300 shadow-sm">
                <Check className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
          </button>
        )
      })}

      <div className="flex items-center justify-end pt-6 border-t border-border/20 mt-4">
        <Button 
          type="button" 
          disabled={isSaving}
          onClick={handleSave}
          className="w-full sm:w-auto bg-primary/70 text-primary-foreground hover:bg-primary/80 font-bold cursor-pointer"
        >
          {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Seleção"}
        </Button>
      </div>
    </div>
  )
}