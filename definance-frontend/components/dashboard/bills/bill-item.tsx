"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  MoreHorizontal, 
  Trash2, 
  CheckCircle2,
  TrendingUp,
  Eye,
  Pencil
} from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn, capitalize } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { CategoryIcon } from "@/components/dashboard/shared/category-icon"

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
  onShowDetails: (conta: ContaItem) => void
}

export const BillItem = ({
  conta,
  discreetMode,
  showTutorial,
  isFirstPending,
  onEdit,
  onDelete,
  onPay,
  onShowDetails
}: BillItemProps) => {
  const isMobile = useIsMobile()
  const isPaid = conta.status === "paga"
  const isOverdue = conta.status === "atrasada"

  // Formata data reduzida (DD/MM/YYYY -> DD/MM/YY)
  const dataExibicao = conta.vencimento !== "—" 
    ? (isMobile ? conta.vencimento.slice(0, 5) + "/" + conta.vencimento.slice(8, 10) : conta.vencimento)
    : "—"

  return (
    <div className={cn(
      "flex flex-row items-center justify-between transition-colors gap-3",
      "p-3 sm:p-4 rounded-lg border bg-card/50",
      "border-border/50 hover:bg-muted/50",
      showTutorial && isFirstPending && "z-[110] relative ring-4 ring-primary ring-offset-4 ring-offset-background shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]"
    )}>
      {/* Lado Esquerdo: Ícone + Info Principal */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn(
          "flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-background flex-shrink-0 border border-border/50 shadow-sm transition-colors",
          isPaid ? "text-primary border-primary/20 bg-primary/5" : 
          isOverdue ? "text-destructive border-destructive/20 bg-destructive/5" : 
          "text-amber-500 border-amber-500/20 bg-amber-500/5"
        )}>
          <CategoryIcon name={conta.categoria} className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        
        <div className="min-w-0 flex-1 space-y-1 sm:space-y-0.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <h4 className={cn(
              "font-bold text-card-foreground text-[13px] sm:text-base truncate transition-opacity duration-300",
              discreetMode && "discreet-mode-blur"
            )}>
              {conta.nome}
            </h4>
            {/* Desktop only FIXA badge */}
            {conta.tipo === "Fixa" && !isMobile && (
              <Badge variant="outline" className="h-4 px-1 text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5 shrink-0">
                FIXA
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 leading-tight gap-0.5 sm:gap-0">
            <p className="text-[10px] sm:text-sm text-muted-foreground font-medium flex items-center gap-1">
              <span>{isMobile ? `Venc: ${dataExibicao}` : `Vencimento: ${conta.vencimento}`}</span>
            </p>
            <span className="hidden sm:inline text-muted-foreground/30 text-[10px]">•</span>
            <span 
              className="text-[9px] sm:text-[10px] font-medium uppercase sm:capitalize text-muted-foreground/80 sm:px-1.5 sm:py-0.5 sm:rounded-md sm:border sm:bg-muted/10 truncate max-w-[100px] sm:max-w-none"
            >
              {conta.categoria || "Outros"}
            </span>
          </div>
        </div>
      </div>

      {/* Lado Direito: Valor + Status/Tipo (Mobile) + Menu */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex flex-col items-end gap-0.5 sm:gap-1">
          {/* Status | Tipo (Mobile) */}
          <div className="flex items-center gap-1 sm:hidden">
            <span className={cn(
              "text-[8px] font-black uppercase tracking-tighter",
              isPaid ? "text-primary/70" : isOverdue ? "text-destructive/70" : "text-amber-500/70"
            )}>
              {isPaid ? "PAGA" : isOverdue ? "ATRASADA" : "PENDENTE"}
            </span>
            <span className="text-muted-foreground/30 text-[8px]">|</span>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-tighter",
              conta.tipo === "Fixa" ? "text-muted-foreground" : "text-muted-foreground/60"
            )}>
              {conta.tipo === "Fixa" ? "FIXA" : "VAR."}
            </span>
          </div>

          <p className={cn(
            "font-black sm:font-bold text-[13px] sm:text-base transition-all duration-300",
            isPaid ? "text-primary" : isOverdue ? "text-destructive" : "text-foreground",
            discreetMode && "discreet-mode-blur"
          )}>
            {formatCurrency(conta.valor)}
          </p>

          {/* Desktop Badge */}
          <div className="hidden sm:block">
            {isPaid ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5">Paga</Badge>
            ) : isOverdue ? (
              <Badge variant="destructive" className="text-[10px] h-5">{Math.abs(conta.dias)}d atrasada</Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] h-5">
                {conta.dias === 0 ? "Hoje" : `${conta.dias}d`}
              </Badge>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
            {!isPaid && (
              <DropdownMenuItem onClick={() => onPay(conta)} className="gap-2 cursor-pointer text-xs font-bold text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Pagar Agora
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => onEdit(conta)} className="gap-2 cursor-pointer text-xs font-medium">
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onDelete(conta)} className="gap-2 text-destructive focus:text-destructive cursor-pointer text-xs font-bold">
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onShowDetails(conta)} className="gap-2 cursor-pointer text-xs font-medium">
              <Eye className="h-3.5 w-3.5" />
              Ver Detalhes
            </DropdownMenuItem>

            {conta.isSynced && (
              <>
                <div className="h-px bg-white/5 my-1" />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil-financeiro" className="flex items-center gap-2 text-primary font-bold cursor-pointer text-xs">
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