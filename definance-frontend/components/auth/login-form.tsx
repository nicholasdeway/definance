"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-provider"
import { AlertCircle, Eye, EyeOff, Mail, Lock, Info } from "lucide-react"

export function LoginForm({ onForgotPassword }: { onForgotPassword: () => void }) {
  const router = useRouter()
  const { login, loginWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    const result = await login(identifier, password)
    if (result.success && result.user) {
      if (result.user.hasCompletedOnboarding) {
        router.push("/dashboard")
      } else {
        router.push("/onboarding")
      }
    } else {
      setError(result.message || "Credenciais inválidas")
    }
    setIsLoading(false)
  }

  async function handleGoogleLogin() {
    setIsLoading(true)
    await loginWithGoogle()
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Bem-vindo de volta!</h1>
        <p className="text-sm text-muted-foreground">
          Entre com seus dados para acessar sua conta.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="identifier" className="text-[13px] font-bold text-foreground">E-mail ou Número de Celular</Label>
          <div className="relative">
            <Input
              id="identifier"
              type="text"
              placeholder="seu@email.com ou (00) 00000-0000"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={isLoading}
              className="bg-secondary/50 border-border h-12 focus:ring-emerald-500/20 text-foreground rounded-xl"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[13px] font-bold text-foreground">Senha</Label>
            <button 
              type="button"
              onClick={onForgotPassword} 
              className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Esqueci minha senha
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-secondary/50 border-border h-12 pr-10 focus:ring-emerald-500/20 text-foreground rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-semibold text-base rounded-xl shadow-lg shadow-emerald-900/20 cursor-pointer" 
          disabled={isLoading}
        >
          {isLoading ? <Spinner className="h-4 w-4" /> : "Acessar Painel ➔"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
          <span className="bg-background px-3 text-muted-foreground/50 font-normal">ou continue com</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="h-12 w-full bg-secondary/20 border-border text-foreground hover:bg-secondary/40 rounded-xl font-semibold cursor-pointer" 
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
        Entrar com Google
      </Button>

      <div className="text-center text-base">
        <span className="text-muted-foreground">Não tem uma conta?</span>{" "}
        <Link href="/register" className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
          Criar conta
        </Link>
      </div>

      <div className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground/40">
        Ao continuar, você concorda com nossos <Link href="/termos" className="underline hover:text-foreground transition-colors">Termos de Serviço</Link> e <Link href="/privacidade" className="underline hover:text-foreground transition-colors">Política de Privacidade</Link>, e em receber e-mails periódicos com atualizações.
      </div>
    </div>
  )
}