"use client"

import * as React from "react"
import { X } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface PremiumModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function PremiumModal({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  children, 
  icon,
  className 
}: PremiumModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "!max-w-[1100px] w-[95vw] min-h-[600px] p-0 overflow-hidden border-none bg-[#0a0a0a]/90 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] transition-all duration-100 ease-out outline-none [&>button]:hidden",
        className
      )}>
        <div className="flex flex-col md:flex-row h-full min-h-[600px]">
          {/* Header Section - Agora integrado no layout horizontal */}
          <div className="w-full md:w-[380px] bg-primary/5 p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden group">
            {/* Efeito de luz sutil no fundo do header */}
            <div className="absolute -top-24 -left-24 h-48 w-48 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-700" />
            
            <div className="space-y-8 relative z-10">
              <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]">
                {icon || <div className="h-10 w-10 rounded-full bg-primary/40 animate-pulse" />}
              </div>
              
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-tight">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>

            <div className="hidden md:block pt-8 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                Definance Gestão Financeira
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-8 md:p-10 relative overflow-y-auto max-h-[85vh]">
            <DialogClose className="absolute right-4 top-4 h-10 w-10 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all active:scale-90 border border-white/5 z-50 cursor-pointer">
              <X className="h-5 w-5" />
            </DialogClose>

            <div className="h-full">
              {children}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
