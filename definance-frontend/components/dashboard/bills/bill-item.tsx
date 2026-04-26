"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal, 
  Home, 
  Zap, 
  Droplets, 
  Globe, 
  Smartphone, 
  Clapperboard, 
  Dumbbell, 
  Bus, 
  Utensils, 
  HeartPulse, 
  BookOpen, 
  CarFront, 
  ShieldCheck, 
  TrendingUp 
} from "lucide-react"
import { cn, capitalize } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/currency"

export interface ContaItem {
  id: string
  nome: string
  valor: number
  categoria: string
  vencimento: string
  rawDueDate: string | null
  status: "vencer" | "paga" | "atrasada"
  dias: number
  tipo: "Fixa" | "Variável"
  isRecorrente: boolean
  isSynced?: boolean
}

interface BillItemProps {
  conta: ContaItem
  discreetMode: boolean
  showTutorial: boolean
  isFirstPending: boolean
  onEdit: (conta: ContaItem) => void
  onDelete: (conta: ContaItem) => void
  onPay: (conta: ContaItem) => void
}

export const BillItem = ({
  conta,
  discreetMode,
  showTutorial,
  isFirstPending,
  onEdit,
  onDelete,
  onPay
}: BillItemProps) => {

  const getBillIcon = (categoria: string, nome: string, status: string) => {
    const c = categoria.toLowerCase()
    const n = nome.toLowerCase()
    const iconColor = status === "paga" ? "text-primary" : status === "atrasada" ? "text-destructive" : "text-yellow-500"
    const iconClass = `h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`

    if (n.includes("ipva")) return <CarFront className={iconClass} />
    if (n.includes("seguro")) return <ShieldCheck className={iconClass} />
    if (n.includes("parcela") || n.includes("empréstimo") || n.includes("empréstimo")) return <CreditCard className={iconClass} />
    
    if (c.includes("aluguel") || c.includes("moradia")) return <Home className={iconClass} />
    if (c.includes("luz") || c.includes("energia")) return <Zap className={iconClass} />
    if (c.includes("agua") || c.includes("água")) return <Droplets className={iconClass} />
    if (c.includes("internet")) return <Globe className={iconClass} />
    if (c.includes("celular") || c.includes("telefone")) return <Smartphone className={iconClass} />
    if (c.includes("streaming") || c.includes("netflix") || c.includes("spotify")) return <Clapperboard className={iconClass} />
    if (c.includes("academia")) return <Dumbbell className={iconClass} />
    if (c.includes("transporte")) return <Bus className={iconClass} />
    if (c.includes("alimentação") || c.includes("alimentacao")) return <Utensils className={iconClass} />
    if (c.includes("saúde") || c.includes("saude")) return <HeartPulse className={iconClass} />
    if (c.includes("educação") || c.includes("educacao")) return <BookOpen className={iconClass} />
    
    return <CreditCard className={iconClass} />
  }

  const getStatusIcon = (status: ContaItem["status"]) => {
    switch (status) {
      case "vencer":   return <Clock       className="h-3.5 w-3.5 text-yellow-500" />
      case "paga":     return <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
      case "atrasada": return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
    }
  }

  const getStatusBadge = (status: ContaItem["status"], dias: number, hasDate: boolean) => {
    switch (status) {
      case "vencer":
        if (!hasDate) {
          return (
            <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs whitespace-nowrap animate-pulse">
              Data pendente
            </Badge>
          )
        }
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs whitespace-nowrap">
            {dias === 0 ? "Vence hoje" : `Vence em ${dias}d`}
          </Badge>
        )
      case "paga":
        return <Badge className="bg-primary/10 text-primary border-primary/20 text-xs whitespace-nowrap">Paga</Badge>
      case "atrasada":
        return <Badge variant="destructive" className="text-xs whitespace-nowrap">{Math.abs(dias)}d atrasada</Badge>
    }
  }

  const getTipoBadge = (tipo: ContaItem["tipo"]) => (
    <Badge
      variant="outline"
      className={`text-[10px] whitespace-nowrap px-1.5 py-0 ${
        tipo === "Fixa"
          ? "border-primary/30 text-primary bg-primary/5"
          : "border-muted-foreground/30 text-muted-foreground"
      }`}
    >
      {tipo === "Fixa" ? "📌 Fixa" : "🔀 Variável"}
    </Badge>
  )

  return (
    <div
      id={`bill-${conta.id}`}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border/50 p-3 sm:p-4 transition-colors hover:bg-muted/50 gap-3 sm:gap-4",
        showTutorial && isFirstPending && "z-[110] relative bg-background ring-4 ring-primary ring-offset-4 ring-offset-background shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]"
      )}
    >
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        <div
          className={cn(
            "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full flex-shrink-0",
            conta.status === "paga" ? "bg-primary/10" : conta.status === "atrasada" ? "bg-destructive/10" : "bg-yellow-500/10"
          )}
        >
          {getBillIcon(conta.categoria, conta.nome, conta.status)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className={cn(
              "font-medium text-card-foreground text-sm sm:text-base break-words transition-opacity duration-300",
              discreetMode && "discreet-mode-blur"
            )}>
              {conta.nome}
            </p>
            {getStatusIcon(conta.status)}
            {getTipoBadge(conta.tipo)}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Vencimento: {conta.vencimento}
            {conta.categoria && ` • ${capitalize(conta.categoria)}`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0">
        {getStatusBadge(conta.status, conta.dias, !!conta.rawDueDate)}
        <span className={cn(
          "font-semibold text-card-foreground text-sm sm:text-base whitespace-nowrap transition-opacity duration-300",
          discreetMode && "discreet-mode-blur"
        )}>
          {formatCurrency(conta.valor)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
              <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {conta.status !== "paga" && (
              <DropdownMenuItem
                className="cursor-pointer text-sm text-primary font-medium"
                onClick={() => onPay(conta)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como paga
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="cursor-pointer text-sm"
              onClick={() => onEdit(conta)}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive font-medium cursor-pointer text-sm"
              onClick={() => onDelete(conta)}
            >
              Excluir
            </DropdownMenuItem>
            {conta.isSynced && (
              <>
                <div className="h-px bg-muted my-1" />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil-financeiro" className="flex items-center gap-2 text-primary font-bold cursor-pointer text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Ajustar no Perfil
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}