"use client"

import * as React from "react"
import { 
  Check, 
  Copy, 
  CheckCircle2, 
  ExternalLink,
  Smartphone
} from "lucide-react"
import { PremiumModal } from "@/components/ui/premium-modal"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface WhatsAppModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: "conectado" | "pendente"
  activationCode?: string
}

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.553 4.189 1.606 6.06L0 24l6.117-1.605a11.793 11.793 0 005.925 1.577h.005c6.632 0 12.028-5.398 12.03-12.03a11.85 11.85 0 00-3.527-8.508z" />
  </svg>
)

export function WhatsAppModal({ open, onOpenChange, status, activationCode }: WhatsAppModalProps) {
  const code = activationCode || "WAUTH-6890193"
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    toast.success("Código copiado!")
  }

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title="Conecte seu WhatsApp"
      description="Finalize enviando o código"
      icon={<WhatsAppIcon className="h-6 w-6 md:h-8 md:w-8 text-emerald-500" />}
    >
      <div className="flex flex-col items-center justify-center h-full space-y-6 py-2 md:py-6">
        <div className="text-center space-y-2 px-4">
          <h2 className="text-xl md:text-3xl font-black tracking-tight text-white">Conecte seu WhatsApp</h2>
          <p className="text-muted-foreground text-[10px] md:text-sm max-w-md mx-auto leading-relaxed">
            Envie o código abaixo para o número oficial do <strong>Definance</strong>.
            A validação é automática.
          </p>
        </div>

        <div className="w-full max-w-sm bg-[#0d0d0d] border border-white/10 rounded-[1.5rem] p-4 md:p-8 space-y-4 md:space-y-6 relative overflow-hidden group">
          {/* Efeito de brilho sutil */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
          
          <div className="space-y-3 text-center relative z-10 w-full">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/80">Seu Código Único</p>
            <div
              className="relative inline-flex items-center justify-center cursor-pointer bg-white/10 border border-white/10 hover:border-emerald-500/50 transition-all rounded-xl px-4 py-3 group/code w-full"
              onClick={copyToClipboard}
            >
              <span className="text-sm md:text-xl font-medium tracking-[0.15em] text-white font-mono whitespace-nowrap">
                {code}
              </span>
              <Copy className="absolute right-4 h-3.5 w-3.5 text-white/40 group-hover/code:text-white transition-colors shrink-0" />
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center relative z-10">
             <p className="text-[9px] md:text-xs font-bold text-emerald-500">
                Expira em 05/05/2026, 20:21.
             </p>
          </div>
        </div>

        <div className="space-y-4 md:space-y-8 w-full px-4">
            <p className="text-[8px] md:text-[10px] text-center text-muted-foreground font-bold uppercase tracking-wider opacity-60">
              Número oficial: <span className="text-white">+55 47 98868-2735</span>
            </p>

            <div className="flex justify-center">
                <Button 
                    className="h-12 md:h-14 w-full md:w-auto px-10 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs md:text-base gap-3 group transition-all shadow-2xl cursor-pointer"
                    onClick={() => window.open(`https://wa.me/5547988682735?text=${code}`, '_blank')}
                >
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    Enviar código
                </Button>
            </div>
        </div>
      </div>
    </PremiumModal>
  )
}
