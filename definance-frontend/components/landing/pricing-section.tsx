"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, ShieldCheck, Headphones, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"

const features = [
  "Dashboard Web",
  "IA no WhatsApp",
  "Áudio e Texto",
  "Relatórios Automáticos",
  "Categorias Ilimitadas",
  "Consultas em Tempo Real"
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const { isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section id="precos" className="relative py-24 overflow-hidden bg-muted/20">
      <div className="container px-4 mx-auto">

        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="mb-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Um plano. <span className="animate-shimmer-text">Sem limites.</span>
          </h2>
          <p className="text-[13px] text-muted-foreground font-medium">
            7 dias de acesso total. Bloqueio automático após o trial.
          </p>
        </div>

        {/* Toggle Mensal/Anual */}
        <div className="flex justify-center mb-10">
          <div className="relative flex p-1 bg-background border border-border rounded-xl shadow-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "relative px-6 md:px-8 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200",
                !isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative z-10">Mensal</span>
              {!isAnnual && (
                <motion.div
                  layoutId="active-plan-bg"
                  className="absolute inset-0 bg-primary rounded-lg shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "relative px-6 md:px-8 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200",
                isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative z-10">Anual</span>
              {isAnnual && (
                <motion.div
                  layoutId="active-plan-bg"
                  className="absolute inset-0 bg-primary rounded-lg shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-sm mx-auto scale-[0.95] md:scale-100">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-card border border-border rounded-[2rem] shadow-md overflow-hidden"
          >
            {/* Top Subtle Glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <div className="p-8 text-center border-b border-border/50 relative z-10">
              <div className="flex justify-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-semibold uppercase tracking-widest border border-primary/20">Plano Único</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-semibold uppercase tracking-widest border border-emerald-500/20">7 Dias Trial</span>
              </div>

              <h3 className="text-[12px] font-medium text-foreground mb-6 uppercase tracking-[0.2em] opacity-80">Acesso completo ao Definance</h3>

              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-xl font-medium text-foreground opacity-60">R$</span>
                <span className="text-5xl font-bold text-foreground tracking-tighter">
                  {isAnnual ? "16" : "19"}
                </span>
                <span className="text-xl font-medium text-foreground opacity-60">
                  ,{isAnnual ? "65" : "90"}
                </span>
                <span className="text-muted-foreground text-[10px] font-bold ml-1.5 opacity-40">/mês</span>
              </div>

              <p className="mt-2 text-[10px] text-muted-foreground font-normal italic opacity-60">
                {isAnnual ? "ou R$ 199,90 à vista" : "Plano mensal sem fidelidade"}
              </p>

              {isAnnual && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold border border-emerald-500/20">
                  Economia de 15%
                </div>
              )}

              <div className="mt-8 space-y-4">
                {!mounted ? (
                  <Button disabled className="w-full h-12 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-xl bg-primary opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
                    Começar agora
                    <span className="text-lg font-light">→</span>
                  </Button>
                ) : (
                  <Button asChild className="w-full h-12 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                    <Link href={isAuthenticated ? "/dashboard/perfil#plans-section" : "/login"}>
                      Começar agora
                      <span className="text-lg font-light">→</span>
                    </Link>
                  </Button>
                )}

                <div className="flex items-center justify-center gap-4 text-[9px] text-muted-foreground font-medium uppercase tracking-widest opacity-40">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Compra Segura
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />
                    7 Dias de Garantia
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-muted/5 relative z-10">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">O que está incluso</span>
                <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10 uppercase">Ilimitado</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Dashboard Web", icon: "Web" },
                  { label: "IA no WhatsApp", icon: "Chat" },
                  { label: "Áudio e Texto", icon: "Mic" },
                  { label: "Relatórios IA", icon: "Chart" },
                  { label: "Categorias Ilimitadas", icon: "List" },
                  { label: "Consultas IA", icon: "Search" }
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border/50 group hover:bg-muted/50 transition-colors">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-[10px] font-medium text-foreground/60 leading-tight uppercase tracking-normal">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-[9px] text-muted-foreground italic opacity-60 leading-tight">
                  Acesso bloqueado automaticamente <br /> após o período de trial de 7 dias.
                </p>
              </div>
            </div>
          </motion.div>
        </div>


      </div>
    </section>
  )
}