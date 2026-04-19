"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Target, 
  Landmark,
  CreditCard
} from "lucide-react"

const navItems = [
  { title: "Geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Entradas", url: "/dashboard/entradas", icon: ArrowDownLeft },
  { title: "Saídas", url: "/dashboard/saidas", icon: ArrowUpRight },
  { title: "Contas", url: "/dashboard/contas", icon: CreditCard },
  { title: "Metas", url: "/dashboard/metas", icon: Target },
  { title: "Perfil", url: "/dashboard/perfil-financeiro", icon: Landmark },
]

export function MobileDashboardNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 w-full overflow-hidden">
      <div 
        className="flex items-center gap-2 overflow-x-auto px-4 py-3 no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ 
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.url
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 border",
                isActive 
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_2px_10px_rgba(34,197,94,0.3)] scale-105" 
                  : "bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/50"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "animate-pulse" : "")} />
              <span className="text-[11px] font-medium uppercase tracking-tight">{item.title}</span>
            </Link>
          )
        })}
        {/* Placeholder para dar espaço no final do scroll */}
        <div className="flex-none w-2 h-1" />
      </div>
    </div>
  )
}