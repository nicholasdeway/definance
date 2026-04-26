"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Briefcase,
  Star,
  Plus,
  Building2,
  User,
  Laptop,
  GraduationCap,
  TrendingUp,
  Home,
  Landmark
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"

interface ReceitaItemProps {
  receita: {
    id: string
    nome: string
    valor: number
    tipo: string
    data: string
    recorrente: boolean
    isSynced?: boolean
    tipoValue?: string
  }
  discreetMode: boolean
  onEdit: (receita: any) => void
  onDelete: (receita: any) => void
}

export const ReceitaItem = ({
  receita,
  discreetMode,
  onEdit,
  onDelete
}: ReceitaItemProps) => {
  const getIcon = (tipo: string, isSynced?: boolean) => {
    const t = tipo.toLowerCase()
    if (t.includes('clt')) return <Briefcase className="h-5 w-5 text-blue-500" />
    if (t.includes('pj')) return <Building2 className="h-5 w-5 text-yellow-500" />
    if (t.includes("autonomo") || t.includes("autônomo")) return <User className="h-5 w-5 text-orange-500" />
    if (t.includes("freelancer") || t.includes("freelance")) return <Laptop className="h-5 w-5 text-indigo-500" />
    if (t.includes("mesada")) return <GraduationCap className="h-5 w-5 text-pink-500" />
    if (t.includes("investimento")) return <TrendingUp className="h-5 w-5 text-emerald-500" />
    if (t.includes("aluguel")) return <Home className="h-5 w-5 text-amber-600" />
    if (t.includes('extra') || t.includes('bônus')) return <Star className="h-5 w-5 text-purple-500" />
    
    if (isSynced) return <Landmark className="h-5 w-5 text-primary" />
    return <Plus className="h-5 w-5 text-emerald-500" />
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl border transition-all bg-card/50",
      receita.isSynced 
        ? "border-primary/30 border-dashed border-2 shadow-[0_0_15px_rgba(34,197,94,0.02)]" 
        : "border-border/50 hover:bg-muted/30"
    )}>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
          {getIcon(receita.tipo, receita.isSynced)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm sm:text-base">{receita.nome}</h4>
            {receita.isSynced && (
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter py-0 px-1.5 border-primary/20 text-primary bg-primary/5">
                Sincronizado
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{receita.data}</span>
            <span>•</span>
            <span>{receita.tipo}</span>
            {receita.recorrente && <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1 rounded font-medium">Recorrente</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={cn(
            "font-bold text-sm sm:text-base transition-all duration-300",
            discreetMode && "discreet-mode-blur"
          )}>
            {formatCurrency(receita.valor)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(receita)} className="gap-2 cursor-pointer">
              <Edit className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(receita)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
              <Trash2 className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}