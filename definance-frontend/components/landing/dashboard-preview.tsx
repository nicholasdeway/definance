"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownLeft, ArrowUpRight, Wallet, CreditCard, LayoutDashboard } from "lucide-react"

const mockData = {
  saldo: 12450.00,
  receitas: 8500.00,
  despesas: 4350.00,
  contas: 3
}

const mockTransactions = [
  { id: 1, nome: "Salário", valor: 5500, tipo: "receita", data: "15 Mar" },
  { id: 2, nome: "Aluguel", valor: -1800, tipo: "despesa", data: "10 Mar" },
  { id: 3, nome: "Supermercado", valor: -450, tipo: "despesa", data: "08 Mar" },
  { id: 4, nome: "Freelance", valor: 2000, tipo: "receita", data: "05 Mar" },
]

function MobileDashboardContent() {
  return (
    <div className="w-[272px] h-[572px] bg-card p-4 overflow-y-auto overflow-x-hidden relative mt-4">
      {/* Mini Header / Profile */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Wallet className="h-3 w-3 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-foreground leading-tight">Olá, Maria</p>
            <p className="text-[7px] text-muted-foreground">Suas finanças hoje</p>
          </div>
        </div>
        <div className="h-6 w-6 rounded-lg bg-muted/20 flex items-center justify-center border border-border/30">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      {/* Main Balance Card */}
      <Card className="border-border/40 bg-gradient-to-br from-primary/10 to-primary/5 mb-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-2xl -mr-10 -mt-10 rounded-full" />
        <CardContent className="p-4 pt-4">
          <p className="text-[9px] font-medium text-muted-foreground/80 mb-1 uppercase tracking-wider">Saldo em conta</p>
          <div className="text-xl font-bold text-foreground">
            R$ {mockData.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[8px] text-emerald-500 font-bold">↑ 12.5%</span>
            <span className="text-[7px] text-muted-foreground">vencendo agora</span>
          </div>
        </CardContent>
      </Card>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="p-3 rounded-xl border border-border/30 bg-muted/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 mb-1">
                <ArrowDownLeft className="h-2.5 w-2.5 text-primary" />
                <span className="text-[8px] text-muted-foreground">Entradas</span>
            </div>
            <p className="text-xs font-bold text-card-foreground">R$ 8.500</p>
          </div>
          <div className="p-3 rounded-xl border border-border/30 bg-muted/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 mb-1">
                <ArrowUpRight className="h-2.5 w-2.5 text-destructive" />
                <span className="text-[8px] text-muted-foreground">Saídas</span>
            </div>
            <p className="text-xs font-bold text-card-foreground">R$ 4.350</p>
          </div>
      </div>

      {/* Simplified Transactions */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
            <h4 className="text-[9px] font-bold text-foreground uppercase tracking-wider">Histórico</h4>
            <span className="text-[7px] text-primary font-bold">VER TUDO</span>
        </div>
        <div className="space-y-2.5">
            {mockTransactions.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/5 border border-border/5">
                    <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center ${t.tipo === 'receita' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                            {t.tipo === 'receita' ? <ArrowDownLeft className="h-3 w-3 text-primary" /> : <ArrowUpRight className="h-3 w-3 text-destructive" />}
                        </div>
                        <div>
                            <p className="text-[9px] font-medium text-foreground">{t.nome}</p>
                            <p className="text-[7px] text-muted-foreground">{t.data}</p>
                        </div>
                    </div>
                    <span className={`text-[9px] font-bold ${t.valor > 0 ? 'text-primary' : 'text-foreground'}`}>
                        {t.valor > 0 ? '+' : '-'} R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                </div>
            ))}
        </div>
      </div>

      {/* Bottom Nav Simulation - Floating */}
      <div className="absolute bottom-4 left-4 right-4 h-11 bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around px-2">
          <div className="p-1.5 bg-primary/20 rounded-lg"><LayoutDashboard className="h-3.5 w-3.5 text-primary" /></div>
          <div className="p-1.5"><Wallet className="h-3.5 w-3.5 text-muted-foreground/60" /></div>
          <div className="p-1.5"><CreditCard className="h-3.5 w-3.5 text-muted-foreground/60" /></div>
          <div className="h-6 w-6 rounded-full bg-muted/20 border border-white/5 flex items-center justify-center overflow-hidden italic text-[7px] font-bold">MS</div>
      </div>
    </div>
  )
}

function MobileMockup() {
  return (
    <div className="relative mx-auto border-border bg-card border-[10px] rounded-[2.5rem] h-[592px] w-[292px]">
        <div className="h-[32px] w-[3px] bg-border absolute -left-[13px] top-[72px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-border absolute -left-[13px] top-[124px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-border absolute -left-[13px] top-[178px] rounded-s-lg"></div>
        <div className="h-[64px] w-[3px] bg-border absolute -right-[13px] top-[142px] rounded-e-lg"></div>
        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background relative">
          {/* Status Bar Simulation */}
          <div className="absolute top-0 left-0 right-0 h-6 flex justify-between items-center px-6 z-10">
              <span className="text-[10px] font-bold text-foreground">9:41</span>
              <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full border border-foreground/30" />
                  <div className="h-2 w-3 rounded-sm border border-foreground/30" />
              </div>
          </div>
          <MobileDashboardContent />
        </div>
    </div>
  )
}

function DashboardContent() {
  return (
    <div className="w-[1024px] bg-background p-6 select-none">
      <div className="mb-6 grid grid-cols-4 gap-4">
        <Card className="border-border/50 bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              R$ {mockData.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-primary">+12% este mês</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Recebido</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              R$ {mockData.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gasto</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              R$ {mockData.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contas a Vencer</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{mockData.contas}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/50 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base text-card-foreground">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative h-40 w-40">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="100 151" className="text-primary" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="60 191" strokeDashoffset="-100" className="text-chart-2" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="40 211" strokeDashoffset="-160" className="text-chart-3" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-card-foreground">R$ 4.350</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Moradia 40%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-chart-2" />
                <span className="text-muted-foreground">Alimentação 25%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-chart-3" />
                <span className="text-muted-foreground">Outros 35%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base text-card-foreground">Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${t.tipo === 'receita' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                      {t.tipo === 'receita' ? (
                        <ArrowDownLeft className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{t.nome}</p>
                      <p className="text-xs text-muted-foreground">{t.data}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${t.valor > 0 ? 'text-primary' : 'text-card-foreground'}`}>
                    {t.valor > 0 ? '+' : ''} R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function DashboardPreview() {
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const targetWidth = 1024
        if (containerWidth < targetWidth) {
          setScale(containerWidth / targetWidth)
        } else {
          setScale(1)
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <section id="como-funciona" className="py-20 md:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Um dashboard que faz sentido
          </h2>
          <p className="text-lg text-muted-foreground">
            Interface limpa e intuitiva. Veja sua situação financeira de forma clara e objetiva.
          </p>
        </div>
        
        <div className="mx-auto max-w-5xl relative">
          {/* Dashboard Device Frame */}
          <div className="relative rounded-2xl border border-border bg-background overflow-hidden group transition-transform duration-500 md:hover:scale-[1.02]">
            {/* Window Controls / Top Bar */}
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-orange-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <div className="flex items-center gap-2 rounded-md bg-background/50 px-3 py-1 text-[10px] text-muted-foreground border border-border/30">
                <LayoutDashboard className="h-3 w-3" />
                definance.com.br/dashboard
              </div>
              <div className="w-12" /> {/* Spacer */}
            </div>

            {/* Glowing Shimmer Effect */}
            <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10" />
            
            {/* Scaling Container */}
            <div 
              ref={containerRef}
              className="relative overflow-hidden transition-all duration-300 ease-out"
              style={{ height: `${580 * scale}px` }}
            >
              <div 
                className="absolute top-0 left-0 origin-top-left"
                style={{ transform: `scale(${scale})` }}
              >
                <DashboardContent />
              </div>
            </div>
          </div>

          {/* Mobile Mockup Overlay (Always Overlapping) */}
          <div className="absolute -left-4 -bottom-6 md:-left-12 md:-bottom-16 z-30 scale-[0.5] sm:scale-[0.6] md:scale-[0.8] origin-bottom-left transition-transform duration-300 md:hover:scale-[0.85]">
            <MobileMockup />
          </div>
        </div>
      </div>
    </section>
  )
}