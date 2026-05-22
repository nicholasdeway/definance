"use client"

import { Suspense } from "react"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

function FailureContent() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-card/40 backdrop-blur-lg border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-border/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-wider bg-red-500/10 border border-red-500/20 py-1 px-3 rounded-full w-fit mx-auto">
            Pagamento Cancelado ou Falhou
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground mt-2">Ops! Algo deu errado</h2>
          <p className="text-sm text-muted-foreground">
            Não foi possível concluir o seu pagamento. A transação foi cancelada ou recusada pela emissora do seu cartão.
          </p>
          <p className="text-xs text-muted-foreground">
            Você pode tentar novamente usando outro método de pagamento ou entrar em contato com o seu banco se a cobrança foi recusada.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => router.push("/dashboard/perfil")}
            className="flex-1 bg-primary/70 text-primary-foreground hover:bg-primary font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>

          <button
            onClick={() => router.push("/dashboard/perfil")}
            className="flex-1 bg-muted hover:bg-muted/80 text-foreground border border-border font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FailurePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Carregando</h2>
            <p className="text-sm text-muted-foreground">Por favor, aguarde...</p>
          </div>
        </div>
      </div>
    }>
      <FailureContent />
    </Suspense>
  )
}