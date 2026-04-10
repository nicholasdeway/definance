"use client"

import { useState } from "react"
import { Eye, EyeOff, Check, Circle, X, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { AuthProvider, useAuth } from "@/lib/auth-provider"

export function RegisterForm() {
  const router = useRouter()
  const { register, loginWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    
    const hasMinLength = formData.password.length >= 8
    const hasUpperCase = /[A-Z]/.test(formData.password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)

    if (!hasMinLength || !hasUpperCase || !hasSpecialChar) {
      setError("A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um caractere especial.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }
    
    setIsLoading(true)
    const result = await register(formData)
    
    if (result.success) {
      router.push("/onboarding")
    } else {
      setError(result.message || "Erro ao criar conta")
      setIsLoading(false)
    }
  }

  async function handleGoogleRegister() {
    setIsLoading(true)
    await loginWithGoogle()
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-card-foreground">Comece</CardTitle>
        <CardDescription className="text-muted-foreground">
          Crie sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-card-foreground">Nome</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Seu nome"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              disabled={isLoading}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-card-foreground">Sobrenome</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Seu sobrenome"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              disabled={isLoading}
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="Seu e-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-card-foreground">Celular</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                let formatted = value
                if (value.length > 2) formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`
                if (value.length > 7) formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
                setFormData({ ...formData, phone: formatted })
              }}
              required
              disabled={isLoading}
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-card-foreground">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="bg-background pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="mt-2 space-y-1.5 px-1">
              {[
                { label: "Pelo menos 8 caracteres", met: formData.password.length >= 8 },
                { label: "Uma letra maiúscula", met: /[A-Z]/.test(formData.password) },
                { label: "Um caractere especial (!@#$%, etc)", met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
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
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-card-foreground">Confirmar senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
                className="bg-background pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.confirmPassword && (
              <div className="flex items-center gap-1.5 px-1 text-[11px] transition-all duration-200">
                {formData.password === formData.confirmPassword ? (
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
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
            disabled={isLoading}
          >
            {isLoading ? <Spinner className="h-4 w-4" /> : "Criar conta"}
          </Button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGoogleRegister}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Cadastrar com Google
        </Button>
        
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>

        <p className="mt-8 text-center text-[10px] leading-relaxed text-muted-foreground/60">
          Ao continuar, você concorda com nossos{" "}
          <Link href="/termos" className="underline hover:text-foreground">
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link href="/privacidade" className="underline hover:text-foreground">
            Política de Privacidade
          </Link>
          , e em receber e-mails periódicos com atualizações.
        </p>
      </CardContent>
    </Card>
  )
}