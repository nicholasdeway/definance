"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  Receipt, 
  Car, 
  CreditCard,
  Info,
  ShieldCheck,
  Landmark
} from "lucide-react"

// Context & Hooks
import { OnboardingProvider } from "@/components/onboarding/context/onboarding-context"
import { useOnboarding } from "@/components/onboarding/hooks/use-onboarding"
import { useOnboardingRecovery } from "@/components/onboarding/hooks/use-onboarding-recovery"
import { useAutoSave } from "@/components/onboarding/hooks/use-auto-save"

import { IncomeTypeSection } from "@/components/financial-profile/sections/income-type-section"
import { MonthlyIncomeSection } from "@/components/financial-profile/sections/monthly-income-section"
import { FixedExpensesSection } from "@/components/financial-profile/sections/fixed-expenses-section"
import { VehiclesSection } from "@/components/financial-profile/sections/vehicles-section"
import { DebtsSection } from "@/components/financial-profile/sections/debts-section"

import { SyncStatusIndicator } from "@/components/onboarding/components/sync-status-indicator"
import { Spinner } from "@/components/ui/spinner"
import { BillsAlert } from "@/components/dashboard/bills-alert"

function FinancialProfileContent() {
  const { syncStatus, isLoadingRecovery, setCurrentStep } = useOnboarding()
  const [isGlobalSaving, setIsGlobalSaving] = React.useState(false)
  
  useOnboardingRecovery()
  useAutoSave()

  const handleTabChange = (value: string) => {
    const stepMap: Record<string, number> = {
      'tipo-renda': 1,
      'renda': 2,
      'gastos': 3,
      'veiculos': 4,
      'dividas': 5
    }
    if (stepMap[value]) {
      setCurrentStep(stepMap[value])
    }
  }

  if (isLoadingRecovery) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Sincronizando seu perfil financeiro...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-4 md:space-y-6">
      {/* Overlay de Bloqueio Minimalista */}
      {isGlobalSaving && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/30 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Sincronizando</span>
                    <span className="text-[9px] text-muted-foreground font-medium opacity-80">Aguarde um instante</span>
                </div>
            </div>
        </div>
      )}
      

      <div className="flex flex-col gap-6 items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil Financeiro</h1>
          </div>
          <p className="text-muted-foreground text-sm">Configurações base que alimentam o restante do seu dashboard</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sincronização</span>
                  <SyncStatusIndicator status={syncStatus} />
              </div>
              <div className="h-10 w-px bg-border/40" />
              <div className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-tighter">Protegido</span>
              </div>
          </div>
        </div>
      </div>
 
      <BillsAlert />
      <div className="grid gap-6">
        <Tabs defaultValue="renda" onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-0 bg-transparent border-none gap-2 mb-6">
                <TabsTrigger value="renda" className="text-[10px] py-2.5 px-2 leading-tight rounded-lg border font-bold transition-all uppercase tracking-tighter data-[state=active]:bg-primary/70 data-[state=active]:text-primary-foreground data-[state=active]:border-primary/50 data-[state=active]:shadow-sm bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50 flex items-center justify-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Renda</span>
                </TabsTrigger>
                <TabsTrigger value="gastos" className="text-[10px] py-2.5 px-2 leading-tight rounded-lg border font-bold transition-all uppercase tracking-tighter data-[state=active]:bg-primary/70 data-[state=active]:text-primary-foreground data-[state=active]:border-primary/50 data-[state=active]:shadow-sm bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50 flex items-center justify-center gap-2">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Gastos</span>
                </TabsTrigger>
                <TabsTrigger value="veiculos" className="text-[10px] py-2.5 px-2 leading-tight rounded-lg border font-bold transition-all uppercase tracking-tighter data-[state=active]:bg-primary/70 data-[state=active]:text-primary-foreground data-[state=active]:border-primary/50 data-[state=active]:shadow-sm bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50 flex items-center justify-center gap-2">
                    <Car className="h-3.5 w-3.5" />
                    <span>Veículos</span>
                </TabsTrigger>
                <TabsTrigger value="dividas" className="text-[10px] py-2.5 px-2 leading-tight rounded-lg border font-bold transition-all uppercase tracking-tighter data-[state=active]:bg-primary/70 data-[state=active]:text-primary-foreground data-[state=active]:border-primary/50 data-[state=active]:shadow-sm bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50 flex items-center justify-center gap-2">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Dívidas</span>
                </TabsTrigger>
                <TabsTrigger value="tipo-renda" className="text-[10px] py-2.5 px-2 leading-tight rounded-lg border font-bold transition-all uppercase tracking-tighter data-[state=active]:bg-primary/70 data-[state=active]:text-primary-foreground data-[state=active]:border-primary/50 data-[state=active]:shadow-sm bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50 flex items-center justify-center gap-2 col-span-2 lg:col-span-1">
                    <Landmark className="h-3.5 w-3.5" />
                    <span>Modelo</span>
                </TabsTrigger>
            </TabsList>

            <div className="mt-6">
                <TabsContent value="renda" className="animate-in fade-in zoom-in-95 duration-200">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Renda Mensal Base</CardTitle>
                            <CardDescription>Qual é sua renda mensal principal no momento?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MonthlyIncomeSection onSavingStateChange={setIsGlobalSaving} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gastos" className="animate-in fade-in zoom-in-95 duration-200">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Despesas Fixas</CardTitle>
                            <CardDescription>Gerencie seus gastos recorrentes fundamentais.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FixedExpensesSection onSavingStateChange={setIsGlobalSaving} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="veiculos" className="animate-in fade-in zoom-in-95 duration-200">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Seus Veículos</CardTitle>
                            <CardDescription>Atualize informações de parcelas e custos automotivos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VehiclesSection onSavingStateChange={setIsGlobalSaving} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dividas" className="animate-in fade-in zoom-in-95 duration-200">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Dívidas em Aberto</CardTitle>
                            <CardDescription>Mantenha o controle das suas pendências financeiras.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DebtsSection onSavingStateChange={setIsGlobalSaving} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tipo-renda" className="animate-in fade-in zoom-in-95 duration-200">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Categoria de Recebimento</CardTitle>
                            <CardDescription>Seu modelo de contratação atual.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IncomeTypeSection />
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>
        </Tabs>

        <Card className="bg-primary/5 border-primary/20 border">
            <CardContent className="pt-2">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-primary uppercase tracking-tighter">Entenda como funciona</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            As alterações feitas aqui são salvas automaticamente e refletem imediatamente nas suas **Entradas**, **Saídas** e **Relatórios de Desempenho**. 
                            Não é necessário recriar as transações fixas todo mês; o sistema fará isso por você com base nestes dados.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function FinancialProfilePage() {
  return (
    <OnboardingProvider>
      <FinancialProfileContent />
    </OnboardingProvider>
  )
}