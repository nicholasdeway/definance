"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-provider"
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from "lucide-react"

export function ForgotPasswordForm() {
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
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur shadow-2xl">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-card-foreground">Esqueceu sua senha?</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          {isSuccess 
            ? "Instruções enviadas com sucesso."
            : "Digite seu e-mail para receber um link de redefinição."}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isSuccess ? (
          <>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">E-mail da conta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background/50"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" 
                disabled={isLoading}
              >
                {isLoading ? <Spinner className="h-4 w-4" /> : "Enviar link de redefinição"}
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-6 py-4 animate-in zoom-in duration-300">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Verifique seu e-mail</h3>
              <p className="text-sm text-muted-foreground">
                Enviamos as instruções de redefinição para <span className="font-medium text-foreground">{email}</span>.
              </p>
              <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground text-left flex gap-3">
                <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                <p>Caso não encontre o e-mail em alguns minutos, verifique sua pasta de <strong>Spam</strong> ou <strong>Lixeira</strong>.</p>
              </div>
            </div>
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
                Voltar para o Login
              </Button>
            </Link>
          </div>
        )}

        {!isSuccess && (
          <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        )}
      </CardContent>
    </Card>
  )
}