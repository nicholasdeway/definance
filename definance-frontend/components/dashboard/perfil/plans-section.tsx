"use client"

import { useState, useEffect } from "react"
import { Sparkles, CheckCircle2, Check, CreditCard, QrCode, Calendar, Zap, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-provider"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"

export function PlansSection() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [showRefundModal, setShowRefundModal] = useState(false)

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
                onClick={() => router.push("/dashboard/checkout?plan=annual")}
                disabled={loadingPlan !== null}
                className="shrink-0 flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
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
          <div className="border border-border/70 rounded-[2rem] p-6 bg-card flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all duration-300 relative group shadow-sm">
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-primary/5 to-transparent rounded-t-[2rem] pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold uppercase tracking-widest border border-primary/20">
                    Recorrente Mensal
                  </span>
                </div>
                <h3 className="font-extrabold text-xl text-foreground tracking-tight">Premium Mensal</h3>
                <p className="text-xs text-muted-foreground">Ideal para testar sem compromisso</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-medium text-foreground opacity-60">R$</span>
                  <span className="text-4xl font-extrabold text-foreground tracking-tighter">19</span>
                  <span className="text-lg font-medium text-foreground opacity-60">,90</span>
                  <span className="text-muted-foreground text-[10px] font-bold ml-1.5 opacity-40">/mês</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic font-normal opacity-60">
                  Plano mensal recorrente - Cancele quando quiser
                </p>
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
              onClick={() => router.push("/dashboard/checkout?plan=monthly")}
              className="w-full h-11 text-[10px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-wider lg:tracking-[0.2em] rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative z-10"
            >
              <CreditCard className="w-4 h-4" />
              Escolher Plano Mensal
            </button>
          </div>

          {/* Plano Anual */}
          <div className="relative group/annual">
            {/* Glowing background container */}
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-r from-primary to-amber-500 opacity-20 blur-lg pointer-events-none group-hover/annual:opacity-30 transition-opacity duration-300" />

            <div className="relative border border-primary/30 rounded-[2rem] p-6 bg-card flex flex-col justify-between space-y-6 hover:border-primary/60 transition-all duration-300 shadow-md shadow-primary/5 h-full">
              {/* Top Subtle Glow */}
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-primary/5 to-transparent rounded-t-[2rem] pointer-events-none" />

              {/* Pop de Melhor Opção */}
              <span className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[8px] font-extrabold uppercase tracking-widest py-1 px-3 rounded-full border border-amber-400 shadow-lg shadow-amber-500/20 z-20">
                Melhor Custo-Benefício
              </span>

              <div className="space-y-5 relative z-10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-semibold uppercase tracking-widest border border-amber-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-amber-500" /> Economia de 15%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-xl text-foreground tracking-tight">Premium Anual</h3>
                  <p className="text-xs text-muted-foreground">Parcelado em até 12x no cartão</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-medium text-foreground opacity-60">R$</span>
                    <span className="text-4xl font-extrabold text-foreground tracking-tighter">16</span>
                    <span className="text-lg font-medium text-foreground opacity-60">,65</span>
                    <span className="text-muted-foreground text-[10px] font-bold ml-1.5 opacity-40">/mês</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic font-normal opacity-60">
                    Cobrado anualmente (R$ 199,90 à vista)
                  </p>
                  <div className="mt-1 text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-emerald-500" /> Economize R$ 38,90 por ano
                  </div>
                </div>

                <div className="h-px bg-border/50 w-full" />

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
                onClick={() => router.push("/dashboard/checkout?plan=annual")}
                className="w-full h-11 text-[10px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-wider lg:tracking-[0.2em] rounded-xl bg-primary/70 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative z-10"
              >
                <QrCode className="w-4 h-4" />
                Escolher Plano Anual
              </button>
            </div>
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


    </div>
  )
}