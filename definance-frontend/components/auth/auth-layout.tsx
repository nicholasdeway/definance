"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { Brain, LayoutGrid, MessageSquare } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative flex min-h-screen flex-col md:grid lg:max-w-none lg:grid-cols-2">
        {/* Sidebar Branding (Desktop) */}
        <div className="relative hidden h-full flex-col bg-[#050505] p-12 lg:flex overflow-hidden border-r border-border/10">
          {/* Glowing Accents */}
          <div className="absolute top-1/4 -left-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 -right-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
          
          <Link href="/" className="relative z-20 flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-md" />
            </div>
            <span className="text-[32px] font-bold tracking-tight text-white">Definance</span>
          </Link>

          <div className="relative z-20 mt-24">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Gestão.<br />
              <span className="text-white/90">Inteligência.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-8 max-w-md text-lg text-white/50 leading-relaxed"
            >
              Revolucione a gestão do seu escritório com nossa plataforma financeira impulsionada por IA.
            </motion.p>
          </div>

          {/* Feature Cards (Mirroring screenshot) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-20 mt-16 flex flex-col gap-5"
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
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md max-w-sm hover:bg-white/[0.05] transition-colors"
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
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md max-w-sm hover:bg-white/[0.05] transition-colors shadow-2xl"
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
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md max-w-sm hover:bg-white/[0.05] transition-colors"
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
        
        {/* Auth Form Side */}
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background lg:p-8">
          {/* Ambient Glows for Light Mode (Subtle) */}
          <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none hidden lg:block" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[100px] pointer-events-none hidden lg:block" />
          
          <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 px-4 sm:w-[400px]">
            <div className="flex justify-center mt-8 lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-md" />
                </div>
                <span className="text-[26px] font-bold text-foreground">Definance</span>
              </Link>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}