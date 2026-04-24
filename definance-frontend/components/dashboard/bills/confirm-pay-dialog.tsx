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
import { CheckCircle2, Loader2 } from "lucide-react"

interface ConfirmPayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemName?: string
  loading?: boolean
}

export function ConfirmPayDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  loading,
}: ConfirmPayDialogProps) {
  const description = itemName
    ? `Deseja marcar a conta "${itemName}" como paga? Uma despesa será gerada automaticamente em "Saídas".`
    : "Deseja marcar esta conta como paga? Uma despesa será gerada automaticamente em \"Saídas\"."

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">Confirmar Pagamento</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel disabled={loading} className="cursor-pointer">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
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