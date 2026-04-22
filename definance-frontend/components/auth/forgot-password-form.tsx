"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-provider"
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from "lucide-react"

export function ForgotPasswordForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await requestPasswordReset(email)
    
    if (result.success) {
      setIsSuccess(true)
    } else {
      setError(result.message || "Não foi possível processar sua solicitação.")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Esqueceu a senha?</h1>
        <p className="text-sm text-muted-foreground">
          {isSuccess 
            ? "Instruções enviadas com sucesso."
            : "Digite seu e-mail para receber um link de redefinição."}
        </p>
      </div>

      {!isSuccess ? (
        <>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">E-mail da conta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-secondary/50 border-border h-12 pl-10 focus:ring-primary/20 text-foreground"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="h-12 w-full bg-primary/10 border border-primary/20 text-white hover:bg-primary/20 transition-all font-bold uppercase tracking-widest text-xs cursor-pointer" 
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="h-4 w-4" /> : "Enviar link de redefinição →"}
            </Button>
          </form>
        </>
      ) : (
        <div className="space-y-6 py-4 animate-in zoom-in duration-300">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Verifique seu e-mail</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enviamos as instruções de redefinição para <span className="font-medium text-foreground">{email}</span>.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-secondary/20 border border-border text-[10px] text-muted-foreground text-left flex gap-3 leading-relaxed">
              <AlertCircle className="h-4 w-4 text-primary shrink-0" />
              <p>Caso não encontre o e-mail em alguns minutos, verifique sua pasta de <strong>Spam</strong> ou <strong>Lixeira</strong>.</p>
            </div>
          </div>
          <Button 
            onClick={onBackToLogin}
            className="w-full bg-secondary/50 border border-border text-foreground hover:bg-secondary cursor-pointer"
          >
            Voltar para o Login
          </Button>
        </div>
      )}

      {!isSuccess && (
        <button 
          onClick={onBackToLogin}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </button>
      )}
    </div>
  )
}