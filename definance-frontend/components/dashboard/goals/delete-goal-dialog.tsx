"use client"

import { useState } from "react"
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
import { AlertTriangle, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface DeleteGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (deleteTransactions: boolean) => void
  itemName?: string
  loading?: boolean
}

export function DeleteGoalDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  loading,
}: DeleteGoalDialogProps) {
  const [deleteTransactions, setDeleteTransactions] = useState(false)

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    onConfirm(deleteTransactions)
  }

  return (
    <AlertDialog open={open} onOpenChange={(openVal) => {
      if (!openVal) setDeleteTransactions(false) // reset state on close
      onOpenChange(openVal)
    }}>
      <AlertDialogContent className="max-w-[480px]">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center font-bold text-lg">
            Excluir Meta
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-muted-foreground">
            Você está prestes a excluir a meta <strong className="text-foreground">"{itemName}"</strong>. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Seção de escolha de deleção de histórico */}
        <div className="my-4 p-4 rounded-xl border border-border/50 bg-muted/5 space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="delete-tx-checkbox"
              checked={deleteTransactions}
              onCheckedChange={(checked) => setDeleteTransactions(!!checked)}
              className="mt-1 cursor-pointer"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="delete-tx-checkbox"
                className="text-xs font-bold text-foreground cursor-pointer select-none"
              >
                Excluir registros de depósitos associados
              </Label>
              <p className="text-[10.5px] text-muted-foreground/80 font-medium">
                Selecione se deseja remover também todos os registros de depósitos e parcelas vinculados a esta meta dos seus relatórios.
              </p>
            </div>
          </div>

          <div className="border-t border-border/20 pt-2.5">
            <p className="text-[10px] font-medium leading-relaxed transition-all duration-200">
              {deleteTransactions ? (
                <span className="text-destructive/90">
                  ⚠️ <strong>Atenção:</strong> Isso apagará definitivamente todos os depósitos passados da meta do seu histórico financeiro, diminuindo os totais de saídas reportados no painel.
                </span>
              ) : (
                <span className="text-emerald-500/90 dark:text-emerald-400/90">
                  💡 <strong>Nota:</strong> A meta será excluída, mas as movimentações realizadas continuarão salvas nos seus relatórios de gastos como despesas normais.
                </span>
              )}
            </p>
          </div>
        </div>

        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel className="cursor-pointer font-medium" disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[120px] cursor-pointer font-bold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir Meta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
