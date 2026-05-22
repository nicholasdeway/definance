"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles, CheckCircle2, CreditCard, QrCode, Calendar, Zap, AlertCircle, X } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-provider"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { useSearchParams, useRouter } from "next/navigation"

export function PlansSection() {
  const { user, refreshUser } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [verifyingSession, setVerifyingSession] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showGatewayModal, setShowGatewayModal] = useState(false)
  const hasVerified = useRef(false)

  const upgradeStatus = searchParams?.get("upgrade")
  const sessionId = searchParams?.get("session_id")
  const paymentId = searchParams?.get("payment_id")

  useEffect(() => {
    async function verifySession() {
      // Guard against React Strict Mode double-invocation in development
      if (hasVerified.current) return

      if (upgradeStatus === "success" && (sessionId || paymentId)) {
        hasVerified.current = true
        setVerifyingSession(true)
        try {
          const res = await apiClient<{ isPaid: boolean }>("/api/subscription/verify-session", {
            method: "POST",
            body: JSON.stringify({
              sessionId: sessionId || undefined,
              paymentId: paymentId || undefined
            })
          })
          if (res.isPaid) {
            toast.success("Parabéns! Sua assinatura Premium foi ativada com sucesso! 🎉")
            await refreshUser(true)
          } else {
            toast.error("O pagamento ainda não foi confirmado. Caso tenha pago, aguarde alguns instantes.")
          }
        } catch (err) {
          console.error("Erro ao verificar sessão de pagamento:", err)
          toast.error("Erro ao sincronizar assinatura. Se o pagamento foi feito, ela será ativada automaticamente pelo nosso sistema em breve.")
        } finally {
          setVerifyingSession(false)
          // Limpa os parâmetros da URL para evitar loops de verificação
          router.replace("/dashboard/perfil")
        }
      } else if (upgradeStatus === "pending") {
        hasVerified.current = true
        toast.info("Seu pagamento está pendente ou em análise. Assim que for confirmado, sua assinatura Premium será liberada! ⏳")
        router.replace("/dashboard/perfil")
      } else if (upgradeStatus === "cancel") {
        hasVerified.current = true
        toast.info("O processo de assinatura foi cancelado.")
        router.replace("/dashboard/perfil")
      }
    }
    verifySession()
  }, [upgradeStatus, sessionId, paymentId, refreshUser, router])

  // Reset loadingPlan if returning via back button (bfcache)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLoadingPlan(null)
      }
    }
    window.addEventListener("pageshow", handlePageShow)
    return () => {
      window.removeEventListener("pageshow", handlePageShow)
    }
  }, [])

  const handleCheckout = async (planType: string, gateway: string) => {
    setLoadingPlan(planType)
    try {
      const originUrl = window.location.origin
      const res = await apiClient<{ url: string }>("/api/subscription/checkout", {
        method: "POST",
        body: JSON.stringify({ planType, originUrl, gateway })
      })
      if (res.url) {
        window.location.href = res.url
      } else {
        toast.error("Não foi possível gerar a página de checkout. Tente novamente.")
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar pagamento.")
    } finally {
      setLoadingPlan(null)
    }
  }

  const handlePortal = async () => {
    setLoadingPlan("portal")
    try {
      const originUrl = window.location.origin
      const res = await apiClient<{ url: string }>("/api/subscription/portal", {
        method: "POST",
        body: JSON.stringify({ originUrl })
      })
      if (res.url) {
        window.location.href = res.url
      } else {
        toast.error("Não foi possível abrir o portal financeiro.")
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao abrir portal financeiro.")
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleCancelAndRefund = async () => {
    setShowRefundModal(false)
    setLoadingPlan("refund")
    try {
      await apiClient("/api/subscription/cancel-and-refund", { method: "POST" })
      toast.success("✅ Reembolso solicitado com sucesso! O valor será estornado em 5-10 dias úteis.")
      await refreshUser(true)
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar reembolso.")
    } finally {
      setLoadingPlan(null)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    } catch {
      return ""
    }
  }

  if (verifyingSession) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center space-y-4">
        <Spinner className="h-10 w-10 text-primary animate-spin" />
        <h3 className="text-lg font-semibold text-foreground">Confirmando pagamento...</h3>
        <p className="text-xs text-muted-foreground text-center">Por favor, aguarde enquanto validamos sua transação.</p>
      </div>
    )
  }

  const isPremium = user?.isPremium
  const isPaidPremium = user?.planType?.toLowerCase() === "premium"
  const isEligibleForRefund = user?.isEligibleForRefund === true

  // Calculate days remaining for refund
  const refundDaysRemaining = (() => {
    if (!user?.subscriptionStartedAt) return 0
    const startedAt = new Date(user.subscriptionStartedAt)
    const deadline = new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    const diffMs = deadline.getTime() - Date.now()
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  })()

  return (
    <div id="plans-section" className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden shadow-sm">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold leading-none tracking-tight text-card-foreground flex items-center gap-2">
            Plano de Assinatura
            {isPremium ? (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 uppercase tracking-wider px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 fill-amber-500" /> Premium
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-muted border border-border text-muted-foreground uppercase tracking-wider px-2 py-0.5 rounded-full">
                Gratuito (Free)
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground max-w-xl">
            {isPaidPremium
              ? "Sua assinatura ativa garante acesso a recursos ilimitados, IA avançada e relatórios financeiros automatizados."
              : "Aproveite 7 dias de trial premium na criação de sua conta. Após o término, o acesso ao painel é bloqueado."}
          </p>
        </div>

        {isPaidPremium && (
          <button
            onClick={handlePortal}
            disabled={loadingPlan !== null}
            className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold py-2.5 px-4 rounded-xl border border-border transition-all duration-200"
          >
            {loadingPlan === "portal" ? <Spinner className="h-4 w-4 text-foreground" /> : <Calendar className="w-4 h-4" />}
            Gerenciar Assinatura (Stripe)
          </button>
        )}
      </div>

      {!isPaidPremium && isPremium && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Período de Teste Ativo
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Você tem acesso completo à plataforma gratuitamente até <strong>{formatDate(user?.premiumUntil)}</strong>.
              Escolha um dos planos abaixo para garantir a continuidade de seus serviços após o teste.
            </p>
          </div>
        </div>
      )}

      {isPaidPremium ? (
        <>
          <div className="grid gap-4 md:grid-cols-3 bg-muted/40 border border-border/50 rounded-2xl p-5 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Status da Conta</span>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Ativa
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Plano Atual</span>
              <span className="text-foreground font-semibold flex items-center gap-1">
                {user?.stripeSubscriptionId ? "Premium Mensal" : "Premium Anual"} <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Válido até</span>
              <span className="text-foreground font-semibold flex items-center gap-1">
                {formatDate(user?.premiumUntil)}
              </span>
            </div>
          </div>

          {/* Garantia de 7 dias (CDC) */}
          {isEligibleForRefund ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Garantia de Reembolso — CDC Art. 49</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Você tem direito a reembolso integral nos primeiros 7 dias.
                    {refundDaysRemaining > 0 && (
                      <span className="text-emerald-600 font-semibold"> Restam {refundDaysRemaining} dia{refundDaysRemaining !== 1 ? 's' : ''}.</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRefundModal(true)}
                disabled={loadingPlan !== null}
                className="shrink-0 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer"
              >
                {loadingPlan === "refund" ? <Spinner className="h-4 w-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                Cancelar e Reembolsar
              </button>
            </div>
          ) : isPaidPremium && (
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                O prazo de reembolso de 7 dias expirou. Você pode cancelar a renovação futura via
                <button onClick={handlePortal} className="text-primary font-semibold ml-1 hover:underline">Gerenciar Assinatura</button>.
              </p>
            </div>
          )}

          {/* Seção de Upgrade para Plano Anual */}
          {user?.stripeSubscriptionId && (
            <div className="bg-gradient-to-r from-primary/10 via-amber-500/5 to-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary fill-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    Upgrade para Plano Anual
                    <span className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 uppercase px-2 py-0.5 rounded-full">
                      Economize R$ 38,90/ano
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Migre para o plano anual por apenas <strong>R$ 199,90/ano</strong> (parcelado em até 12x no cartão ou via PIX).
                    Sua assinatura mensal atual será cancelada automaticamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGatewayModal(true)}
                disabled={loadingPlan !== null}
                className="shrink-0 flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer"
              >
                {loadingPlan === "annual" ? <Spinner className="h-4 w-4 text-primary-foreground animate-spin" /> : <Zap className="w-4 h-4" />}
                Fazer Upgrade Agora
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Plano Mensal */}
          <div className="border border-border/70 rounded-2xl p-6 bg-card flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all duration-300 relative group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-foreground">Premium Mensal</h3>
                  <p className="text-xs text-muted-foreground">Ideal para pagamentos graduais</p>
                </div>
                <span className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5">
                  Recorrente
                </span>
              </div>

              <div className="flex items-baseline gap-1 text-foreground">
                <span className="text-2xl font-bold tracking-tight">R$ 19,90</span>
                <span className="text-xs text-muted-foreground">/ mês</span>
              </div>

              <div className="h-px bg-border/50 w-full" />

              <ul className="space-y-3.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  Conexão WhatsApp ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  Comandos de IA e relatórios por áudio/texto
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  Metas, transações e dashboard inteligente
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout("monthly", "stripe")}
              disabled={loadingPlan !== null}
              className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold py-3 px-4 rounded-xl border border-primary/20 transition-all duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loadingPlan === "monthly" ? <Spinner className="h-4 w-4" /> : <CreditCard className="w-4 h-4" />}
              Escolher Plano Mensal
            </button>
          </div>

          {/* Plano Anual */}
          <div className="border border-primary/30 rounded-2xl p-6 bg-primary/5/20 flex flex-col justify-between space-y-6 hover:border-primary transition-all duration-300 relative group shadow-md shadow-primary/5">
            {/* Pop de Melhor Opção */}
            <span className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full border border-amber-400 shadow-sm animate-bounce">
              Melhor Custo-Benefício
            </span>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-1.5">
                    Premium Anual <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </h3>
                  <p className="text-xs text-muted-foreground">Parcelado em até 12x de R$ 16,65</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-1 text-foreground">
                  <span className="text-2xl font-bold tracking-tight">R$ 199,90</span>
                  <span className="text-xs text-muted-foreground">/ ano à vista</span>
                </div>
                <p className="text-[10px] text-primary font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-primary" /> Economize R$ 38,90 por ano
                </p>
              </div>

              <div className="h-px bg-primary/10 w-full" />

              <ul className="space-y-3.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 fill-primary/10" />
                  Parcelamento em até 12x no cartão
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 fill-primary/10" />
                  Disponível pagamento via PIX
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 fill-primary/10" />
                  Todos os benefícios do Definance
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowGatewayModal(true)}
              disabled={loadingPlan !== null}
              className="w-full bg-primary/70 hover:bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary/15 transition-all duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loadingPlan === "annual" ? <Spinner className="h-4 w-4" /> : <QrCode className="w-4 h-4" />}
              Escolher Plano Anual
            </button>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Confirmar Cancelamento e Reembolso</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sua assinatura Premium será <strong className="text-foreground">cancelada imediatamente</strong> e o valor pago será estornado para o seu cartão em <strong className="text-foreground">5 a 10 dias úteis</strong>.
              </p>
              <p className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-xl px-4 py-2 w-full">
                Você perderá acesso imediato a todos os recursos Premium.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 py-2.5 px-4 text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition-all duration-200 cursor-pointer"
              >
                Manter Assinatura
              </button>
              <button
                onClick={handleCancelAndRefund}
                className="flex-1 py-2.5 px-4 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 cursor-pointer"
              >
                Confirmar Reembolso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gateway Selection Modal */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  Escolha como pagar
                </h3>
                <p className="text-xs text-muted-foreground">
                  Selecione a melhor opção de pagamento para sua assinatura Premium Anual.
                </p>
              </div>
              <button
                onClick={() => setShowGatewayModal(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 hover:bg-muted/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gateway Options */}
            <div className="grid gap-4">
              {/* Option 1: Stripe */}
              <button
                onClick={() => {
                  setShowGatewayModal(false)
                  handleCheckout("annual", "stripe")
                }}
                disabled={loadingPlan !== null}
                className="w-full text-left bg-muted/40 hover:bg-muted/80 border border-border/80 hover:border-primary/40 rounded-2xl p-5 transition-all duration-300 flex items-start gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 p-2 group-hover:scale-105 transition-transform duration-200 shadow-sm border border-border">
                  <img src="/stripe.png" alt="Stripe Logo" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="text-sm font-bold text-foreground truncate">Cartão de Crédito (Stripe)</span>
                    <span className="text-[9px] font-extrabold bg-primary/15 text-primary border border-primary/20 rounded-full px-2 py-0.5 uppercase tracking-wider whitespace-nowrap self-start sm:self-auto">
                      Renovação Automática
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pagamento <strong>à vista</strong> apenas. Renova automaticamente a cada 1 ano no seu cartão. Ideal para manter sua conta ativa sem preocupações.
                  </p>
                </div>
              </button>

              {/* Option 2: Mercado Pago */}
              <button
                onClick={() => {
                  setShowGatewayModal(false)
                  handleCheckout("annual", "mercadopago")
                }}
                disabled={loadingPlan !== null}
                className="w-full text-left bg-muted/40 hover:bg-muted/80 border border-border/80 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-300 flex items-start gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 p-2 group-hover:scale-105 transition-transform duration-200 shadow-sm border border-border">
                  <img src="/mercadopago.png" alt="Mercado Pago Logo" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="text-sm font-bold text-foreground truncate">Pix ou Parcelado (Mercado Pago)</span>
                    <span className="text-[9px] font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider whitespace-nowrap self-start sm:self-auto">
                      Sem Renovação
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pague via <strong>PIX</strong> ou parcele em até <strong>12x no Cartão</strong>. <strong>Pagamento único</strong>. O plano expira em 1 ano e não será cobrado novamente de forma automática.
                  </p>
                </div>
              </button>
            </div>

            {/* Cancel Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowGatewayModal(false)}
                className="py-2.5 px-4 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition-all duration-200 cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}