"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  Receipt, 
  Car, 
  CreditCard,
  Info,
  ShieldCheck,
  Landmark,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react"

// Context & Hooks
import { OnboardingProvider } from "@/components/onboarding/context/onboarding-context"
import { useOnboarding } from "@/components/onboarding/hooks/use-onboarding"
import { useOnboardingRecovery } from "@/components/onboarding/hooks/use-onboarding-recovery"
import { useAutoSave } from "@/components/onboarding/hooks/use-auto-save"

// UI & Blocks
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Localized Sections (Independent from Onboarding)
import { IncomeTypeSection } from "@/components/financial-profile/sections/income-type-section"
import { MonthlyIncomeSection } from "@/components/financial-profile/sections/monthly-income-section"
import { FixedExpensesSection } from "@/components/financial-profile/sections/fixed-expenses-section"
import { VehiclesSection } from "@/components/financial-profile/sections/vehicles-section"
import { DebtsSection } from "@/components/financial-profile/sections/debts-section"

import { SyncStatusIndicator } from "@/components/onboarding/components/sync-status-indicator"
import { Spinner } from "@/components/ui/spinner"

function FinancialProfileContent() {
  const { syncStatus, isLoadingRecovery, setCurrentStep } = useOnboarding()
  
  // Hook de recuperação de dados e auto-save
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil Financeiro</h1>
          <p className="text-muted-foreground">Configurações base que alimentam o restante do seu dashboard</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status de Sincronização</span>
                <SyncStatusIndicator status={syncStatus} />
            </div>
            <div className="h-10 w-px bg-border/40 hidden md:block" />
            <div className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-tighter">Dados Protegidos</span>
            </div>
        </div>
      </div>

      <div className="grid gap-6">
        <Tabs defaultValue="renda" onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 gap-1 bg-muted/50 border-border/30 border">
                <TabsTrigger value="renda" className="py-2.5 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Renda Mensal</span>
                </TabsTrigger>
                <TabsTrigger value="gastos" className="py-2.5 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <Receipt className="h-4 w-4" />
                    <span className="hidden sm:inline">Gastos Fixos</span>
                </TabsTrigger>
                <TabsTrigger value="veiculos" className="py-2.5 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <Car className="h-4 w-4" />
                    <span className="hidden sm:inline">Veículos</span>
                </TabsTrigger>
                <TabsTrigger value="dividas" className="py-2.5 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dívidas</span>
                </TabsTrigger>
                <TabsTrigger value="tipo-renda" className="py-2.5 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <Landmark className="h-4 w-4" />
                    <span className="hidden sm:inline">Modelo Renda</span>
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
                            <MonthlyIncomeSection />
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
                            <FixedExpensesSection />
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
                            <VehiclesSection />
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
                            <DebtsSection />
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