"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Zap, ArrowRight, ShieldCheck, Clock } from "lucide-react"

interface AccountSummaryCardProps {
  user: any
}

export const AccountSummaryCard = ({ user }: AccountSummaryCardProps) => {
  const isPaidPremium = user?.planType?.toLowerCase() === "premium" && user?.isPremium
  const isTrial = user?.isPremium && !isPaidPremium
  const isFree = !user?.isPremium

  const handleScrollToPlans = () => {
    const element = document.getElementById("plans-section")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

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
      </CardContent>
    </Card>
  )
}