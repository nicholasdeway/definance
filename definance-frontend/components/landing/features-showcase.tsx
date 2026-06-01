"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target, CreditCard, Sparkles, Check, Play, RotateCcw, Shield, Folder, Edit, BellRing, TrendingUp, Database, Trash2, History, ArrowDownLeft, ArrowUpRight, FileText, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"

// Tipos de chaves para cada funcionalidade exibida na aba esquerda
type FeatureKey = "goals" | "ai" | "cards" | "categories" | "data"

export function FeaturesShowcase() {
  // Define qual funcionalidade está ativa no momento (padrão: "goals")
  const [activeFeature, setActiveFeature] = useState<FeatureKey>("goals")

  // Temporizador de auto-rotação - se o usuário clicar em algo, isso vira false e para de mudar sozinho
  const [autoRotate, setAutoRotate] = useState(true)

  // Efeito responsável por mudar de funcionalidade automaticamente a cada 22 segundos
  useEffect(() => {
    if (!autoRotate) return
    const interval = setInterval(() => {
      setActiveFeature((current) => {
        if (current === "goals") return "ai"
        if (current === "ai") return "cards"
        if (current === "cards") return "categories"
        if (current === "categories") return "data"
        return "goals"
      })
    }, 22000) // 22 segundos de tempo por funcionalidade para dar tempo de terminar todo o fluxo de animações internas
    return () => clearInterval(interval)
  }, [autoRotate])

  // Função disparada ao clicar nas abas da esquerda
  const handleSelectFeature = (feature: FeatureKey) => {
    setActiveFeature(feature)
    setAutoRotate(false) // Desativa o carrossel automático pois o usuário quer interagir manualmente
  }

  return (
    <section className="relative py-24 overflow-hidden bg-muted/10 border-t border-border/50">
      {/* Gradientes decorativos de fundo */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full -z-10 pointer-events-none opacity-5" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full -z-10 pointer-events-none opacity-5" style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />

      <div className="container px-4 md:px-6 mx-auto">
        {/* Cabeçalho da Seção de Funcionalidades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">Funcionalidades</span>
          <h2 className="mt-2 mb-4 text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Sua vida financeira no <span className="animate-shimmer-text">piloto automático</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Esqueça sistemas complexos. Veja como a inteligência artificial do Definance organiza e projeta seus objetivos de forma interativa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna Esquerda: Menu de Botões das Funcionalidades */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 space-y-4"
          >
            {/* Aba 1: Metas Inteligentes */}
            <button
              onClick={() => handleSelectFeature("goals")}
              className={cn(
                "w-full text-left p-6 rounded-[1.5rem] border transition-all duration-300 flex gap-4 cursor-pointer",
                activeFeature === "goals"
                  ? "bg-card border-primary/20 shadow-md shadow-primary/5"
                  : "bg-transparent border-transparent hover:bg-card/30"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                activeFeature === "goals"
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted/50 border-border/50 text-muted-foreground"
              )}>
                <Target className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Metas Inteligentes</h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Crie objetivos e veja a barra de progresso encher conforme você poupa. A IA calcula a projeção de conclusão automaticamente.
                </p>
              </div>
            </button>

            {/* Aba 2: Sistema Integrado (Inteligência Artificial) */}
            <button
              onClick={() => handleSelectFeature("ai")}
              className={cn(
                "w-full text-left p-6 rounded-[1.5rem] border transition-all duration-300 flex gap-4 cursor-pointer",
                activeFeature === "ai"
                  ? "bg-card border-primary/20 shadow-md shadow-primary/5"
                  : "bg-transparent border-transparent hover:bg-card/30"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                activeFeature === "ai"
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted/50 border-border/50 text-muted-foreground"
              )}>
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Sistema Integrado</h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Lance de forma inteligente e automática no painel. Nossa IA identifica valores, categorias e integra direto ao histórico.
                </p>
              </div>
            </button>

            {/* Aba 3: Controle de Cartões */}
            <button
              onClick={() => handleSelectFeature("cards")}
              className={cn(
                "w-full text-left p-6 rounded-[1.5rem] border transition-all duration-300 flex gap-4 cursor-pointer",
                activeFeature === "cards"
                  ? "bg-card border-primary/20 shadow-md shadow-primary/5"
                  : "bg-transparent border-transparent hover:bg-card/30"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                activeFeature === "cards"
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted/50 border-border/50 text-muted-foreground"
              )}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Controle de Cartões</h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Centralize faturas e limites em uma interface visual de alta precisão. Saiba de imediato o limite restante após cada compra.
                </p>
              </div>
            </button>

            {/* Aba 4: Categorias e Limites */}
            <button
              onClick={() => handleSelectFeature("categories")}
              className={cn(
                "w-full text-left p-6 rounded-[1.5rem] border transition-all duration-300 flex gap-4 cursor-pointer",
                activeFeature === "categories"
                  ? "bg-card border-primary/20 shadow-md shadow-primary/5"
                  : "bg-transparent border-transparent hover:bg-card/30"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                activeFeature === "categories"
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted/50 border-border/50 text-muted-foreground"
              )}>
                <Folder className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Categorias e Limites</h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Crie categorias customizadas e defina limites máximos de gastos. Acompanhe o consumo e seja alertado antes de estourar seu orçamento.
                </p>
              </div>
            </button>

            {/* Aba 5: Gestão e Limpeza de Dados */}
            <button
              onClick={() => handleSelectFeature("data")}
              className={cn(
                "w-full text-left p-6 rounded-[1.5rem] border transition-all duration-300 flex gap-4 cursor-pointer",
                activeFeature === "data"
                  ? "bg-card border-primary/20 shadow-md shadow-primary/5"
                  : "bg-transparent border-transparent hover:bg-card/30"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                activeFeature === "data"
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted/50 border-border/50 text-muted-foreground"
              )}>
                <Database className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Gestão e Limpeza</h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Exporte relatórios em PDF, CSV ou integre com o Google Sheets em 1 clique. Delete dados específicos com segurança quando quiser.
                </p>
              </div>
            </button>
          </motion.div>

          {/* Coluna Direita: O Painel Visual Interativo (Sandbox / Maquete) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-7 relative flex justify-center w-full"
          >
            {/* Container Principal da Maquete (Simulação de Celular / Painel) */}
            <div
              onClick={(e) => {
                // Esse clique serve para debugar/encontrar as coordenadas X e Y de qualquer ponto no painel
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                console.log(`Coordenadas clicadas -> x: ${Math.round(x)}, y: ${Math.round(y)}`);
              }}
              className="relative w-full max-w-[500px] h-[440px] md:h-[460px] bg-card border border-border/80 rounded-[2.5rem] shadow-xl p-6 md:p-8 flex flex-col justify-between overflow-hidden"
            >
              {/* Degradê sutil de luz verde no topo do painel */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

              {/* Brilho neon de fundo */}
              <div className="absolute -inset-1 rounded-[2.5rem] opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--primary) 0%, var(--accent) 50%, transparent 70%)' }} />

              {/* Renderiza a maquete interativa baseada na aba ativa com efeitos de transição */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {activeFeature === "goals" && <GoalsInteractiveMockup key="goals" />}
                  {activeFeature === "ai" && <IntegratedSystemMockup key="ai" />}
                  {activeFeature === "cards" && <CreditCardMockup key="cards" />}
                  {activeFeature === "categories" && <CategoriesInteractiveMockup key="categories" />}
                  {activeFeature === "data" && <DataInteractiveMockup key="data" />}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ----------------------------------------------------
// COMPONENTE DO CURSOR SIMULADO (A SETINHA DO MOUSE AUTOMÁTICA)
// ----------------------------------------------------
interface SimulatedCursorProps {
  x: number          // Coordenada X na tela
  y: number          // Coordenada Y na tela
  isClicking: boolean // Se está simulando um clique naquele momento
}

function SimulatedCursor({ x, y, isClicking }: SimulatedCursorProps) {
  return (
    <motion.div
      className="absolute pointer-events-none z-50 flex items-center justify-center"
      animate={{ x, y }}
      // Transição suave tipo mola (efeito natural de movimento de mouse)
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      style={{ left: 0, top: 0 }}
    >
      {/* Círculo do clique (Efeito Ripple) que aparece quando isClicking é verdadeiro */}
      <AnimatePresence>
        {isClicking && (
          <motion.div
            key="ripple"
            initial={{ scale: 0.1, opacity: 0.9 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            // Duração do efeito visual do clique: 350 milissegundos
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute w-5 h-5 rounded-full bg-primary/45 border border-primary/20"
          />
        )}
      </AnimatePresence>

      {/* SVG da seta do mouse */}
      <svg
        className="w-5 h-5 text-slate-900 drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] filter dark:invert"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="white"
        strokeWidth="1.5"
      >
        <path d="M4.5 3V18.25L9 13.75L12 20.75L15 19.5L12 12.5L17.75 11.75L4.5 3Z" strokeLinejoin="miter" strokeLinecap="square" />
      </svg>
    </motion.div>
  )
}

// ----------------------------------------------------
// 1. SIMULAÇÃO DE METAS FINANCEIRAS
// ----------------------------------------------------
function GoalsInteractiveMockup() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentValue, setCurrentValue] = useState(0)
  const [targetValue, setTargetValue] = useState(0)
  const [limitDate, setLimitDate] = useState("")
  // Cursor começa numa posição neutra (X: 220, Y: 180)
  const [cursor, setCursor] = useState({ x: 220, y: 180, isClicking: false })

  // PASSO A PASSO DA ANIMAÇÃO:
  // Muda de passo ("step") a cada 2500ms (2.5 segundos) de forma cíclica entre os passos 0 e 7.
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((currentStep) => {
        const nextStep = (currentStep + 1) % 8
        return nextStep
      })
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  // CONTROLE DO MOVIMENTO DO MOUSE E CLIQUE A CADA PASSO:
  useEffect(() => {
    // Função auxiliar para guiar o mouse, dar o clique após "actionDelay" ms e rodar a ação desejada
    const triggerClick = (x: number, y: number, actionDelay: number, action: () => void) => {
      // 1. Move o cursor até as coordenadas indicadas
      setCursor({ x, y, isClicking: false })
      // 2. Espera o tempo de delay e executa o clique físico e a alteração de estado correspondente
      const clickTimeout = setTimeout(() => {
        setCursor({ x, y, isClicking: true })
        action()
        // 3. Solta o clique 300ms depois (tira a marcação visual de pressionado)
        const releaseTimeout = setTimeout(() => {
          setCursor((prev) => ({ ...prev, isClicking: false }))
        }, 300)
        return () => clearTimeout(releaseTimeout)
      }, actionDelay)
      return () => clearTimeout(clickTimeout)
    }

    // PASSO 0: Iniciando Simulação. Reseta todas as variáveis para o estado inicial
    if (step === 0) {
      setCursor({ x: 220, y: 200, isClicking: false })
      setProgress(0)
      setCurrentValue(0)
      setTargetValue(0)
      setLimitDate("")
    } 
    // PASSO 1: Definindo Valor da Meta (Muda para R$ 5.000,00)
    // Mouse viaja até o input de valor (X: 255, Y: 260). Clica com 800ms de delay.
    else if (step === 1) {
      triggerClick(255, 260, 800, () => {
        setTargetValue(5000)
      })
    } 
    // PASSO 2: Definindo Data Limite (Seleciona 31/12/2026)
    // Mouse viaja até o campo de data (X: 251, Y: 291). Clica com 800ms de delay.
    else if (step === 2) {
      triggerClick(251, 291, 800, () => {
        setLimitDate("31/12/2026")
      })
    } 
    // PASSO 3: Criando a Nova Meta (Transição para o card visual de progresso)
    // Mouse viaja até o botão azul "Criar Meta" (X: 260, Y: 300). Clica com 800ms de delay.
    else if (step === 3) {
      triggerClick(260, 300, 800, () => { })
    } 
    // PASSO 4: Primeiro Depósito de R$ 1.500,00 (Alcança 30% da meta)
    // Mouse viaja até o botão "Adicionar Saldo" (X: 325, Y: 365). Clica com 800ms de delay.
    else if (step === 4) {
      triggerClick(325, 365, 800, () => {
        setProgress(30)
        setCurrentValue(1500)
      })
    } 
    // PASSO 5: Segundo Depósito (+ R$ 2.000,00 acumulando R$ 3.500,00 / 70%)
    // Mouse viaja de novo até o botão "Adicionar Saldo" (X: 325, Y: 365). Clica com 800ms de delay.
    else if (step === 5) {
      triggerClick(325, 365, 800, () => {
        setProgress(70)
        setCurrentValue(3500)
      })
    } 
    // PASSO 6: Terceiro Depósito (+ R$ 1.500,00 atingindo R$ 5.000,00 / 100% concluído!)
    // Clica no botão "Adicionar Saldo" (X: 325, Y: 365). Clica com 800ms de delay. Dispara o banner de parabéns 🎉
    else if (step === 6) {
      triggerClick(325, 365, 800, () => {
        setProgress(100)
        setCurrentValue(5000)
      })
    } 
    // PASSO 7: Reiniciando a Simulação
    // Mouse viaja até o botão "Reiniciar" no rodapé (X: 180, Y: 407). Clica com 800ms de delay.
    else if (step === 7) {
      triggerClick(180, 407, 800, () => {
        setProgress(0)
        setCurrentValue(0)
        setTargetValue(0)
        setLimitDate("")
      })
    }
  }, [step])

  return (
    <div className="flex flex-col h-full justify-between py-2 relative">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500">
            <Target className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-foreground">Metas Financeiras</span>
        </div>
        <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-md">Ativa</span>
      </div>

      {/* Área Central da Simulação */}
      <div className="flex-1 flex flex-col justify-center items-center relative my-1">
        {/* Texto do indicador da etapa da simulação */}
        <div className="absolute top-0 text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase">
          {step === 0 && "Iniciando Simulação..."}
          {step === 1 && "Definindo Valor da Meta..."}
          {step === 2 && "Definindo Data Limite..."}
          {step === 3 && "Criando nova meta..."}
          {step === 4 && "Depositando R$ 1.500,00"}
          {step === 5 && "Poupança Adicional: + R$ 2.000,00"}
          {step === 6 && "Meta Concluída!"}
          {step === 7 && "Simulação Finalizada."}
        </div>

        {/* MOCKUP 1A: Formulário de Criação (Etapas 0, 1 e 2) */}
        {step < 3 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-3 shadow-sm relative mt-1"
          >
            <h4 className="text-xs font-bold text-foreground">Nova Meta</h4>
            <div className="space-y-3">
              {/* Campo 1: Nome do objetivo */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Nome do Objetivo</span>
                <div className="h-8 rounded-lg bg-card border border-border/80 px-2.5 flex items-center text-xs text-foreground font-medium">
                  Reserva de Emergência
                </div>
              </div>

              {/* Campo 2: Valor Alvo */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Valor Alvo</span>
                <div className={cn(
                  "h-8 rounded-lg border px-2.5 flex items-center text-xs font-bold justify-between transition-colors",
                  step === 1 ? "bg-primary/5 border-primary" : "bg-card border-border/80"
                )}>
                  <span className="text-muted-foreground">R$</span>
                  <span className="text-foreground">
                    {/* Exibe o valor preenchido ou um cursor piscando enquanto digita no step 1 */}
                    {targetValue > 0 ? "5.000,00" : <span className="w-1 h-3 bg-muted-foreground animate-pulse" />}
                  </span>
                </div>
              </div>

              {/* Campo 3: Data Limite */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Data Limite</span>
                <div className={cn(
                  "h-8 rounded-lg border px-2.5 flex items-center text-xs font-medium justify-between transition-colors",
                  step === 2 ? "bg-primary/5 border-primary" : "bg-card border-border/80"
                )}>
                  <span className="text-muted-foreground">Selecionar</span>
                  <span className="text-foreground font-bold">
                    {/* Exibe a data limite preenchida ou um cursor piscando enquanto digita no step 2 */}
                    {limitDate || (step === 2 ? <span className="w-1 h-3 bg-muted-foreground animate-pulse" /> : "")}
                  </span>
                </div>
              </div>
            </div>

            <button className={cn(
              "w-full py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center justify-center transition-colors",
              step === 3 ? "bg-primary text-primary-foreground" : "bg-primary/10 border border-primary/20 text-primary"
            )}>
              Criar Meta
            </button>
          </motion.div>
        ) : (
          // MOCKUP 1B: Card de Progresso Ativo da Meta (Etapas de 3 a 7)
          <div className="w-full max-w-sm flex flex-col items-center gap-3">
            <motion.div
              layout
              className="w-full bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-3.5 shadow-sm relative overflow-hidden mt-1"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Reserva de Emergência</h4>
                    <p className="text-[10px] text-muted-foreground">Data limite: 31/12/2026</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-muted-foreground">Meta</span>
                    <p className="text-xs font-bold text-foreground">R$ 5.000,00</p>
                  </div>
                </div>

                {/* Barra de Progresso visual */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                    <span>Progresso</span>
                    <motion.span>{Math.round(progress)}%</motion.span>
                  </div>
                  <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      // Suavização do preenchimento da barra de progresso
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    />
                  </div>
                </div>

                {/* Estatística de valor total acumulado */}
                <div className="flex justify-between items-center pt-1 border-t border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground">Acumulado</span>
                  <motion.span className="text-xs font-bold text-emerald-500">
                    R$ {currentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </motion.span>
                </div>
              </motion.div>
            </motion.div>

            {/* Banner de Parabéns exibido ao atingir 100% de conclusão da meta */}
            {progress === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 flex items-center justify-center gap-2 shadow-sm z-30"
              >
                <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm animate-bounce">
                  🎉
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  Reserva Concluída!
                </span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Botões do Rodapé de Teste Manual */}
      <div className="flex justify-center gap-3 pt-3 border-t border-border/40">
        <button
          onClick={() => { setStep(0); setProgress(0); setCurrentValue(0); setTargetValue(0); setLimitDate(""); }}
          className="px-4 py-2 border border-border hover:bg-muted/50 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer text-foreground"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
        </button>
        <button
          onClick={() => {
            if (progress < 100) {
              setProgress(prev => Math.min(100, prev + 25))
              setCurrentValue(prev => Math.min(5000, prev + 1250))
              setStep(6)
            }
          }}
          disabled={progress >= 100}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" /> Adicionar Saldo
        </button>
      </div>

      {/* Cursor simulado que anda automaticamente */}
      <SimulatedCursor x={cursor.x} y={cursor.y} isClicking={cursor.isClicking} />
    </div>
  )
}

// ----------------------------------------------------
// 2. SIMULAÇÃO DO SISTEMA INTEGRADO (CONSOLE INTELIGENTE DA IA)
// ----------------------------------------------------
function IntegratedSystemMockup() {
  const [step, setStep] = useState(0)
  const [inputText, setInputText] = useState("")
  // Posição neutra inicial do cursor: (X: 220, Y: 220)
  const [cursor, setCursor] = useState({ x: 220, y: 220, isClicking: false })

  // Frase inteira que a IA vai fingir que o usuário está digitando
  const fullText = "Almoço na churrascaria deu R$ 85,90 no débito"

  // PASSO A PASSO DA ANIMAÇÃO:
  // Muda de passo ("step") a cada 3500ms (3.5 segundos) de forma cíclica entre 0 e 4
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((currentStep) => (currentStep + 1) % 5)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  // CONTROLE DO MOVIMENTO DO MOUSE A CADA PASSO:
  useEffect(() => {
    const triggerClick = (x: number, y: number, actionDelay: number, action: () => void) => {
      setCursor({ x, y, isClicking: false })
      const clickTimeout = setTimeout(() => {
        setCursor({ x, y, isClicking: true })
        action()
        const releaseTimeout = setTimeout(() => {
          setCursor((prev) => ({ ...prev, isClicking: false }))
        }, 300)
        return () => clearTimeout(releaseTimeout)
      }, actionDelay)
      return () => clearTimeout(clickTimeout)
    }

    // PASSO 0: Reinicia tudo, apaga textos e coloca cursor no centro
    if (step === 0) {
      setCursor({ x: 220, y: 220, isClicking: false })
      setInputText("")
    } 
    // PASSO 1: Foca no console de input (X: 180, Y: 320)
    // Clica no console após 500ms. Dispara o efeito de digitação do texto do usuário
    else if (step === 1) {
      triggerClick(180, 320, 500, () => { })
    } 
    // DEMAIS PASSOS: O mouse voa de volta para o centro
    else {
      setCursor({ x: 220, y: 220, isClicking: false })
    }
  }, [step])

  // EFEITO DE DIGITAÇÃO SENSÍVEL AO PASSO:
  useEffect(() => {
    if (step === 0) {
      setInputText("")
    } else if (step === 1) {
      setInputText("")
      let typingInterval: NodeJS.Timeout | null = null

      // Começa a digitar após 800ms do clique no input
      const typingTimeout = setTimeout(() => {
        typingInterval = setInterval(() => {
          setInputText((prev) => {
            const nextLength = prev.length + 1
            if (nextLength <= fullText.length) {
              return fullText.slice(0, nextLength) // Adiciona uma letra por vez
            } else {
              if (typingInterval) clearInterval(typingInterval)
              return prev
            }
          })
        }, 40) // 40 milissegundos por letra (efeito realista de digitação)
      }, 800)

      return () => {
        clearTimeout(typingTimeout)
        if (typingInterval) clearInterval(typingInterval)
      }
    } else {
      setInputText("")
    }
  }, [step])

  return (
    <div className="flex flex-col h-full justify-between py-2 relative">
      {/* Cabeçalho do Console */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block leading-tight">Sistema Integrado</span>
            <span className="text-[9px] text-emerald-500 font-medium tracking-wide">Online / Conectado</span>
          </div>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Console IA</span>
      </div>

      {/* Caixa do Terminal */}
      <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden my-3 bg-muted/10 rounded-2xl border border-border/40 min-h-[225px]">
        {/* Histórico das Mensagens no Chat do Terminal */}
        <div className="flex-1 flex flex-col mb-2 overflow-y-auto no-scrollbar">
          <div className="mt-auto space-y-2 flex flex-col w-full">
            {/* Texto ocioso exibido antes da digitação ou no início */}
            {step <= 1 && (
              <div className="h-8 flex items-center justify-center w-full">
                <span className="text-[9px] text-muted-foreground/40 italic">Aguardando comando ou entrada...</span>
              </div>
            )}

            {/* Balão do usuário enviado (Aparece a partir do Passo 2) */}
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="max-w-[85%] self-end bg-primary text-primary-foreground px-3 py-1.5 rounded-xl rounded-tr-none text-[11px] font-medium shadow-sm flex items-center gap-1.5"
              >
                <span className="text-[9px] opacity-75 font-mono">&gt;</span>
                <span>{fullText}</span>
              </motion.div>
            )}

            {/* Spinner de carregamento da IA analisando o texto (Visível apenas no Passo 2) */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="self-start text-[9px] font-mono text-primary flex items-center gap-1.5 pl-1"
              >
                <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
                <span>Processando com IA...</span>
              </motion.div>
            )}

            {/* Card com a transação extraída pela IA (Visível a partir do Passo 3) */}
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="max-w-[85%] self-start bg-card border border-border/80 text-foreground px-3 py-2 rounded-xl rounded-tl-none text-[10px] font-medium shadow-sm space-y-1"
              >
                <div className="flex items-center gap-1 text-emerald-500 font-bold uppercase tracking-wider text-[8px]">
                  <Check className="w-2.5 h-2.5" /> Lançamento no Sistema!
                </div>
                <p className="text-foreground/90 font-semibold leading-tight">
                  Processado pela IA e lançado com sucesso.
                </p>
                <div className="flex gap-1.5 pt-1.5 border-t border-border/40">
                  <span className="px-1.5 py-0.5 rounded bg-muted/60 text-[8px] font-semibold text-muted-foreground border border-border/40">
                    Alimentação
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[8px] font-bold text-primary border border-primary/20">
                    R$ 85,90
                  </span>
                </div>
              </motion.div>
            )}

            {/* Indicador de Sincronização concluída no Banco de Dados (Visível no Passo 4) */}
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="self-center bg-muted/40 border border-border/30 px-2.5 py-0.5 rounded-full text-[8px] font-bold text-muted-foreground/80 tracking-wide uppercase flex items-center gap-1.5 shadow-inner"
              >
                <Check className="w-2.5 h-2.5 text-emerald-500" /> Sincronizado no histórico
              </motion.div>
            )}
          </div>
        </div>

        {/* Linha Inferior de Entrada de Texto do Terminal */}
        <div className="border-t border-border/30 pt-2 flex items-center gap-2 font-mono text-[11px]">
          <span className="text-primary font-bold shrink-0">&gt;</span>
          <div className="flex-1 text-foreground font-medium min-h-[1.25rem] flex items-center relative">
            {step === 1 ? (
              <>
                <span>{inputText}</span>
                {/* Cursor piscando na barra de digitação */}
                <span className="w-1.5 h-3.5 bg-primary animate-pulse ml-0.5 inline-block shrink-0" />
              </>
            ) : step === 0 ? (
              <span className="w-1.5 h-3.5 bg-muted-foreground/60 animate-pulse inline-block shrink-0" />
            ) : (
              <span className="text-muted-foreground/30 italic text-[9px] select-none">Aguardando novo prompt...</span>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé do Painel */}
      <div className="flex justify-between items-center gap-3 pt-3 border-t border-border/40 text-[10px] text-muted-foreground">
        <span>Simulação automática</span>
        <button
          onClick={() => setStep(1)}
          className="text-xs font-bold text-primary hover:underline cursor-pointer uppercase tracking-wider"
        >
          Disparar teste
        </button>
      </div>

      {/* Seta do mouse simulada */}
      <SimulatedCursor x={cursor.x} y={cursor.y} isClicking={cursor.isClicking} />
    </div>
  )
}

// ----------------------------------------------------
// 3. SIMULAÇÃO DO CARTÃO DE CRÉDITO INTELIGENTE
// ----------------------------------------------------
function CreditCardMockup() {
  const [step, setStep] = useState(0)
  // Limites em reais
  const [usedLimit, setUsedLimit] = useState(117089.44)
  const [availableLimit, setAvailableLimit] = useState(382910.56)
  const [cursor, setCursor] = useState({ x: 220, y: 220, isClicking: false })
  const totalLimit = 500000.00
  // Porcentagem calculada do limite já utilizado
  const percentage = (usedLimit / totalLimit) * 100

  // PASSO A PASSO DA ANIMAÇÃO:
  // Muda de passo ("step") a cada 3000ms (3 segundos) ciclando entre 0 e 3
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((currentStep) => {
        const nextStep = (currentStep + 1) % 4
        return nextStep
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // CONTROLADOR DO MOVIMENTO DO MOUSE A CADA PASSO:
  useEffect(() => {
    const triggerClick = (x: number, y: number, actionDelay: number, action: () => void) => {
      setCursor({ x, y, isClicking: false })
      const clickTimeout = setTimeout(() => {
        setCursor({ x, y, isClicking: true })
        action()
        const releaseTimeout = setTimeout(() => {
          setCursor((prev) => ({ ...prev, isClicking: false }))
        }, 300)
        return () => clearTimeout(releaseTimeout)
      }, actionDelay)
      return () => clearTimeout(clickTimeout)
    }

    // PASSO 0: Reseta para os valores padrões de limite
    if (step === 0) {
      setCursor({ x: 220, y: 220, isClicking: false })
      setUsedLimit(117089.44)
      setAvailableLimit(382910.56)
    } 
    // PASSO 1: Adiciona R$ 120,00 no Uber
    // Clica no botão "Simular Gasto" no canto inferior direito (X: 365, Y: 395) após 1200ms de delay
    else if (step === 1) {
      triggerClick(365, 395, 1200, () => {
        setUsedLimit(117089.44 + 120.00)
        setAvailableLimit(382910.56 - 120.00)
      })
    } 
    // PASSO 2: Adiciona mais R$ 450,00 de compra
    // Clica de novo no botão "Simular Gasto" (X: 365, Y: 395) após 1200ms
    else if (step === 2) {
      triggerClick(365, 395, 1200, () => {
        setUsedLimit(117089.44 + 120.00 + 450.00)
        setAvailableLimit(382910.56 - 120.00 - 450.00)
      })
    } 
    // PASSO 3: Clica para reiniciar a simulação
    else if (step === 3) {
      triggerClick(365, 395, 1200, () => {
        setUsedLimit(117089.44)
        setAvailableLimit(382910.56)
      })
    }
  }, [step])

  return (
    <div className="flex flex-col h-full justify-between py-1 relative">
      {/* Cabeçalho do Cartão */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <CreditCard className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-foreground">Itaú - Black</span>
        </div>
        <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold text-rose-500">
          <Shield className="w-3 h-3" />
          Conectado
        </div>
      </div>

      {/* Estatísticas de Limites */}
      <div className="flex-1 flex flex-col justify-center space-y-4 my-2.5">
        {/* Barra Visual de Limite Gasto */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Limite Usado</span>
            <span className="text-foreground">{percentage.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: "23.4%" }}
              animate={{ width: `${percentage}%` }}
              // Suavização do preenchimento da barra de limite
              transition={{ type: "spring", stiffness: 60 }}
            />
          </div>
        </div>

        {/* Grade de valores (Usado, Disponível e Total) */}
        <div className="grid grid-cols-3 gap-2.5 text-center bg-muted/20 border border-border/40 p-3 rounded-2xl">
          <div>
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider block">Limite Usado</span>
            <motion.p className="text-[11px] font-bold text-rose-500 pt-0.5">
              R$ {usedLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </motion.p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider block">Disponível</span>
            <motion.p className="text-[11px] font-bold text-emerald-500 pt-0.5">
              R$ {availableLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </motion.p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider block">Limite Total</span>
            <p className="text-[11px] font-bold text-foreground pt-0.5">
              R$ {totalLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Caixa de Texto Explicativa Inteligente */}
        <div className="p-3 bg-muted/40 rounded-xl border border-border/30 relative">
          <h5 className="text-[9px] font-bold text-foreground uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> Cartão Inteligente
          </h5>
          <p className="text-[9px] text-muted-foreground leading-normal mt-1">
            {step === 0 && "Envie despesas no sistema e veja o limite atualizar."}
            {step === 1 && "Simulando: Compra de R$ 120,00 no Uber lançada."}
            {step === 2 && "Simulando: Compra de R$ 450,00 lançada com sucesso."}
            {step === 3 && "Sincronização instantânea com as faturas do Itaú."}
          </p>

          {/* Selo no canto indicando a quantidade de reais que acabou de ser lançada */}
          {step > 0 && step < 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 flex items-center gap-1 text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/10"
            >
              + R$ {step === 1 ? "120" : "570"} lançados
            </motion.div>
          )}
        </div>
      </div>

      {/* Rodapé do painel */}
      <div className="flex justify-between items-center pt-2.5 border-t border-border/40 text-[9px] text-muted-foreground">
        <span>Vencimento: Todo dia 1</span>
        <button
          onClick={() => { setUsedLimit(117089.44 + 500); setAvailableLimit(382910.56 - 500); setStep(2); }}
          className="text-xs font-bold text-primary hover:underline cursor-pointer uppercase tracking-wider flex items-center gap-0.5"
        >
          Simular Gasto →
        </button>
      </div>

      {/* Cursor simulado */}
      <SimulatedCursor x={cursor.x} y={cursor.y} isClicking={cursor.isClicking} />
    </div>
  )
}

// ----------------------------------------------------
// 4. SIMULAÇÃO DE CATEGORIAS E LIMITES MENSAL (TETOS DE GASTOS)
// ----------------------------------------------------
function CategoriesInteractiveMockup() {
  const [step, setStep] = useState(0)
  const [limitValue, setLimitValue] = useState<number | null>(null)
  const [spentValue, setSpentValue] = useState(800)
  const [progress, setProgress] = useState(0)
  const [cursor, setCursor] = useState({ x: 220, y: 220, isClicking: false })

  // PASSO A PASSO DA ANIMAÇÃO:
  // Muda de passo ("step") a cada 3000ms (3 segundos) ciclando de 0 a 5
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((currentStep) => {
        const nextStep = (currentStep + 1) % 6
        return nextStep
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // CONTROLE DO MOVIMENTO DO MOUSE A CADA PASSO:
  useEffect(() => {
    const triggerClick = (x: number, y: number, actionDelay: number, action: () => void) => {
      setCursor({ x, y, isClicking: false })
      const clickTimeout = setTimeout(() => {
        setCursor({ x, y, isClicking: true })
        action()
        const releaseTimeout = setTimeout(() => {
          setCursor((prev) => ({ ...prev, isClicking: false }))
        }, 300)
        return () => clearTimeout(releaseTimeout)
      }, actionDelay)
      return () => clearTimeout(clickTimeout)
    }

    // PASSO 0: Inicial / Reseta tudo
    if (step === 0) {
      setCursor({ x: 220, y: 220, isClicking: false })
      setLimitValue(null)
      setSpentValue(800)
      setProgress(0)
    } 
    // PASSO 1: Abre a janela de edição de limite da categoria Alimentação
    // Clica no botão de edição de limite na linha da categoria (X: 345, Y: 155) após 1200ms
    else if (step === 1) {
      triggerClick(345, 155, 1200, () => { })
    } 
    // PASSO 2: Preenche o valor limite mensal no Input (R$ 1.000,00)
    // Clica no input dentro do modal de limite (X: 220, Y: 195) após 1200ms
    else if (step === 2) {
      triggerClick(220, 195, 1200, () => {
        setLimitValue(1000)
      })
    } 
    // PASSO 3: Salva o limite mensal configurado
    // Clica no botão "Salvar Teto" no modal (X: 275, Y: 265) após 1200ms. Atualiza progresso para 80%
    else if (step === 3) {
      triggerClick(275, 265, 1200, () => {
        setProgress(80)
      })
    } 
    // PASSO 4: Simula um novo gasto detectado
    // Cursor volta à posição neutra, simula a detecção de um gasto adicional após 1 segundo
    else if (step === 4) {
      setCursor({ x: 220, y: 220, isClicking: false })
      const expenseTimeout = setTimeout(() => {
        setSpentValue(800)
        setProgress(80)
      }, 1000)
      return () => clearTimeout(expenseTimeout)
    } 
    // PASSO 5: Reiniciando a simulação
    else if (step === 5) {
      setCursor({ x: 220, y: 220, isClicking: false })
    }
  }, [step])

  return (
    <div className="flex flex-col h-full justify-between py-1 relative">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <Folder className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-foreground">Categorias e Limites</span>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Configuração</span>
      </div>

      {/* Conteúdo central da simulação de tetos */}
      <div className="flex-1 flex flex-col justify-center space-y-2.5 relative my-2">
        {/* Texto do indicador da etapa ativa */}
        <div className="text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase text-center mb-1">
          {step === 0 && "Selecione uma categoria para definir um teto..."}
          {step === 1 && "Definindo limite para Alimentação..."}
          {step === 2 && "Preenchendo valor: R$ 1.000,00"}
          {step === 3 && "Teto salvo! Gasto atual em 80%"}
          {step === 4 && "Novo gasto detectado! Atualizando..."}
          {step === 5 && "Reiniciando..."}
        </div>

        {/* Lista de Categorias no Painel */}
        <div className="space-y-2">
          {/* Categoria 1: Alimentação (A única interativa neste fluxo) */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20 p-3 pl-4.5 transition-all">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-amber-500" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <span className="text-sm">🍴</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Alimentação</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase text-muted-foreground/70">Saída</span>
                    {/* Se o limite foi definido, exibe uma tag azul indicando o valor teto */}
                    {limitValue && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <TrendingUp className="h-2 w-2" />
                        <span className="text-[8px] font-bold">R$ {limitValue.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ações (Editar Limite) */}
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "p-1.5 rounded-lg border text-muted-foreground/50 transition-colors",
                  step === 1 ? "bg-primary/20 border-primary text-primary" : "bg-muted/50 border-border/40"
                )}>
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <div className="p-1.5 rounded-lg bg-muted/50 border border-border/40 text-muted-foreground/30">
                  <Edit className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            {/* Barra de progresso do orçamento (Aparece a partir do Passo 3, quando o limite é salvo) */}
            {limitValue && step >= 3 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3.5 pt-3.5 border-t border-border/20 space-y-1.5"
              >
                <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground">
                  <span>Gasto Atual: R$ {spentValue.toFixed(2)}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", progress >= 80 ? "bg-red-500" : "bg-amber-500")}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Categoria 2: Lazer (Estática, apenas para visualização) */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/30 bg-muted/10 p-3 pl-4.5 opacity-60">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-500" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <span className="text-sm">🌴</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Lazer</h4>
                  <span className="text-[8px] font-black uppercase text-muted-foreground/70">Saída</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground/30">
                <TrendingUp className="h-3.5 w-3.5" />
                <Edit className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Pop-up do alerta de orçamento estourado/alcançado (Z-Index 30 para evitar sobreposição) */}
        {limitValue && step >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-2.5 rounded-xl border flex items-center gap-2 shadow-sm relative z-30",
              progress >= 80
                ? "bg-red-500/10 border-red-500/20 text-red-500"
                : "bg-amber-500/10 border-amber-500/20 text-amber-500"
            )}
          >
            <BellRing className="h-4 w-4 shrink-0 animate-bounce" />
            <div className="text-[9px] font-bold uppercase tracking-wider leading-snug">
              {progress >= 80
                ? "Teto estourando! 80% do limite de Alimentação utilizado."
                : "Atenção! 80% do limite de Alimentação atingido."}
            </div>
          </motion.div>
        )}

        {/* Modal Simulado de Edição de Limite (Popover z-index 40) - Ativo nos passos 1, 2 e 3 */}
        {step >= 1 && step <= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-background/95 flex items-center justify-center p-4 z-40"
          >
            <div className="bg-card border border-border rounded-2xl shadow-xl p-5 w-full max-w-[280px] space-y-4">
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-foreground">Definir Teto Mensal</h5>
                <p className="text-[9px] text-muted-foreground">Defina um limite para Alimentação</p>
              </div>
              <div className="space-y-2">
                <div className={cn(
                  "h-10 border rounded-xl px-3 flex items-center bg-muted/20 text-sm font-bold text-foreground justify-end transition-colors",
                  step === 2 ? "border-primary" : "border-border/80"
                )}>
                  R${" "}
                  {step === 1 ? (
                    // Cursor piscando enquanto finge estar vazio no Passo 1
                    <span className="w-1.5 h-4 bg-primary animate-pulse ml-1" />
                  ) : (
                    // Valor já preenchido a partir do Passo 2
                    "1.000,00"
                  )}
                </div>
                {step >= 2 && (
                  <p className="text-[8px] text-primary italic leading-tight">
                    Você será alertado ao atingir R$ 800,00 gastos (80%).
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-border rounded-lg text-[9px] font-bold text-muted-foreground">Cancelar</button>
                <button className={cn(
                  "flex-1 py-2 rounded-lg text-[9px] font-bold transition-colors",
                  step === 3 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                )}>
                  Salvar Teto
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Rodapé do painel */}
      <div className="flex justify-between items-center pt-2.5 border-t border-border/40 text-[9px] text-muted-foreground">
        <span>Controle de Orçamentos</span>
        <button
          onClick={() => { setStep(3); setLimitValue(1000); setProgress(80); }}
          className="text-xs font-bold text-primary hover:underline cursor-pointer uppercase tracking-wider"
        >
          Ver Limite →
        </button>
      </div>

      {/* Seta do mouse simulada */}
      <SimulatedCursor x={cursor.x} y={cursor.y} isClicking={cursor.isClicking} />
    </div>
  )
}

// ----------------------------------------------------
// 5. SIMULAÇÃO DE EXPORTAÇÃO E EXCLUSÃO DE DADOS
// ----------------------------------------------------
function DataInteractiveMockup() {
  const [step, setStep] = useState(0)
  const [metasActive, setMetasActive] = useState(true)
  const [exportingType, setExportingType] = useState<string | null>(null)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [showPurgeDialog, setShowPurgeDialog] = useState(false)
  const [purgingType, setPurgingType] = useState<string | null>(null)
  const [cursor, setCursor] = useState({ x: 220, y: 220, isClicking: false })

  // PASSO A PASSO DA ANIMAÇÃO:
  // Muda de passo ("step") a cada 3000ms (3 segundos) ciclando de 0 a 5
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((currentStep) => {
        const nextStep = (currentStep + 1) % 6
        return nextStep
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // CONTROLE DO MOVIMENTO DO MOUSE A CADA PASSO:
  useEffect(() => {
    const triggerClick = (x: number, y: number, actionDelay: number, action: () => void) => {
      setCursor({ x, y, isClicking: false })
      const clickTimeout = setTimeout(() => {
        setCursor({ x, y, isClicking: true })
        action()
        const releaseTimeout = setTimeout(() => {
          setCursor((prev) => ({ ...prev, isClicking: false }))
        }, 300)
        return () => clearTimeout(releaseTimeout)
      }, actionDelay)
      return () => clearTimeout(clickTimeout)
    }

    // PASSO 0: Inicial / Reseta todos os estados
    if (step === 0) {
      setCursor({ x: 220, y: 220, isClicking: false })
      setMetasActive(true)
      setExportingType(null)
      setShowToast(null)
      setShowPurgeDialog(false)
      setPurgingType(null)
    } 
    // PASSO 1: Desmarca o switch das Metas do relatório
    // Clica no switch de alternância da linha "Metas" (X: 361, Y: 236) após 1200ms
    else if (step === 1) {
      triggerClick(361, 236, 1200, () => {
        setMetasActive(false)
      })
    } 
    // PASSO 2: Clica para exportar em PDF
    // Clica no botão "PDF" no rodapé (X: 360, Y: 395) após 1200ms. Inicia o loading de exportação
    else if (step === 2) {
      triggerClick(360, 395, 1200, () => {
        setExportingType("pdf")
      })
    } 
    // PASSO 3: Exportação Concluída com sucesso!
    // Finaliza o loading, cursor volta ao centro e exibe toast verde de sucesso no topo
    else if (step === 3) {
      setCursor({ x: 220, y: 220, isClicking: false })
      setExportingType(null)
      setShowToast("Relatório PDF exportado com sucesso! 🎉")
    } 
    // PASSO 4: Abre o modal de limpeza destrutiva de Histórico
    // Limpa o toast e clica no botão vermelho "Limpar" da linha Histórico (X: 340, Y: 165) após 1200ms
    else if (step === 4) {
      setShowToast(null)
      triggerClick(340, 165, 1200, () => {
        setShowPurgeDialog(true)
      })
    } 
    // PASSO 5: Confirma a exclusão dos dados
    // Clica no botão vermelho "Confirmar" dentro do modal (X: 275, Y: 285) após 1200ms.
    // Dispara animação de "Excluindo...", fecha o modal após 1.2 segundos e mostra toast de confirmação.
    else if (step === 5) {
      triggerClick(275, 285, 1200, () => {
        setPurgingType("history")
        setTimeout(() => {
          setPurgingType(null)
          setShowPurgeDialog(false)
          setShowToast("Dados de Histórico excluídos com sucesso.")
        }, 1200)
      })
    }
  }, [step])

  // Lista dos cards de itens de dados que podem ser exportados/deletados
  const items = [
    { id: "entradas", title: "Entradas", icon: ArrowDownLeft, color: "text-emerald-500", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
    { id: "saidas", title: "Saídas", icon: ArrowUpRight, color: "text-rose-500", bgColor: "bg-rose-500/10 border-rose-500/20" },
    { id: "historico", title: "Histórico", icon: History, color: "text-amber-500", bgColor: "bg-amber-500/10 border-amber-500/20" },
    { id: "metas", title: "Metas", icon: Target, color: "text-violet-500", bgColor: "bg-violet-500/10 border-violet-500/20" }
  ]

  // Decide se exibe o layout de limpeza destrutiva (Passos 4 e 5) ou o layout de exportação (Passos 0 a 3)
  const isPurgeView = step >= 4

  return (
    <div className="flex flex-col h-full justify-between py-1 relative">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <Database className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-foreground">
            {isPurgeView ? "Limpeza de Dados" : "Gestão de Dados"}
          </span>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
          {isPurgeView ? "Destrutivo" : "Exportar"}
        </span>
      </div>

      {/* Conteúdo central da simulação de dados */}
      <div className="flex-1 flex flex-col justify-center space-y-2 relative my-2">
        {/* Texto do indicador da etapa ativa */}
        <div className="text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase text-center mb-1">
          {step === 0 && "Selecione as informações para exportar..."}
          {step === 1 && "Desmarcando metas do relatório..."}
          {step === 2 && "Gerando documento PDF..."}
          {step === 3 && "Exportação finalizada!"}
          {step === 4 && "Abrindo Limpeza de Dados..."}
          {step === 5 && "Excluindo histórico permanentemente..."}
        </div>

        {/* Grade de linhas de dados */}
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = item.id === "metas" ? metasActive : true

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/30"
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center border shrink-0", item.bgColor)}>
                    <Icon className={cn("h-3.5 w-3.5", item.color)} />
                  </div>
                  <span className="text-xs font-bold text-foreground">{item.title}</span>
                </div>

                {/* Se estiver no fluxo de exclusão/limpeza, mostra botão de Limpar. Senão, mostra chave liga/desliga */}
                {isPurgeView ? (
                  <button
                    onClick={() => {
                      if (item.id === "historico") {
                        setStep(4)
                        setShowPurgeDialog(true)
                      }
                    }}
                    className={cn(
                      "px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer flex items-center gap-1",
                      item.id === "historico" && step === 4
                        ? "bg-red-500 border-red-500 text-white"
                        : "border-red-500/30 text-red-500 hover:bg-red-500/10"
                    )}
                  >
                    <Trash2 className="w-2.5 h-2.5" /> Limpar
                  </button>
                ) : (
                  // Chave Liga/Desliga Simulado (Switch customizado)
                  <button
                    onClick={() => {
                      if (item.id === "metas") setMetasActive(!metasActive)
                    }}
                    className={cn(
                      "w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer flex items-center",
                      isActive ? "bg-emerald-500 justify-end" : "bg-muted-foreground/30 justify-start"
                    )}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Toast Notificação de Sucesso (Exibido no topo com z-index 45) */}
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-2 inset-x-0 mx-auto w-max max-w-xs bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-[10px] font-bold tracking-wide shadow-md flex items-center gap-2 z-45"
          >
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>{showToast}</span>
          </motion.div>
        )}

        {/* Modal Simulado de Confirmação da Limpeza/Exclusão (Z-Index 40) - Ativo no Passo 4 e 5 */}
        {showPurgeDialog && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-background/95 flex items-center justify-center p-4 z-40"
          >
            <div className="bg-card border border-border rounded-2xl shadow-xl p-5 w-full max-w-[280px] text-center space-y-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <Trash2 className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-foreground">Excluir Histórico?</h5>
                <p className="text-[9px] text-muted-foreground leading-normal">
                  Esta ação é destrutiva e apagará permanentemente todas as suas receitas e despesas.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-border rounded-lg text-[9px] font-bold text-muted-foreground">
                  Cancelar
                </button>
                <button
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-bold flex items-center justify-center gap-1"
                >
                  {purgingType === "history" ? "Excluindo..." : "Confirmar"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Botões do Rodapé de Exportação de Dados */}
      <div className="pt-2.5 border-t border-border/40 flex justify-between items-center gap-2">
        <button
          className={cn(
            "flex-1 py-2.5 border border-border rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 text-foreground"
          )}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-500" /> Exportar (CSV)
        </button>
        <button
          className={cn(
            "flex-1 py-2.5 border border-border rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 text-foreground"
          )}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Sheets
        </button>
        <button
          onClick={() => { setStep(2); setExportingType("pdf"); }}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 text-white border transition-all cursor-pointer",
            step === 2
              ? "bg-primary border-primary"
              : "bg-primary/85 hover:bg-primary border-primary/20"
          )}
        >
          {exportingType === "pdf" ? (
            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-white" />
          )}
          PDF
        </button>
      </div>

      {/* Seta do mouse simulada */}
      <SimulatedCursor x={cursor.x} y={cursor.y} isClicking={cursor.isClicking} />
    </div>
  )
}
