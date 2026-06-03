"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { useSectionNavigation } from "@/lib/scroll-utils"
import { ShieldCheck, Brain, Mail } from "lucide-react"
import { useState, useEffect } from "react"

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.553 4.189 1.606 6.06L0 24l6.117-1.605a11.793 11.793 0 005.925 1.577h.005c6.632 0 12.028-5.398 12.03-12.03a11.85 11.85 0 00-3.527-8.508z" />
  </svg>
)

export function Footer() {
  const { isAuthenticated, user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const { navigateToSection } = useSectionNavigation()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer className="border-t border-border/60 bg-background dark:bg-muted/30 relative overflow-hidden">
      <div className="container px-6 py-16 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:justify-around gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="space-y-8 max-w-sm">
            <div>
              <Link href="/" className="flex items-center gap-2.5 group">
                <img
                  src="/logo1.png"
                  alt="Definance Logo"
                  className="h-6 md:h-8 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
                />
                <span className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  Definance
                </span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Simplifique suas finanças pessoais com inteligência artificial e uma plataforma intuitiva projetada para o seu sucesso.
              </p>
            </div>

            {/* Badges Section */}
            <div className="flex flex-wrap items-center gap-4">
              {/* WhatsApp AI Badge */}
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm group hover:border-emerald-500/40 transition-all cursor-default">
                <WhatsAppIcon className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600/80 dark:text-emerald-500/80 leading-none">Inteligência</span>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">WhatsApp AI</span>
                </div>
              </div>

              {/* LGPD Badge */}
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-blue-500/5 border border-blue-500/20 shadow-sm group hover:border-blue-500/40 transition-all cursor-default">
                <ShieldCheck className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600/80 dark:text-blue-500/80 leading-none">Proteção</span>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-100">LGPD Compliance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Links Section Wrapper */}
          <div className="flex flex-wrap gap-12 md:gap-24 lg:gap-32">
            {/* Navigation */}
            <div>
              <h4 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/50">Produto</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li>
                  <Link
                    href="/#beneficios"
                    onClick={(e) => navigateToSection('/#beneficios', e)}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Benefícios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#como-funciona"
                    onClick={(e) => navigateToSection('/#como-funciona', e)}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Como funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#precos"
                    onClick={(e) => navigateToSection('/#precos', e)}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Plano
                  </Link>
                </li>
                <li>
                  {!mounted ? (
                    <div className="h-4 w-20 bg-muted/20 animate-pulse rounded" />
                  ) : (
                    <Link
                      href={isAuthenticated ? (user?.hasCompletedOnboarding ? "/dashboard" : "/onboarding") : "/register"}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {isAuthenticated ? "Meu Dashboard" : "Criar conta"}
                    </Link>
                  )}
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/50">Legal</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Termos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/50">Contato</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li className="text-muted-foreground flex items-center gap-2 select-all">
                  <Mail className="h-4 w-4 text-muted-foreground/75" />
                  <span>suporte@definance.com.br</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-muted-foreground font-medium">
            © 2026 Definance. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-4">
            <div
              className="h-9 w-9 rounded-full bg-foreground/5 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer group"
              title="E-mail"
            >
              <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
            </div>
            <div className="h-9 w-9 rounded-full bg-foreground/5 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer group">
              <InstagramIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            </div>
            <div className="h-9 w-9 rounded-full bg-foreground/5 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer group">
              <FacebookIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}