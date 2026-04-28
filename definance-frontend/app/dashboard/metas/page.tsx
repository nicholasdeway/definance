"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Star, Loader2, Target, Download } from "lucide-react"
import { BillsAlert } from "@/components/dashboard/bills-alert"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { goalsApi, Goal, CreateUpdateGoalDto } from "@/lib/goals"
import { useToast } from "@/components/ui/use-toast"
import { PeriodFilter, type PeriodFilterState } from "@/components/dashboard/period-filter"
import { ExportPdfDialog } from "@/components/dashboard/export-pdf-dialog"

// Novos componentes
import { GoalCard } from "@/components/dashboard/goals/goal-card"
import { GoalFormDialog } from "@/components/dashboard/goals/goal-form-dialog"
import { DepositDialog } from "@/components/dashboard/goals/deposit-dialog"
import { GoalsSummary } from "@/components/dashboard/goals/goals-summary"

export default function MetasPage() {
  const [metas, setMetas] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [period, setPeriod] = useState<PeriodFilterState>({ type: "monthly", month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const { toast } = useToast()

  // Modais
  const [modalForm, setModalForm] = useState<{ open: boolean; meta: Goal | null }>({ open: false, meta: null })
  const [modalDeposito, setModalDeposito] = useState<{ open: boolean; meta: Goal | null }>({ open: false, meta: null })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Goal | null }>({ open: false, item: null })

  // Fetch metas
  const loadMetas = async () => {
    try {
      setLoading(true)
      const data = await goalsApi.getGoals()
      setMetas(data)
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Tente novamente mais tarde."
      toast({
        title: "Erro ao carregar metas",
        description: message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetas()
  }, [])

  // Totais
  const totalAlvo      = metas.reduce((s, m) => s + m.targetAmount, 0)
  const totalAcumulado = metas.reduce((s, m) => s + m.currentAmount, 0)
  const progressoGeral = totalAlvo > 0 ? (totalAcumulado / totalAlvo) * 100 : 0

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleSaveGoal(data: CreateUpdateGoalDto) {
    try {
      setSaving(true)
      if (modalForm.meta) {
        await goalsApi.updateGoal(modalForm.meta.id, data)
        toast({ title: "Meta atualizada!" })
      } else {
        await goalsApi.createGoal(data)
        toast({ title: "Meta criada com sucesso!" })
      }
      setModalForm({ open: false, meta: null })
      loadMetas()
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Tente novamente."
      toast({
        title: "Erro ao salvar meta",
        description: message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDeposit(amount: number) {
    if (!modalDeposito.meta) return
    try {
      setSaving(true)
      await goalsApi.deposit(modalDeposito.meta.id, { amount })
      toast({ title: "Depósito realizado!" })
      setModalDeposito({ open: false, meta: null })
      loadMetas()
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Tente novamente."
      toast({
        title: "Erro ao depositar",
        description: message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteMeta() {
    if (!deleteDialog.item) return
    try {
      setSaving(true)
      await goalsApi.deleteGoal(deleteDialog.item.id)
      toast({ title: "Meta excluída." })
      setDeleteDialog({ open: false, item: null })
      loadMetas()
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Erro ao excluir meta"
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6 items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Metas</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">Acompanhe seus objetivos financeiros e sonhos</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full">
          <Button
            className="bg-primary/70 text-primary-foreground hover:bg-primary cursor-pointer w-full sm:w-auto h-9 text-xs sm:text-sm font-bold shadow-lg shadow-primary/20"
            onClick={() => setModalForm({ open: true, meta: null })}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Meta
          </Button>

          <PeriodFilter value={period} onChange={setPeriod}>
            <Button
              variant="outline"
              className="h-9 gap-2 hover:bg-primary/5 transition-colors cursor-pointer border-white/10 sm:border-border/50 text-xs sm:text-sm font-medium"
              onClick={() => setIsExportDialogOpen(true)}
              size="sm"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </PeriodFilter>
        </div>
      </div>

      <BillsAlert />

      {loading ? (
        <div className="flex h-[40vh] sm:h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2 sm:gap-4">
            <Loader2 className="h-5 w-5 sm:h-8 sm:w-8 animate-spin text-primary" />
            <p className="text-[11px] sm:text-sm text-muted-foreground/70">Processando...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Progresso Geral */}
          {metas.length > 0 && (
            <GoalsSummary 
              totalAcumulado={totalAcumulado} 
              totalAlvo={totalAlvo} 
              progressoGeral={progressoGeral} 
            />
          )}

          {/* Grid de metas */}
          <div className="grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metas.map((meta) => (
              <GoalCard 
                key={meta.id} 
                meta={meta} 
                onEdit={(m) => setModalForm({ open: true, meta: m })}
                onDelete={(m) => setDeleteDialog({ open: true, item: m })}
                onDeposit={(m) => setModalDeposito({ open: true, meta: m })}
              />
            ))}

            {metas.length === 0 && (
              <div className="col-span-full py-10 sm:py-20 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
                <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl bg-muted/20 border border-white/5 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Star className="h-7 w-7 sm:h-10 sm:w-10 text-primary/40" />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-base sm:text-xl font-bold text-foreground">Nenhuma meta ainda</p>
                  <p className="text-[11px] sm:text-sm text-muted-foreground max-w-[200px] sm:max-w-xs mx-auto font-medium">
                    Comece a planejar seus sonhos criando sua primeira meta financeira.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="h-9 sm:h-11 rounded-xl px-6 sm:px-8 text-[11px] sm:text-sm font-bold border-primary/20 text-primary hover:bg-primary/5 transition-all cursor-pointer"
                  onClick={() => setModalForm({ open: true, meta: null })}
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Criar minha primeira meta
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modais Extraídos */}
      <GoalFormDialog 
        open={modalForm.open}
        onOpenChange={(open) => setModalForm({ ...modalForm, open })}
        onSave={handleSaveGoal}
        meta={modalForm.meta}
        saving={saving}
      />

      <DepositDialog 
        open={modalDeposito.open}
        onOpenChange={(open) => setModalDeposito({ ...modalDeposito, open })}
        onConfirm={handleConfirmDeposit}
        meta={modalDeposito.meta}
        saving={saving}
      />

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteMeta}
        itemName={deleteDialog.item?.name}
        loading={saving}
      />

      <ExportPdfDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        title="Relatório de Metas"
        subtitle={`Deseja exportar as ${metas.length} metas listadas no PDF?`}
        data={metas.map(m => ({
          nome: m.name,
          categoria: m.category,
          acumulado: m.currentAmount,
          alvo: m.targetAmount,
          reservaMensal: m.monthlyReserve,
          concluida: m.isCompleted ? "Sim" : "Não",
        }))}
        columns={[
          { header: "Nome", key: "nome" },
          { header: "Categoria", key: "categoria" },
          { header: "Reserva Mensal", key: "reservaMensal", type: "currency" },
          { header: "Acumulado", key: "acumulado", type: "currency" },
          { header: "Alvo", key: "alvo", type: "currency" },
          { header: "Concluída", key: "concluida" },
        ]}
        fileName={`metas-${period.month}-${period.year}`}
      />
    </div>
  )
}