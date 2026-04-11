"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Menu, X, User as UserIcon, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"

interface SiteHeaderProps {
  variant?: 'landing' | 'onboarding'
}

export function SiteHeader({ variant = 'landing' }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const pathname = usePathname()

  const isOnboarding = variant === 'onboarding'

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    if (isOnboarding) {
      if (window.confirm("Você ainda não finalizou o onboarding. Se sair agora, seu progresso será salvo, mas você precisará voltar aqui depois para concluir. Deseja sair?")) {
        logout()
      }
    } else {
      logout()
    }
  }

  const scrollToSection = (e: React.MouseEvent, href: string) => {
    const isHomePage = pathname === '/'
    
    if (!isHomePage || isOnboarding) {
      setMobileMenuOpen(false)
      return
    }

    e.preventDefault()
    const id = href.replace('#', '')

    if (id === '' || id === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const element = document.getElementById(id)
      if (element) {
        const offset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }

    setMobileMenuOpen(false)
  }

  const navLinks = isOnboarding ? [] : [
    { name: "Benefícios", href: '#beneficios' },
    { name: "Como funciona", href: '#como-funciona' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 pointer-events-none ${isScrolled ? 'md:pt-4 md:px-4' : 'pt-0 px-0'}`}>
      <nav 
        className={`pointer-events-auto relative flex items-center justify-between transition-all duration-250 border-b md:border ${
          isScrolled 
            ? 'w-full md:w-[96%] max-w-8xl bg-background/95 md:bg-background/40 md:backdrop-blur-2xl border-border/40 md:rounded-2xl py-3 px-4 md:px-7 shadow-lg' 
            : `w-full max-w-none bg-background/95 border-border/40 py-3 px-4 md:px-6 ${isOnboarding ? 'shadow-md' : ''}`
        }`}
      >
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 z-10"
          onClick={(e) => scrollToSection(e, '#')}>
          <Logo size={18} withCard variant="muted" />
          <span className="text-xl font-bold text-foreground">Definance</span>
        </Link>

        {/* Desktop Nav (Only in Landing) */}
        {!isOnboarding && (
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 z-10">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 z-10">
          <ThemeToggle />
          
          {!mounted || isLoading ? (
            <div className="h-9 w-24 bg-muted/20 animate-pulse rounded-lg hidden md:block" />
          ) : !isAuthenticated && !isOnboarding ? (
            <>
              <Link href="/register" className="hidden md:flex">
                <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Criar Conta
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="sm" 
                  className={`cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-all ${
                    isScrolled ? 'shadow-lg shadow-primary/20' : ''
                  }`}
                >
                  Entrar
                </Button>
              </Link>
            </>
          ) : (isAuthenticated || isOnboarding) && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-foreground leading-none">
                  {user?.firstName} {user?.lastName}
                </span>
                {isOnboarding ? (
                  <span className="text-[10px] font-medium mt-1 uppercase tracking-wider text-primary">
                    Configurando Perfil
                  </span>
                ) : (
                  <Link href="/dashboard" className="text-[10px] font-medium mt-1 uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Dashboard
                  </Link>
                )}
              </div>
              
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-4 w-4 text-primary" />
                )}
              </div>

              {!isOnboarding && (
                <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />
              )}

              <Button 
                variant="ghost" 
                size={isOnboarding ? "sm" : "icon"}
                onClick={handleLogout}
                className={`cursor-pointer text-muted-foreground hover:text-destructive transition-colors ${isOnboarding ? 'gap-2 font-medium px-2' : 'hidden md:flex'}`}
              >
                <LogOut className="h-4 w-4" />
                {isOnboarding && <span className="hidden sm:inline">Sair</span>}
              </Button>
            </div>
          )}
          
          {!isOnboarding && (
            <button className="md:hidden text-foreground ml-2 cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu (Only in Landing) */}
      {!isOnboarding && (
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`pointer-events-auto absolute left-4 right-4 bg-background border border-border/40 p-6 flex flex-col gap-4 md:hidden rounded-2xl shadow-2xl ${
                isScrolled ? 'top-20' : 'top-16'
              }`}
            >
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </a>
              ))}

              {(!mounted || isLoading) ? (
                <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
              ) : isAuthenticated ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/5 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair da Conta
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="w-full">
                    <Button variant="outline" size="lg" className="w-full cursor-pointer">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                      Criar Conta
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </header>
  )
}
