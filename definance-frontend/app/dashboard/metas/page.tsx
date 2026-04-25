"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Star } from "lucide-react"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { goalsApi, Goal, CreateUpdateGoalDto } from "@/lib/goals"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/ui/spinner"

// Novos componentes
import { GoalCard } from "@/components/dashboard/goals/goal-card"
import { GoalFormDialog } from "@/components/dashboard/goals/goal-form-dialog"
import { DepositDialog } from "@/components/dashboard/goals/deposit-dialog"
import { GoalsSummary } from "@/components/dashboard/goals/goals-summary"

export default function MetasPage() {
  const [metas, setMetas] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center">
          <Spinner className="h-10 w-10 text-primary" />
          <div className="absolute h-10 w-10 border-4 border-primary/20 rounded-full"></div>
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Carregando seus objetivos...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Metas</h1>
            <p className="text-muted-foreground">Acompanhe seus objetivos financeiros</p>
          </div>
          <Button 
            id="btn-nova-meta" 
            className="bg-primary/70 text-primary-foreground hover:bg-primary w-full sm:w-auto cursor-pointer" 
            onClick={() => setModalForm({ open: true, meta: null })}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Meta
          </Button>
        </div>
      </div>

      {/* Progresso Geral */}
      <GoalsSummary 
        totalAcumulado={totalAcumulado} 
        totalAlvo={totalAlvo} 
        progressoGeral={progressoGeral} 
      />

      {/* Grid de metas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metas.map((meta) => (
          <GoalCard 
            key={meta.id} 
            meta={meta} 
            onEdit={(m) => setModalForm({ open: true, meta: m })}
            onDelete={(m) => setDeleteDialog({ open: true, item: m })}
            onDeposit={(m) => setModalDeposito({ open: true, meta: m })}
          />
        ))}

        {metas.length === 0 && !loading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">Nenhuma meta ainda</p>
              <p className="text-muted-foreground max-w-xs">Comece a planejar seus sonhos criando sua primeira meta financeira.</p>
            </div>
            <Button variant="outline" onClick={() => setModalForm({ open: true, meta: null })}>
              Criar minha primeira meta
            </Button>
          </div>
        )}
      </div>

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
    </div>
  )
}