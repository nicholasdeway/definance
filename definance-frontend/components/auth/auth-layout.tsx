"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { Brain, LayoutGrid, MessageSquare } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen bg-[#050505] text-foreground selection:bg-primary/30 relative overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-primary/[0.02] blur-[150px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Branding Section (Left) */}
        <div className="hidden lg:flex flex-col justify-between w-[45%] p-16 xl:p-24">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-md transition-transform group-hover:scale-105">
              <Image src="/logo1.png" alt="Logo" width={36} height={36} className="rounded-md" />
            </div>
            <span className="text-[32px] font-bold tracking-tight text-white">Definance</span>
          </Link>

          <div className="mt-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Gestão.<br />
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Inteligência.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-8 max-w-md text-l text-white/50 leading-relaxed font-medium"
            >
              Revolucione a gestão do seu escritório com nossa plataforma financeira impulsionada por IA.
            </motion.p>

            {/* Feature Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-16 flex flex-col gap-5"
            >
              <motion.div 
                initial={{ opacity: 0, x: 16 }}
                animate={{ 
                  opacity: 1, 
                  x: 16, 
                  y: [0, -8, 0] 
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.3 },
                  x: { duration: 0.5, delay: 0.3 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md max-w-sm hover:bg-white/[0.05] transition-colors cursor-default"
              >
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Praticidade IA</p>
                  <p className="text-xs text-white/40">Classificação inteligente</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 48 }}
                animate={{ 
                  opacity: 1, 
                  x: 48,
                  y: [0, -12, 0] 
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.4 },
                  x: { duration: 0.5, delay: 0.4 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md max-w-sm hover:bg-white/[0.05] transition-colors shadow-2xl cursor-default"
              >
                <div className="h-10 w-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Visão Clássica</p>
                  <p className="text-xs text-white/40">Acompanhe seu fluxo de caixa</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 24 }}
                animate={{ 
                  opacity: 1, 
                  x: 24,
                  y: [0, -10, 0] 
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.5 },
                  x: { duration: 0.5, delay: 0.5 },
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md max-w-sm hover:bg-white/[0.05] transition-colors cursor-default"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Assistencia 24h</p>
                  <p className="text-xs text-white/40">Sua assistente no bolso</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="mt-auto pt-12">
            <p className="text-xs text-white/20 font-medium tracking-wider uppercase">
              © 2026 Definance • Inteligência Financeira
            </p>
          </div>
        </div>

        {/* Auth Card Side (Right) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 xl:p-24 relative">
          {/* Mobile Logo Only */}
          <div className="lg:hidden mb-12">
            <Link href="/" className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <Image src="/logo1.png" alt="Logo" width={42} height={42} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">Definance</span>
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[480px]"
          >
            <div className="relative group">
              {/* Outer Glow for the card */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-[32px] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              
              <div className="relative bg-background/80 border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 md:p-12 shadow-2xl">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}