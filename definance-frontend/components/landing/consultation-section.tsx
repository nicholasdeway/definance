"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCheck, Mic, Play, Receipt, Target, Check, Calendar, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function ConsultationSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [isLuzPaid, setIsLuzPaid] = useState(false)

  // Card 1 Loop: Simulação de áudio no WhatsApp
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  // Card 2 Loop: Simulação de dar baixa
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLuzPaid((prev) => !prev)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const waveBars = Array.from({ length: 32 })

  return (
    <section id="recursos-consultas" className="dark relative py-24 overflow-hidden bg-background border-t border-border/50 text-foreground">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full -z-10 opacity-5 blur-[100px]" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/3 right-1/4 h-72 w-72 rounded-full -z-10 opacity-5 blur-[100px]" style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />

      <div className="container px-4 md:px-6 mx-auto">
        
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold text-emerald-500 uppercase tracking-widest">
            Praticidade no Dia a Dia
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Como você gerencia tudo pelo <span className="animate-shimmer-text">WhatsApp</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Descubra as formas inteligentes de conduzir suas finanças mandando apenas uma mensagem de áudio ou texto.
          </p>
        </div>

        {/* Cards Layout (Competitor inspired, vertically stacked for spacing) */}
        <div className="flex flex-col gap-10 max-w-4xl mx-auto">
          
          {/* CARD 1: Consulta de Contas e Metas por Voz/Texto */}
          <div className="bg-card/40 border border-border/50 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md flex flex-col md:flex-row gap-12 items-center justify-between overflow-hidden group hover:border-emerald-500/20 transition-all duration-300 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Text details */}
            <div className="flex-1 space-y-5 text-left">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25">
                <Mic className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Acompanhe contas e metas por áudio</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Mande um áudio de 5 segundos ou digite sua pergunta. A inteligência artificial do Definance entende seu áudio e traz os dados do seu painel na hora.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground font-medium">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Consulte quantos boletos vencem na semana.
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Saiba a porcentagem de conclusão de suas metas.
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Entende gírias e linguagem natural perfeitamente.
                </li>
              </ul>
            </div>

            {/* Visual Mini Mockup */}
            <div className="w-full max-w-[260px] h-[250px] bg-[#0b141a] rounded-[2rem] border-4 border-[#202c33] shadow-lg flex flex-col justify-between p-4 overflow-hidden shrink-0 relative">
              {/* Wallpaper overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }} />
              
              <div className="flex flex-col gap-3 relative z-10">
                {/* Header info */}
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <div className="h-6 w-6 rounded-full bg-background flex items-center justify-center overflow-hidden border border-border p-1">
                    <img src="/logo1.png" alt="Logo" className="h-full w-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-white/90">Definance</span>
                </div>

                {/* Simulated Conversation */}
                <div className="space-y-2 text-left">
                  {/* User voice bubble */}
                  {activeStep >= 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="p-3 rounded-2xl rounded-tr-none bg-[#005c4b] text-white shadow-sm flex items-center gap-3 w-[230px] ml-auto justify-between"
                    >
                      <Play className="h-3.5 w-3.5 fill-current text-[#53bdeb] shrink-0" />
                      <div className="flex items-center gap-[2px] h-5 flex-1 justify-center mx-1.5 overflow-hidden">
                        {waveBars.map((_, idx) => (
                          <div
                            key={idx}
                            className="w-[2px] bg-[#53bdeb] rounded-full shrink-0"
                            style={{
                              height: `${Math.max(5, Math.sin(idx * 0.3) * 10 + 8)}px`,
                              animationName: activeStep === 0 ? 'pulse' : 'none',
                              animationDuration: '1s',
                              animationIterationCount: 'infinite',
                              animationDelay: `${idx * 0.03}s`
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[8px] text-white/40 shrink-0">0:06</span>
                    </motion.div>
                  )}

                  {/* AI processing or text */}
                  {activeStep === 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-2.5 bg-[#202c33] rounded-2xl rounded-tl-none text-[9.5px] text-white/80 max-w-[85%]"
                    >
                      Processando áudio... 🎙️
                    </motion.div>
                  )}

                  {/* AI full response */}
                  {activeStep >= 2 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 bg-[#202c33] rounded-2xl rounded-tl-none text-[9.5px] text-white/95 max-w-[90%] leading-relaxed"
                    >
                      Sua meta **Reserva de Emergência** está em **70% concluída** (R$ 3.500 acumulados). Faltam apenas 30% (R$ 1.500) para atingir seu objetivo! 🎯
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Fake message input */}
              <div className="h-6 bg-white/5 rounded-full flex items-center px-2 text-[8px] text-white/20 select-none">
                Mensagem
              </div>
            </div>

          </div>

          {/* CARD 2: Baixa e Quitação de Contas */}
          <div className="bg-card/40 border border-border/50 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md flex flex-col md:flex-row-reverse gap-12 items-center justify-between overflow-hidden group hover:border-emerald-500/20 transition-all duration-300 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Text details */}
            <div className="flex-1 space-y-5 text-left">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25">
                <Receipt className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Dê baixa em contas pagas na hora</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Boleto pago? Mande uma mensagem como "paguei a conta de energia" e a inteligência do Definance liquida a fatura no seu dashboard em tempo real.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground font-medium">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Comandos rápidos por texto ou voz ("conta de luz paga").
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Sincronização imediata com os gráficos do painel.
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Organização clara do que está pago e pendente.
                </li>
              </ul>
            </div>

            {/* Visual Mini Mockup Dashboard Panel */}
            <div className="w-full max-w-[260px] h-[250px] bg-[#0c0c0d] rounded-[2rem] border border-border/80 shadow-lg flex flex-col justify-between p-4 overflow-hidden shrink-0 relative">
              <div className="flex flex-col gap-3.5 text-left">
                {/* Dashboard style header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-[9px] font-bold text-foreground tracking-wide uppercase">Contas a Pagar</span>
                  <span className="text-[8px] font-bold bg-[#00a884]/10 text-[#00a884] px-1.5 py-0.5 rounded">WhatsApp Sync</span>
                </div>

                {/* List of Simulated Bills */}
                <div className="space-y-2.5">
                  {/* Bill 1: Energia (This bill switches status dynamically) */}
                  <div className="relative p-2.5 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between overflow-hidden">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs">
                        ⚡
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-foreground block">Conta de Energia</span>
                        <span className="text-[8px] text-muted-foreground">Vence em 2 dias</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] font-bold text-foreground">R$ 142,50</span>
                      {isLuzPaid ? (
                        <motion.span 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-[7.5px] text-emerald-500 font-bold bg-emerald-500/10 px-1 py-0.2 rounded mt-0.5 border border-emerald-500/20"
                        >
                          PAGO
                        </motion.span>
                      ) : (
                        <span className="text-[7.5px] text-rose-500 font-bold bg-rose-500/10 px-1 py-0.2 rounded mt-0.5 border border-rose-500/20">
                          PENDENTE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bill 2: Internet (Statically Paid) */}
                  <div className="relative p-2.5 rounded-xl border border-border/20 bg-muted/10 flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs">
                        🌐
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-foreground block">Plano de Internet</span>
                        <span className="text-[8px] text-muted-foreground">Pago via WhatsApp</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] font-bold text-foreground">R$ 99,90</span>
                      <span className="text-[7.5px] text-emerald-500 font-bold bg-emerald-500/10 px-1 py-0.2 rounded mt-0.5 border border-emerald-500/20">
                        PAGO
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Visual Alert feedback */}
              <AnimatePresence mode="wait">
                {isLuzPaid ? (
                  <motion.div
                    key="paid-toast"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8.5px] font-semibold flex items-center justify-center gap-1 border border-emerald-500/10 shadow-sm"
                  >
                    <span>⚡ Conta de Energia dada baixa!</span>
                  </motion.div>
                ) : (
                  <div className="h-[21px]" />
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
