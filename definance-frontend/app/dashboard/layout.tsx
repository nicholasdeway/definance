"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AuthProvider, useAuth } from "@/lib/auth-provider"
import { CategoryProvider } from "@/lib/category-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Lock, ArrowRight, Sparkles } from "lucide-react"

import { GettingStarted } from "@/components/dashboard/getting-started"
import { QuickExpenseButton } from "@/components/dashboard/quick-expense-button"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (!user?.isWhatsAppConnected) {
        router.push("/onboarding")
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user?.isWhatsAppConnected) {
    return null
  }

  const isPerfilPage = pathname === "/dashboard/perfil"
  const isPremiumExpired = user && !user.isPremium

  if (isPremiumExpired && !isPerfilPage) {
    return (
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <MobileNav />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-8 flex items-center justify-center min-h-[75vh] bg-background/50">
            <div className="max-w-md w-full text-center space-y-6 p-8 bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/15 rounded-full blur-3xl animate-pulse" />

              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 relative">
                <Lock className="w-8 h-8" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                  Acesso Restrito <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Seu período de teste grátis terminou. Para continuar utilizando todos os recursos inteligentes do Definance, ative sua assinatura.
                </p>
              </div>

              <div className="p-4 bg-muted/40 rounded-2xl border border-border/30 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Histórico completo e relatórios inteligentes com IA
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Conexão ilimitada com seu WhatsApp para lançar gastos
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Gerenciamento avançado de metas financeiras
                </div>
              </div>

              <button
                onClick={() => router.push("/dashboard/perfil")}
                className="w-full flex items-center justify-center gap-2 bg-primary/70 hover:bg-primary text-primary-foreground font-medium py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-[1.02] cursor-pointer"
              >
                Ativar Assinatura
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </main>
          <footer className="py-6 flex justify-center mt-auto">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-50 text-center px-4">
              Plataforma Definance - Gestão Financeira &copy; 2026
            </p>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <MobileNav />
        <main className="flex-1 p-4 md:p-6 pb-32 md:pb-8 relative">
          <CategoryProvider>
            {children}
            <GettingStarted />
            <QuickExpenseButton />
          </CategoryProvider>
        </main>
        <footer className="py-6 flex justify-center mt-auto">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-50 text-center px-4">
            Plataforma Definance - Gestão Financeira &copy; 2026
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  )
}