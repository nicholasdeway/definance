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
  Pencil,
  AlertCircle
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
import { useCategories } from "@/lib/category-context"

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
  const { categories } = useCategories()
  const isMobile = useIsMobile()
  const isPaid = conta.status === "paga"
  const isOverdue = conta.status === "atrasada"

  // Busca a categoria real para pegar o ícone configurado no sistema
  const realCategory = categories.find(c => c.name === conta.categoria)
  const categoryIcon = (realCategory?.icon && realCategory.icon !== "MoreHorizontal") ? realCategory.icon : conta.categoria

  // Formata data reduzida (DD/MM/YYYY -> DD/MM/YY)
  const dataExibicao = conta.vencimento !== "—" 
    ? (isMobile ? conta.vencimento.slice(0, 5) + "/" + conta.vencimento.slice(8, 10) : conta.vencimento)
    : "—"

  return (
    <div className={cn(
      "relative flex flex-col sm:flex-row sm:items-center justify-between transition-colors gap-2 sm:gap-3",
      "p-3 sm:p-4 rounded-xl border bg-card/50",
      "border-border/50 hover:bg-muted/50",
      showTutorial && isFirstPending && "z-[110] relative ring-4 ring-primary ring-offset-4 ring-offset-background shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]"
    )}>
      {/* --- CAMADA 1 (MOBILE TOP) --- */}
      <div className="flex sm:hidden justify-between w-full items-center shrink-0">
        <div className="flex items-center gap-1">
          <span className={cn(
            "text-[8px] font-black uppercase tracking-tighter",
            isPaid ? "text-primary/70" : isOverdue ? "text-destructive/70" : !conta.rawDueDate ? "text-amber-500" : "text-amber-500/70"
          )}>
            {isPaid ? "PAGA" : isOverdue ? "ATRASADA" : !conta.rawDueDate ? "AJUSTAR" : "PENDENTE"}
          </span>
          <span className="text-muted-foreground/30 text-[8px]">|</span>
          <span className={cn(
            "text-[8px] font-black uppercase tracking-tighter",
            conta.tipo === "Fixa" ? "text-muted-foreground" : "text-muted-foreground/60"
          )}>
            {conta.tipo === "Fixa" ? "FIXA" : "VAR."}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted transition-colors -mr-1">
              <MoreHorizontal className="h-3.5 w-3.5" />
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

      {/* --- CAMADA 2 (MOBILE MID / DESKTOP LEFT) --- */}
      <div className="flex items-center justify-between w-full sm:w-auto flex-1 min-w-0">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className={cn(
            "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-background flex-shrink-0 border border-border/50 shadow-sm transition-colors",
            isPaid ? "text-primary border-primary/20 bg-primary/5" : 
            isOverdue ? "text-destructive border-destructive/20 bg-destructive/5" : 
            "text-amber-500 border-amber-500/20 bg-amber-500/5"
          )}>
            <CategoryIcon name={categoryIcon} className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 overflow-hidden mb-0.5 sm:mb-0">
              <h4 className={cn(
                "font-bold text-card-foreground text-[14px] sm:text-base leading-snug transition-all duration-300 truncate",
                discreetMode && "discreet-mode-blur"
              )}>
                {conta.nome}
              </h4>
              {conta.tipo === "Fixa" && !isMobile && (
                <Badge variant="outline" className="h-4 px-1 text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5 shrink-0">
                  FIXA
                </Badge>
              )}
            </div>
            
            {/* Vencimento e Categoria (Apenas Desktop aqui) */}
            <div className="hidden sm:flex items-center gap-2 leading-tight">
              {conta.rawDueDate ? (
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                  <span>Vencimento: {conta.vencimento}</span>
                </p>
              ) : (
                <p className="text-[12px] text-amber-500/90 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Ajustar data</span>
                </p>
              )}
              <span className="text-muted-foreground/30 text-[10px]">•</span>
              <span className="text-[10px] font-medium capitalize text-muted-foreground/80 px-1.5 py-0.5 rounded-md border bg-muted/10 truncate">
                {conta.categoria || "Outros"}
              </span>
            </div>
          </div>
        </div>

        {/* VALOR MOBILE (Canto Direito do Meio) */}
        <div className="sm:hidden shrink-0 ml-2">
          <p className={cn(
            "font-black text-[15px] transition-all duration-300 leading-none",
            isPaid ? "text-primary" : isOverdue ? "text-destructive" : "text-foreground",
            discreetMode && "discreet-mode-blur"
          )}>
            {formatCurrency(conta.valor)}
          </p>
        </div>
      </div>

      {/* --- CAMADA 3 (MOBILE BOT / DESKTOP RIGHT) --- */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto shrink-0 mt-0.5 sm:mt-0">
        
        {/* Aviso Canto Esquerdo (Mobile Only) */}
        <div className="sm:hidden">
          {!conta.rawDueDate ? (
            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 animate-pulse">
              <AlertCircle className="h-3 w-3" />
              Ajustar data
            </span>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <span>Venc: {dataExibicao}</span>
              <span className="text-muted-foreground/30">•</span>
              <span className="capitalize">{conta.categoria || "Outros"}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          {/* Valor Desktop */}
          <p className={cn(
            "hidden sm:block font-bold text-base transition-all duration-300 leading-none",
            isPaid ? "text-primary" : isOverdue ? "text-destructive" : "text-foreground",
            discreetMode && "discreet-mode-blur"
          )}>
            {formatCurrency(conta.valor)}
          </p>

          <div className="flex items-center gap-2">
            {/* Menu Desktop */}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted transition-colors">
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

            {isPaid ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] sm:text-[10px] h-4 sm:h-5">Paga</Badge>
            ) : isOverdue ? (
              <Badge variant="destructive" className="text-[9px] sm:text-[10px] h-4 sm:h-5">{Math.abs(conta.dias)}d atrasada</Badge>
            ) : !conta.rawDueDate ? (
              <Badge 
                onClick={() => onEdit(conta)}
                className="bg-amber-500 text-amber-950 border-amber-500/20 text-[8px] sm:text-[9px] font-black uppercase h-5 sm:h-6 px-3 rounded-full cursor-pointer hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
              >
                CONFIGURAR
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] sm:text-[10px] h-4 sm:h-5">
                {conta.dias === 0 ? "Hoje" : `${conta.dias}d`}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}