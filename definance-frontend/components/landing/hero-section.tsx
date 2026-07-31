"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { useSectionNavigation } from "@/lib/scroll-utils"

import { useState, useEffect } from "react"

export function HeroSection() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  const { navigateToSection } = useSectionNavigation()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determinar o link e texto corretos baseados no estado de autenticação
  const getCtaConfig = () => {
    if (isLoading) return { href: "/register", label: "Começar Grátis com IA" }

    if (!isAuthenticated) {
      return { href: "/register", label: "Começar Grátis com IA" }
    }

    return {
      href: user?.hasCompletedOnboarding ? "/dashboard" : "/onboarding",
      label: user?.hasCompletedOnboarding ? "Acessar meu Dashboard" : "Concluir Onboarding"
    }
  }

  const { href, label } = getCtaConfig()

  return (
    <section className="dark relative overflow-hidden py-20 md:py-32 bg-black dark:bg-muted/30 border-y border-border/50 text-foreground">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
      </div>

      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            IA no WhatsApp para sua rotina
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl leading-tight">
            Pare de perder dinheiro.{" "}
            <span className="animate-shimmer-text">Controle tudo pelo WhatsApp.</span>
          </h1>

          <p className="mb-10 text-pretty text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
            Mande um áudio de 5 segundos e nossa IA organiza, categoriza e registra seus gastos automaticamente. Sem planilhas. Sem complicação. Em segundos.
          </p>

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={mounted && !isLoading ? href : "/register"}>
                <Button
                  className="group cursor-pointer w-full sm:w-auto h-14 min-w-[220px] bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 font-bold text-base rounded-xl"
                >
                  Começar Agora — 7 Dias Grátis
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/#como-funciona" onClick={(e) => navigateToSection('/#como-funciona', e)}>
                <Button
                  variant="outline"
                  className="cursor-pointer w-full sm:w-auto h-12 min-w-[180px] border-border/50 bg-background/90 hover:bg-muted/50 transition-all rounded-xl"
                >
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  Ver como funciona
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/70 font-medium">
              ✓ Sem cartão de crédito &nbsp;·&nbsp; ✓ Cancela quando quiser &nbsp;·&nbsp; ✓ Setup em 2 minutos
            </p>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <div className="flex -space-x-3">
              <img 
                className="inline-block h-9 w-9 rounded-full ring-2 ring-background object-cover" 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Usuária do Definance" 
              />
              <img 
                className="inline-block h-9 w-9 rounded-full ring-2 ring-background object-cover" 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Usuário do Definance" 
              />
              <img 
                className="inline-block h-9 w-9 rounded-full ring-2 ring-background object-cover" 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Usuária do Definance" 
              />
              <img 
                className="inline-block h-9 w-9 rounded-full ring-2 ring-background object-cover" 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Usuário do Definance" 
              />
            </div>
            
            <div className="flex flex-col items-center sm:items-start text-sm">
              <div className="flex items-center gap-1.5 text-amber-400 justify-center">
                <div className="flex">
                  {"★★★★★".split("").map((star, idx) => (
                    <span key={idx}>★</span>
                  ))}
                </div>
                <span className="font-bold text-foreground">4.9/5</span>
                <span className="text-muted-foreground text-xs">(+5.000 usuários)</span>
              </div>
              <p className="text-muted-foreground text-xs mt-0.5">
                Mais de <span className="font-semibold text-emerald-500">R$ 2.4 Milhões</span> economizados pelos membros.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}