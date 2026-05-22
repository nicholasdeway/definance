"use client"
import React, { useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Camera, Trash2, CheckCircle2, Sparkles, Zap, ArrowRight, ShieldCheck, Clock } from "lucide-react"

interface ProfileSidebarCardProps {
  user: any
  initials: string
  isActionLoading: boolean
  isGoogleAccount: boolean
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveAvatar: () => Promise<void>
}

export const ProfileSidebarCard = ({
  user,
  initials,
  isActionLoading,
  isGoogleAccount,
  handleFileChange,
  handleRemoveAvatar
}: ProfileSidebarCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border/80 h-full flex flex-col justify-between">
      {/* Top Section: Profile Photo */}
      <div className="flex flex-col flex-1">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-card-foreground">Foto de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-6">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-transform group-hover:scale-[1.02]">
              <AvatarImage src={user?.avatar || ""} alt="Avatar" />
              <AvatarFallback className="bg-primary text-3xl text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 flex gap-1">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isActionLoading}
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
                title="Alterar foto"
              >
                <Camera className="h-5 w-5" />
              </Button>
              {user?.avatar && !user.avatar.includes("googleusercontent") && (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleRemoveAvatar}
                  disabled={isActionLoading}
                  className="h-10 w-10 rounded-full shadow-lg hover:scale-105 transition-transform"
                  title="Remover foto"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground max-w-[200px]">
            Imagens em formato JPG ou PNG (max. 2MB).
          </p>
          {isGoogleAccount && (
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-primary font-bold bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 uppercase tracking-tighter">
              <CheckCircle2 className="h-3 w-3" />
              Sincronizado via Google
            </div>
          )}
        </CardContent>
      </div>

      <Separator className="bg-border/50" />

      {/* Bottom Section: Account Summary */}
      <div className="flex flex-col p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-card-foreground flex items-center gap-2">
            Resumo da Conta
          </h3>
          <p className="text-xs text-muted-foreground">Informações gerais do seu plano</p>
        </div>

        <div className="space-y-3 pt-2">
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
              className="w-full text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/10 hover:shadow-md hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5 group cursor-pointer"
            >
              {isTrial ? "Ativar Plano Premium" : "Quero ser Premium"}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}