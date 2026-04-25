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
import { CheckCircle2, Loader2, Calendar } from "lucide-react"

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
              <Calendar className="h-4 w-4 text-primary" />
              Esta conta não possui vencimento. Informe um para continuar:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
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