"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Mail, Phone } from "lucide-react"

interface PersonalInfoFormProps {
  profile: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  setProfile: (profile: any) => void
  isGoogleAccount: boolean
  isActionLoading: boolean
  onSubmit: (e: React.FormEvent) => Promise<void>
  formatPhoneNumber: (value: string) => string
}

export const PersonalInfoForm = ({
  profile,
  setProfile,
  isGoogleAccount,
  isActionLoading,
  onSubmit,
  formatPhoneNumber
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
          
          {!isGoogleAccount && (
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: formatPhoneNumber(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  className="pl-9"
                  maxLength={15}
                />
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="bg-primary/70 text-primary-foreground hover:bg-primary min-w-[140px] cursor-pointer"
            disabled={isActionLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}