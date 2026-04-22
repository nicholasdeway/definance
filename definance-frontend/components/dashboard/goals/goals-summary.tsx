"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/currency"

interface GoalsSummaryProps {
  totalAcumulado: number
  totalAlvo: number
  progressoGeral: number
}

export function GoalsSummary({ totalAcumulado, totalAlvo, progressoGeral }: GoalsSummaryProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base text-card-foreground">Progresso Geral</CardTitle>
        <CardDescription>Todas as suas metas combinadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(totalAcumulado)} de {formatCurrency(totalAlvo)}
          </span>
          <span className="font-medium text-primary">{progressoGeral.toFixed(0)}%</span>
        </div>
        <Progress value={progressoGeral} className="h-3" />
      </CardContent>
    </Card>
  )
}