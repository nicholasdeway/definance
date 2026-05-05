"use client"

import * as React from "react"
import { 
  Mail, 
  CheckCircle2, 
  Smartphone,
  ArrowLeft,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { WhatsAppModal } from "@/components/dashboard/conectar-aplicativos/whatsapp-modal"

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.553 4.189 1.606 6.06L0 24l6.117-1.605a11.793 11.793 0 005.925 1.577h.005c6.632 0 12.028-5.398 12.03-12.03a11.85 11.85 0 00-3.527-8.508z" />
  </svg>
)

export default function ConectarAplicativosPage() {
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = React.useState(false)
  const [whatsappStatus, setWhatsappStatus] = React.useState<"conectado" | "pendente">("conectado")

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-primary/10 p-2 rounded-xl">
             <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Conectar Aplicativos</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Gerencie suas integrações com ferramentas externas para automatizar sua gestão financeira e receber notificações inteligentes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* WhatsApp Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
          <CardHeader className="relative flex flex-col gap-5 pb-6">
            <div className="flex flex-col xs:flex-row items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <WhatsAppIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1 w-full">
                <CardTitle className="text-lg md:text-xl">WhatsApp</CardTitle>
                <CardDescription className="text-xs leading-relaxed max-w-none md:max-w-[300px]">
                  Autentique seu número de WhatsApp para poder conversar com o <strong>definance.com.br</strong> no WhatsApp.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/40 sm:border-none sm:pt-0 sm:absolute sm:top-6 sm:right-6">
              <Badge 
                variant="outline" 
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                  whatsappStatus === "conectado" 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}
              >
                {whatsappStatus === "conectado" ? "Conectado" : "Pendente"}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="h-8 rounded-xl border-border/50 hover:bg-muted/50 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap cursor-pointer"
              >
                {whatsappStatus === "conectado" ? "Alterar número" : "Gerar novo código"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Número Conectado</p>
                <p className="text-sm font-semibold">(00) 00000-0000</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Status</p>
                <div className={cn(
                  "text-xs font-medium flex items-center gap-1.5",
                  whatsappStatus === "conectado" ? "text-emerald-500" : "text-amber-500"
                )}>
                  {whatsappStatus === "conectado" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">Ativo e pronto</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />
                      <span className="truncate">Aguardando confirmação.</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {whatsappStatus === "pendente" && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 group/alert animate-in slide-in-from-top-2 duration-500">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-500">Código de ativação pendente</h4>
                  <p className="text-[11px] text-muted-foreground leading-tight">Envie este código pelo WhatsApp para concluir a ativação.</p>
                  <p className="text-[10px] text-amber-500/70 font-medium tracking-tight">Expira em 05/05/2026, 20:22.</p>
                </div>
                <div className="flex items-center gap-3 bg-black/40 p-2.5 px-4 rounded-xl border border-white/5 group-hover/alert:border-amber-500/40 transition-all shadow-inner w-full xs:w-auto justify-center shrink-0">
                   <code className="text-xs font-bold text-amber-500 tracking-wider">WAUTH-3123871</code>
                   <Copy className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-amber-500 transition-colors" onClick={() => {
                     navigator.clipboard.writeText("WAUTH-3123871");
                   }} />
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground leading-relaxed opacity-70 pt-2 border-t border-border/40">
              * É obrigatório manter ao menos um WhatsApp conectado. Você pode alterar o número, mas não remover a integração.
            </p>
          </CardContent>
        </Card>

        {/* E-mail Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300 opacity-80">
          <CardHeader className="relative flex flex-col gap-5 pb-6">
            <div className="flex flex-col xs:flex-row items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Mail className="h-6 w-6" />
              </div>
              <div className="space-y-1 w-full">
                <CardTitle className="text-lg md:text-xl">E-mail</CardTitle>
                <CardDescription className="text-xs leading-relaxed max-w-none md:max-w-[300px]">
                  Conecte suas caixas de entrada para ler e enviar e-mails direto pelo painel.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/40 sm:border-none sm:pt-0 sm:absolute sm:top-6 sm:right-6">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                Em breve
              </Badge>
              <Button disabled variant="outline" size="sm" className="h-8 rounded-xl border-border/50 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">
                Adicionar e-mail
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">E-mail Conectado</p>
                <p className="text-sm font-semibold text-muted-foreground/40">Nenhum e-mail ainda</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Status</p>
                <div className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground/40">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/20" />
                  <span className="truncate">Inativo</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed opacity-70 pt-2 border-t border-border/40">
              * Em breve você poderá conectar múltiplos e-mails via Google e gerenciar tudo por aqui.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <WhatsAppModal 
        open={isWhatsAppModalOpen} 
        onOpenChange={setIsWhatsAppModalOpen} 
        status={whatsappStatus}
        activationCode="WAUTH-6890193"
      />
    </div>
  )
}