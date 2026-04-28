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
      <DialogContent 
        showCloseButton={false}
        className={cn(
          "!max-w-[1100px] w-[95vw] min-h-[auto] md:min-h-[600px] p-0 overflow-hidden border-none bg-[#0a0a0a]/90 backdrop-blur-md md:backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-75 ease-out outline-none",
          className
        )}
      >

        <div className="flex flex-col md:flex-row h-full min-h-[auto] md:min-h-[600px]">
          {/* Header Section - Agora integrado no layout horizontal */}
          <div className="w-full md:w-[380px] bg-primary/5 p-4 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden group">
            {/* Efeito de luz sutil no fundo do header */}
            <div className="absolute -top-24 -left-24 h-48 w-48 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-700" />
            
            <div className="space-y-2 md:space-y-8 relative z-10">
              <div className="h-10 w-10 md:h-20 md:w-20 rounded-xl md:rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]">
                {icon || <div className="h-6 w-6 md:h-10 md:w-10 rounded-full bg-primary/40 animate-pulse" />}
              </div>
              
              <div className="space-y-0.5 md:space-y-2">
                <DialogTitle className="text-lg md:text-3xl font-black tracking-tight text-foreground leading-tight">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-muted-foreground text-[10px] md:text-sm font-medium leading-relaxed line-clamp-1 md:line-clamp-none">
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
          <div className="flex-1 p-4 md:p-10 relative overflow-y-auto max-h-[75vh] md:max-h-[85vh]">


            <div className="h-full">
              {children}
            </div>
          </div>
        </div>
        <DialogClose className="fixed right-4 top-4 h-7 w-7 rounded-full flex items-center justify-center bg-background/80 hover:bg-background text-foreground transition-all active:scale-90 border border-white/20 z-[100] cursor-pointer shadow-xl backdrop-blur-md">
          <X className="h-3.5 w-3.5" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}