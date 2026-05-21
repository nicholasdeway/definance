"use client"

import * as React from "react"
import { Copy, CheckCircle2, AlertCircle, ExternalLink, Check, QrCode, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-provider"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.553 4.189 1.606 6.06L0 24l6.117-1.605a11.793 11.793 0 005.925 1.577h.005c6.632 0 12.028-5.398 12.03-12.03a11.85 11.85 0 00-3.527-8.508z" />
  </svg>
)

export function Step0WhatsApp() {
  const { refreshUser } = useAuth()
  const [code, setCode] = React.useState<string | null>(null)
  const [expiresAt, setExpiresAt] = React.useState<Date | null>(null)
  const [status, setStatus] = React.useState<"pendente" | "conectado">("pendente")
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [showQR, setShowQR] = React.useState(false)

  const whatsappUrl = code ? `https://wa.me/14155238886?text=${encodeURIComponent(code)}` : ""

  // Atualiza o contexto — OnboardingWizard avança automaticamente quando isWhatsAppConnected === true
  const handleConnected = React.useCallback(async () => {
    setStatus("conectado")
    toast.success("WhatsApp conectado! Carregando seu perfil...")
    await refreshUser()
  }, [refreshUser])

  const fetchCode = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const statusData = await apiClient<{ code: string; status: string; expiresAt: string }>("/api/whatsapp/status").catch(() => null)
      
      if (statusData?.status?.toLowerCase() === "connected") {
        await handleConnected()
        return
      }

      if (statusData?.code && statusData.code.trim() !== "") {
        setCode(statusData.code)
        setExpiresAt(new Date(statusData.expiresAt))
        setStatus("pendente")
        return
      }

      // Sem código ativo → gera um novo
      const newData = await apiClient<{ code: string; status: string; expiresAt: string }>("/api/whatsapp/generate-code", {
        method: "POST"
      })
      setCode(newData.code)
      setExpiresAt(new Date(newData.expiresAt))
      setStatus("pendente")
    } catch (err) {
      setError("Não foi possível gerar o código. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [handleConnected])

  const verifyConnection = async () => {
    setIsVerifying(true)
    try {
      const data = await apiClient<{ code: string; status: string }>(`/api/whatsapp/status?t=${Date.now()}`)
      
      if (data.status?.toLowerCase() === "connected") {
        await handleConnected()
      } else {
        toast.error("Ainda não recebemos sua mensagem. Tente novamente em instantes.")
      }
    } catch (e) {
      toast.error("Erro ao verificar conexão.")
    } finally {
      setIsVerifying(false)
    }
  }

  React.useEffect(() => {
    fetchCode()
  }, [fetchCode])

  React.useEffect(() => {
    if (status === "conectado" || !code) return

    let isChecking = false

    const checkStatus = async () => {
      if (isChecking) return
      isChecking = true
      try {
        const data = await apiClient<{ code: string; status: string }>(`/api/whatsapp/status?t=${Date.now()}`)
        if (data.status?.toLowerCase() === "connected") await handleConnected()
      } catch (e) {
        // silencioso
      } finally {
        isChecking = false
      }
    }

    const interval = setInterval(checkStatus, 3000)

    // Mobile: verifica imediatamente ao retornar de outro app
    const onVisible = () => { if (document.visibilityState === "visible") checkStatus() }
    const onFocus = () => checkStatus()
    const onPageShow = () => checkStatus()

    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", onFocus)
    window.addEventListener("pageshow", onPageShow)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("pageshow", onPageShow)
    }
  }, [status, code, handleConnected])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-12 space-y-4 animate-in fade-in">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Preparando ambiente seguro...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-12 space-y-4 animate-in fade-in">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-sm text-center text-muted-foreground">{error}</p>
        <Button onClick={fetchCode} variant="outline" size="sm">Tentar novamente</Button>
      </div>
    )
  }

  if (status === "conectado") {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-12 space-y-4 animate-in zoom-in duration-500">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-foreground">WhatsApp Conectado!</h3>
          <p className="text-sm text-muted-foreground">Iniciando o seu perfil financeiro...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-3 px-2">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
          <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">Conecte seu WhatsApp</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs leading-relaxed">
            Para finalizar o cadastro, você precisa enviar o código pelo WhatsApp.
          </p>
        </div>
      </div>

      {/* Toggle Tabs: Código / QR Code */}
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
      <div className="w-full max-w-sm rounded-3xl bg-muted/20 dark:bg-black/40 border border-border/50 dark:border-white/10 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.01] dark:from-white/[0.02] to-transparent pointer-events-none" />

        {/* Code view */}
        <div className={cn("transition-all duration-500", !showQR ? "block" : "hidden")}>
          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
              Seu Código Único
            </p>
            <div
              className="flex items-center justify-center gap-3 bg-muted dark:bg-white/5 p-4 rounded-2xl border border-border dark:border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group/code overflow-hidden"
              onClick={() => {
                if (code) {
                  navigator.clipboard.writeText(code)
                  toast.success("Código copiado!")
                }
              }}
            >
              <code className="text-base sm:text-xl font-bold text-foreground dark:text-white tracking-[0.12em] sm:tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis">{code}</code>
              <Copy className="h-4 w-4 shrink-0 text-muted-foreground/40 dark:text-white/30 group-hover:text-primary dark:group-hover:text-white transition-colors" />
            </div>

            {/* Botão de abrir WhatsApp */}
            <Button
              className="h-11 sm:h-12 w-full rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/20 text-foreground font-bold text-sm gap-2 transition-all cursor-pointer"
              onClick={() => window.open(whatsappUrl, '_blank')}
            >
              Enviar código no WhatsApp
              <ExternalLink className="h-4 w-4" />
            </Button>

            {expiresAt && (
              <p className="text-[10px] text-center text-muted-foreground/40 font-medium">
                Expira às {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        {/* ——— QR CODE VIEW ——— */}
        <div className={cn(
          "transition-all duration-500",
          showQR ? "block" : "hidden"
        )}>
          <div className="p-5 sm:p-6 space-y-4 flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
              Aponte a câmera do WhatsApp
            </p>

            {/* QR Code */}
            <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-lg shadow-foreground/5 dark:shadow-black/20">
              <QRCodeSVG
                value={whatsappUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#111111"
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="text-[11px] text-center text-muted-foreground/60 leading-relaxed max-w-[220px]">
              Escaneie o QR Code acima com a câmera do seu celular
            </p>

            {expiresAt && (
              <p className="text-[10px] text-center text-muted-foreground/40 font-medium">
                Expira às {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="w-full max-w-sm pt-4 border-t border-border/50 dark:border-white/5 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          onClick={() => window.history.back()}
        >
          ← Voltar
        </Button>

        <Button
          className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-muted dark:bg-white/5 hover:bg-muted/80 dark:hover:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white font-bold text-xs gap-2 transition-all cursor-pointer"
          onClick={verifyConnection}
          disabled={isVerifying}
        >
          {isVerifying ? "Verificando..." : "Já enviei o código"}
          <Check className="h-4 w-4 text-emerald-500" />
        </Button>
      </div>
    </div>
  )
}
