"use client"
import { PremiumModal } from "@/components/ui/premium-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"
import { CategoryIcon } from "@/components/dashboard/shared/category-icon"
import {
  Calendar,
  Tag,
  Pencil,
  Trash2,
  ArrowDownCircle,
  Clock
} from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"

interface Gasto {
  id: string
  descricao: string
  valor: number
  data: string
  dataReal: string
  hora: string
  categoria?: string
}

interface GastoDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gasto: Gasto | null
  onEdit: () => void
  onDelete: () => void
}

export function GastoDetailsModal({
  open,
  onOpenChange,
  gasto,
  onEdit,
  onDelete
}: GastoDetailsModalProps) {
  const isMobile = useIsMobile()
  if (!gasto) return null

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title="Detalhes do Gasto"
      description="Informações completas do lançamento rápido."
      icon={<ArrowDownCircle className="h-8 w-8 text-destructive" />}
    >
      <div className="space-y-4 md:space-y-8 pt-6 sm:pt-0">
        {/* Header de Valor e Status */}
        <div className="flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl md:rounded-3xl bg-muted/20 border border-white/5 relative overflow-hidden mt-6 md:mt-0">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-destructive">
             <ArrowDownCircle size={isMobile ? 80 : 120} />
           </div>

           <div className="h-12 w-12 md:h-16 md:w-16 rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-xl border-2 bg-destructive/10 text-destructive border-destructive/20">
             <CategoryIcon name={gasto.categoria} className="h-6 w-6 md:h-8 md:w-8" />
           </div>

           <h3 className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1 text-center">
             {gasto.descricao}
           </h3>
           
           <div className="text-2xl md:text-4xl font-black mb-2 md:mb-3 transition-all text-destructive">
             - {formatCurrency(gasto.valor)}
           </div>

           <div className="flex items-center gap-1.5 md:gap-2">
             <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
               Saída
             </Badge>
             <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
               Lançamento Rápido
             </Badge>
           </div>
        </div>

        {/* Informações Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-muted/10 border border-white/5 space-y-0.5 md:space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-0.5 md:mb-1">
              <Calendar className="h-3 md:h-3.5 w-3 md:w-3.5" />
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider">Data do Gasto</span>
            </div>
            <p className="text-xs md:text-sm font-semibold">{gasto.data}</p>
          </div>

          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-muted/10 border border-white/5 space-y-0.5 md:space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-0.5 md:mb-1">
              <Clock className="h-3 md:h-3.5 w-3 md:w-3.5" />
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider">Horário</span>
            </div>
            <p className="text-xs md:text-sm font-semibold">{gasto.hora}</p>
          </div>
        </div>

        <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-muted/10 border border-white/5 space-y-0.5 md:space-y-1 w-full">
          <div className="flex items-center gap-2 text-muted-foreground mb-0.5 md:mb-1">
            <Tag className="h-3 md:h-3.5 w-3 md:w-3.5" />
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider">Categoria Vinculada</span>
          </div>
          <p className="text-xs md:text-sm font-semibold">{gasto.categoria || "Sem Categoria"}</p>
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
          <Button
            className="flex-[2] h-10 md:h-12 rounded-xl md:rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs md:text-sm"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 md:h-4 w-3.5 md:w-4 mr-1.5 md:mr-2" />
            Editar Gasto
          </Button>
        </div>
      </div>
    </PremiumModal>
  )
}