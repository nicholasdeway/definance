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
  AlertCircle
} from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/lib/settings-context"
import { cn, capitalize } from "@/lib/utils"

export interface Despesa {
  id: string
  nome: string
  valor: number
  categoria: string
  data: string
  tipo: string
  status: string
  billId?: string | null  // se preenchido, veio de Minhas Contas
}

interface ExpenseListProps {
  despesas: Despesa[]
  search: string
  onSearchChange: (value: string) => void
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
  statusFilter,
  onEdit,
  onMarkAsPaid,
  onDelete,
  isLoading,
}: ExpenseListProps) {
  const { discreetMode } = useSettings()
  const filtered = despesas.filter(
    (d) => {
      const matchesSearch = d.nome.toLowerCase().includes(search.toLowerCase()) ||
                           d.categoria.toLowerCase().includes(search.toLowerCase())
      
      if (statusFilter === "paid") return matchesSearch && d.status === "Pago"
      if (statusFilter === "pending") return matchesSearch && d.status === "Pendente"
      return matchesSearch
    }
  )

  const getCategoryIcon = (categoria: string, nome: string) => {
    const c = categoria.toLowerCase()
    const n = nome.toLowerCase()
    
    // Prioridade por nome (para itens sincronizados específicos)
    if (n.includes("ipva")) return <CarFront className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (n.includes("seguro")) return <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (n.includes("parcela")) return <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    
    // Categorias padrão
    if (c.includes("aluguel")) return <Home className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("luz") || c.includes("energia")) return <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("agua") || c.includes("água")) return <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("internet")) return <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("celular") || c.includes("telefone")) return <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("streaming") || c.includes("netflix") || c.includes("spotify")) return <Clapperboard className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("academia")) return <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("transporte") || c.includes("combustível") || c.includes("combustivel")) return <Bus className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("alimentacao") || c.includes("alimentação") || n.includes("mercado")) return <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("saude") || c.includes("saúde") || c.includes("farmacia")) return <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("educacao") || c.includes("educação") || c.includes("curso")) return <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    if (c.includes("veículo") || c.includes("carro")) return <CarFront className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
    
    return <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm sm:text-base text-card-foreground">
            Lista de Despesas
          </CardTitle>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar despesas..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 sm:pl-9 sm:w-[250px] text-sm sm:text-base"
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
            {filtered.map((d) => (
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
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-destructive/10 flex-shrink-0">
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

            {!isLoading && filtered.length === 0 && (
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