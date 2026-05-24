"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for diagnostic purposes
    console.error("Client error caught by App Boundary:", error)
  }, [error])

  return (
    <div className="dark min-h-screen bg-[#050505] text-foreground flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-destructive/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[480px] z-10">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-destructive/20 to-primary/20 rounded-[32px] blur opacity-40"></div>

        <div className="relative bg-[#0b0b0b]/90 border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 md:p-12 shadow-2xl text-center space-y-8">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Oops! Algo deu errado
            </h1>
            <p className="text-sm text-white/50 leading-relaxed font-medium">
              Ocorreu um erro inesperado ao carregar esta página. Isso pode ser causado por bloqueadores de conteúdo ou instabilidade na conexão.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => {
                // Tenta reiniciar o estado do Next.js
                reset()
                // Força um recarregamento se necessário
                setTimeout(() => {
                  window.location.reload()
                }, 100)
              }}
              className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-semibold text-base rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 animate-spin-reverse" />
              Recarregar Página
            </button>

            <Link
              href="/"
              className="h-12 w-full bg-white/5 hover:bg-white/10 text-white transition-all font-semibold text-base rounded-xl border border-white/10 flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Voltar ao Início
            </Link>
          </div>

          <div className="text-[10px] text-white/25 leading-normal">
            Se você estiver usando Adblock ou janela anônima com restrições severas, tente desativar temporariamente para o nosso domínio.
          </div>
        </div>
      </div>
    </div>
  )
}