"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Wallet,
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Target,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronUp,
  CalendarDays,
  Shield,
} from "lucide-react"
import { useAuth } from "@/lib/auth-provider"

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Receitas", url: "/dashboard/receitas", icon: ArrowDownLeft },
  { title: "Despesas", url: "/dashboard/despesas", icon: ArrowUpRight },
  { title: "Gastos Diários", url: "/dashboard/gastos-diarios", icon: CalendarDays },
  { title: "Contas", url: "/dashboard/contas", icon: CreditCard },
  { title: "Metas", url: "/dashboard/metas", icon: Target },
  { title: "Relatórios", url: "/dashboard/relatorios", icon: BarChart3 },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.firstName 
      ? user.firstName.slice(0, 2).toUpperCase()
      : "US"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-14 justify-center pt-0 pb-0">
        <Link href="/dashboard" className="flex items-center gap-2 px-2">
          <Logo size={32} />
          <span className="truncate text-lg font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Definance
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 group-data-[collapsible=icon]:mx-auto">
                    <AvatarImage src={user?.avatar} alt="Avatar" />
                    <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="flex items-center gap-1.5 truncate font-semibold text-sidebar-foreground">
                      {user ? `${user.firstName} ${user.lastName}` : "Usuário"}
                      {user?.role === "admin" && (
                        <Shield className="h-3 w-3 text-primary" />
                      )}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70">{user?.email}</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/configuracoes" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="flex cursor-pointer items-center gap-2 text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}