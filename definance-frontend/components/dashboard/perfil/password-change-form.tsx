"use client"
import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Check, Circle, X } from "lucide-react"

interface PasswordChangeFormProps {
  isActionLoading: boolean
  onSubmit: (passwords: any) => Promise<boolean>
}

export const PasswordChangeForm = ({
  isActionLoading,
  onSubmit
}: PasswordChangeFormProps) => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await onSubmit(passwords)
    if (success) {
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      })
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base text-card-foreground">Alterar Senha</CardTitle>
        <CardDescription>Mantenha sua conta segura</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmNewPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirmNewPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-2 space-y-1.5 px-1">
            {[
              { label: "Pelo menos 8 caracteres", met: passwords.newPassword.length >= 8 },
              { label: "Uma letra maiúscula", met: /[A-Z]/.test(passwords.newPassword) },
              { label: "Um caractere especial (!@#$%, etc)", met: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword) },
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] transition-colors duration-200">
                {req.met ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/40" />
                )}
                <span className={req.met ? "text-emerald-500/90" : "text-muted-foreground"}>
                  {req.label}
                </span>
              </div>
            ))}
            
            {passwords.confirmNewPassword && (
              <div className="flex items-center gap-1.5 text-[11px] transition-all duration-200">
                {passwords.newPassword === passwords.confirmNewPassword ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500/90 italic">As senhas correspondem</span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 text-destructive" />
                    <span className="text-destructive/90 italic">As senhas não correspondem</span>
                  </>
                )}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            variant="outline"
            disabled={isActionLoading}
          >
            Alterar senha
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}