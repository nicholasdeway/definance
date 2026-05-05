"use client"

import { useState, useMemo } from "react"
import { useCategories, Category } from "@/lib/category-context"
import { CategoryCard } from "@/components/dashboard/categories/category-card"
import { CategoryDialog } from "@/components/dashboard/categories/category-dialog"
import { SetLimitDialog } from "@/components/dashboard/categories/set-limit-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Tags, Lock, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

export default function CategoriasPage() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory, refreshCategories } = useCategories()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Category | null }>({
    open: false,
    item: null,
  })

  const [limitDialog, setLimitDialog] = useState<{ open: boolean; item: Category | null }>({
    open: false,
    item: null,
  })
  const [isSavingLimit, setIsSavingLimit] = useState(false)

  const userCategories = useMemo(() => categories.filter(c => !c.isSystem), [categories])
  
  const systemGroups = useMemo(() => {
    const incomeKeywords = ['clt', 'pj', 'autônomo', 'autonomo', 'freelancer', 'salário', 'salario', 'investimentos', 'extra']
    
    const income = categories.filter(c => 
      c.isSystem && incomeKeywords.includes(c.name.toLowerCase())
    )
    
    const lifestyle = categories.filter(c => 
      c.isSystem && !incomeKeywords.includes(c.name.toLowerCase())
    )
    
    return { income, lifestyle }
  }, [categories])

  const handleOpenAdd = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data)
      } else {
        await createCategory(data)
        window.dispatchEvent(new CustomEvent("onboarding:update"))
      }
      setIsDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.item) return
    try {
      setIsDeleting(true)
      const success = await deleteCategory(deleteDialog.item.id)
      if (success) {
        setDeleteDialog({ open: false, item: null })
        window.dispatchEvent(new CustomEvent("onboarding:update"))
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) setEditingCategory(null)
  }

  const handleSaveLimit = async (categoryId: string, limit: number | null) => {
    setIsSavingLimit(true)
    try {
      await apiClient(`/api/categories/${categoryId}/limit`, {
        method: "PATCH",
        body: JSON.stringify({ monthlyLimit: limit }),
      })
      await refreshCategories()
      toast.success(limit ? "Teto mensal definido com sucesso!" : "Teto mensal removido.")
      setLimitDialog({ open: false, item: null })
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar o teto mensal.")
    } finally {
      setIsSavingLimit(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-6 items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tags className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Gerenciar Categorias</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">Personalize como você organiza suas finanças</p>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-primary/70 text-primary-foreground hover:bg-primary cursor-pointer w-full sm:w-auto"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <Alert className="bg-primary/5 border-primary/20 rounded-2xl">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-bold">Dica de Organização</AlertTitle>
        <AlertDescription className="text-muted-foreground text-xs sm:text-sm">
          Categorias personalizadas permitem que você tenha relatórios mais precisos. Categorias do sistema não podem ser editadas para garantir a integridade dos dados base.
        </AlertDescription>
      </Alert>

      {/* User Categories Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Minhas categorias de despesas</h2>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
        ) : userCategories.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-3xl space-y-3">
             <p className="text-muted-foreground italic">Você ainda não criou nenhuma categoria personalizada.</p>
             <Button variant="outline" size="sm" onClick={handleOpenAdd} className="rounded-xl cursor-pointer">Começar agora</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCategories.map(category => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                onEdit={handleOpenEdit}
                onDelete={(c) => setDeleteDialog({ open: true, item: c })}
                onSetLimit={(c) => setLimitDialog({ open: true, item: c })}
              />
            ))}
          </div>
        )}
      </section>

      {/* System Categories: Income & Assets */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Lock className="h-3.5 w-3.5 text-primary/40" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Categorias do Sistema: Renda e Ativos</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
          ) : (
            systemGroups.income.map(category => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                onEdit={() => {}} 
                onDelete={() => {}}
                onSetLimit={(c) => setLimitDialog({ open: true, item: c })}
              />
            ))
          )}
        </div>
      </section>

      {/* System Categories: Lifestyle & Consumption */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Categorias do Sistema: Estilo de Vida e Consumo</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
          ) : (
            systemGroups.lifestyle.map(category => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                onEdit={() => {}} 
                onDelete={() => {}}
                onSetLimit={(c) => setLimitDialog({ open: true, item: c })}
              />
            ))
          )}
        </div>
      </section>

      <CategoryDialog 
        key={editingCategory?.id || "new"}
        open={isDialogOpen}
        onOpenChange={handleOpenChange}
        onSave={handleSave}
        initialData={editingCategory}
        isSaving={isSaving}
      />

      <ConfirmDeleteDialog 
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDelete}
        itemName={deleteDialog.item?.name}
        loading={isDeleting}
      />

      <SetLimitDialog
        open={limitDialog.open}
        onOpenChange={(open) => setLimitDialog({ ...limitDialog, open })}
        category={limitDialog.item}
        onSave={handleSaveLimit}
        isSaving={isSavingLimit}
      />
    </div>
  )
}