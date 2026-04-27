import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { GastoItem } from "./gasto-item"

interface Gasto {
  id: string
  descricao: string
  valor: number
  data: string
  dataReal: string
  hora: string
  categoria?: string
}

interface GastoListProps {
  title: string
  gastos: Gasto[]
  visible: boolean
  isLoading: boolean
  isInitialLoad: boolean
  discreetMode: boolean
  onEdit: (gasto: Gasto) => void
  onDelete: (gasto: Gasto) => void
}

export function GastoList({ 
  title, 
  gastos, 
  visible, 
  isLoading, 
  isInitialLoad, 
  discreetMode, 
  onEdit,
  onDelete 
}: GastoListProps) {
  if (!visible || (gastos.length === 0 && !isLoading)) return null

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base text-card-foreground">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">{gastos.length} gastos</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground text-sm">Carregando...</p>
          </div>
        ) : (
          <div className={cn(
            "space-y-2 sm:space-y-3",
            isInitialLoad && "discreet-mode-blur"
          )}>
            {gastos.map((g) => (
              <GastoItem 
                key={g.id} 
                gasto={g} 
                isInitialLoad={isInitialLoad} 
                discreetMode={discreetMode} 
                onEdit={onEdit}
                onDelete={onDelete} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}