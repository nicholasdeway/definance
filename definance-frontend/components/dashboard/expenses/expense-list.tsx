import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ArrowUpRight, 
  Search, 
  MoreHorizontal, 
  Link2,
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
  CreditCard,
  AlertCircle,
  ShoppingBag,
  Palmtree,
  Wallet
} from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/lib/settings-context"
import { cn, capitalize } from "@/lib/utils"
import { FilterBar, type SortOption } from "@/components/dashboard/filter-bar"
import { useCategories } from "@/lib/category-context"


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

  const getCategoryIcon = (categoria: string, nome: string) => {
    const c = categoria.toLowerCase()
    const n = nome.toLowerCase()
    
    // Configuração base de ícones: [Ícone, Cor]
    const iconClass = "h-4 w-4 sm:h-5 sm:w-5"
    
    // Prioridade por nome (para itens sincronizados específicos)
    if (n.includes("ipva")) return <CarFront className={cn(iconClass, "text-blue-600")} />
    if (n.includes("seguro")) return <ShieldCheck className={cn(iconClass, "text-emerald-600")} />
    if (n.includes("parcela") || n.includes("empréstimo")) return <CreditCard className={cn(iconClass, "text-slate-600")} />
    
    // Categorias padrão
    if (c.includes("aluguel") || c.includes("moradia")) return <Home className={cn(iconClass, "text-amber-600")} />
    if (c.includes("luz") || c.includes("energia")) return <Zap className={cn(iconClass, "text-yellow-500")} />
    if (c.includes("agua") || c.includes("água")) return <Droplets className={cn(iconClass, "text-blue-500")} />
    if (c.includes("internet")) return <Globe className={cn(iconClass, "text-sky-500")} />
    if (c.includes("celular") || c.includes("telefone")) return <Smartphone className={cn(iconClass, "text-slate-500")} />
    if (c.includes("streaming") || c.includes("netflix") || c.includes("spotify")) return <Clapperboard className={cn(iconClass, "text-purple-500")} />
    if (c.includes("academia")) return <Dumbbell className={cn(iconClass, "text-emerald-500")} />
    if (c.includes("transporte") || c.includes("combustível") || c.includes("combustivel") || n.includes("uber")) return <Bus className={cn(iconClass, "text-orange-500")} />
    if (c.includes("alimentacao") || c.includes("alimentação")) return <Utensils className={cn(iconClass, "text-rose-500")} />
    if (n.includes("mercado") || n.includes("supermercado")) return <ShoppingBag className={cn(iconClass, "text-emerald-600")} />
    if (c.includes("saude") || c.includes("saúde") || c.includes("farmacia") || n.includes("farmácia")) return <HeartPulse className={cn(iconClass, "text-red-500")} />
    if (c.includes("educacao") || c.includes("educação") || c.includes("curso")) return <BookOpen className={cn(iconClass, "text-indigo-500")} />
    if (c.includes("veículo") || c.includes("carro") || n.includes("oficina")) return <CarFront className={cn(iconClass, "text-blue-600")} />
    if (c.includes("lazer") || c.includes("viagem")) return <Palmtree className={cn(iconClass, "text-cyan-500")} />
    if (c.includes("serviços") || c.includes("assinatura")) return <Wallet className={cn(iconClass, "text-slate-500")} />
    
    return <ArrowUpRight className={cn(iconClass, "text-muted-foreground")} />
  }

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
            {despesas.map((d) => (
              <div
                key={d.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-3 sm:p-4 transition-colors gap-3 sm:gap-4 ${
                  d.billId
                    ? "border-primary/20 bg-primary/5 border-dashed border-2"
                    : "border-border/50 hover:bg-muted/50"
                }`}
              >
                {/* Ícone + Info */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted/30 flex-shrink-0 border border-border/50 shadow-sm">
                    {getCategoryIcon(d.categoria, d.nome)}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className={cn(
                        "font-medium text-card-foreground text-sm sm:text-base truncate transition-opacity duration-300",
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
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {capitalize(d.categoria)} • {d.data}
                    </p>
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
                      className="text-xs"
                    >
                      {d.tipo}
                    </Badge>
                    <Badge
                      variant={d.status === "Pago" ? "default" : "destructive"}
                      className={
                        d.status === "Pago" ? "bg-primary/10 text-primary border-primary/20" : ""
                      }
                    >
                      {d.status}
                    </Badge>
                  </div>

                  <span className={cn(
                    "font-semibold text-card-foreground text-sm sm:text-base whitespace-nowrap transition-opacity duration-300",
                    discreetMode && "discreet-mode-blur"
                  )}>
                    {formatCurrency(d.valor)}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-destructive/10 hover:text-destructive rounded-full flex-shrink-0"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[160px]">
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
            ))}

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