"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CheckCircle2, Loader2, Calendar as CalendarIcon } from "lucide-react"

interface ConfirmPayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (date?: string) => void
  itemName?: string
  loading?: boolean
  hasDate?: boolean
}

export function ConfirmPayDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  loading,
  hasDate = true,
}: ConfirmPayDialogProps) {
  const [selectedDate, setSelectedDate] = useState("")

  useEffect(() => {
    if (open) setSelectedDate("")
  }, [open])

  const description = itemName
    ? `Deseja marcar a conta "${itemName}" como paga? Uma despesa será gerada automaticamente em "Saídas".`
    : "Deseja marcar esta conta como paga? Uma despesa será gerada automaticamente em \"Saídas\"."

  const isButtonDisabled = loading || (!hasDate && !selectedDate)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">Confirmar Pagamento</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!hasDate && (
          <div className="py-4 space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Esta conta não possui vencimento. Informe um para continuar:
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-muted/20 border-white/5 rounded-xl h-12 transition-all px-5",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="shrink-0 text-primary opacity-50 h-4 w-4 mr-2" />
                  <span className="truncate">
                    {selectedDate ? format(parseISO(selectedDate), "dd/MM/yy") : "Selecionar data de vencimento"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-[#0a0a0a]" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate ? parseISO(selectedDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(format(date, "yyyy-MM-dd"))
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel disabled={loading} className="cursor-pointer">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm(selectedDate || undefined);
            }}
            disabled={isButtonDisabled}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}