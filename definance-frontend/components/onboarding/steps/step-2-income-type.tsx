"use client"

import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useOnboarding } from "../hooks/use-onboarding"
import { incomeTypes } from "../constants"
import { FieldLabel } from "../components/field-label"

export const Step2IncomeType = () => {
  const { 
    selectedIncomeTypes, 
    setSelectedIncomeTypes, 
    wasAttempted 
  } = useOnboarding()

  const toggleIncomeType = (value: string) => {
    setSelectedIncomeTypes(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    )
  }

  const isInvalid = wasAttempted && selectedIncomeTypes.length === 0

  return (
    <div className="space-y-4">
      <FieldLabel 
        label="Selecione seus tipos de renda" 
        required 
        isEmpty={selectedIncomeTypes.length === 0} 
        wasAttempted={wasAttempted} 
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {incomeTypes.map((type, index) => {
          const isSelected = selectedIncomeTypes.includes(type.value)
          
          return (
            <motion.button
              key={type.value}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              type="button"
              onClick={() => toggleIncomeType(type.value)}
              className={cn(
                "relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 cursor-pointer group h-[72px]",
                isSelected 
                  ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/10" 
                  : isInvalid
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-white/5 bg-white/5 hover:border-primary/20 hover:bg-primary/5"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                isSelected 
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                  : "bg-white/10 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                <type.icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <p className={cn(
                  "text-[13px] font-bold leading-tight truncate transition-colors",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {type.label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight truncate mt-0.5 group-hover:text-muted-foreground/80">
                  {type.description}
                </p>
              </div>

              {isSelected && (
                <div className="shrink-0 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary" />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {isInvalid && (
        <p className="text-[10px] text-destructive text-center font-bold uppercase tracking-widest animate-pulse">
          Selecione pelo menos uma opção para continuar
        </p>
      )}
    </div>
  )
}