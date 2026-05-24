"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global crash caught by Global Error Boundary:", error)
  }, [error])

  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#050505] text-white antialiased min-h-screen flex items-center justify-center p-6 select-none relative overflow-hidden font-sans">
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
                Falha Crítica do Sistema
              </h1>
              <p className="text-sm text-white/50 leading-relaxed font-medium">
                Ocorreu uma falha ao inicializar a aplicação. Seus bloqueadores de conteúdo (Adblock) ou configurações de privacidade do navegador podem estar interferindo na inicialização.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  reset()
                  setTimeout(() => {
                    window.location.reload()
                  }, 100)
                }}
                className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-semibold text-base rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 animate-spin-reverse" />
                Recarregar Sistema
              </button>
            </div>

            <div className="text-[10px] text-white/25 leading-normal">
              Caso o erro persista, tente desativar extensões de bloqueio de anúncios ou usar outra aba.
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}