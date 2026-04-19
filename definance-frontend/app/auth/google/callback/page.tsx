"use client"

import { useEffect, useState } from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { AlertCircle, CheckCircle2 } from "lucide-react"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, user, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const googleError = searchParams.get("googleError")
    
    if (googleError) {
      if (googleError === "external_auth_failed") {
        setError("Não foi possível autenticar com o Google. Tente novamente.")
      } else if (googleError === "server_error") {
        setError("Ocorreu um erro no servidor ao processar o login.")
      } else {
        setError("Algo deu errado no login com o Google.")
      }
      return
    }

    // Se estivermos autenticados e o usuário carregado, redirecionamos imediatamente
    if (!isLoading && isAuthenticated && user) {
      if (user.hasCompletedOnboarding) {
        router.push("/dashboard")
      } else {
        router.push("/onboarding")
      }
      return
    }

    // Fallback de timeout caso demore a sincronizar
    const tokenCheck = setTimeout(() => {
      if (!isLoading && !isAuthenticated) {
        setError("Falha ao sincronizar sessão. Verifique se os cookies estão habilitados.")
      }
    }, 5000)

    return () => clearTimeout(tokenCheck)
  }, [searchParams, isAuthenticated, user, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {error && (
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-2xl text-center">
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Ops! Algo deu errado</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground hover:bg-primary/70 transition-colors"
            >
              Voltar para o Login
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackContent />
    </Suspense>
  )
}