import React from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

interface SyncStatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
}

export const SyncStatusIndicator = ({ status }: SyncStatusIndicatorProps) => {
  if (status === 'idle') return null

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300",
        status === 'saving' && "bg-primary/5 text-primary border-primary/20 animate-pulse",
        status === 'saved' && "bg-emerald-500/5 text-emerald-500 border-emerald-500/20",
        status === 'error' && "bg-destructive/5 text-destructive border-destructive/20"
      )}
    >
      {status === 'saving' && <Spinner className="h-2.5 w-2.5 text-primary" />}
      {status === 'saved' && <Check className="h-2.5 w-2.5" />}
      {status === 'error' && <X className="h-2.5 w-2.5" />}
      
      {status === 'saving' && "Salvando..."}
      {status === 'saved' && "Salvo"}
      {status === 'error' && "Erro de Conexão"}
    </motion.div>
  )
}
