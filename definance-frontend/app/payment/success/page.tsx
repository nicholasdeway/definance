"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-provider"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"

function SuccessContent() {
  const { refreshUser } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const hasVerified = useRef(false)

  const sessionId = searchParams?.get("session_id")
  const paymentId = searchParams?.get("payment_id")

  useEffect(() => {
    async function verify() {
      if (hasVerified.current) return
      hasVerified.current = true

      try {
        const res = await apiClient<{ isPaid: boolean }>("/api/subscription/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId || undefined,
            paymentId: paymentId || undefined
          })
        })

        if (res.isPaid) {
          setSuccess(true)
          toast.success("Assinatura Premium ativada com sucesso! 🎉")
          await refreshUser(true)
        } else {
          setSuccess(false)
          toast.error("O pagamento ainda não foi confirmado.")
        }
      } catch (err) {
        console.error("Erro ao verificar pagamento:", err)
        toast.error("Erro ao sincronizar pagamento. Nossa equipe ativará em instantes se concluído.")
      } finally {
        setVerifying(false)
      }
    }

    if (sessionId || paymentId) {
      verify()
    } else {
      setVerifying(false)
      setSuccess(false)
    }
  }, [sessionId, paymentId, refreshUser])

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin flex items-center justify-center" />
            <Loader2 className="w-6 h-6 text-primary animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2 relative z-10">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Verificando seu Pagamento</h2>
            <p className="text-sm text-muted-foreground">Estamos validando a transação. Isso leva apenas alguns instantes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6 relative">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Pagamento não Identificado</h2>
            <p className="text-sm text-muted-foreground">
              Não conseguimos confirmar a transação automaticamente. Se você já realizou o pagamento, a ativação será processada em instantes pelo nosso sistema de webhooks.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/perfil")}
            className="w-full bg-primary/70 hover:bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            Voltar para o Perfil
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Confetti container could be simulated via CSS radial glow animations */}
      <div className="bg-card/40 backdrop-blur-lg border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 py-1 px-3 rounded-full w-fit mx-auto">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            Acesso Premium Ativo
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground mt-2">Parabéns! 🎉</h2>
          <p className="text-sm text-muted-foreground">
            Seu pagamento foi confirmado e todos os recursos do Definance Premium já estão liberados na sua conta.
          </p>
        </div>

        <div className="bg-muted/40 border border-border/50 rounded-2xl p-4 w-full text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Plano</span>
            <span className="text-foreground font-semibold">Definance Premium</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Status</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Ativo
            </span>
          </div>
          {paymentId && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Ref. Pagamento</span>
              <span className="text-foreground font-mono">{paymentId}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-primary/70 hover:bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer group"
        >
          Acessar Painel
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

function SuccessLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Carregando detalhes</h2>
          <p className="text-sm text-muted-foreground">Por favor, aguarde...</p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  )
}