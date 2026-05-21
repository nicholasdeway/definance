import { useEffect, useState } from "react"
import { Goal, GoalHistoryItem, goalsApi } from "@/lib/goals"
import { PremiumModal } from "@/components/ui/premium-modal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Calendar, DollarSign, History } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/components/ui/use-mobile"

interface GoalHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meta: Goal | null
}

export function GoalHistoryDialog({ open, onOpenChange, meta }: GoalHistoryDialogProps) {
  const isMobile = useIsMobile()
  const [history, setHistory] = useState<GoalHistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && meta) {
      setLoading(true)
      goalsApi.getGoalHistory(meta.id)
        .then(setHistory)
        .catch((err) => console.error("Erro ao carregar histórico", err))
        .finally(() => setLoading(false))
    } else {
      setHistory([])
    }
  }, [open, meta])

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title="Histórico de Depósitos"
      description={meta ? `Lançamentos efetuados em: ${meta.name}` : "Histórico detalhado do objetivo."}
      icon={<History className="h-8 w-8 text-primary" />}
    >
      <div className="flex flex-col space-y-4 h-full max-h-[60vh]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Carregando histórico...</p>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted/20 border border-border flex items-center justify-center">
              <History className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Nenhum depósito</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Não há registros de pagamentos ou depósitos para esta meta ainda.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-1">
            <div className="space-y-3 pb-4">
              {history.map((item, idx) => {
                let formattedDate = ""
                try {
                  formattedDate = format(parseISO(item.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                } catch {
                  formattedDate = item.date
                }

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-card-foreground truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span className="text-[10px] font-medium">{formattedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-primary">
                        +{formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </PremiumModal>
  )
}
