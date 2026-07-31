"use client"

import { useState, useEffect, useLayoutEffect } from "react"
import Link from "next/link"
import { X, ArrowRight, Zap } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { cn } from "@/lib/utils"

const BANNER_HEIGHT = 40 // px — altura fixa da faixa

// Atualiza a CSS custom property que o header usa para seu `top`
function setBannerCssVar(height: number) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--banner-h", `${height}px`)
  }
}

// ─── Top Urgency Banner ────────────────────────────────────────────────────
// Elemento fixed independente do header. Não sofre nenhum efeito de scroll.
export function UrgencyBanner() {
  const [visible, setVisible] = useState(true)
  const { isAuthenticated } = useAuth()

  // Define a variável CSS assim que monta, para o header já iniciar no top correto
  useLayoutEffect(() => {
    setBannerCssVar(BANNER_HEIGHT)
    return () => setBannerCssVar(0)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setBannerCssVar(0)
  }

  if (isAuthenticated) return null

  return (
    <div
      className={cn(
        // fixed e independente — não participa do flex do header
        "fixed top-0 left-0 right-0 z-[51] bg-emerald-600 dark:bg-emerald-700 text-white",
        "flex items-center justify-center gap-3 px-4",
        "transition-all duration-300",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none h-0 overflow-hidden"
      )}
      style={{ height: visible ? BANNER_HEIGHT : 0 }}
    >
      <Zap className="h-3.5 w-3.5 shrink-0 fill-white" aria-hidden="true" />
      <p className="text-xs sm:text-sm font-semibold leading-snug">
        <span className="font-black">Lançamento:</span> 7 dias grátis para testar tudo.{" "}
        <Link
          href="/register"
          className="underline underline-offset-2 hover:no-underline font-bold whitespace-nowrap"
        >
          Começar agora →
        </Link>
      </p>
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Fechar aviso"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Sticky Mobile CTA ────────────────────────────────────────────────────
export function StickyMobileCta() {
  const [visible, setVisible] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (isAuthenticated) return null

  return (
    <div
      className={cn(
        "fixed bottom-5 left-4 right-4 z-50 md:hidden transition-all duration-500",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
      )}
    >
      <Link
        href="/register"
        className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-2xl shadow-emerald-500/40 active:scale-95 transition-all"
      >
        Começar Agora — 7 Dias Grátis
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

