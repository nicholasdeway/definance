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

import { GettingStarted } from "@/components/dashboard/getting-started"
import { QuickExpenseButton } from "@/components/dashboard/quick-expense-button"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isAllowedInactiveRoute = pathname === "/dashboard/inativo" || pathname === "/dashboard/checkout"

    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (!user?.isWhatsAppConnected) {
        router.push("/onboarding")
      } else if (user && !user.isPremium && !isAllowedInactiveRoute) {
        router.push("/dashboard/inativo")
      } else if (user && user.isPremium && pathname === "/dashboard/inativo") {
        router.push("/dashboard")
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname])

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

  const isInactivePage = pathname === "/dashboard/inativo" || pathname === "/dashboard/checkout"

  if (user && !user.isPremium && !isInactivePage) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (isInactivePage) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 overflow-y-auto w-full">
        {children}
      </main>
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