"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={18} withCard variant="primary" />
          <span className="text-xl font-bold text-foreground">Definance</span>
        </Link>
        
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#beneficios" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Benefícios
          </Link>
          <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Como funciona
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/70">
              Criar Conta
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}