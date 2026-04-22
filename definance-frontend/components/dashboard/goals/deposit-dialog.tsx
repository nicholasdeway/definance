"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Loader2 } from "lucide-react"
import { formatCurrency, parseCurrencyInput } from "@/lib/currency"
import { Goal } from "@/lib/goals"

interface DepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (amount: number) => Promise<void>
  meta: Goal | null
  saving: boolean
}

export function DepositDialog({ open, onOpenChange, onConfirm, meta, saving }: DepositDialogProps) {
  const [valorDeposito, setValorDeposito] = useState("")

  useEffect(() => {
    if (open) setValorDeposito("")
  }, [open])

  const handleConfirm = async () => {
    const amount = parseCurrencyInput(valorDeposito)
    if (amount <= 0) return
    await onConfirm(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Adicionar Valor</DialogTitle>
          <DialogDescription>
            {meta && (
              <>
                Depositando em <span className="font-medium text-foreground">{meta.name}</span>
                {" — "}
                <span className="text-primary">{formatCurrency(meta.currentAmount)}</span>
                {" de "}
                <span className="font-medium">{formatCurrency(meta.targetAmount)}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="deposito-valor">Valor a depositar</Label>
            <CurrencyInput id="deposito-valor" value={valorDeposito} onChange={setValorDeposito} />
          </div>
          {meta && valorDeposito && parseCurrencyInput(valorDeposito) > 0 && (() => {
            const dep      = parseCurrencyInput(valorDeposito)
            const novoAt   = Math.min(meta.currentAmount + dep, meta.targetAmount)
            const novoPct  = (novoAt / meta.targetAmount) * 100
            return (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Novo total</span>
                  <span className="font-medium text-foreground">{formatCurrency(novoAt)} ({novoPct.toFixed(0)}%)</span>
                </div>
                <Progress value={novoPct} className="h-1.5" />
              </div>
            )
          })()}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            className="bg-primary text-primary-foreground"
            onClick={handleConfirm}
            disabled={saving || !valorDeposito || parseCurrencyInput(valorDeposito) <= 0}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar depósito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}