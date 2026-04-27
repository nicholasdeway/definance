"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/ui/currency-input"
import { PremiumModal } from "@/components/ui/premium-modal"
import { useCategories } from "@/lib/category-context"
import { ShoppingBag, Loader2, Save, Plus } from "lucide-react"

interface GastoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => Promise<void>
  initialData: any | null
  isSaving: boolean
}

export const GastoDialog = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  isSaving
}: GastoDialogProps) => {
  const { categories } = useCategories()
  
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    valor: "",
    categoria: "Outros",
    outroTipo: "",
    data: new Date().toISOString().split('T')[0],
    expenseType: "Variável",
    status: "Pago"
  })

  const todasCategorias = Array.from(new Set(
    categories
      .filter(c => c.type === "Saída" || c.type === "Ambos")
      .map(c => c.name.trim())
  ))

  useEffect(() => {
    if (initialData) {
      // Usar a dataReal (ISO) para o input type="date"
      const formattedDate = initialData.dataReal 
        ? initialData.dataReal.split('T')[0] 
        : new Date().toISOString().split('T')[0]

      // Formatar o valor para o padrão PT-BR que o CurrencyInput reconhece na inicialização
      const formattedValue = initialData.valor 
        ? initialData.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) 
        : ""

      setFormData({
        id: initialData.id || "",
        nome: initialData.descricao || "",
        valor: formattedValue,
        categoria: initialData.categoria || "Outros",
        outroTipo: "",
        data: formattedDate,
        expenseType: initialData.expenseType || "Variável",
        status: initialData.status || "Pago"
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: formData.id,
      name: formData.nome,
      amount: parseFloat(formData.valor.replace(".", "").replace(",", ".")),
      category: formData.categoria,
      date: formData.data,
      expenseType: formData.expenseType,
      status: formData.status
    })
  }

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? 'Editar Gasto' : 'Novo Gasto'}
      description={initialData ? 'Ajuste os detalhes deste lançamento.' : 'Preencha as informações para registrar um novo gasto.'}
      icon={<ShoppingBag className="h-8 w-8 text-primary" />}
    >
      <form onSubmit={handleSubmit} className="space-y-8 h-full flex flex-col">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Descrição do Gasto</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Almoço no Centro, Uber Casa..."
              className="h-12 text-lg bg-muted/20 border-white/5 rounded-2xl px-5 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="valor" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Valor do Gasto</Label>
              <CurrencyInput
                id="valor"
                value={formData.valor}
                onChange={(val) => setFormData({ ...formData, valor: val })}
                placeholder="0,00"
                className="h-12 text-2xl font-black bg-primary/5 border-primary/10 text-primary rounded-2xl pl-8 pr-5 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Data do Gasto</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="h-12 bg-muted/20 border-white/5 rounded-2xl px-5 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Categoria</Label>
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-muted/20 h-12 px-5 shadow-sm">
              <span className="text-sm font-medium text-muted-foreground truncate mr-2">
                {formData.categoria}
              </span>
              <Select 
                value={formData.categoria} 
                onValueChange={(val) => setFormData({ ...formData, categoria: val })}
              >
                <SelectTrigger className="w-auto shrink-0 border-0 bg-white/5 px-3 h-8 rounded-lg shadow-none hover:bg-white/10 focus:ring-0 cursor-pointer transition-colors">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
                  {todasCategorias.sort().map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-6 hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving} 
            className="min-w-[160px] h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </PremiumModal>
  )
}