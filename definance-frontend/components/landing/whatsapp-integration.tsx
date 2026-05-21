"use client"

import { WhatsAppMockup } from "./whatsapp-mockup"
import { motion } from "framer-motion"
import { CheckCircle2, MessageSquare, Sparkles, Mic } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { useState, useEffect } from "react"
import Link from "next/link"

export function WhatsAppIntegration() {
  const { isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section id="whatsapp" className="relative py-24 overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00a884]/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Content */}
          <div className="max-w-xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00a884] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00a884]" />
                </span>
                IA no WhatsApp para sua rotina
              </div>

              <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                Esqueça as <span className="animate-shimmer-text">planilhas</span>. Controle tudo por mensagem.
              </h2>
              
              <p className="mb-10 text-lg text-muted-foreground leading-relaxed">
                Finanças, relatórios e gastos. Organizados por IA, direto no WhatsApp. 
                Sem apps complicados, apenas envie uma mensagem ou áudio e deixe que cuidamos do resto.
              </p>

              <div className="grid gap-6 sm:grid-cols-2 mb-10">
                {[
                  { icon: Mic, text: "Registre por áudio" },
                  { icon: MessageSquare, text: "Consulte em segundos" },
                  { icon: Sparkles, text: "Organize com IA" },
                  { icon: CheckCircle2, text: "Sincronize com o painel" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border/50">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80">{item.text}</span>
                  </div>
                ))}
              </div>

              {mounted && !isAuthenticated && !isLoading && (
                <Link href="/login">
                  <button className="h-12 px-8 rounded-full bg-[#00a884] text-[#0b141a] font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-[#00a884]/20 active:scale-95 cursor-pointer">
                    Começar agora
                  </button>
                </Link>
              )}
            </motion.div>
          </div>

          {/* Right Side: Animated Mockup */}
          <div className="relative flex justify-center mt-12 lg:mt-0">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.7, delay: 0.2 }}
               className="relative z-10 scale-[0.8] md:scale-100"
             >
                {/* Floating Elements Behind Mockup */}
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 rounded-full blur-3xl animate-pulse -z-10" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-[#00a884]/20 rounded-full blur-3xl animate-pulse -z-10" />
                
                <WhatsAppMockup />
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
