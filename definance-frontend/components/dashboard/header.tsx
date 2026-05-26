"use client"

import { useState } from "react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Plus, AlertTriangle, TrendingUp, TrendingDown, CreditCard, Receipt, LogOut, Menu, CalendarClock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useBillsNotifications } from "@/hooks/use-bills-notifications"
import { useSettings } from "@/lib/settings-context"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export function DashboardHeader() {
  const { totalCount, overdueCount, setupCount, dueSoonCount, budgetAlertsCount, maxBudgetPct, spendingAlert, spendingPct, isLoading } = useBillsNotifications()
  const { discreetMode, setDiscreetMode, showBudgetAlerts, showSpendingAlerts } = useSettings()
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await apiClient("/api/Auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      window.location.href = "/"
    }
  }

  return (
    <>
      {/* 1. DESKTOP HEADER */}
      <header className="hidden md:flex sticky top-0 z-10 h-14 shrink-0 items-center gap-2 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1" />
        
        <div className="flex flex-1 items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary/70 dark:hover:bg-primary cursor-pointer shadow-sm active:scale-95 transition-all">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Transação</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5">
              <Link href="/dashboard/entradas?action=new">
                <DropdownMenuItem className="cursor-pointer gap-2 py-2 text-primary">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                  <span>Nova Receita</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/saidas?action=new">
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                    <TrendingDown className="h-3.5 w-3.5" />
                  </div>
                  <span>Nova Despesa</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/contas?action=new">
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                    <CreditCard className="h-3.5 w-3.5" />
                  </div>
                  <span>Nova Conta</span>
                </DropdownMenuItem>
              </Link>
              <div className="my-1 border-t border-border/50" />
              <Link href="/dashboard/gastos-diarios?action=new">
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10 text-orange-500">
                    <Receipt className="h-3.5 w-3.5" />
                  </div>
                  <span>Gasto Diário</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 cursor-pointer transition-all hover:bg-muted"
            onClick={() => setDiscreetMode(!discreetMode)}
          >
            {discreetMode ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
          </Button>

          <ThemeToggle />
          
          <NotificationDropdown 
            open={desktopOpen} 
            setOpen={setDesktopOpen} 
            isLoading={isLoading} 
            totalCount={totalCount}
            overdueCount={overdueCount}
            setupCount={setupCount}
            dueSoonCount={dueSoonCount}
            budgetAlertsCount={budgetAlertsCount}
            maxBudgetPct={maxBudgetPct}
            spendingAlert={spendingAlert}
            spendingPct={spendingPct}
            showBudgetAlerts={showBudgetAlerts}
            showSpendingAlerts={showSpendingAlerts}
          />

          <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9 cursor-pointer hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 2. MOBILE FLOATING HEADER (Floating Top Dock) */}
      <div className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md">
        <div className="bg-background/40 backdrop-blur-2xl border border-border/50 rounded-full h-14 shadow-2xl flex items-center justify-between px-2 relative">
          
          {/* Hamburger Menu */}
          <SidebarTrigger className="h-11 w-11 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90 flex items-center justify-center">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>

          {/* Quick Actions Group */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full transition-all active:scale-90"
              onClick={() => setDiscreetMode(!discreetMode)}
            >
              {discreetMode ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </Button>

            <ThemeToggle className="h-11 w-11 rounded-full hover:bg-muted/50" />

            <NotificationDropdown 
              open={mobileOpen} 
              setOpen={setMobileOpen} 
              isLoading={isLoading} 
              totalCount={totalCount}
              overdueCount={overdueCount}
              setupCount={setupCount}
              dueSoonCount={dueSoonCount}
              budgetAlertsCount={budgetAlertsCount}
              maxBudgetPct={maxBudgetPct}
              spendingAlert={spendingAlert}
              spendingPct={spendingPct}
              showBudgetAlerts={showBudgetAlerts}
              showSpendingAlerts={showSpendingAlerts}
              isMobile
            />

            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-11 w-11 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all active:scale-90">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Spacer para não cobrir o conteúdo */}
      <div className="md:hidden h-20" />
    </>
  )
}

function NotificationDropdown({ 
  open, setOpen, isLoading, totalCount, overdueCount, setupCount, dueSoonCount, 
  budgetAlertsCount, maxBudgetPct, spendingAlert, spendingPct, isMobile = false 
}: any) {
  const { 
    showOverdueAlerts, 
    showSetupAlerts, 
    showDueSoonAlerts, 
    showBudgetAlerts, 
    showSpendingAlerts 
  } = useSettings()

  const hasOverdue = overdueCount > 0 && showOverdueAlerts
  const hasSetup = setupCount > 0 && showSetupAlerts
  const hasDueSoon = dueSoonCount > 0 && showDueSoonAlerts
  const hasBudget = budgetAlertsCount > 0 && showBudgetAlerts
  const hasSpending = spendingAlert && showSpendingAlerts

  const activeTotalCount = 
    (hasOverdue ? overdueCount : 0) + 
    (hasSetup ? setupCount : 0) + 
    (hasDueSoon ? dueSoonCount : 0) + 
    (hasBudget ? budgetAlertsCount : 0) + 
    (hasSpending ? 1 : 0)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative h-9 w-9 cursor-pointer rounded-full", isMobile && "h-11 w-11")}>
          <Bell className={cn("h-4 w-4", !isLoading && activeTotalCount > 0 && "animate-pulse text-primary")} />
          {!isLoading && activeTotalCount > 0 && (
            <span className={cn(
              "absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in duration-300",
              isMobile ? "-right-0 -top-0" : "-right-0.5 -top-0.5"
            )}>
              {activeTotalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={12} className="w-[280px] sm:w-80 p-0 overflow-hidden bg-background/95 backdrop-blur-lg border-border/50 rounded-2xl shadow-2xl">
        <div className="bg-muted/30 px-4 py-2 border-b border-border/40">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Notificações</h3>
        </div>
        
        <div className="max-h-[350px] overflow-y-auto">
          {activeTotalCount === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary/40" />
                </div>
              </div>
              <p className="text-sm font-medium text-foreground/80">Tudo em dia!</p>
            </div>
          ) : (
            <div className="py-1">
              {hasOverdue && (
                <DropdownMenuItem asChild className="p-0 border-none focus:bg-destructive/10 cursor-pointer">
                  <Link href="/dashboard/contas?tab=atrasadas" className="flex items-center gap-2.5 px-4 py-2.5" onClick={() => setOpen(false)}>
                    <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-destructive leading-tight">Contas Atrasadas</p>
                      <p className="text-[11px] text-muted-foreground truncate">{overdueCount} vencida(s)</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              )}

              {hasDueSoon && (
                <>
                  {hasOverdue && <div className="mx-4 my-1 border-t border-border/50" />}
                  <DropdownMenuItem asChild className="p-0 border-none focus:bg-amber-500/10 cursor-pointer">
                    <Link href="/dashboard/contas?tab=vencer" className="flex items-center gap-2.5 px-4 py-2.5" onClick={() => setOpen(false)}>
                      <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-amber-600 leading-tight">Contas a Vencer</p>
                        <p className="text-[11px] text-muted-foreground truncate">{dueSoonCount} conta(s) em 2 dias</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {hasSetup && (
                <>
                  {(hasOverdue || hasDueSoon) && <div className="mx-4 my-1 border-t border-border/50" />}
                  <DropdownMenuItem asChild className="p-0 border-none focus:bg-primary/10 cursor-pointer">
                    <Link href="/dashboard/contas?tutorial=true" className="flex items-center gap-2.5 px-4 py-2.5" onClick={() => setOpen(false)}>
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-primary leading-tight">Ação Necessária</p>
                        <p className="text-[11px] text-muted-foreground truncate">{setupCount} conta(s) sem vencimento</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {hasBudget && (
                <>
                  {(hasOverdue || hasDueSoon || hasSetup) && <div className="mx-4 my-1 border-t border-border/50" />}
                  <DropdownMenuItem asChild className="p-0 border-none focus:bg-blue-500/10 cursor-pointer">
                    <Link href="/dashboard/relatorios" className="flex items-center gap-2.5 px-4 py-2.5" onClick={() => setOpen(false)}>
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-blue-600 leading-tight">Limite de Categorias</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {budgetAlertsCount === 1
                            ? `1 categoria em ${maxBudgetPct}% do limite`
                            : `${budgetAlertsCount} categorias (máx. ${maxBudgetPct}%)`}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {hasSpending && (
                <>
                  {(hasOverdue || hasDueSoon || hasSetup || hasBudget) && <div className="mx-4 my-1 border-t border-border/50" />}
                  <DropdownMenuItem asChild className="p-0 border-none focus:bg-orange-500/10 cursor-pointer">
                    <Link href="/dashboard/relatorios" className="flex items-center gap-2.5 px-4 py-2.5" onClick={() => setOpen(false)}>
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-orange-600 leading-tight">Gastos Elevados</p>
                        <p className="text-[11px] text-muted-foreground truncate">{Math.round(spendingPct * 100)}% da receita consumida</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </div>
          )}
        </div>
        <div className="bg-muted/10 px-4 py-2 border-t border-border/40 flex justify-center">
          <Link href="/dashboard/contas" className="text-[10px] uppercase font-bold text-primary/60 hover:text-primary transition-colors">Ver todas as contas</Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}