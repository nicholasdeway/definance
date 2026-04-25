import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/lib/settings-context"
import { cn } from "@/lib/utils"

interface GoalsSummaryProps {
  totalAcumulado: number
  totalAlvo: number
  progressoGeral: number
}

export function GoalsSummary({ totalAcumulado, totalAlvo, progressoGeral }: GoalsSummaryProps) {
  const { discreetMode } = useSettings()

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base text-card-foreground">Progresso Geral</CardTitle>
            <CardDescription>Todas as suas metas combinadas</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className={cn(
            "text-muted-foreground transition-all duration-300",
            discreetMode && "blur-md opacity-50 select-none"
          )}>
            {formatCurrency(totalAcumulado)} de {formatCurrency(totalAlvo)}
          </span>
          <span className="font-medium text-primary">{progressoGeral.toFixed(0)}%</span>
        </div>
        <Progress value={progressoGeral} className="h-3" />
      </CardContent>
    </Card>
  )
}