import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CurrencyInput } from "@/components/ui/currency-input"
import { TrendingUp, Save, Loader2 } from "lucide-react"
import { Category } from "@/lib/category-context"
import { PremiumModal } from "@/components/ui/premium-modal"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"

interface SetLimitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  onSave: (categoryId: string, limit: number | null) => Promise<void>
  isSaving: boolean
}

export function SetLimitDialog({ open, onOpenChange, category, onSave, isSaving }: SetLimitDialogProps) {
  const isMobile = useIsMobile()
  const [limit, setLimit] = useState("")

  useEffect(() => {
    if (open && category) {
      setLimit(category.monthlyLimit ? (category.monthlyLimit * 100).toString() : "")
    }
  }, [open, category])

  const handleSave = async () => {
    if (!category) return
    const value = limit ? parseFloat(limit) / 100 : null
    await onSave(category.id, value)
  }

  const handleClear = async () => {
    if (!category) return
    setLimit("")
    await onSave(category.id, null)
  }

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title="Teto Mensal"
      description={`Defina um limite de gastos para ${category?.name}.`}
      icon={<TrendingUp className="h-8 w-8 text-primary" />}
    >
      <div className={cn("flex flex-col h-full", isMobile ? "space-y-4" : "space-y-8")}>
        <div className={cn("flex-1", isMobile ? "space-y-4" : "space-y-6")}>
          <div className="space-y-2 md:space-y-3">
            <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
              Valor do Teto Mensal
            </Label>
            <CurrencyInput
              value={limit}
              onChange={setLimit}
              placeholder="0,00"
              className={cn(
                "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all font-bold",
                isMobile ? "h-10 text-base pl-10" : "h-14 text-2xl pl-14"
              )}
            />
            {limit && parseFloat(limit) > 0 && (
              <p className="text-[10px] md:text-xs text-primary/70 italic px-1 font-medium">
                Você será alertado ao atingir {((parseFloat(limit) / 100) * 0.8).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} gastos nesta categoria.
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 md:pt-6 border-t border-white/5 flex items-center justify-end gap-3 md:gap-4">
          {category?.monthlyLimit && (
            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={isSaving}
              className="flex-1 md:flex-none min-w-[100px] h-9 md:h-12 text-[10px] text-xs md:text-sm font-bold rounded-lg md:rounded-xl text-destructive hover:bg-destructive/10 border border-destructive/10 cursor-pointer"
            >
              Remover Teto
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 md:flex-none min-w-[120px] h-9 md:h-12 bg-primary text-primary-foreground text-[10px] text-xs md:text-sm font-bold rounded-lg md:rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Teto
          </Button>
        </div>
      </div>
    </PremiumModal>
  )
}