"use client"

import React from "react"
import { AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Context & Hooks
import { OnboardingProvider } from "./context/onboarding-context"
import { useOnboarding } from "./hooks/use-onboarding"
import { useOnboardingRecovery } from "./hooks/use-onboarding-recovery"
import { useAutoSave } from "./hooks/use-auto-save"

// Shared Components
// Domestic Components
import { SiteHeader } from "@/components/layout/site-header"
import { OnboardingProgress } from "./components/onboarding-progress"
import { OnboardingNavigation } from "./components/onboarding-navigation"
import { SyncStatusIndicator } from "./components/sync-status-indicator"
import { ValidationErrorBox } from "./components/validation-error-box"
import { Spinner } from "@/components/ui/spinner"

// Steps
import { Step1IncomeType } from "./steps/step-1-income-type"
import { Step2MonthlyIncome } from "./steps/step-2-monthly-income"
import { Step3FixedExpenses } from "./steps/step-3-fixed-expenses"
import { Step4Vehicles } from "./steps/step-4-vehicles"
import { Step5Debts } from "./steps/step-5-debts"

// Constants
import { steps } from "./constants"

function OnboardingWizardContent() {
  const { currentStep, syncStatus, stepErrors, setStepErrors, formTopRef, isLoadingRecovery } = useOnboarding()
  
  // Initialize Hooks
  useOnboardingRecovery()
  useAutoSave()
  
  if (isLoadingRecovery) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center px-4 pt-26 pb-12">
      <SiteHeader variant="onboarding" />
      
      <Card className="w-full max-w-lg border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="">
          <div className="mb-6 px-2">
            <OnboardingProgress />
          </div>
          <div className="mt-2 pt-2 border-t border-border/10 flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl text-card-foreground">
                {steps[currentStep - 1]?.title || "Carregando..."}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {currentStep === 1 && "Como você recebe sua principal fonte de renda?"}
                {currentStep === 2 && "Qual é sua renda mensal aproximada?"}
                {currentStep === 3 && "Selecione suas despesas fixas mensais"}
                {currentStep === 4 && "Adicione seus veículos e custos associados"}
                {currentStep === 5 && "Registre suas dívidas em aberto"}
              </CardDescription>
            </div>
            <SyncStatusIndicator status={syncStatus} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div ref={formTopRef} className="scroll-mt-32" />
          
          <AnimatePresence mode="wait">
            {stepErrors.length > 0 && (
              <ValidationErrorBox 
                errors={stepErrors} 
                onClose={() => setStepErrors([])} 
              />
            )}
          </AnimatePresence>

          <div className="min-h-[300px]">
             {currentStep === 1 && <Step1IncomeType />}
             {currentStep === 2 && <Step2MonthlyIncome />}
             {currentStep === 3 && <Step3FixedExpenses />}
             {currentStep === 4 && <Step4Vehicles />}
             {currentStep === 5 && <Step5Debts />}
          </div>

          <OnboardingNavigation />
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-muted-foreground/60 text-xs">
        <p>© 2026 Definance • Sistema de Planejamento Financeiro Inteligente</p>
        <p className="mt-1 italic">Seus dados estão protegidos e criptografados.</p>
      </footer>
    </div>
  )
}

export function OnboardingWizard() {
  return (
    <OnboardingProvider>
      <OnboardingWizardContent />
    </OnboardingProvider>
  )
}