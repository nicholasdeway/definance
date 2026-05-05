"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { MobileDashboardNav } from "@/components/dashboard/mobile-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AuthProvider, useAuth } from "@/lib/auth-provider"
import { CategoryProvider } from "@/lib/category-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"

import { GettingStarted } from "@/components/dashboard/getting-started"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

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

  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <MobileDashboardNav />
        <main className="flex-1 p-4 md:p-6 pb-2">
          <CategoryProvider>
            {children}
          </CategoryProvider>
        </main>
        <GettingStarted />
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