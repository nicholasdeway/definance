import React from "react"
import Link from "next/link"
import { LogOut, User as UserIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export const OnboardingHeader = () => {
  const { user, logout } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto relative w-full flex items-center justify-between bg-background/95 border-b border-border/40 py-3 px-6 md:px-8 shadow-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo size={25} />
          <span className="text-xl font-bold text-foreground">Definance</span>
        </Link>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-foreground leading-none">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-[10px] text-primary font-medium mt-1 uppercase tracking-wider">
              Configurando Perfil
            </span>
          </div>

          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <UserIcon className="h-4 w-4 text-primary" />
          </div>

          <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              if (window.confirm("Você ainda não finalizou o onboarding. Se sair agora, seu progresso será salvo, mas você precisará voltar aqui depois para concluir. Deseja sair?")) {
                logout()
              }
            }}
            className="text-muted-foreground hover:text-destructive gap-2 font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </nav>
    </header>
  )
}
