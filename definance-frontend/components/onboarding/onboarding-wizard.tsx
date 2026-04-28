"use client"

import { AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Context & Hooks
import { OnboardingProvider } from "./context/onboarding-context"
import { useOnboarding } from "./hooks/use-onboarding"
import { useOnboardingRecovery } from "./hooks/use-onboarding-recovery"
import { useAutoSave } from "./hooks/use-auto-save"

// Domestic Components
import { SiteHeader } from "@/components/layout/site-header"
import { OnboardingProgress } from "./components/onboarding-progress"
import { OnboardingNavigation } from "./components/onboarding-navigation"
import { SyncStatusIndicator } from "./components/sync-status-indicator"
import { ValidationErrorBox } from "./components/validation-error-box"
import { Spinner } from "@/components/ui/spinner"

// Steps
import { Step1Motivations } from "./steps/step-1-motivations"
import { Step2IncomeType } from "./steps/step-2-income-type"
import { Step3MonthlyIncome } from "./steps/step-3-monthly-income"
import { Step4FixedExpenses } from "./steps/step-4-fixed-expenses"
import { Step5Vehicles } from "./steps/step-5-vehicles"
import { Step6Debts } from "./steps/step-6-debts"

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
      
      <Card className={cn(
        "w-full border-border/50 bg-card/50 backdrop-blur transition-all duration-700 ease-in-out overflow-hidden",
        (currentStep >= 1 && currentStep <= 6) ? "max-w-2xl" : "max-w-xl"
      )}>
        <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
          <div className="mb-2 sm:mb-4 px-1">
            <OnboardingProgress />
          </div>
          <div className="flex items-center justify-between sm:mt-1 sm:pt-1.5 sm:border-t sm:border-border/10">
            <div className="space-y-0.5 sm:space-y-0.5">
              <CardTitle className="text-lg sm:text-lg text-card-foreground font-bold">
                {steps[currentStep - 1]?.title || "Carregando..."}
              </CardTitle>
              <CardDescription className="text-[13px] sm:text-sm text-muted-foreground leading-tight">
                {currentStep === 1 && (
                  <>
                    <span className="sm:hidden">Selecione suas prioridades.</span>
                    <span className="hidden sm:inline">Selecione suas prioridades financeiras e vamos te ajudar a alcançá-las.</span>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <span className="sm:hidden">Como você recebe sua renda?</span>
                    <span className="hidden sm:inline">Como você recebe sua principal fonte de renda?</span>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <span className="sm:hidden">Qual é sua renda mensal?</span>
                    <span className="hidden sm:inline">Qual é sua renda mensal aproximada?</span>
                  </>
                )}
                {currentStep === 4 && "Selecione suas despesas fixas mensais"}
                {currentStep === 5 && "Adicione seus veículos e custos associados"}
                {currentStep === 6 && "Registre suas dívidas em aberto"}
              </CardDescription>
            </div>
            <SyncStatusIndicator status={syncStatus} />
          </div>
        </CardHeader>

        <CardContent className={cn(
          "relative transition-all duration-500 p-4 sm:p-6 pt-0 sm:pt-0 space-y-0"
        )}>
          <div ref={formTopRef} className="scroll-mt-32" />
          
          <AnimatePresence mode="wait">
            {stepErrors.length > 0 && (
              <ValidationErrorBox 
                errors={stepErrors} 
                onClose={() => setStepErrors([])} 
              />
            )}
          </AnimatePresence>

          <div className={cn(
            "transition-all duration-500",
            (currentStep >= 1 && currentStep <= 3) ? "min-h-0 sm:min-h-[160px]" : "min-h-[300px]"
          )}>
             {currentStep === 1 && <Step1Motivations />}
             {currentStep === 2 && <Step2IncomeType />}
             {currentStep === 3 && <Step3MonthlyIncome />}
             {currentStep === 4 && <Step4FixedExpenses />}
             {currentStep === 5 && <Step5Vehicles />}
             {currentStep === 6 && <Step6Debts />}
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