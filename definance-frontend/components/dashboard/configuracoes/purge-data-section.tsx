"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  CalendarDays,
  CreditCard,
  Target,
  Tags,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface PurgeItem {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  dataType: string
  warningText: string
}

export default function PurgeDataSection() {
  const [selectedItem, setSelectedItem] = useState<PurgeItem | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const purgeItems: PurgeItem[] = [
    {
      id: "entradas",
      title: "Entradas",
      description: "Excluir todas as receitas registradas na sua conta.",
      icon: ArrowDownLeft,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
      dataType: "incomes",
      warningText: "Esta ação apagará de forma permanente todas as suas receitas (entradas) lançadas. Seus gráficos e relatórios serão recalculados."
    },
    {
      id: "saidas",
      title: "Saídas",
      description: "Excluir todas as despesas lançadas na sua conta.",
      icon: ArrowUpRight,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20",
      dataType: "expenses",
      warningText: "Esta ação apagará de forma permanente todas as suas despesas (saídas) lançadas. Seus gráficos e relatórios serão recalculados."
    },
    {
      id: "historico",
      title: "Histórico",
      description: "Excluir todas as entradas e saídas registradas.",
      icon: History,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
      dataType: "history",
      warningText: "Esta ação é altamente destrutiva e apagará de forma permanente TODAS as receitas e despesas lançadas no sistema. Seu saldo e gráficos serão zerados."
    },
    {
      id: "gastos-diarios",
      title: "Gastos Diários",
      description: "Excluir apenas as despesas do tipo 'Variável'.",
      icon: CalendarDays,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
      dataType: "daily-expenses",
      warningText: "Esta ação apagará permanentemente apenas os gastos rápidos marcados como 'Variável' (como despesas de lanches, combustível do dia, etc.), mantendo faturas e pagamentos fixos intactos."
    },
    {
      id: "minhas-contas",
      title: "Minhas Contas",
      description: "Excluir faturas e boletos registrados na plataforma.",
      icon: CreditCard,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20",
      dataType: "bills",
      warningText: "Esta ação removerá todas as faturas e boletos registrados. Quaisquer despesas lançadas que estejam vinculadas a essas faturas serão mantidas, mas a referência de vinculação de conta será removida."
    },
    {
      id: "metas",
      title: "Metas",
      description: "Excluir metas e objetivos financeiros configurados.",
      icon: Target,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20",
      dataType: "goals",
      warningText: "Esta ação apagará permanentemente todas as suas metas e objetivos financeiros cadastrados. Os pagamentos e faturas associados a essas metas deixarão de fazer referência a elas."
    },
    {
      id: "categorias",
      title: "Categorias",
      description: "Excluir apenas categorias criadas de forma personalizada.",
      icon: Tags,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20",
      dataType: "categories",
      warningText: "Esta ação apagará apenas as categorias customizadas criadas por você. As categorias padrão do sistema não serão afetadas, e transações anteriores que usavam as categorias excluídas permanecerão intocadas."
    }
  ]

  const handleOpenConfirm = (item: PurgeItem) => {
    setSelectedItem(item)
    setIsConfirmOpen(true)
  }

  const handleCloseConfirm = () => {
    if (isLoading) return
    setIsConfirmOpen(false)
    setSelectedItem(null)
  }

  const handlePurge = async () => {
    if (!selectedItem) return

    setIsLoading(true)

    try {
      // 1. Respeitar o tempo de 2~3 segundos de processamento para não encavalar informações no frontend
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // 2. Chamar endpoint da API de exclusão correspondente
      await apiClient(`/api/profile/purge/${selectedItem.dataType}`, {
        method: "DELETE"
      })

      toast.success(`Dados de ${selectedItem.title} excluídos com sucesso.`)

      // 3. Atualizar dashboard instantaneamente através de CustomEvent
      window.dispatchEvent(new CustomEvent("finance-update"))

      setIsConfirmOpen(false)
      setSelectedItem(null)
    } catch (error: unknown) {
      console.error(`Erro ao deletar dados de ${selectedItem.title}:`, error)
      const errorMessage = error instanceof Error ? error.message : `Não foi possível excluir os dados de ${selectedItem.title}.`
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="border-border/50 bg-card/85 dark:bg-card/65 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border flex flex-col h-full col-span-1">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <CardTitle className="text-base text-card-foreground">Limpeza de Dados</CardTitle>
          </div>
          <CardDescription>
            Apague dados específicos de sua conta de forma isolada e segura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="divide-y divide-border/60">
            {purgeItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${item.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-normal max-w-md">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenConfirm(item)}
                      className="text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer rounded-lg px-3 h-8 gap-1.5 transition-all shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpar
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={handleCloseConfirm}>
        <AlertDialogContent className="sm:max-w-md border-border/80 shadow-none">
          <AlertDialogHeader className="gap-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 dark:text-red-400">
              <AlertTriangle className="h-6 w-6 animate-pulse" />
            </div>
            <AlertDialogTitle className="text-center text-lg font-bold text-foreground">
              Confirmar Exclusão de {selectedItem?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-muted-foreground leading-normal mt-1">
              {selectedItem?.warningText}
              <span className="block mt-2 font-semibold text-red-500 dark:text-red-400">
                Esta ação é definitiva e não poderá ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3 mt-4 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseConfirm}
              disabled={isLoading}
              className="h-10 text-xs font-semibold cursor-pointer w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handlePurge}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white h-10 text-xs font-semibold min-w-[130px] cursor-pointer w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 text-white" />
                  Processando...
                </>
              ) : (
                "Confirmar Exclusão"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
