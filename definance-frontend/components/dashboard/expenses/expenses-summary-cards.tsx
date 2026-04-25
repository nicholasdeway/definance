import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <Card 
        className={cn(
          "border-border/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden",
          selectedFilter === "all" ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50",
          isLoading && "pointer-events-none"
        )}
        onClick={() => onFilterChange("all")}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-between">
            Total de Despesas
            {selectedFilter === "all" && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-xl sm:text-2xl font-bold transition-opacity duration-300",
            selectedFilter === "all" ? "text-primary" : "text-card-foreground",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {formatCurrency(total)}
          </div>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "border-border/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden",
          selectedFilter === "paid" ? "ring-2 ring-emerald-500 bg-emerald-500/5" : "hover:bg-muted/50",
          isLoading && "pointer-events-none"
        )}
        onClick={() => onFilterChange(selectedFilter === "paid" ? "all" : "paid")}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-emerald-500 transition-colors flex items-center justify-between">
            Pagas
            {selectedFilter === "paid" && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-xl sm:text-2xl font-bold transition-opacity duration-300",
            selectedFilter === "paid" ? "text-emerald-500" : "text-card-foreground",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {formatCurrency(pagas)}
          </div>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "border-border/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden",
          selectedFilter === "pending" ? "ring-2 ring-destructive bg-destructive/5" : "hover:bg-muted/50",
          isLoading && "pointer-events-none"
        )}
        onClick={() => onFilterChange(selectedFilter === "pending" ? "all" : "pending")}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-destructive transition-colors flex items-center justify-between">
            Pendentes
            {selectedFilter === "pending" && <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-xl sm:text-2xl font-bold transition-opacity duration-300",
            selectedFilter === "pending" ? "text-destructive" : "text-card-foreground",
            (isLoading || discreetMode) && "discreet-mode-blur"
          )}>
            {formatCurrency(pendentes)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
