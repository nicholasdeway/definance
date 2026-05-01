"use client"

import { PremiumModal } from "@/components/ui/premium-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { 
  Calendar, 
  Tag, 
  Info, 
  Pencil, 
  Trash2, 
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"
import { type ContaItem } from "./bill-item"

interface BillDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conta: ContaItem | null
  onEdit: () => void
  onDelete: () => void
  onPay: () => void
}

export function BillDetailsModal({
  open,
  onOpenChange,
  conta,
  onEdit,
  onDelete,
  onPay
}: BillDetailsModalProps) {
  const isMobile = useIsMobile()
  if (!conta) return null

  const isPaid = conta.status === "paga"
  const isOverdue = conta.status === "atrasada"

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title="Detalhes da Conta"
      description="Informações completas do vencimento ou pagamento."
      icon={
        isPaid ? <CheckCircle2 className="h-8 w-8 text-primary" /> : 
        isOverdue ? <AlertTriangle className="h-8 w-8 text-destructive" /> : 
        !conta.rawDueDate ? <AlertCircle className="h-8 w-8 text-amber-500 animate-pulse" /> :
        <Clock className="h-8 w-8 text-yellow-500" />
      }
    >
      <div className="space-y-4 md:space-y-8 pt-6 sm:pt-0">
        {/* Header de Valor e Status */}
        <div className="flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl md:rounded-3xl bg-muted/20 border border-white/5 relative overflow-hidden mt-6 md:mt-0">
           <div className={cn(
             "absolute top-0 right-0 p-4 opacity-10",
             isPaid ? "text-primary" : isOverdue ? "text-destructive" : "text-yellow-500"
           )}>
             {isPaid ? <CheckCircle2 size={isMobile ? 80 : 120} /> : isOverdue ? <AlertTriangle size={isMobile ? 80 : 120} /> : <Clock size={isMobile ? 80 : 120} />}
           </div>

           <div className={cn(
             "h-12 w-12 md:h-16 md:w-16 rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-xl border-2",
             isPaid ? "bg-primary/10 text-primary border-primary/20" : 
             isOverdue ? "bg-destructive/10 text-destructive border-destructive/20" : 
             !conta.rawDueDate ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
             "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
           )}>
             <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
           </div>

           <h3 className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1 text-center">
             {conta.nome}
           </h3>
           
           <div className={cn(
             "text-2xl md:text-4xl font-black mb-2 md:mb-3 transition-all",
             isPaid ? "text-primary" : "text-foreground"
           )}>
             {formatCurrency(conta.valor)}
           </div>

           <div className="flex items-center gap-1.5 md:gap-2">
             <Badge variant="outline" className={cn(
               "px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest",
               isPaid ? "border-primary/30 text-primary bg-primary/5" : 
               isOverdue ? "border-destructive/30 text-destructive bg-destructive/5" : 
               "border-yellow-500/30 text-yellow-500 bg-yellow-500/5"
             )}>
                {isPaid ? "Paga" : isOverdue ? "Atrasada" : !conta.rawDueDate ? "Ajustar" : "A Vencer"}
             </Badge>
             <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground bg-muted/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
               {conta.tipo}
             </Badge>
           </div>
        </div>

        {/* Informações Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-muted/10 border border-white/5 space-y-0.5 md:space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-0.5 md:mb-1">
              <Calendar className="h-3 md:h-3.5 w-3 md:w-3.5" />
               <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider">Vencimento</span>
            </div>
            <p className={cn(
              "text-xs md:text-sm font-semibold",
              !conta.rawDueDate && "text-amber-500"
            )}>
              {conta.rawDueDate ? conta.vencimento : "Ajustar data"}
            </p>
          </div>

          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-muted/10 border border-white/5 space-y-0.5 md:space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-0.5 md:mb-1">
              <Tag className="h-3 md:h-3.5 w-3 md:w-3.5" />
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider">Categoria</span>
            </div>
            <p className="text-xs md:text-sm font-semibold">{conta.categoria || "Sem Categoria"}</p>
          </div>
        </div>

        <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-muted/10 border border-white/5 space-y-0.5 md:space-y-1 w-full">
          <div className="flex items-center gap-2 text-muted-foreground mb-0.5 md:mb-1">
            <Info className="h-3 md:h-3.5 w-3 md:w-3.5" />
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider">Status e Recorrência</span>
          </div>
          <p className="text-xs md:text-sm font-semibold">
            {conta.isRecorrente ? "Conta recorrente (mensal)" : "Lançamento único"}
            {isOverdue && ` • ${Math.abs(conta.dias)} dias de atraso`}
            {isPaid && ` • Pagamento efetuado`}
          </p>
        </div>

        {/* Ações */}
        <div className="pt-4 md:pt-6 border-t border-white/5 flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            className="flex-1 h-10 md:h-12 rounded-xl md:rounded-2xl font-bold text-destructive hover:bg-destructive/10 hover:text-destructive border border-destructive/10 text-xs md:text-sm"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 md:h-4 w-3.5 md:w-4 mr-1.5 md:mr-2" />
            Excluir
          </Button>
          {!isPaid && (
            <Button
              variant="outline"
              className="flex-1 h-10 md:h-12 rounded-xl md:rounded-2xl font-bold border-primary/20 text-primary hover:bg-primary/10 text-xs md:text-sm"
              onClick={onPay}
            >
              <CheckCircle2 className="h-3.5 md:h-4 w-3.5 md:w-4 mr-1.5 md:mr-2" />
              Pagar
            </Button>
          )}
          <Button
            className="flex-1 h-10 md:h-12 rounded-xl md:rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs md:text-sm"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 md:h-4 w-3.5 md:w-4 mr-1.5 md:mr-2" />
            Editar
          </Button>
        </div>
      </div>
    </PremiumModal>
  )
}
