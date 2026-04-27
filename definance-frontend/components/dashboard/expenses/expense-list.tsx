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
          <div className="space-y-2 sm:space-y-3">
            {despesas.map((d) => {
              const category = dynamicCategories.find(c => c.name === d.categoria)
              
              return (
                <div
                  key={d.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-3 sm:p-4 transition-colors gap-3 sm:gap-4",
                    d.billId
                      ? "border-primary/20 bg-primary/5 border-dashed border-2"
                      : "border-border/50 hover:bg-muted/50"
                  )}
                >
                  {/* Ícone + Info */}
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-background flex-shrink-0 border border-border/50 shadow-sm"
                      style={{ borderColor: category?.color ? `${category.color}40` : undefined }}
                    >
                      <CategoryIcon 
                        name={category?.icon} 
                        color={category?.color} 
                        fallback="MoreHorizontal" 
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className={cn(
                          "font-semibold text-card-foreground text-sm sm:text-base truncate transition-opacity duration-300",
                          discreetMode && "discreet-mode-blur"
                        )}>
                          {d.nome}
                        </p>
                        {/* Badge especial quando a despesa veio de Minhas Contas */}
                        {d.billId && (
                          <Badge
                            variant="outline"
                            className="border-primary/30 text-primary bg-primary/5 text-[10px] px-1.5 py-0 whitespace-nowrap gap-1"
                          >
                            <Link2 className="h-2.5 w-2.5" />
                            Conta vinculada
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {d.data}
                        </p>
                        <span className="text-muted-foreground/30 text-[10px]">•</span>
                        <span 
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-md border"
                          style={{ 
                            color: category?.color || undefined, 
                            backgroundColor: category?.color ? `${category.color}10` : undefined,
                            borderColor: category?.color ? `${category.color}20` : undefined
                          }}
                        >
                          {capitalize(d.categoria)}
                        </span>
                      </div>
                      {(d.descricao || d.observacoes) && (
                        <div className="flex flex-col gap-1 mt-1.5 pt-1.5 border-t border-white/5">
                          {d.descricao && (
                            <p className="text-[11px] leading-relaxed text-muted-foreground/70 italic">
                              {d.descricao}
                            </p>
                          )}
                          {d.observacoes && (
                            <p className="text-[10px] leading-relaxed text-primary/60 font-medium">
                              Obs: {d.observacoes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges + Valor + Ações */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                      <Badge
                        variant={d.tipo === "Fixa" ? "default" : "secondary"}
                        className="text-[10px] uppercase font-bold px-1.5"
                      >
                        {d.tipo}
                      </Badge>
                      <Badge
                        variant={d.status === "Pago" ? "default" : "destructive"}
                        className={cn(
                          "text-[10px] uppercase font-bold px-1.5",
                          d.status === "Pago" ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" : ""
                        )}
                      >
                        {d.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground font-bold">-</span>
                      <span className={cn(
                        "font-bold text-card-foreground text-sm sm:text-base whitespace-nowrap transition-opacity duration-300",
                        discreetMode && "discreet-mode-blur"
                      )}>
                        {formatCurrency(d.valor)}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-destructive/10 hover:text-destructive rounded-full flex-shrink-0 cursor-pointer"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[160px] rounded-xl">
                        {/* Despesa vinculada a conta: não editar diretamente */}
                        {d.billId ? (
                          <DropdownMenuItem
                            className="cursor-pointer text-sm text-muted-foreground italic"
                            disabled
                          >
                            Gerada por Minhas Contas
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              className="cursor-pointer text-sm"
                              onClick={() => onEdit(d)}
                            >
                              Editar
                            </DropdownMenuItem>
                            {d.status !== "Pago" && (
                              <DropdownMenuItem
                                className="cursor-pointer text-sm text-primary"
                                onClick={() => onMarkAsPaid(d)}
                              >
                                Marcar como pago
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-destructive font-medium cursor-pointer text-sm"
                          onClick={() => onDelete(d)}
                        >
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