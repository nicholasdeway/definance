"use client"

import { useState } from "react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Plus, AlertTriangle, TrendingUp, TrendingDown, CreditCard, Receipt, LogOut } from "lucide-react"
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
  const { totalCount, overdueCount, setupCount, isLoading } = useBillsNotifications()
  const { discreetMode, setDiscreetMode } = useSettings()
  const [open, setOpen] = useState(false)
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
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      
      <div className="flex flex-1 items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="bg-primary/70 text-primary-foreground hover:bg-primary cursor-pointer shadow-sm active:scale-95 transition-all">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nova Transação</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 p-1.5">
            <Link href="/dashboard/entradas?action=new">
              <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
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
          title={discreetMode ? "Mostrar valores" : "Ocultar valores"}
        >
          {discreetMode ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
        </Button>

        <ThemeToggle />
        
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 cursor-pointer">
              <Bell className={cn("h-4 w-4", !isLoading && totalCount > 0 && "animate-pulse text-primary")} />
              {!isLoading && totalCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in duration-300">
                  {totalCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[280px] sm:w-80 p-0 overflow-hidden">
            <div className="bg-muted/30 px-4 py-2 border-b border-border/40">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Notificações</h3>
            </div>
            
            <div className="max-h-[350px] overflow-y-auto">
              {totalCount === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary/40" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground/80">Tudo em dia!</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Você não tem nenhuma pendência financeira no momento. 🎉
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  {overdueCount > 0 && (
                    <DropdownMenuItem 
                      onSelect={() => setOpen(false)}
                      asChild 
                      className="p-0 border-none focus:bg-destructive/10 cursor-pointer"
                    >
                      <Link href="/dashboard/contas?tab=atrasadas" className="flex items-center gap-2.5 px-4 py-2.5">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-destructive leading-tight mb-0.5">Contas Atrasadas</p>
                          <p className="text-[11px] text-muted-foreground leading-tight truncate">
                            {overdueCount} {overdueCount === 1 ? 'conta vencida' : 'contas vencidas'}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {setupCount > 0 && (
                    <DropdownMenuItem 
                      onSelect={() => setOpen(false)}
                      asChild 
                      className="p-0 border-none focus:bg-primary/10 cursor-pointer"
                    >
                      <Link href="/dashboard/contas?tutorial=true" className="flex items-center gap-2.5 px-4 py-2.5">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-primary leading-tight mb-0.5">Configuração Pendente</p>
                          <p className="text-[11px] text-muted-foreground leading-tight truncate">
                            {setupCount} {setupCount === 1 ? 'importação pendente' : 'importações pendentes'}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-muted/10 px-4 py-2 border-t border-border/40 flex justify-center">
              <Button asChild variant="link" size="sm" className="h-auto p-0 text-[10px] uppercase font-bold text-primary/60 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                <Link href="/dashboard/contas">Ver todas as contas</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-9 w-9 cursor-pointer transition-all hover:bg-destructive/10 hover:text-destructive"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}