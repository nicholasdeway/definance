"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
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

    // Se estivermos aqui, o cookie definance_token deve ter sido definido pelo proxy do backend
    // O useAuth irá disparar o checkAuth automaticamente ao montar se estiver configurado globalmente
    // ou podemos forçar um pequeno delay para aguardar o reconhecimento do cookie
    
    const tokenCheck = setTimeout(() => {
      if (isAuthenticated) {
        router.push("/dashboard")
      } else {
        // Se após 3 segundos não estiver autenticado, algo falhou no cookie
        setError("Falha ao sincronizar sessão. Verifique se os cookies estão habilitados.")
      }
    }, 2000)

    return () => clearTimeout(tokenCheck)
  }, [searchParams, isAuthenticated, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-2xl text-center">
        {!error ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Spinner className="h-12 w-12 text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Finalizando Login</h1>
            <p className="text-muted-foreground animate-pulse">
              Autenticando com o Google, por favor aguarde...
            </p>
          </div>
        ) : (
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
              className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Voltar para o Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
