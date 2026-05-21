"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Mail } from "lucide-react"

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.553 4.189 1.606 6.06L0 24l6.117-1.605a11.793 11.793 0 005.925 1.577h.005c6.632 0 12.028-5.398 12.03-12.03a11.85 11.85 0 00-3.527-8.508z" />
  </svg>
)
import Link from "next/link"

interface PersonalInfoFormProps {
  profile: {
    firstName: string
    lastName: string
    email: string
  }
  setProfile: (profile: any) => void
  isGoogleAccount: boolean
  isActionLoading: boolean
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export const PersonalInfoForm = ({
  profile,
  setProfile,
  isGoogleAccount,
  isActionLoading,
  onSubmit,
}: PersonalInfoFormProps) => {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base text-card-foreground">Informações Pessoais</CardTitle>
        <CardDescription>Atualize seus dados pessoais</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                required
                placeholder="Seu nome"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                required
                placeholder="Seu sobrenome"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Email
              {isGoogleAccount && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Google</span>}
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="pl-9 bg-muted/30"
                title="O email não pode ser alterado."
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
            </div>
            <p className="text-[10px] text-muted-foreground">O endereço de e-mail é usado para login e não pode ser alterado por segurança.</p>
          </div>

          <Button 
            type="submit" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary/70 dark:hover:bg-primary min-w-[140px] cursor-pointer"
            disabled={isActionLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar alterações
          </Button>
        </form>

        {/* Card de redirecionamento para WhatsApp */}
        <Link href="/dashboard/conectar-aplicativos" className="block mt-4">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer group">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <WhatsAppIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">WhatsApp Conectado</p>
              <p className="text-[11px] text-muted-foreground truncate">Gerencie seu número em Conectar Aplicativos →</p>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}