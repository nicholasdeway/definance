"use client"

import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Trash2,
  Pencil,
  Info
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { useCategories } from "@/lib/category-context"
import { CategoryIcon } from "@/components/dashboard/shared/category-icon"
import { useIsMobile } from "@/components/ui/use-mobile"

interface Gasto {
  id: string
  descricao: string
  valor: number
  data: string
  dataReal: string
  hora: string
  categoria?: string
  transactionType?: string
}

interface GastoItemProps {
  gasto: Gasto
  isInitialLoad: boolean
  discreetMode: boolean
  onEdit: (gasto: Gasto) => void
  onDelete: (gasto: Gasto) => void
  onDetails: (gasto: Gasto) => void
}

export function GastoItem({ gasto, isInitialLoad, discreetMode, onEdit, onDelete, onDetails }: GastoItemProps) {
  const { categories } = useCategories()
  const isMobile = useIsMobile()

  // Busca a categoria real do banco para pegar o ícone e a cor
  const realCategory = categories.find(c => c.name === gasto.categoria)
  const categoryIcon = (realCategory?.icon && realCategory.icon !== "MoreHorizontal") ? realCategory.icon : gasto.categoria

  // Formata data reduzida se possível (ex: 27/04)
  const dataExibicao = gasto.data

  return (
    <div className={cn(
      "flex flex-row items-center justify-between transition-colors gap-3",
      "p-1.5 sm:py-1.5 sm:px-4 rounded-lg border bg-card/50",
      "border-border/50 hover:bg-muted/50"
    )}>
      {/* Lado Esquerdo: Ícone + Info Principal */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className={cn(
          "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-background flex-shrink-0 border shadow-sm transition-colors",
          "text-destructive border-destructive/20 bg-destructive/5"
        )}>
          <CategoryIcon 
            name={categoryIcon} 
            color={realCategory?.color} 
            className="h-4 w-4 sm:h-5 sm:w-5"
            fallback="MoreHorizontal" 
          />
        </div>
        
        <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <h4 className={cn(
              "font-bold text-card-foreground text-[13px] sm:text-base truncate transition-opacity duration-300",
              (isInitialLoad || discreetMode) && "discreet-mode-blur"
            )}>
              {gasto.descricao}
            </h4>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 leading-tight gap-0.5 sm:gap-0">
            <p className="text-[10px] sm:text-sm text-muted-foreground font-medium flex items-center gap-1">
              <span>{dataExibicao}</span>
              <span>•</span>
              <span>{gasto.hora}</span>
            </p>
            <span className="hidden sm:inline text-muted-foreground/30 text-[10px]">•</span>
            {gasto.categoria && (
              <span 
                className="text-[9px] sm:text-[10px] font-medium uppercase sm:capitalize text-muted-foreground/80 sm:px-1.5 sm:py-0.5 sm:rounded-md sm:border sm:bg-muted/10 w-fit"
              >
                {gasto.categoria}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lado Direito: Valor + Status (Mobile) + Menu */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex flex-col items-end gap-1">
          {/* Status / Tipo (Mobile) */}
          <div className="flex items-center gap-1 sm:hidden">
            <span className="text-[8px] font-black uppercase tracking-tighter text-destructive/70">
              SAÍDA
            </span>
          </div>

          <p className={cn(
            "font-black sm:font-bold text-[13px] sm:text-base transition-all duration-300 text-destructive",
            (isInitialLoad || discreetMode) && "discreet-mode-blur"
          )}>
            - {formatCurrency(gasto.valor)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
            <DropdownMenuItem onClick={() => onDetails(gasto)} className="gap-2 cursor-pointer text-xs font-medium">
              <Info className="h-3.5 w-3.5" />
              Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(gasto)} className="gap-2 cursor-pointer text-xs font-medium">
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(gasto)} className="gap-2 text-destructive focus:text-destructive cursor-pointer text-xs font-bold">
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}