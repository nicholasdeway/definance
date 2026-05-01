import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Link2,
} from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/lib/settings-context"
import { cn, capitalize } from "@/lib/utils"
import { FilterBar, type SortOption } from "@/components/dashboard/filter-bar"
import { useCategories } from "@/lib/category-context"
import { CategoryIcon } from "@/components/dashboard/shared/category-icon"

export interface Despesa {
  id: string
  nome: string
  valor: number
  categoria: string
  data: string
  tipo: string
  status: string
  billId?: string | null
  descricao?: string | null
  observacoes?: string | null
  rawDate?: Date
}

interface ExpenseListProps {
  despesas: Despesa[]
  search: string
  onSearchChange: (value: string) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  statusFilter: "all" | "paid" | "pending"
  onEdit: (despesa: Despesa) => void
  onMarkAsPaid: (despesa: Despesa) => void
  onDelete: (despesa: Despesa) => void
  isLoading: boolean
}

export function ExpenseList({
  despesas,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedCategories,
  onCategoriesChange,
  statusFilter,
  onEdit,
  onMarkAsPaid,
  onDelete,
  isLoading,
}: ExpenseListProps) {
  const { discreetMode } = useSettings()
  const { categories: dynamicCategories } = useCategories()

  // Prepara a lista de categorias para o filtro (Padrão + Dinâmicas de Saída)
  const categoriasFiltradas = dynamicCategories
    .filter(c => c.type === "Saída" || c.type === "Ambos")
    .map(c => c.name.trim())

  const todasCategoriasParaFiltro = Array.from(new Set(
    categoriasFiltradas
  )).sort()

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm sm:text-base text-card-foreground">
            Lista de Despesas
          </CardTitle>
          <div className="w-full sm:max-w-[520px]">
            <FilterBar 
              search={search}
              onSearchChange={onSearchChange}
              sortBy={sortBy}
              onSortChange={onSortChange}
              categories={todasCategoriasParaFiltro}
              selectedCategories={selectedCategories}
              onCategoriesChange={onCategoriesChange}
              placeholder="Buscar despesas ou palavra-chave..."
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground animate-pulse text-xs sm:text-sm">
              Carregando despesas...
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {despesas.map((d) => {
              const category = dynamicCategories.find(c => c.name === d.categoria)
              const dataReduzida = d.data.replace(/\/20(\d{2})$/, '/$1')
              
              return (
                <div
                  key={d.id}
                  className={cn(
                    "flex flex-row items-center justify-between transition-colors gap-3",
                    "p-2 sm:p-4 rounded-lg border",
                    d.billId
                      ? "border-primary/20 bg-primary/5 border-dashed border-2"
                      : "border-border/50 hover:bg-muted/50"
                  )}
                >
                  {/* Lado Esquerdo: Ícone + Info Principal */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div 
                      className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-background flex-shrink-0 border border-border/50 shadow-sm"
                      style={{ borderColor: category?.color ? `${category.color}40` : undefined }}
                    >
                      <CategoryIcon 
                        name={category?.icon} 
                        color={category?.color} 
                        fallback="MoreHorizontal" 
                      />
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-0">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <p className={cn(
                          "font-bold text-card-foreground text-[13px] sm:text-base truncate transition-opacity duration-300",
                          discreetMode && "discreet-mode-blur"
                        )}>
                          {d.nome}
                        </p>
                        {d.billId && (
                          <Link2 className="h-2.5 w-2.5 text-primary shrink-0 sm:hidden" />
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 leading-tight gap-0.5 sm:gap-0">
                        <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
                          <span className="sm:hidden">{dataReduzida}</span>
                          <span className="hidden sm:inline">{d.data}</span>
                        </p>
                        <span className="hidden sm:inline text-muted-foreground/30 text-[10px]">•</span>
                        <span 
                          className="text-[9px] sm:text-[10px] font-medium sm:px-1.5 sm:py-0.5 sm:rounded-md sm:border sm:bg-muted/10 uppercase sm:capitalize"
                          style={{ color: category?.color || undefined }}
                        >
                          {capitalize(d.categoria)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito: Valor + Badges Minimalistas (Mobile) + Menu */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      {/* Status / Tipo (Mobile) */}
                      <div className="flex items-center gap-1 sm:hidden">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-tighter",
                          d.status === "Pago" ? "text-primary" : "text-destructive"
                        )}>
                          {d.status}
                        </span>
                        <span className="text-[8px] text-muted-foreground/30">|</span>
                        <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/80">
                          {d.tipo}
                        </span>
                      </div>

                      {/* Badges Desktop */}
                      <div className="hidden sm:flex items-center gap-2">
                        {d.billId && (
                          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[10px] px-1.5 py-0 gap-1">
                            <Link2 className="h-2.5 w-2.5" />
                            Conta vinculada
                          </Badge>
                        )}
                        <Badge variant={d.tipo === "Fixa" ? "default" : "secondary"} className="text-[10px] uppercase font-bold px-1.5">
                          {d.tipo}
                        </Badge>
                        <Badge
                          variant={d.status === "Pago" ? "default" : "destructive"}
                          className={cn(
                            "text-[10px] uppercase font-bold px-1.5",
                            d.status === "Pago" ? "bg-primary/10 text-primary border-primary/20" : ""
                          )}
                        >
                          {d.status}
                        </Badge>
                      </div>

                      {/* Valor */}
                      <div className="flex items-center gap-0.5">
                        <span className="text-xs text-muted-foreground font-bold">-</span>
                        <span className={cn(
                          "font-black text-card-foreground text-sm sm:text-base whitespace-nowrap transition-opacity duration-300",
                          discreetMode && "discreet-mode-blur"
                        )}>
                          {discreetMode ? "R$ ••••" : formatCurrency(d.valor).replace("R$", "").trim()}
                        </span>
                      </div>
                    </div>

                    {/* Menu de Ações */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-white/5 rounded-full flex-shrink-0 cursor-pointer"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[160px] rounded-xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
                        {d.billId ? (
                          <DropdownMenuItem className="cursor-pointer text-xs text-muted-foreground italic" disabled>
                            Gerada por Minhas Contas
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => onEdit(d)}>
                              Editar
                            </DropdownMenuItem>
                            {d.status !== "Pago" && (
                              <DropdownMenuItem className="cursor-pointer text-sm text-primary font-bold" onClick={() => onMarkAsPaid(d)}>
                                Marcar como pago
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuItem className="text-destructive font-bold cursor-pointer text-sm" onClick={() => onDelete(d)}>
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}

            {!isLoading && despesas.length === 0 && (
              <div className="py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground border-2 border-dashed border-border/60 rounded-xl">
                Nenhuma despesa encontrada.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}