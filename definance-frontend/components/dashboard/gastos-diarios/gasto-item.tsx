import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Trash2,
  Pencil
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
}

export function GastoItem({ gasto, isInitialLoad, discreetMode, onEdit, onDelete }: GastoItemProps) {
  const { categories } = useCategories()

  // Busca a categoria real do banco para pegar o ícone e a cor
  const category = categories.find(c => c.name === gasto.categoria)

  return (
    <div className={cn(
      "flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all bg-card/50 gap-2",
      "border-border/50 hover:bg-muted/30"
    )}>
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div 
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-background border border-border flex items-center justify-center shadow-sm flex-shrink-0 relative"
          style={{ borderColor: category?.color ? `${category.color}40` : undefined }}
        >
          <CategoryIcon 
            name={category?.icon} 
            color={category?.color} 
            fallback="MoreHorizontal" 
          />
          
          {/* Badge de 'S' para Saída fixo */}
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center border border-background text-[8px] font-bold text-white shadow-sm bg-muted-foreground/50">
            S
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-semibold text-xs sm:text-base truncate text-card-foreground transition-all duration-300",
              discreetMode && "blur-md select-none"
            )}>
              {gasto.descricao}
            </p>
            <span className="text-[9px] uppercase font-black px-1 rounded-sm leading-tight text-muted-foreground bg-muted/20">
              Saída
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] sm:text-xs text-muted-foreground">{gasto.data} • {gasto.hora}</p>
            {gasto.categoria && (
              <>
                <span className="text-muted-foreground/30 text-[10px]">•</span>
                <span 
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-md border"
                  style={{ 
                    color: category?.color || undefined, 
                    backgroundColor: category?.color ? `${category.color}10` : undefined,
                    borderColor: category?.color ? `${category.color}20` : undefined
                  }}
                >
                  {gasto.categoria}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="text-right mr-1 sm:mr-2 flex items-center gap-1">
          <span className="font-bold text-sm sm:text-lg text-muted-foreground">-</span>
          <p className={cn(
            "font-bold text-sm sm:text-lg text-card-foreground/90 transition-all duration-300",
            discreetMode && "blur-md select-none"
          )}>
            {formatCurrency(gasto.valor)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem 
              onClick={() => onEdit(gasto)}
              className="gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(gasto)}
              className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}