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
import { AlertCircle } from "lucide-react"

interface OnboardingExitDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function OnboardingExitDialog({ isOpen, onOpenChange, onConfirm }: OnboardingExitDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] border-border/40 bg-background/80 backdrop-blur-xl rounded-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Atenção!</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
            Você ainda não finalizou o onboarding. Se sair agora, seu progresso será salvo, mas você precisará voltar aqui depois para concluir. 
            <br /><br />
            <span className="font-semibold text-foreground">Deseja realmente sair?</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel className="rounded-xl border-border/40 hover:bg-muted cursor-pointer">
            Continuar Configurando
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            Sair mesmo assim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
