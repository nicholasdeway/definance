"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Menu, X, User as UserIcon, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSectionNavigation } from "@/lib/scroll-utils"

import { OnboardingExitDialog } from "@/components/dashboard/onboarding/onboarding-exit-dialog"

interface SiteHeaderProps {
  variant?: 'landing' | 'onboarding'
}

export function SiteHeader({ variant = 'landing' }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [exitAction, setExitAction] = useState<(() => void) | null>(null)
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
      setExitAction(() => logout)
      setShowExitDialog(true)
    } else {
      logout()
    }
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isOnboarding) {
      e.preventDefault()
      setExitAction(() => () => window.location.href = "/")
      setShowExitDialog(true)
    } else {
      handleScrollClick(e, '/')
    }
  }

  const { navigateToSection } = useSectionNavigation()

  const handleScrollClick = (e: React.MouseEvent, href: string) => {
    navigateToSection(href, e)
    setMobileMenuOpen(false)
  }

  const navLinks = isOnboarding ? [] : [
    { name: "Benefícios", href: '/#beneficios' },
    { name: "Como funciona", href: '/#como-funciona' },
    { name: "Plano", href: '/#precos' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 pointer-events-none ${isScrolled ? 'lg:pt-4 lg:px-4' : 'pt-0 px-0'}`}>
      {/* Mobile Floating Dock */}
      <div className="lg:hidden pointer-events-auto fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50">
        <div className="bg-background/40 backdrop-blur-2xl border border-white/10 rounded-full h-14 shadow-2xl flex items-center justify-between px-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={handleLogoClick}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
              <img src="/logo1.png" alt="Definance Logo" className="h-5 w-auto" />
            </div>
            <span className="text-sm font-bold text-foreground">Definance</span>
          </Link>
          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle className="h-10 w-10 rounded-full" />
            {!isOnboarding && (
              <button className="h-10 w-10 rounded-full flex items-center justify-center text-foreground hover:bg-white/10 transition-all" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Nav (original) */}
      <nav 
        className={`pointer-events-auto hidden lg:flex relative items-center justify-between transition-all duration-250 border ${
          isScrolled 
            ? 'w-[96%] max-w-8xl bg-background/40 backdrop-blur-2xl border-border/40 rounded-2xl py-3 px-7 shadow-lg' 
            : `w-full max-w-none bg-background/95 border-border/40 border-b py-3 px-6 ${isOnboarding ? 'shadow-md' : ''}`
        }`}
      >
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 z-10"
          onClick={handleLogoClick}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
            <img src="/logo1.png" alt="Definance Logo" className="h-5 w-auto" />
          </div>
          <span className="text-xl font-bold text-foreground">Definance</span>
        </Link>

        {/* Desktop Nav (Only in Landing) */}
        {!isOnboarding && (
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 z-10">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => handleScrollClick(e, link.href)}
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
              <Link href="/register" className="hidden lg:flex">
                <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Criar Conta
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="sm" 
                  className={`cursor-pointer bg-primary text-primary-foreground hover:bg-primary/70 transition-all ${
                    isScrolled ? 'shadow-lg shadow-primary/20' : ''
                  }`}
                >
                  Entrar
                </Button>
              </Link>
            </>
          ) : (isAuthenticated || isOnboarding) && (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end">
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
                className={`cursor-pointer text-muted-foreground hover:text-destructive transition-colors ${isOnboarding ? 'gap-2 font-medium px-2' : 'hidden lg:flex'}`}
              >
                <LogOut className="h-4 w-4" />
                {isOnboarding && <span className="hidden sm:inline">Sair</span>}
              </Button>
            </div>
          )}
          
          {/* Mobile hamburger hidden — handled by floating dock above */}
        </div>
      </nav>
      {/* Spacer for mobile floating dock */}
      <div className="lg:hidden h-20 pointer-events-none" />

      {/* Mobile Menu (Only in Landing) */}
      {!isOnboarding && (
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="pointer-events-auto fixed left-4 right-4 top-20 bg-background/95 backdrop-blur-xl border border-white/10 p-6 flex flex-col gap-4 lg:hidden rounded-2xl shadow-2xl z-40"
            >
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => handleScrollClick(e, link.href)}
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
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-primary" />
                      )}
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
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/70 cursor-pointer">
                      Criar Conta
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <OnboardingExitDialog 
        isOpen={showExitDialog}
        onOpenChange={setShowExitDialog}
        onConfirm={() => {
          if (exitAction) exitAction();
          setShowExitDialog(false);
        }}
      />
    </header>
  )
}