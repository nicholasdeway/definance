"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-provider"
import { AlertCircle, CheckCircle2, Lock, Eye, EyeOff, XCircle } from "lucide-react"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { confirmPasswordReset } = useAuth()
  
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  // Password criteria
  const hasMinLength = newPassword.length >= 8
  const hasUpperCase = /[A-Z]/.test(newPassword)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  const isFormValid = hasMinLength && hasUpperCase && hasSpecialChar && newPassword === confirmNewPassword && newPassword !== ""

  useEffect(() => {
    const t = searchParams.get("token")
    const e = searchParams.get("email")
    if (t) setToken(t)
    if (e) setEmail(e)
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError("")

    const result = await confirmPasswordReset({
      email,
      token,
      newPassword,
      confirmNewPassword
    })
    
    if (result.success) {
      setIsSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } else {
      setError(result.message || "Erro ao redefinir sua senha. Verifique se o link expirou.")
    }
    setIsLoading(false)
  }

  const PasswordCriterion = ({ label, isValid }: { label: string; isValid: boolean }) => (
    <div className="flex items-center gap-2 text-xs">
      {isValid ? (
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 transition-colors" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground/30 shrink-0 transition-colors" />
      )}
      <span className={isValid ? "text-primary font-medium" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  )

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur shadow-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-primary/20">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(Number(hasMinLength) + Number(hasUpperCase) + Number(hasSpecialChar)) * 33.33}%` }} />
      </div>
      
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Lock className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-card-foreground">Nova Senha</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          {isSuccess ? "Senha redefinida com sucesso." : "Escolha uma senha forte para sua segurança."}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isSuccess ? (
          <div className="animate-in fade-in duration-500">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-background/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className={`bg-background/50 transition-colors ${
                        confirmNewPassword && newPassword !== confirmNewPassword ? "border-destructive/50" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Password Criteria */}
              <div className="space-y-2 rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Segurança da Senha</p>
                <PasswordCriterion label="Mínimo de 8 caracteres" isValid={hasMinLength} />
                <PasswordCriterion label="Uma letra maiúscula" isValid={hasUpperCase} />
                <PasswordCriterion label="Um caractere especial (!@#$%, etc.)" isValid={hasSpecialChar} />
                <PasswordCriterion label="As senhas coincidem" isValid={newPassword === confirmNewPassword && newPassword !== ""} />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" 
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? <Spinner className="h-4 w-4" /> : "Redefinir Senha"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 py-6 animate-in zoom-in duration-300">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Sua senha foi redefinida!</h3>
              <p className="text-sm text-muted-foreground">
                Você já pode acessar sua conta com a nova senha criada. Redirecionando para o login...
              </p>
            </div>
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
                Fazer Login agora
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}