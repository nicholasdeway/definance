"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useOnboarding } from "@/components/onboarding/hooks/use-onboarding"
import { FieldLabel } from "@/components/onboarding/components/field-label"

export const MonthlyIncomeSection = () => {
  const { 
    monthlyIncome, 
    setMonthlyIncome, 
    wasAttempted 
  } = useOnboarding()

  // Formata dígitos brutos (centavos) para exibição em BRL
  function displayBRL(digits: string): string {
    if (!digits) return ""
    const number = parseInt(digits, 10) / 100
    return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FieldLabel 
          label="Renda mensal líquida" 
          required 
          isEmpty={!monthlyIncome} 
          wasAttempted={wasAttempted} 
        />
        <Input
          id="monthlyIncome"
          type="text"
          inputMode="numeric"
          placeholder="R$ 0,00"
          value={monthlyIncome ? displayBRL(monthlyIncome) : ""}
          onChange={(e) => setMonthlyIncome(e.target.value.replace(/\D/g, ""))}
          className={cn(
            "bg-background text-lg",
            wasAttempted && !monthlyIncome && "border-destructive/50 focus-visible:ring-destructive/20"
          )}
        />
        <p className="text-xs text-muted-foreground">
          Informe o valor líquido que você recebe mensalmente
        </p>
      </div>
    </div>
  )
}
