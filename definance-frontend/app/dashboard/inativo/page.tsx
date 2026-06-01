"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
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
  ArrowRight,
  Sparkles,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  LogOut,
  Clock
} from "lucide-react"

export default function InativoPage() {
  const { user, deleteAccount, logout } = useAuth()
  const router = useRouter()

  const [isAnnual, setIsAnnual] = useState(true)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

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

  const handleReactivate = () => {
    router.push("/dashboard/checkout")
  }

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="text-left space-y-2">
        <span className="text-[10px] md:text-xs font-bold text-rose-500 uppercase tracking-[0.2em]">
          Retomar Assinatura
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Plano Definance <span className="animate-shimmer-text">Premium</span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground font-medium">
          Selecione o formato para religar as conexões e continuar utilizando os recursos inteligentes.
        </p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column (spans 7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">

          {/* O QUE VOCÊ RECUPERA */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em]">
              O que você recupera
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Mensagens ilimitadas para o Definance WhatsApp",
                "Dashboard Web",
                "Categorias Ilimitadas",
                "Relatórios IA",
                "Controle de Metas e Objetivos",
                "Suporte humanizado"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/45 border border-border/50 hover:bg-card/70 transition-all duration-300">
                  <div className="h-6 w-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 text-rose-500" />
                  </div>
                  <span className="text-xs font-medium text-foreground/90 leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BÔNUS MANTIDOS */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] flex items-center gap-1.5">
              <span>Bônus Mantidos</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/10 border border-border/30 space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Relatório automático via WhatsApp
                </h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Configure o dia e horário de recebimento do seu relatório financeiro.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/10 border border-border/30 space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Google Agenda
                </h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Seus compromissos automaticamente sincronizados.
                </p>
              </div>
            </div>
          </div>

          {/* Desbloqueio Imediato */}
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15 flex items-start gap-4">
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-500">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground">Desbloqueio Imediato</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Renove com total segurança. Seu sistema voltará a processar seus dados sem nenhuma perda de histórico!
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (spans 5 cols on lg) */}
        <div className="lg:col-span-5 relative">

          {/* Glowing background container */}
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary to-accent opacity-20 blur-xl pointer-events-none" />

          <div className="relative bg-card border border-border rounded-[2rem] p-6 md:p-8 text-center overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            {/* Toggle */}
            <div className="flex justify-center mb-6 relative z-10">
              <div className="relative flex p-1 bg-background border border-border rounded-xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setIsAnnual(false)}
                  className={cn(
                    "relative px-5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer",
                    !isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="relative z-10">Mensal</span>
                  {!isAnnual && (
                    <motion.div
                      layoutId="active-plan-bg-overlay-page"
                      className="absolute inset-0 bg-primary rounded-lg shadow-md"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnnual(true)}
                  className={cn(
                    "relative px-5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center gap-1",
                    isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="relative z-10">Anual</span>
                  <span className="relative z-10 text-[8px] bg-rose-500/25 text-white px-1 py-0.5 rounded border border-rose-500/35 ml-0.5 lowercase font-semibold tracking-normal">
                    -15% OFF
                  </span>
                  {isAnnual && (
                    <motion.div
                      layoutId="active-plan-bg-overlay-page"
                      className="absolute inset-0 bg-primary rounded-lg shadow-md"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Pricing values */}
            <div className="space-y-2 mb-6 relative z-10">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] opacity-80 block">
                Acesso completo ao Definance
              </span>
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

              <p className="text-[10px] text-muted-foreground italic font-normal opacity-60">
                {isAnnual ? "Equivale a R$ 16,65/mês" : "Plano mensal recorrente - Cancele quando quiser"}
              </p>

              {isAnnual && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold border border-emerald-500/20 shadow-sm">
                  Economia de 15% — Equivale a 2 meses grátis!
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="space-y-5 relative z-10">
              <Button
                onClick={handleReactivate}
                className="w-full h-12 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl bg-primary hover:bg-primary/95 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                Reativar Acesso
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>

              {/* Trust badges */}
              <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] text-muted-foreground font-semibold uppercase tracking-widest opacity-60">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Compra Segura
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5 text-emerald-500" />
                    7 Dias de Garantia
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-[9px] text-muted-foreground font-semibold uppercase tracking-widest opacity-40">
                  <Lock className="h-3 w-3" />
                  Criptografia de Ponta a Ponta
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom safety valves */}
      <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => logout(false)}
          className="text-[11px] font-semibold text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
        >
          <LogOut className="w-3.5 h-3.5" />
          Fazer Logout
        </button>

        <button
          type="button"
          onClick={handleOpenDelete}
          className="text-[11px] font-semibold text-muted-foreground/60 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Excluir minha conta
        </button>
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
