"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, X, Send, ChevronDown, Loader2, Sparkles, CheckCircle2, Mic, MicOff } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { useSpeechToText } from "@/hooks/use-speech-to-text"

interface QuickExpenseResult {
  id: string
  name: string
  amount: number
  category: string
  date: string
}

const HINTS = [
  "Gastei 20 de pão hoje",
  "Paguei 50 no almoço ontem",
  "Uber de 35 agora",
  "Mercado 120 hoje",
  "Farmácia 45 ontem",
]

export function QuickExpenseButton() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<QuickExpenseResult | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [hintIndex, setHintIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechToText()

  // Rotaciona as dicas
  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex(i => (i + 1) % HINTS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  // Foca no input ao abrir
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  // Atualiza input conforme a transcrição ocorre
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  const reset = useCallback(() => {
    setInput("")
    setStatus("idle")
    setResult(null)
    setErrorMsg("")
    resetTranscript()
  }, [resetTranscript])

  const handleToggle = () => {
    if (open) {
      setOpen(false)
    } else {
      reset()
      setOpen(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || status === "loading") return

    setStatus("loading")
    setResult(null)
    setErrorMsg("")

    try {
      const data = await apiClient<QuickExpenseResult>("/api/dailyexpenses/quick", {
        method: "POST",
        body: JSON.stringify({ input: text }),
      })

      setResult(data)
      setStatus("success")

      // Notifica o sistema que um novo gasto foi adicionado
      window.dispatchEvent(new CustomEvent("expense-added"))

      // Fecha após 3s de feedback
      setTimeout(() => {
        reset()
        setOpen(false)
      }, 3000)
    } catch (err: any) {
      setErrorMsg(err?.message || "Não consegui entender. Tente descrever melhor.")
      setStatus("error")
    }
  }

  // Auto-submit apenas no mobile quando para de ouvir e tem conteúdo
  useEffect(() => {
    if (isMobile && !isListening && transcript && transcript.trim().length > 3) {
      // Pequeno delay para garantir que o estado do input atualizou
      const timer = setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent
        handleSubmit(fakeEvent)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isListening, isMobile])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
    if (e.key === "Escape") setOpen(false)
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <div
      className="fixed bottom-[110px] right-6 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6"
      ref={panelRef}
    >
      {/* Painel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[320px] rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-foreground leading-none">
                    Lançar Gasto Diário com IA
                  </p>
                  <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{today}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Estado de sucesso */}
              <AnimatePresence mode="wait">
                {status === "success" && result ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3 py-3"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500/15">
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[13px] font-bold text-foreground">Lançado com sucesso!</p>
                      <p className="text-[11px] text-muted-foreground">{result.name}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Categoria</p>
                        <p className="text-[12px] font-bold text-foreground truncate">{result.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Valor</p>
                        <p className="text-[13px] font-black text-primary">{formatCurrency(result.amount)}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-3"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Input principal */}
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => {
                          setInput(e.target.value)
                          if (status === "error") setStatus("idle")
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={status === "loading"}
                        placeholder={HINTS[hintIndex]}
                        className={cn(
                          "w-full h-11 rounded-xl border bg-background pr-20 pl-3.5 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all disabled:opacity-50",
                          status === "error"
                            ? "border-destructive/40 focus:border-destructive/50"
                            : "border-input focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
                          isListening && "border-primary/50 ring-1 ring-primary/20"
                        )}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onPointerDown={isMobile ? (e) => {
                            e.preventDefault()
                            startListening()
                          } : undefined}
                          onPointerUp={isMobile ? (e) => {
                            e.preventDefault()
                            stopListening()
                          } : undefined}
                          onClick={!isMobile ? (isListening ? stopListening : startListening) : undefined}
                          onContextMenu={(e) => e.preventDefault()}
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer relative",
                            isMobile && "touch-none",
                            isListening 
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/40 scale-110" 
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                          title={isMobile ? "Segure para falar" : (isListening ? "Parar" : "Ouvir")}
                        >
                          {isListening ? (
                            <>
                              <Mic className="h-3.5 w-3.5" />
                              <motion.span 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute inset-0 bg-white/40 rounded-lg"
                              />
                            </>
                          ) : (
                            <Mic className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          type="submit"
                          disabled={!input.trim() || status === "loading" || isListening}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/80 text-primary-foreground hover:bg-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {status === "loading" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Erro */}
                    {status === "error" && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-red-400/80 px-1"
                      >
                        {errorMsg}
                      </motion.p>
                    )}

                    {/* Loading state */}
                    {status === "loading" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 px-1"
                      >
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <span
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground/60">
                          Interpretando com IA...
                        </p>
                      </motion.div>
                    )}

                    {/* Dica de uso */}
                    {status === "idle" && (
                      <p className="text-[10px] text-muted-foreground/70 dark:text-muted-foreground/40 px-1 leading-relaxed">
                        Descreva o gasto em linguagem natural. A IA irá identificar o valor, a categoria e a data automaticamente.
                      </p>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full shadow-xl transition-all duration-300 cursor-pointer",
          open
            ? "bg-card border border-border shadow-none"
            : "bg-primary shadow-primary/30 hover:bg-primary/90"
        )}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown className="h-5 w-5 md:h-7 md:w-7 text-foreground" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ShoppingBag className="h-5 w-5 md:h-7 md:w-7 text-primary-foreground" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Ping quando fechado */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/20 pointer-events-none" />
        )}
      </motion.button>
    </div>
  )
}
