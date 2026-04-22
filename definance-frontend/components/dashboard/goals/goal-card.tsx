"use client"

import { Goal } from "@/lib/goals"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { format, parseISO, differenceInDays, isBefore, isAfter } from "date-fns"
import { ptBR } from "date-fns/locale"
import { LucideIcon, Plane, Car, Home, GraduationCap, Shield, Star } from "lucide-react"

interface GoalCardProps {
  meta: Goal
  onEdit: (meta: Goal) => void
  onDelete: (meta: Goal) => void
  onDeposit: (meta: Goal) => void
}

type Categoria = {
  id: string
  label: string
  icon: LucideIcon
  cor: string
  bgCor: string
}

const CATEGORIAS: Categoria[] = [
  { id: "viagem",   label: "Viagem",   icon: Plane,         cor: "text-blue-400",   bgCor: "bg-blue-400/10"   },
  { id: "veiculo",  label: "Veículo",  icon: Car,           cor: "text-purple-400", bgCor: "bg-purple-400/10" },
  { id: "moradia",  label: "Moradia",  icon: Home,          cor: "text-primary",    bgCor: "bg-primary/10"    },
  { id: "educacao", label: "Educação", icon: GraduationCap, cor: "text-red-400",    bgCor: "bg-red-400/10"    },
  { id: "reserva",  label: "Reserva",  icon: Shield,        cor: "text-yellow-400", bgCor: "bg-yellow-400/10" },
  { id: "outros",   label: "Outros",   icon: Star,          cor: "text-orange-400", bgCor: "bg-orange-400/10" },
]

function getCat(id: string): Categoria {
  return CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[CATEGORIAS.length - 1]
}

function fmtShort(dateStr: string) {
  if (!dateStr) return "—"
  try { return format(parseISO(dateStr), "MMM yyyy", { locale: ptBR }) } catch { return dateStr }
}

function calcTempoDecorrido(inicio: string, fim: string): number {
  try {
    const start = parseISO(inicio)
    const end   = parseISO(fim)
    const now   = new Date()
    if (isBefore(now, start)) return 0
    if (isAfter(now, end))    return 100
    const total  = differenceInDays(end, start)
    const passed = differenceInDays(now, start)
    return total > 0 ? Math.round((passed / total) * 100) : 100
  } catch { return 0 }
}

function diasRestantes(fim: string): number {
  try {
    const end = parseISO(fim)
    const now = new Date()
    return Math.max(differenceInDays(end, now), 0)
  } catch { return 0 }
}

export function GoalCard({ meta, onEdit, onDelete, onDeposit }: GoalCardProps) {
  const cat        = getCat(meta.category)
  const Icon       = cat.icon
  const progresso  = meta.targetAmount > 0 ? (meta.currentAmount / meta.targetAmount) * 100 : 0
  const falta      = Math.max(meta.targetAmount - meta.currentAmount, 0)
  const concluida  = meta.isCompleted || meta.currentAmount >= meta.targetAmount
  const tempoPct   = calcTempoDecorrido(meta.startDate, meta.endDate)
  const diasLeft   = diasRestantes(meta.endDate)
  const atrasada   = !concluida && tempoPct > progresso + 10

  return (
    <Card className={cn(
      "border-border/50 transition-all",
      concluida && "border-primary/30 bg-primary/5",
      atrasada  && "border-orange-500/20"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", cat.bgCor)}>
            <Icon className={cn("h-5 w-5", cat.cor)} />
          </div>
          <div className="flex items-center gap-1">
            {concluida && <CheckCircle2 className="h-4 w-4 text-primary" />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!concluida && (
                  <DropdownMenuItem onClick={() => onDeposit(meta)}>
                    Adicionar valor
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onEdit(meta)}>Editar</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(meta)}>
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardTitle className="text-base text-card-foreground">
          {meta.name.replace(/[<>]/g, '')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progresso financeiro */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-2xl font-bold text-card-foreground">{progresso.toFixed(0)}%</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                concluida && "bg-primary/20 text-primary",
                atrasada  && "bg-orange-500/20 text-orange-400"
              )}
            >
              {concluida ? "Concluída ✓" : atrasada ? "Atenção" : `${diasLeft}d restantes`}
            </Badge>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(progresso, 100)}%` }}
            />
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Progresso financeiro</p>
        </div>

        {/* Progresso temporal */}
        {!concluida && (
          <div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  atrasada ? "bg-orange-400/60" : "bg-muted-foreground/40"
                )}
                style={{ width: `${Math.min(tempoPct, 100)}%` }}
              />
            </div>
            <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
              <span>{fmtShort(meta.startDate)}</span>
              <span className={cn(atrasada && "text-orange-400")}>{tempoPct}% do tempo</span>
              <span>{fmtShort(meta.endDate)}</span>
            </div>
          </div>
        )}

        {/* Acumulado / Falta */}
        <div className="flex justify-between text-sm pt-1 border-t border-border/30">
          <div>
            <p className="text-muted-foreground">Acumulado</p>
            <p className="font-semibold text-primary">{formatCurrency(meta.currentAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">{concluida ? "Alvo" : "Falta"}</p>
            <p className="font-semibold text-card-foreground">
              {concluida ? formatCurrency(meta.targetAmount) : formatCurrency(falta)}
            </p>
          </div>
        </div>

        {/* Reserva mensal */}
        {!concluida && meta.monthlyReserve > 0 && (() => {
          const mesesRestantes = meta.monthlyReserve > 0 ? Math.ceil(falta / meta.monthlyReserve) : null
          return (
            <div className="flex items-center justify-between rounded-md bg-muted/30 px-2.5 py-1.5 text-[11px] text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">{formatCurrency(meta.monthlyReserve)}/mês</span>
                {" • todo dia "}
                <span className="font-medium text-foreground">{meta.reserveDay}</span>
              </span>
              {mesesRestantes && (
                <span className="font-medium text-primary">
                  ~{mesesRestantes} {mesesRestantes === 1 ? "mês" : "meses"} p/ concluir
                </span>
              )}
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}