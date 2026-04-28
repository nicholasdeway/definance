import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"
import { 
  CheckCircle2, 
  Clock,
  ArrowUpRight
} from "lucide-react"

export type ExpenseFilterType = "all" | "paid" | "pending"

interface ExpensesSummaryCardsProps {
  total: number
  pagas: number
  pendentes: number
  selectedFilter: ExpenseFilterType
  onFilterChange: (filter: ExpenseFilterType) => void
  isLoading?: boolean
}

export function ExpensesSummaryCards({ 
  total, 
  pagas, 
  pendentes, 
  selectedFilter, 
  onFilterChange,
  isLoading
}: ExpensesSummaryCardsProps) {
  const { discreetMode } = useSettings()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      <Card 
        className={cn(
          "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-primary/30 group relative overflow-hidden py-3 sm:py-6 gap-0 sm:gap-6 col-span-2 sm:col-span-1",
          selectedFilter === "all" && "ring-2 ring-primary/20 border-primary/40 bg-primary/5",
          isLoading && "pointer-events-none"
        )}
        onClick={() => onFilterChange("all")}
      >
        <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:text-primary transition-colors sm:normal-case sm:tracking-normal">
            Total Despesas
          </CardTitle>
          <div className={cn(
            "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-colors",
            selectedFilter === "all" ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary/70"
          )}>
            <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className={cn(
            "text-lg sm:text-2xl font-bold transition-all duration-300",
            selectedFilter === "all" ? "text-primary" : "text-card-foreground",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            <span className="sm:hidden">
              {`R$ ${total.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
            </span>
            <span className="hidden sm:inline">
              {formatCurrency(total)}
            </span>
          </div>
          <p className={cn(
            "hidden sm:block text-[10px] text-muted-foreground font-medium uppercase mt-1 transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            Gasto total no período
          </p>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-emerald-500/30 group relative overflow-hidden py-3 sm:py-6 gap-0 sm:gap-6",
          selectedFilter === "paid" && "ring-2 ring-emerald-500/20 border-emerald-500/40 bg-emerald-500/5",
          isLoading && "pointer-events-none"
        )}
        onClick={() => onFilterChange(selectedFilter === "paid" ? "all" : "paid")}
      >
        <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:text-emerald-500 transition-colors sm:normal-case sm:tracking-normal">
            Pagas
          </CardTitle>
          <div className={cn(
            "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-colors",
            selectedFilter === "paid" ? "bg-emerald-500/20 text-emerald-600" : "bg-emerald-500/10 text-emerald-500/70"
          )}>
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className={cn(
            "text-lg sm:text-2xl font-bold transition-all duration-300",
            selectedFilter === "paid" ? "text-emerald-500" : "text-card-foreground",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            <span className="sm:hidden">
              {`R$ ${pagas.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
            </span>
            <span className="hidden sm:inline">
              {formatCurrency(pagas)}
            </span>
          </div>
          <p className={cn(
            "hidden sm:block text-[10px] text-emerald-600 font-bold uppercase mt-1 transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            Contas já liquidadas
          </p>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "border-border/50 shadow-sm cursor-pointer transition-all duration-300 hover:border-destructive/30 group relative overflow-hidden py-3 sm:py-6 gap-0 sm:gap-6",
          selectedFilter === "pending" && "ring-2 ring-destructive/20 border-destructive/40 bg-destructive/5",
          isLoading && "pointer-events-none"
        )}
        onClick={() => onFilterChange(selectedFilter === "pending" ? "all" : "pending")}
      >
        <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6 space-y-0 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:text-destructive transition-colors sm:normal-case sm:tracking-normal">
            Pendentes
          </CardTitle>
          <div className={cn(
            "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-colors",
            selectedFilter === "pending" ? "bg-destructive/20 text-destructive" : "bg-destructive/10 text-destructive/70"
          )}>
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className={cn(
            "text-lg sm:text-2xl font-bold transition-all duration-300",
            selectedFilter === "pending" ? "text-destructive" : "text-card-foreground",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            <span className="sm:hidden">
              {`R$ ${pendentes.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
            </span>
            <span className="hidden sm:inline">
              {formatCurrency(pendentes)}
            </span>
          </div>
          <p className={cn(
            "hidden sm:block text-[10px] text-destructive font-bold uppercase mt-1 transition-all duration-300",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            Aguardando pagamento
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
