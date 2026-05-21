"use client"

import * as React from "react"
import { Check, Copy, ExternalLink, Hash, QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { PremiumModal } from "@/components/ui/premium-modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface WhatsAppModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: "conectado" | "pendente"
  activationCode?: string
  expiresAt?: Date | null
}

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.553 4.189 1.606 6.06L0 24l6.117-1.605a11.793 11.793 0 005.925 1.577h.005c6.632 0 12.028-5.398 12.03-12.03a11.85 11.85 0 00-3.527-8.508z" />
  </svg>
)

export function WhatsAppModal({ open, onOpenChange, status, activationCode, expiresAt }: WhatsAppModalProps) {
  const [showQR, setShowQR] = React.useState(false)
  const code = activationCode || "Carregando..."
  const whatsappUrl = activationCode ? `https://wa.me/14155238886?text=${encodeURIComponent(activationCode)}` : ""

  // Reset QR toggle when modal closes
  React.useEffect(() => {
    if (!open) setShowQR(false)
  }, [open])

  const copyToClipboard = () => {
    if (!activationCode) return
    navigator.clipboard.writeText(activationCode)
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
      <div className="flex flex-col items-center justify-center h-full space-y-5 py-2 md:py-4 px-2">

        {/* Header */}
        <div className="text-center space-y-2 px-2">
          <h2 className="text-xl md:text-3xl font-black tracking-tight text-foreground dark:text-white">Conecte seu WhatsApp</h2>
          <p className="text-muted-foreground text-[10px] md:text-sm max-w-md mx-auto leading-relaxed">
            Envie o código abaixo para o número oficial do <strong>Definance</strong>.
            A validação é automática.
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex w-full max-w-xs rounded-xl bg-muted/30 dark:bg-white/5 border border-border/50 dark:border-white/10 p-1 gap-1">
          <button
            onClick={() => setShowQR(false)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300",
              !showQR 
                ? "bg-background dark:bg-white/10 text-primary dark:text-white shadow-sm ring-1 ring-border/20 dark:ring-white/5" 
                : "text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/70"
            )}
          >
            <Hash className="h-3.5 w-3.5" />
            Código
          </button>
          <button
            onClick={() => setShowQR(true)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300",
              showQR 
                ? "bg-background dark:bg-white/10 text-primary dark:text-white shadow-sm ring-1 ring-border/20 dark:ring-white/5" 
                : "text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/70"
            )}
          >
            <QrCode className="h-3.5 w-3.5" />
            QR Code
          </button>
        </div>

        {/* Content Card */}
        <div className="w-full max-w-sm bg-muted/20 dark:bg-[#0d0d0d] border border-border/50 dark:border-white/10 rounded-[1.5rem] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.01] dark:from-white/[0.05] to-transparent pointer-events-none" />

          {/* ——— CODE VIEW ——— */}
          <div className={cn("transition-all duration-300", !showQR ? "block" : "hidden")}>
            <div className="p-4 md:p-7 space-y-4 relative z-10">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500/80 text-center">
                Seu Código Único
              </p>
              <div
                className="relative inline-flex items-center justify-center cursor-pointer bg-muted dark:bg-white/5 border border-border/50 dark:border-white/5 hover:border-emerald-500/50 transition-all rounded-xl px-4 py-3 group/code w-full"
                onClick={copyToClipboard}
              >
                <span className="text-sm md:text-xl font-medium tracking-[0.15em] text-foreground dark:text-white font-mono whitespace-nowrap">
                  {code}
                </span>
                <Copy className="absolute right-4 h-3.5 w-3.5 text-muted-foreground/40 dark:text-white/40 group-hover:text-primary dark:group-hover/code:text-white transition-colors shrink-0" />
              </div>

              {expiresAt && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
                  <p className="text-[9px] md:text-xs font-bold text-emerald-500">
                    Expira às {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ——— QR CODE VIEW ——— */}
          <div className={cn("transition-all duration-300", showQR ? "block" : "hidden")}>
            <div className="p-4 md:p-7 space-y-4 relative z-10 flex flex-col items-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/80 text-center">
                Aponte a câmera do WhatsApp
              </p>

              <div className="p-3 bg-white rounded-2xl shadow-lg shadow-black/40 flex items-center justify-center">
                <QRCodeSVG
                  value={whatsappUrl || " "}
                  size={typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 180}
                  bgColor="#ffffff"
                  fgColor="#111111"
                  level="M"
                  includeMargin={false}
                />
              </div>

              <p className="text-[9px] md:text-[10px] text-center text-muted-foreground/60 leading-relaxed max-w-[200px]">
                Escaneie o QR Code acima com a câmera do seu celular
              </p>

              {expiresAt && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center w-full">
                  <p className="text-[9px] md:text-xs font-bold text-emerald-500">
                    Expira às {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 w-full px-2 md:px-4">
          <p className="text-[8px] md:text-[10px] text-center text-muted-foreground font-bold uppercase tracking-wider opacity-60">
            Número oficial: <span className="text-foreground dark:text-white">+55 27 98100-9312</span>
          </p>
          <div className="flex justify-center">
            <Button
              className="h-11 md:h-14 w-full md:w-auto px-8 md:px-10 rounded-xl md:rounded-2xl bg-muted dark:bg-white/5 hover:bg-muted/80 dark:hover:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white font-bold text-xs md:text-sm gap-3 group transition-all cursor-pointer"
              onClick={() => window.open(whatsappUrl, '_blank')}
              disabled={!activationCode}
            >
              <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              Enviar código no WhatsApp
              <ExternalLink className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </div>
        </div>
      </div>
    </PremiumModal>
  )
}
