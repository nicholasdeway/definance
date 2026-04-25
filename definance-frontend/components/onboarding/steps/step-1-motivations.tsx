"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOnboarding } from "../hooks/use-onboarding"
import { motivationTypes } from "../constants"
import { FieldLabel } from "../components/field-label"

export const Step1Motivations = () => {
  const { 
    motivations, 
    setMotivations, 
    wasAttempted 
  } = useOnboarding()

  const toggleMotivation = (value: string) => {
    setMotivations(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    )
  }

  return (
    <div className="grid gap-3">
      <FieldLabel 
        label="Selecione uma ou mais opções" 
        required 
        isEmpty={motivations.length === 0} 
        wasAttempted={wasAttempted} 
      />
      {motivationTypes.map((type) => {
        const isSelected = motivations.includes(type.value)
        const isInvalid = wasAttempted && motivations.length === 0
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => toggleMotivation(type.value)}
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
            </div>
            {isSelected && (
              <div className="h-6 w-6 rounded-full bg-primary/70 flex items-center justify-center animate-in zoom-in duration-300 shadow-sm">
                <Check className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}