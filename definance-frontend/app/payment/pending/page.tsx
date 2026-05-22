"use client"

import { Suspense } from "react"
import { Clock, ArrowRight, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

function PendingContent() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-card/40 backdrop-blur-lg border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 py-1 px-3 rounded-full w-fit mx-auto">
            Pagamento em Análise
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground mt-2">Quase lá! ⏳</h2>
          <p className="text-sm text-muted-foreground">
            Seu pagamento está sendo processado pela operadora. Isso é comum para pagamentos via Pix ou quando o banco está analisando a transação.
          </p>
          <p className="text-xs text-muted-foreground">
            Você não precisa esperar nesta tela. Assim que a confirmação for recebida pelo nosso sistema, seu acesso Premium será liberado automaticamente.
          </p>
        </div>

        <div className="bg-muted/40 border border-border/50 rounded-2xl p-4 w-full text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Plano</span>
            <span className="text-foreground font-semibold">Definance Premium</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Status</span>
            <span className="text-amber-500 font-semibold flex items-center gap-1">
              Pendente
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-primary/70 hover:bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer group"
        >
          Voltar para o Painel
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

export default function PendingPage() {
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
      <PendingContent />
    </Suspense>
  )
}