"use client"

import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Info
} from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { CategoryIcon } from "@/components/dashboard/shared/category-icon"
import { useCategories } from "@/lib/category-context"

interface TransactionItemProps {
  transaction: {
    id: string
    nome: string
    valor: number
    tipo: "receita" | "despesa"
    categoria: string
    data: string
    rawDate?: Date
    descricao?: string | null
    observacoes?: string | null
    status?: string
  }
  discreetMode: boolean
  onDetails?: (item: any) => void
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
}

export const TransactionItem = ({
  transaction,
  discreetMode,
  onDetails,
  onEdit,
  onDelete
}: TransactionItemProps) => {
  const { categories } = useCategories()
  const isIncome = transaction.tipo === "receita"
  const isMobile = useIsMobile()

  // Busca o ícone oficial da categoria
  const realCategory = categories.find(c => c.name === transaction.categoria)
  const categoryIcon = (realCategory?.icon && realCategory.icon !== "MoreHorizontal") ? realCategory.icon : transaction.categoria

  const dataExibicao = isMobile 
    ? transaction.data.split(" • ")[0].replace(/ de /g, "/") 
    : transaction.data

  return (
    <div className={cn(
      "flex flex-row items-center justify-between transition-colors gap-3",
      "p-2 sm:p-4 rounded-lg border bg-card/50",
      "border-border/50 hover:bg-muted/50"
    )}>
      {/* Lado Esquerdo: Ícone + Info Principal */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className={cn(
          "flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-background flex-shrink-0 border border-border/50 shadow-sm transition-colors",
          isIncome ? "text-primary border-primary/20 bg-primary/5" : "text-destructive border-destructive/20 bg-destructive/5"
        )}>
          <CategoryIcon name={categoryIcon} className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        
        <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <h4 className={cn(
              "font-bold text-card-foreground text-[13px] sm:text-base truncate transition-opacity duration-300",
              discreetMode && "discreet-mode-blur"
            )}>
              {transaction.nome}
            </h4>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 leading-tight gap-0.5 sm:gap-0">
            <p className="text-[10px] sm:text-sm text-muted-foreground font-medium flex items-center gap-1">
              <span className="sm:hidden">{dataExibicao}</span>
              <span className="hidden sm:inline">{transaction.data}</span>
            </p>
            <span className="hidden sm:inline text-muted-foreground/30 text-[10px]">•</span>
            <span 
              className="text-[9px] sm:text-[10px] font-medium uppercase sm:capitalize text-muted-foreground/80 sm:px-1.5 sm:py-0.5 sm:rounded-md sm:border sm:bg-muted/10"
            >
              {transaction.categoria}
            </span>
          </div>
        </div>
      </div>

      {/* Lado Direito: Valor + Status (Mobile) + Menu */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex flex-col items-end gap-1">
          {/* Status / Tipo (Mobile) */}
          <div className="flex items-center gap-1 sm:hidden">
            <span className={cn(
              "text-[8px] font-black uppercase tracking-tighter",
              isIncome ? "text-primary/70" : "text-destructive/70"
            )}>
              {isIncome ? "ENTRADA" : "SAÍDA"}
            </span>
            {transaction.status && (
              <>
                <span className="text-muted-foreground/30 text-[8px]">|</span>
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-tighter",
                  transaction.status === "Pago" ? "text-primary/70" : "text-amber-500/70"
                )}>
                  {transaction.status}
                </span>
              </>
            )}
          </div>

          <p className={cn(
            "font-black sm:font-bold text-[13px] sm:text-base transition-all duration-300",
            isIncome ? "text-primary" : "text-destructive",
            discreetMode && "discreet-mode-blur"
          )}>
            {isIncome ? "+" : "-"} {formatCurrency(transaction.valor)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
            <DropdownMenuItem onClick={() => onDetails?.(transaction)} className="gap-2 cursor-pointer text-xs font-medium">
              <Info className="h-3.5 w-3.5" />
              Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(transaction)} className="gap-2 cursor-pointer text-xs font-medium">
              <Edit className="h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(transaction)} className="gap-2 text-destructive focus:text-destructive cursor-pointer text-xs font-bold">
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}