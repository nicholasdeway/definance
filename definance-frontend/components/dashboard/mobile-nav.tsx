"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Wallet, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  History, 
  CreditCard,
  Target,
  LayoutGrid,
  Settings,
  Smartphone,
  UserCircle,
  TrendingUp,
  PieChart,
  Brain
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-provider"

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "US"

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md md:hidden">
      <div className="bg-background/40 backdrop-blur-2xl border border-border/50 rounded-full h-16 shadow-2xl flex items-center justify-around px-2 relative">
        
        {/* 1. Visão Geral (Home) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex flex-col items-center justify-center h-12 w-16 rounded-full transition-all duration-300 group",
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            )}>
              <Home className="h-5 w-5 mb-0.5 group-active:scale-90 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Início</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-48 bg-background/95 backdrop-blur-lg border-border/50 rounded-2xl p-2 shadow-2xl">
            <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest opacity-50 px-2 py-1.5">Visão Geral</DropdownMenuLabel>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <span className="font-medium">Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 2. Financeiro (Wallet) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex flex-col items-center justify-center h-12 w-16 rounded-full transition-all duration-300 group",
              ["/dashboard/entradas", "/dashboard/saidas", "/dashboard/gastos-diarios", "/dashboard/historico", "/dashboard/contas"].includes(pathname) ? "text-primary" : "text-muted-foreground"
            )}>
              <Wallet className="h-5 w-5 mb-0.5 group-active:scale-90 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Finanças</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" sideOffset={8} className="w-56 bg-background/95 backdrop-blur-lg border-border/50 rounded-2xl p-2 shadow-2xl">
            <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest opacity-50 px-2 py-1.5">Gestão Financeira</DropdownMenuLabel>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/entradas">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">Entradas / Ganhos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/saidas">
                <ArrowDownLeft className="h-4 w-4 text-rose-500" />
                <span className="font-medium">Saídas / Despesas</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/gastos-diarios">
                <Calendar className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Gasto Diário</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-muted/30 my-1" />
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/historico">
                <History className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Histórico Total</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/contas">
                <CreditCard className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Minhas Contas</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 3. Análise e Metas (Chart) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex flex-col items-center justify-center h-12 w-16 rounded-full transition-all duration-300 group",
              ["/dashboard/relatorios", "/dashboard/metas", "/dashboard/categorias", "/dashboard/perfil-financeiro"].includes(pathname) ? "text-primary" : "text-muted-foreground"
            )}>
              <BarChart3 className="h-5 w-5 mb-0.5 group-active:scale-90 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Insights</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" sideOffset={8} className="w-56 bg-background/95 backdrop-blur-lg border-border/50 rounded-2xl p-2 shadow-2xl">
            <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest opacity-50 px-2 py-1.5">Inteligência</DropdownMenuLabel>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/relatorios">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">Análises e Relatórios</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/metas">
                <Target className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Minhas Metas</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/categorias">
                <PieChart className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Categorias</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/perfil-financeiro">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Perfil Financeiro</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 4. Avatar / Perfil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center h-12 w-16 rounded-full group">
              <Avatar className={cn(
                "h-6 w-6 mb-0.5 border-2 transition-all duration-300 group-active:scale-90",
                pathname.includes("/dashboard/perfil") ? "border-primary" : "border-transparent"
              )}>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-[8px] bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Você</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" sideOffset={8} className="w-56 bg-background/95 backdrop-blur-lg border-border/50 rounded-2xl p-2 shadow-2xl">
            <div className="px-2 py-2 mb-1">
              <p className="text-xs font-bold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-muted/30 mb-1" />
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/perfil">
                <UserCircle className="h-4 w-4 text-primary" />
                <span className="font-medium">Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/conectar-aplicativos">
                <Smartphone className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">Conectar Apps</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl gap-3 cursor-pointer">
              <Link href="/dashboard/configuracoes">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Configurações</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  )
}