"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    name: "Mariana Silva",
    role: "Autônoma / Empreendedora",
    quote: "Antes da Definance, eu me perdia no fluxo de caixa da minha empresa e no pessoal. Agora só mando as mensagens por áudio no WhatsApp no meio do dia e o painel organiza tudo. Economizo horas de planilha!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "Carlos Rocha",
    role: "Engenheiro Civil",
    quote: "O que eu mais gosto é a precisão da inteligência artificial. Eu falo 'almoço de negócios 120 reais no débito' e ela já joga na categoria Alimentação e desconta do meu saldo. É bizarro de prático!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "Amanda Costa",
    role: "Médica Pediatra",
    quote: "Consigo acompanhar minhas metas mensais sem nenhum esforço. O controle financeiro integrado ao WhatsApp mudou meu jogo. Recomendo para todos os meus colegas de profissão.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "Thiago Ramos",
    role: "Designer Freelancer",
    quote: "A Definance colocou minha vida financeira no piloto automático. A interface do painel web é linda e super rápida, mas o assistente no WhatsApp é o verdadeiro diferencial de produtividade.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "Juliana Mendes",
    role: "Gerente de Marketing",
    quote: "Nunca fui fã de planilhas de Excel. Com o assistente por voz do WhatsApp, ficou muito fácil controlar meus gastos diários e finalmente ver meu dinheiro render no fim do mês.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80"
  }
]

// Componente de Contador Animado que sobe de 0 ao valor final quando entra na tela
function Counter({
  value,
  duration = 1800,
  decimals = 0,
  prefix = "",
  suffix = ""
}: {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const elementRef = useRef<HTMLSpanElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!hasStarted) return

    let start = 0
    const end = value
    if (start === end) return

    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / duration, 1)

      // Easing: easeOutQuad
      const easeProgress = progress * (2 - progress)

      const currentValue = start + (end - start) * easeProgress
      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [hasStarted, value, duration])

  return (
    <span ref={elementRef}>
      {prefix}
      {count.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(2) // Default central index (Amanda Costa)
  const [isMobile, setIsMobile] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!autoPlay) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000) // Troca a cada 6 segundos
    return () => clearInterval(interval)
  }, [autoPlay])

  const handlePrev = () => {
    setAutoPlay(false)
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setAutoPlay(false)
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const handleSelect = (idx: number) => {
    setAutoPlay(false)
    setActiveIndex(idx)
  }

  return (
    <section id="depoimentos" className="dark relative py-24 overflow-hidden bg-black dark:bg-muted/20 border-y border-border/50 text-foreground">
      {/* Decorative Background Gradients */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full -z-10 pointer-events-none opacity-5" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />

      <div className="container px-4 md:px-6 mx-auto">

        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold text-emerald-500 uppercase tracking-widest">
            Resultados Reais
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Quem usa a inteligência do <span className="animate-shimmer-text">Definance</span> aprova
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Veja como nossos membros transformaram sua relação com o dinheiro em poucos dias.
          </p>
        </div>

        {/* Vídeo de Depoimento — proporção 9:16 (vertical/celular) */}
        <div className="flex justify-center mb-16">
          <div className="relative w-full max-w-[300px] sm:max-w-[320px]">
            {/* Glow de fundo */}
            <div className="absolute -inset-3 rounded-[3rem] bg-emerald-500/10 blur-2xl pointer-events-none" />

            {/* Frame do celular */}
            <div className="relative rounded-[2.5rem] overflow-hidden border-[3px] border-white/10 shadow-2xl shadow-black/60 ring-1 ring-white/5 bg-black">
              {/* Entalhe do topo (notch decorativo) */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-white/10 z-10" />

              {/* Vídeo 9:16 */}
              <div className="aspect-[9/16] w-full">
                <video
                  src="/depoimento.mp4"
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  poster=""
                  aria-label="Depoimento de usuário do Definance"
                />
              </div>
            </div>

            {/* Badge "Depoimento real" */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/30 whitespace-nowrap">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Depoimento real
            </div>
          </div>
        </div>

        {/* Stats Grid Dashboard Style */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-card/45 border border-border/50 rounded-[2rem] p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-border/20">

              <div className="flex flex-col items-center justify-center text-center p-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Registros Processados</span>
                <span className="text-3xl font-extrabold text-foreground mt-1.5">
                  <Counter value={1.5} decimals={1} prefix="+" suffix="M" />
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">Categorizados por IA</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center p-2 pt-6 md:pt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Economia Gerada</span>
                <span className="text-3xl font-extrabold text-emerald-500 mt-1.5">
                  <Counter value={2.4} decimals={1} prefix="+R$ " suffix="M" />
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">Para nossos usuários</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center p-2 pt-6 md:pt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Planilhas Descartadas</span>
                <span className="text-3xl font-extrabold text-foreground mt-1.5">
                  <Counter value={20} decimals={0} prefix="+" suffix="K" />
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">Substituídas por IA</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center p-2 pt-6 md:pt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Precisão da IA</span>
                <span className="text-3xl font-extrabold text-foreground mt-1.5">
                  <Counter value={99.9} decimals={1} suffix="%" />
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">Na categorização</span>
              </div>

            </div>
          </div>
        </div>

        {/* 3D Glassmorphic Cards Carousel */}
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden py-10 px-4">
          <div className="relative flex justify-center items-center h-[360px] md:h-[280px]">
            {testimonials.map((item, idx) => {
              let diff = idx - activeIndex
              const len = testimonials.length

              // Handle infinite wrapping for carousel offset calculations
              if (diff < -len / 2) diff += len
              if (diff > len / 2) diff -= len

              const isActive = diff === 0
              const isVisible = isMobile ? isActive : Math.abs(diff) <= 1

              if (!isVisible) return null

              return (
                <motion.div
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={cn(
                    "absolute w-full max-w-[280px] md:max-w-[460px] p-6 md:p-8 rounded-3xl border transition-all duration-500 cursor-pointer flex flex-col justify-between bg-card text-left",
                    isActive
                      ? "border-emerald-500/40 bg-card shadow-xl shadow-emerald-500/5 z-20"
                      : "border-border/20 bg-card/20 opacity-30 scale-90 z-10 hover:opacity-50"
                  )}
                  animate={{
                    x: isMobile ? diff * 0 : diff * 380, // centered stacks on mobile
                    scale: isActive ? 1.05 : 0.9,
                    rotateY: isMobile ? 0 : diff * -12, // subtle 3D tilt
                    z: isActive ? 0 : -80,
                    opacity: isActive ? 1 : 0.3
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className={cn(
                            "w-11 h-11 rounded-xl object-cover border-2 transition-all duration-300",
                            isActive ? "border-emerald-500" : "border-border/30"
                          )}
                        />
                        <div>
                          <h4 className="text-xs md:text-sm font-bold text-foreground leading-tight">{item.name}</h4>
                          <span className="text-[10px] text-muted-foreground font-semibold block">{item.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground italic leading-relaxed">
                      "{item.quote}"
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Navigation Dots & Buttons */}
          <div className="flex justify-center items-center gap-5 mt-10">
            <button
              onClick={handlePrev}
              type="button"
              className="h-10 w-10 rounded-xl border border-border/80 bg-background/40 hover:bg-muted/50 text-foreground transition-all flex items-center justify-center cursor-pointer active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                    activeIndex === idx ? "w-6 bg-emerald-500" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              type="button"
              className="h-10 w-10 rounded-xl border border-border/80 bg-background/40 hover:bg-muted/50 text-foreground transition-all flex items-center justify-center cursor-pointer active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* CTA após depoimentos */}
        <div className="flex flex-col items-center gap-3 mt-12">
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            Quero organizar minhas finanças agora
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <p className="text-xs text-muted-foreground/60 font-medium">7 dias grátis &bull; Sem cartão de crédito</p>
        </div>

      </div>
    </section>
  )
}
