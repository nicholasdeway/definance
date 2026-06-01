"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Lock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  LogOut,
  Clock,
  CreditCard,
  QrCode,
  Zap,
  CheckCircle2
} from "lucide-react"

function CheckoutContent() {
  const { user, deleteAccount, logout, refreshUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isAnnual, setIsAnnual] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [verifyingSession, setVerifyingSession] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const hasVerified = useRef(false)

  const planParam = searchParams?.get("plan")

  useEffect(() => {
    if (planParam === "monthly") {
      setIsAnnual(false)
    } else if (planParam === "annual") {
      setIsAnnual(true)
    }
  }, [planParam])

  const upgradeStatus = searchParams?.get("upgrade")
  const sessionId = searchParams?.get("session_id")
  const paymentId = searchParams?.get("payment_id")

  // Payment Verification Hook
  useEffect(() => {
    async function verifySession() {
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
            router.push("/dashboard")
          } else {
            toast.error("O pagamento ainda não foi confirmado. Caso tenha pago, aguarde alguns instantes.")
          }
        } catch (err) {
          console.error("Erro ao verificar sessão de pagamento:", err)
          toast.error("Erro ao sincronizar assinatura. Se o pagamento foi feito, ela será ativada automaticamente pelo nosso sistema em breve.")
        } finally {
          setVerifyingSession(false)
          router.replace("/dashboard/checkout")
        }
      } else if (upgradeStatus === "pending") {
        hasVerified.current = true
        toast.info("Seu pagamento está pendente ou em análise. Assim que for confirmado, sua assinatura Premium será liberada! ⏳")
        router.replace("/dashboard/checkout")
      } else if (upgradeStatus === "cancel") {
        hasVerified.current = true
        toast.info("O processo de assinatura foi cancelado.")
        router.replace("/dashboard/checkout")
      }
    }
    verifySession()
  }, [upgradeStatus, sessionId, paymentId, refreshUser, router])

  const handleCheckout = async (planType: string, gateway: string) => {
    setLoadingPlan(`${planType}-${gateway}`)
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

  const isGoogleAccount =
    user?.authProvider?.toLowerCase() === "google" ||
    !!user?.avatar?.includes("googleusercontent.com")

  const handleOpenDelete = () => {
    setPassword("")
    setConfirmText("")
    setIsDeleteOpen(true)
  }

  const handleCloseDelete = () => {
    if (isDeleteLoading) return
    setIsDeleteOpen(false)
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isGoogleAccount) {
      if (confirmText.trim().toLowerCase() !== "excluir") {
        toast.error("Para confirmar, digite exatamente a palavra 'Excluir'.")
        return
      }
    } else {
      if (!password) {
        toast.error("A senha atual é necessária para confirmar a exclusão.")
        return
      }
    }

    setIsDeleteLoading(true)
    try {
      const result = await deleteAccount(isGoogleAccount ? undefined : password)
      if (result.success) {
        toast.success("Conta excluída com sucesso.")
        setIsDeleteOpen(false)
      } else {
        toast.error(result.message || "Erro ao excluir conta.")
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro ao excluir a conta. Tente novamente.")
    } finally {
      setIsDeleteLoading(false)
    }
  }

  const isConfirmDisabled = isGoogleAccount
    ? confirmText.trim().toLowerCase() !== "excluir"
    : !password

  if (verifyingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="bg-card/45 backdrop-blur-md border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6">
          <Spinner className="h-10 w-10 text-primary animate-spin" />
          <h3 className="text-lg font-semibold text-foreground">Confirmando pagamento...</h3>
          <p className="text-xs text-muted-foreground text-center">Por favor, aguarde enquanto validamos sua transação.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Checkout Premium
          </h1>
          <p className="text-muted-foreground text-sm">
            Ative sua assinatura para desbloquear todos os recursos inteligentes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(user?.isPremium ? "/dashboard/perfil" : "/dashboard/inativo")}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column (Checkout Gateway Options, spans 8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Toggle Mensal/Anual */}
          <div className="flex justify-center">
            <div className="relative flex p-1 bg-background border border-border rounded-xl shadow-sm">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "relative px-6 md:px-8 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer",
                  !isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative z-10">Mensal</span>
                {!isAnnual && (
                  <motion.div
                    layoutId="checkout-plan-bg"
                    className="absolute inset-0 bg-primary rounded-lg shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "relative px-6 md:px-8 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center gap-1",
                  isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative z-10">Anual</span>
                <span className="relative z-10 text-[8px] bg-rose-500/25 text-white px-1.5 py-0.5 rounded border border-rose-500/35 ml-0.5 lowercase font-semibold tracking-normal">
                  -15% OFF
                </span>
                {isAnnual && (
                  <motion.div
                    layoutId="checkout-plan-bg"
                    className="absolute inset-0 bg-primary rounded-lg shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="max-w-md mx-auto scale-[0.95] md:scale-100 relative">
            {/* Glowing background container */}
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary to-accent opacity-20 blur-xl pointer-events-none" />

            <div className="relative bg-card border border-border rounded-[2rem] shadow-md overflow-hidden group">
              {/* Top Subtle Glow */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

              <div className="p-8 text-center border-b border-border/50 relative z-10">
                <div className="flex justify-center gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-semibold uppercase tracking-widest border border-primary/20">
                    {!isAnnual ? "Recorrente Mensal" : "Pagamento Único"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-semibold uppercase tracking-widest border border-emerald-500/20">
                    Acesso Premium
                  </span>
                </div>

                <h3 className="text-[12px] font-medium text-foreground mb-6 uppercase tracking-[0.2em] opacity-80">
                  Acesso completo ao Definance
                </h3>

                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-xl font-medium text-foreground opacity-60">R$</span>
                  <span className="text-5xl font-extrabold text-foreground tracking-tighter">
                    {isAnnual ? "199" : "19"}
                  </span>
                  <span className="text-xl font-medium text-foreground opacity-60">
                    ,{isAnnual ? "90" : "90"}
                  </span>
                  <span className="text-muted-foreground text-[10px] font-bold ml-1.5 opacity-40">{isAnnual ? "/ano" : "/mês"}</span>
                </div>

                <p className="mt-2 text-[10px] text-muted-foreground font-normal italic opacity-60">
                  {isAnnual ? "Equivale a R$ 16,65/mês" : "Plano mensal sem fidelidade"}
                </p>

                {isAnnual && (
                  <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold border border-emerald-500/20">
                    Economia de 15%
                  </div>
                )}

                <div className="mt-8 space-y-3">
                  {!isAnnual ? (
                    // Stripe Monthly + Mercado Pago Monthly
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => handleCheckout("monthly", "stripe")}
                        disabled={loadingPlan !== null}
                        className="w-full h-12 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl bg-primary/70 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {loadingPlan === "monthly-stripe" ? (
                          <Spinner className="h-4 w-4 text-primary-foreground animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Assinar
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCheckout("monthly", "mercadopago")}
                        disabled={loadingPlan !== null}
                        className="w-full h-12 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl bg-amber-500/70 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {loadingPlan === "monthly-mercadopago" ? (
                          <Spinner className="h-4 w-4 text-white animate-spin" />
                        ) : (
                          <>
                            <QrCode className="w-4 h-4" />
                            Pix
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    // Stripe Annual + Mercado Pago Annual
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => handleCheckout("annual", "stripe")}
                        disabled={loadingPlan !== null}
                        className="w-full h-12 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl bg-primary/70 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {loadingPlan === "annual-stripe" ? (
                          <Spinner className="h-4 w-4 text-primary-foreground animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            À Vista no cartão
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCheckout("annual", "mercadopago")}
                        disabled={loadingPlan !== null}
                        className="w-full h-12 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl bg-amber-500/70 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {loadingPlan === "annual-mercadopago" ? (
                          <Spinner className="h-4 w-4 text-white animate-spin" />
                        ) : (
                          <>
                            <QrCode className="w-4 h-4" />
                            Pix ou Parcelado até 12x
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-4 text-[9px] text-muted-foreground font-medium uppercase tracking-widest opacity-40 pt-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Compra Segura
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="h-3.5 w-3.5 text-emerald-500" />
                      7 Dias de Garantia
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Features List */}
              <div className="p-6 bg-muted/5 relative z-10 border-t border-border/50">
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">O que está incluso</span>
                  <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10 uppercase">Ilimitado</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "WhatsApp Ilimitado" },
                    { label: "Dashboard Completo" },
                    { label: "Categorias Ilimitadas" },
                    { label: "Relatórios IA" },
                    { label: "Controle de Metas e Objetivos" },
                    { label: "Suporte humanizado" }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border/50 group-hover:bg-muted/50 transition-colors">
                      <div className="h-5 w-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                        <Check className="h-3 w-3 text-rose-500" />
                      </div>
                      <span className="text-[10px] font-medium text-foreground/60 leading-tight uppercase tracking-normal">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-[9px] text-muted-foreground italic opacity-60 leading-tight">
                    Liberação imediata dos recursos <br /> após a confirmação do pagamento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Account Summary Details, spans 4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden transition-all duration-300">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Resumo da Conta</h3>
              <p className="text-xs text-muted-foreground">Informações gerais do seu cadastro</p>
            </div>

            <div className="h-px bg-border/50 w-full" />

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Criada em
                </span>
                <span className="font-semibold text-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "---"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Status do Plano
                </span>
                <span className="text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-500 uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
                  Inativo
                </span>
              </div>
            </div>

            <div className="h-px bg-border/50 w-full" />

            {/* Bottom Actions */}
            <div className="flex flex-col gap-3 pt-1">
              <button
                type="button"
                onClick={() => logout(false)}
                className="w-full py-2 bg-muted/30 hover:bg-muted/80 text-foreground border border-border/80 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Fazer Logout
              </button>

              <button
                type="button"
                onClick={handleOpenDelete}
                className="w-full text-center text-[10px] text-muted-foreground/60 hover:text-red-500 font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Excluir minha conta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={handleCloseDelete}>
        <DialogContent className="sm:max-w-md border-border/80 shadow-2xl">
          <form onSubmit={handleDelete}>
            <DialogHeader className="gap-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 dark:text-red-400">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <DialogTitle className="text-center text-lg font-bold text-foreground">
                Confirmar Exclusão de Conta
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground leading-normal">
                Esta ação é irreversível. Todos os seus dados serão deletados permanentemente e a sua assinatura Stripe será cancelada.
              </DialogDescription>
            </DialogHeader>

            <div className="my-6 space-y-4">
              {isGoogleAccount ? (
                <div className="space-y-2">
                  <Label htmlFor="confirmText" className="text-xs font-semibold text-foreground block">
                    <span>
                      Sua conta está vinculada ao Google. Para confirmar, digite <span className="font-bold text-red-600 dark:text-red-400 select-none">Excluir</span>:
                    </span>
                  </Label>
                  <Input
                    id="confirmText"
                    type="text"
                    placeholder="Digite Excluir"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    required
                    className="h-10 text-sm border-red-500/30 focus-visible:ring-red-500"
                    disabled={isDeleteLoading}
                    autoComplete="off"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs font-semibold text-foreground">
                    Confirme sua senha para continuar:
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Sua senha atual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 text-sm"
                    disabled={isDeleteLoading}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-3 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDelete}
                disabled={isDeleteLoading}
                className="h-10 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isConfirmDisabled || isDeleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white h-10 text-xs font-semibold min-w-[130px] cursor-pointer"
              >
                {isDeleteLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 text-white" />
                    Excluindo...
                  </>
                ) : (
                  "Confirmar Exclusão"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <Spinner className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
