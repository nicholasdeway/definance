"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
import { Spinner } from "@/components/ui/spinner"
import { Sparkles, Zap, ArrowRight, ShieldCheck, Clock, AlertTriangle, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { toast } from "sonner"

interface AccountSummaryCardProps {
  user: any
}

export const AccountSummaryCard = ({ user }: AccountSummaryCardProps) => {
  const { deleteAccount } = useAuth()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isPaidPremium = user?.planType?.toLowerCase() === "premium" && user?.isPremium
  const isTrial = user?.isPremium && !isPaidPremium

  const isGoogleAccount =
    user?.authProvider?.toLowerCase() === "google" ||
    !!user?.avatar?.includes("googleusercontent.com")

  const handleScrollToPlans = () => {
    const element = document.getElementById("plans-section")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleOpenDelete = () => {
    setPassword("")
    setConfirmText("")
    setIsDeleteOpen(true)
  }

  const handleCloseDelete = () => {
    if (isLoading) return
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

    setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  const isConfirmDisabled = isGoogleAccount
    ? confirmText.trim().toLowerCase() !== "excluir"
    : !password

  const getPlanBadge = () => {
    if (isPaidPremium) {
      const planName = user?.stripeSubscriptionId ? "Premium Mensal" : "Premium Anual"
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
          <Sparkles className="w-3 h-3 fill-amber-500" /> {planName}
        </span>
      )
    }
    if (isTrial) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-500 uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm animate-pulse">
          <Zap className="w-3 h-3 fill-orange-500" /> Teste Grátis
        </span>
      )
    }
    return (
      <span className="text-[10px] font-bold bg-muted border border-border text-muted-foreground uppercase tracking-widest px-2.5 py-1 rounded-full">
        Gratuito
      </span>
    )
  }

  return (
    <>
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-card-foreground flex items-center gap-2">
            Resumo da Conta
          </CardTitle>
          <CardDescription>Informações gerais do seu plano</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Conta criada em
              </span>
              <span className="font-semibold text-card-foreground">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "---"}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Plano Atual
              </span>
              {getPlanBadge()}
            </div>

            {user?.isPremium && user?.premiumUntil && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Válido até</span>
                <span className="font-semibold text-card-foreground">
                  {new Date(user.premiumUntil).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
            )}
          </div>

          {!isPaidPremium && (
            <>
              <Separator className="bg-border/50" />
              <Button
                onClick={handleScrollToPlans}
                className="w-full text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r bg-primary/70 hover:bg-primary text-primary-foreground shadow-sm shadow-primary/10 hover:shadow-md hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5 group cursor-pointer"
              >
                {isTrial ? "Ativar Plano Premium" : "Quero ser Premium"}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </>
          )}

          <Separator className="bg-border/50" />
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={handleOpenDelete}
              className="text-[11px] text-muted-foreground/60 hover:text-red-500 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Excluir minha conta
            </button>
          </div>
        </CardContent>
      </Card>

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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-3 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDelete}
                disabled={isLoading}
                className="h-10 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isConfirmDisabled || isLoading}
                className="bg-red-600 hover:bg-red-700 text-white h-10 text-xs font-semibold min-w-[130px] cursor-pointer"
              >
                {isLoading ? (
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
    </>
  )
}