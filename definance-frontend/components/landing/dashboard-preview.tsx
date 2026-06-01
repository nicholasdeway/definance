"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  CreditCard,
  LayoutDashboard,
  Home,
  BarChart3,
  Menu,
  Eye,
  Bell,
  LogOut,
  Moon,
  CalendarDays
} from "lucide-react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

const mockData = {
  saldo: 12450.00,
  receitas: 8500.00,
  despesas: 4350.00,
  contas: 3
}

const mockTransactions = [
  { id: 1, nome: "CLT", data: "10 de mai.", categoria: "Salário", valor: 100, tipo: "receita" },
  { id: 2, nome: "Gás", data: "09 de mai.", categoria: "Moradia", valor: -120, tipo: "despesa" },
  { id: 3, nome: "Gasolina", data: "09 de mai.", categoria: "Veículo", valor: -20, tipo: "despesa" },
  { id: 4, nome: "Uber", data: "09 de mai.", categoria: "Lazer", valor: -45, tipo: "despesa" },
  { id: 5, nome: "Uber", data: "09 de mai.", categoria: "Lazer", valor: -35, tipo: "despesa" }
]

function MobileDashboardContent() {
  return (
    <div className="w-full h-full bg-background p-4 overflow-hidden relative pt-20 pb-20 antialiased">

      {/* MOCKUP TOP DOCK (Replicating DashboardHeader Mobile) */}
      <div className="absolute top-8 left-3 right-3 z-50">
        <div className="bg-background/95 border border-white/10 rounded-full h-11 shadow-md flex items-center justify-between px-2 relative">
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Menu className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/60"><Eye className="h-3.5 w-3.5" /></div>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/60"><Moon className="h-3.5 w-3.5" /></div>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/60"><Bell className="h-3.5 w-3.5" /></div>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/60"><LogOut className="h-3.5 w-3.5" /></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground leading-tight">Olá, Maria</p>
            <p className="text-[10px] text-muted-foreground font-medium">Sua conta hoje</p>
          </div>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card mb-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
        <CardContent className="p-5 pt-6">
          <p className="text-[10px] font-bold text-muted-foreground/80 mb-1 uppercase tracking-wider">Saldo em conta</p>
          <div className="text-2xl font-bold text-card-foreground tracking-tight">
            R$ {mockData.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide opacity-50 mt-1">Este mês</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-2xl border border-border/50 bg-card shadow-sm">
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">Entradas</p>
          <p className="text-sm font-bold text-card-foreground">R$ 8.500,00</p>
        </div>
        <div className="p-4 rounded-2xl border border-border/50 bg-card shadow-sm">
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">Saídas</p>
          <p className="text-sm font-bold text-card-foreground text-destructive">R$ 4.350,00</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Histórico</h4>
          <span className="text-[9px] text-primary font-bold uppercase tracking-widest">Ver Tudo</span>
        </div>
        <div className="space-y-2">
          {mockTransactions.slice(0, 3).map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/5 border border-border/10 group active:scale-95 transition-all">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center border border-border/20 bg-muted/20",
                  t.tipo === 'receita' ? "text-emerald-500/60" : "text-rose-500/60"
                )}>
                  {t.tipo === 'receita' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-foreground/90 leading-tight">{t.nome}</p>
                  <p className="text-[8px] text-muted-foreground/40 font-medium uppercase tracking-tighter">
                    {t.categoria} • {t.data}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-[11px] font-bold tracking-tight",
                  t.tipo === 'receita' ? "text-emerald-500" : "text-foreground/90"
                )}>
                  {t.tipo === 'receita' ? '+' : '-'} R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOCKUP BOTTOM DOCK (Replicating MobileNav) */}
      <div className="absolute bottom-4 left-3 right-3 z-50">
        <div className="bg-background/95 border border-white/10 rounded-full h-14 shadow-lg flex items-center justify-around px-2 relative">
          <div className="flex flex-col items-center justify-center h-10 w-12 text-primary">
            <Home className="h-4 w-4 mb-0.5" />
            <span className="text-[7px] font-bold uppercase tracking-tighter">Início</span>
          </div>
          <div className="flex flex-col items-center justify-center h-10 w-12 text-muted-foreground/60">
            <Wallet className="h-4 w-4 mb-0.5" />
            <span className="text-[7px] font-bold uppercase tracking-tighter">Finanças</span>
          </div>
          <div className="flex flex-col items-center justify-center h-10 w-12 text-muted-foreground/60">
            <BarChart3 className="h-4 w-4 mb-0.5" />
            <span className="text-[7px] font-bold uppercase tracking-tighter">Insights</span>
          </div>
          <div className="flex flex-col items-center justify-center h-10 w-12">
            <div className="h-5 w-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[7px] font-bold text-primary">MS</div>
            <span className="text-[7px] font-bold uppercase tracking-tighter text-muted-foreground/60">Você</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileMockup() {
  return (
    <div className="relative mx-auto border-border bg-card border-[8px] md:border-[10px] rounded-[2.5rem] md:rounded-[2.8rem] h-[480px] md:h-[580px] w-[240px] md:w-[280px] overflow-hidden">
      <div className="rounded-[1.8rem] md:rounded-[2.2rem] overflow-hidden w-full h-full bg-background relative border border-white/5">
        {/* Status Bar Simulation */}
        <div className="absolute top-0 left-0 right-0 h-6 flex justify-between items-center px-8 z-10 bg-background/80">
          <span className="text-[10px] font-bold text-foreground">9:41</span>
          <div className="flex gap-1 items-center">
            <div className="h-1 w-1 rounded-full bg-foreground/50" />
            <div className="h-1.5 w-3 rounded-[1px] border border-foreground/50" />
          </div>
        </div>
        <MobileDashboardContent />
      </div>
    </div>
  )
}

function DashboardContent() {
  return (
    <div className="w-[1200px] bg-background p-10 select-none antialiased">
      {/* Header with Period Filter */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 bg-card/90 border border-border/50 p-1 rounded-xl">
          <div className="flex items-center text-muted-foreground/50 px-3 border-r border-border/20">
            <CalendarDays className="h-4 w-4 mr-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Período:</span>
          </div>
          <div className="flex items-center gap-1.5 px-1">
            <div className="text-[12px] font-bold text-foreground/80 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">Mensal</div>
            <div className="text-[12px] font-bold text-foreground/80 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">Maio</div>
            <div className="text-[12px] font-bold text-foreground/80 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">2026</div>
          </div>
        </div>
      </div>

      {/* Top Stats Grid - Using Exact Classes from DashboardCards */}
      <div className="mb-10 grid grid-cols-4 gap-4">
        {/* Saldo Atual (isPrimary style) */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden py-6 relative">
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-0">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Saldo em Conta</CardTitle>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pt-0 pb-0">
            <div className="text-2xl font-bold tracking-tight text-card-foreground">
              -R$ 290,00
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide opacity-60">Este mês</p>
              <ArrowUpRight className="h-3 w-3 text-primary/40" />
            </div>
          </CardContent>
        </Card>

        {/* Entradas */}
        <Card className="border-border/50 bg-card overflow-hidden py-6 relative">
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-0">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Entradas</CardTitle>
            <div className="p-1.5 rounded-lg bg-muted/50 text-primary">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pt-0 pb-0">
            <div className="text-2xl font-bold tracking-tight text-card-foreground">
              R$ 100,00
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide opacity-60 mt-1">Este mês</p>
          </CardContent>
        </Card>

        {/* Saídas */}
        <Card className="border-border/50 bg-card overflow-hidden py-6 relative">
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-0">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Saídas</CardTitle>
            <div className="p-1.5 rounded-lg bg-muted/50 text-destructive">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pt-0 pb-0">
            <div className="text-2xl font-bold tracking-tight text-card-foreground">
              R$ 390,00
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide opacity-60 mt-1">Este mês</p>
          </CardContent>
        </Card>

        {/* Contas a Vencer */}
        <Card className="border-border/50 bg-card overflow-hidden py-6 relative">
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-0">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Contas a Vencer</CardTitle>
            <div className="p-1.5 rounded-lg bg-muted/50 text-orange-500">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pt-0 pb-0">
            <div className="text-2xl font-bold tracking-tight text-card-foreground">0</div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide opacity-60 mt-1">Faturas Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-12 gap-6">
        {/* Gastos Chart */}
        <Card className="col-span-7 border-border/50 bg-card p-8">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Análise de Gastos</h3>
          </div>
          <div className="flex items-center justify-around gap-12">
            <div className="relative h-64 w-64">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/5" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="11" strokeDasharray="80 251.2" /> {/* Lazer */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#0ea5e9" strokeWidth="11" strokeDasharray="60 251.2" strokeDashoffset="-85" /> {/* Moradia */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="11" strokeDasharray="70 251.2" strokeDashoffset="-150" /> {/* Veículo */}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">Total</span>
                <span className="text-2xl font-bold text-foreground tracking-tight">R$ 390,00</span>
              </div>
            </div>
            <div className="space-y-5 flex-1 max-w-[220px]">
              {[
                { label: "Lazer", value: "31%", color: "bg-emerald-500" },
                { label: "Moradia", value: "31%", color: "bg-sky-500" },
                { label: "Veículo", value: "31%", color: "bg-amber-500" },
                { label: "Alimentação", value: "8%", color: "bg-indigo-500" }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-lg shadow-black/40`} />
                    <span className="text-[12px] font-medium text-muted-foreground/80">{item.label}</span>
                  </div>
                  <span className="text-[12px] font-bold text-foreground/90">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/10">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 text-center mb-8">Evolução Mensal</h4>
            <div className="h-32 w-full flex items-end gap-2 relative">
              <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
                <path d="M0 120 Q 150 40, 300 100 T 600 20 T 900 80 T 1200 40 L 1200 150 L 0 150 Z" fill="url(#grad)" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.15 }} />
                    <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </Card>

        {/* Transactions */}
        <Card className="col-span-5 border-border/50 bg-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Últimas Movimentações</h3>
            <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest hover:text-primary cursor-pointer transition-colors">Ver Todas →</span>
          </div>
          <div className="space-y-5">
            {mockTransactions.map((t, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center border border-border/20 bg-muted/10 transition-all group-hover:scale-110",
                    t.tipo === 'receita' ? "text-emerald-500/60" : "text-rose-500/60"
                  )}>
                    {t.tipo === 'receita' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-foreground/90">{t.nome}</p>
                    <p className="text-[10px] text-muted-foreground/40 font-medium">
                      {t.categoria} • {t.data} • 18:25
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-[12px] font-bold tracking-tight",
                    t.tipo === 'receita' ? "text-emerald-500" : "text-foreground/90"
                  )}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function WebDashboardMockup() {
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const targetWidth = 1200
        setScale(containerWidth < targetWidth ? containerWidth / targetWidth : 1)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="relative rounded-2xl md:rounded-3xl border border-border bg-background overflow-hidden shadow-2xl w-full max-w-6xl mx-auto shadow-black/50">
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-rose-500/50" />
          <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-amber-500/50" />
          <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-emerald-500/50" />
        </div>
        <div className="flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl bg-background/50 px-3 md:px-4 py-1 md:py-1.5 text-[9px] md:text-[11px] font-medium text-muted-foreground border border-border/30">
          <LayoutDashboard className="h-3.5 w-3.5" />
          definance.com.br/dashboard
        </div>
        <div className="w-10 md:w-16" />
      </div>
      <div ref={containerRef} className="relative overflow-hidden bg-background" style={{ height: `${640 * scale}px` }}>
        <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
          <DashboardContent />
        </div>
      </div>
    </div>
  )
}

export function DashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [scaleMultiplier, setScaleMultiplier] = useState(1)

  useEffect(() => {
    const checkSize = () => {
      const w = window.innerWidth
      setIsMobile(w < 768)
      setIsTablet(w >= 768 && w < 1100)

      const h = window.innerHeight
      if (h < 850) {
        setScaleMultiplier(Math.max(0.6, h / 850))
      } else {
        setScaleMultiplier(1)
      }
    }
    checkSize()
    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  // Responsive Transforms with Height-Aware Multiplier
  const rawWebScale = useTransform(smoothProgress, [0, 0.4, 0.6, 1], isMobile ? [0.95, 1, 1, 0.95] : [0.85, 1, 1, 0.9])
  const webScale = useTransform(rawWebScale, (s) => s * scaleMultiplier)
  const webY = useTransform(smoothProgress, [0, 1], [50, -50])

  // Mobile mockup transforms
  const mobileX = useTransform(
    smoothProgress, [0.3, 0.6],
    isMobile ? [0, 0] : isTablet ? [0, 0] : [0, -420]
  )
  const mobileY = useTransform(
    smoothProgress, [0.3, 0.6],
    isMobile ? [120, 20] : isTablet ? [80, -20] : [100, 0]
  )
  const rawMobileScale = useTransform(
    smoothProgress, [0.3, 0.6],
    isMobile ? [0.5, 0.75] : isTablet ? [0.45, 0.65] : [0.65, 0.85]
  )
  const mobileScale = useTransform(rawMobileScale, (s) => s * scaleMultiplier)
  const mobileOpacity = useTransform(smoothProgress, [0.3, 0.45], [0, 1])
  const mobileZIndex = useTransform(smoothProgress, [0, 0.5, 1], [10, 30, 30])

  return (
    <section ref={containerRef} id="como-funciona" className="relative h-[200vh] md:h-[250vh] bg-background border-t border-border/50">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative h-full flex flex-col items-center justify-center pt-24 pb-12">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto mb-8 md:mb-12 max-w-2xl text-center"
          >
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Um dashboard que faz sentido
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Interface limpa e intuitiva. Veja sua situação financeira de forma clara e objetiva.
            </p>
          </motion.div>

          <div className="relative w-full max-w-5xl flex items-center justify-center">
            <motion.div style={{ scale: webScale, y: webY, zIndex: 10, willChange: "transform" }} className="relative w-full shadow-2xl shadow-black/50">
              <WebDashboardMockup />
            </motion.div>

            {/* Mockup do celular — visível em todos os tamanhos, com transforms adaptativos */}
            <motion.div
              style={{
                x: mobileX,
                y: mobileY,
                scale: mobileScale,
                opacity: mobileOpacity,
                zIndex: mobileZIndex,
                willChange: "transform"
              }}
              className="absolute"
            >
              <div className="relative">
                <MobileMockup />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}