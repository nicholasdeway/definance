"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CurrencyInput } from "@/components/ui/currency-input"
import { PremiumModal } from "@/components/ui/premium-modal"
import { useCategories } from "@/lib/category-context"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"
import { TrendingUp, Loader2, Save, Plus } from "lucide-react"
import { toCents } from "@/lib/currency"

export interface ReceitaFormState {
  id: string
  nome: string
  valor: string
  tipo: string
  outroTipo: string
  data: string
  hora: string
  recorrente: boolean
  descricao: string
  observacoes: string
}

interface ReceitaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => Promise<void>
  initialData: any | null
  isSaving: boolean
}

export const ReceitaDialog = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  isSaving
}: ReceitaDialogProps) => {
  const { categories } = useCategories()
  const isMobile = useIsMobile()
  
  const [formData, setFormData] = useState<ReceitaFormState>({
    id: "",
    nome: "",
    valor: "",
    tipo: "",
    outroTipo: "",
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
    recorrente: false,
    descricao: "",
    observacoes: ""
  })

  // Lista final consolidada (Apenas API - Única)
  const todasCategorias = Array.from(new Set(
    categories
      .filter(c => c.type === "Entrada" || c.type === "Ambos")
      .map(c => c.name.trim())
  ))

  useEffect(() => {
    if (initialData) {
      // Normalizar tipo inicial para CLT/PJ se necessário
      let initialTipo = initialData.tipo || ""
      const loweredTipo = initialTipo.toLowerCase().trim()
      if (loweredTipo === "clt" || loweredTipo === "pj") {
        initialTipo = loweredTipo.toUpperCase()
      }

      // Verificar se é uma categoria customizada (sem ignorar case)
      const exactMatch = todasCategorias.find(c => c.toLowerCase() === initialTipo.toLowerCase())
      const isCustomType = initialTipo && !exactMatch && initialTipo !== "Outros"
      
      setFormData({
        id: initialData.id || "",
        nome: initialData.nome || "",
        valor: initialData.valor ? toCents(initialData.valor).toString() : "",
        tipo: isCustomType ? "Outros" : (exactMatch || "Outros"),
        outroTipo: isCustomType ? initialTipo : "",
        data: initialData.data ? (() => {
          const parts = initialData.data.split("/")
          if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
          return initialData.data
        })() : new Date().toISOString().split('T')[0],
        hora: initialData.hora || new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
        recorrente: initialData.recorrente ?? false,
        descricao: initialData.descricao || "",
        observacoes: initialData.observacoes || ""
      })
    } else {
      setFormData({
        id: "",
        nome: "",
        valor: "",
        tipo: "",
        outroTipo: "",
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
        recorrente: false,
        descricao: "",
        observacoes: ""
      })
    }
  }, [initialData, open, categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dataToSave = {
      ...formData,
      tipo: formData.tipo === "Outros" ? (formData.outroTipo || "Outros") : formData.tipo,
      description: formData.descricao || null,
      notes: formData.observacoes || null
    }
    onSave(dataToSave)
  }

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? 'Editar Receita' : 'Nova Receita'}
      description={initialData ? 'Ajuste os detalhes deste recebimento.' : 'Preencha as informações para registrar uma nova entrada no seu caixa.'}
      icon={<TrendingUp className="h-8 w-8 text-primary" />}
    >
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-8 h-full flex flex-col">
        <div className="flex-1 space-y-2.5 md:space-y-6">
          {/* Nome / Descrição */}
          <div className="space-y-0.5">
            <Label htmlFor="nome" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Nome / Descrição</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Salário..."
              className="h-8 md:h-12 text-[10px] md:text-lg bg-muted/20 border-white/5 rounded-lg md:rounded-2xl px-2 md:px-5 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
            {/* Valor */}
            <div className="flex-1 space-y-0.5">
              <Label htmlFor="valor" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Valor</Label>
              <CurrencyInput
                id="valor"
                value={formData.valor}
                onChange={(val) => setFormData({ ...formData, valor: val })}
                placeholder="0,00"
                className="h-8 md:h-12 text-xs md:text-2xl font-black bg-primary/5 border-primary/10 text-primary rounded-lg md:rounded-2xl pl-9 md:pl-12 pr-1 md:pr-5 focus:ring-primary/20"
                required
              />
            </div>

            {/* Data e Hora */}
            <div className="flex-1 flex gap-2 md:gap-6">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="data" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="h-8 md:h-12 text-[10px] bg-muted/20 border-white/5 rounded-lg md:rounded-2xl px-1 md:px-5 transition-all"
                  required
                />
              </div>
              <div className="w-[70px] md:w-[120px] space-y-0.5">
                <Label htmlFor="hora" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="h-8 md:h-12 text-[10px] bg-muted/20 border-white/5 rounded-lg md:rounded-2xl px-1 md:px-5 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
            {/* Categoria da Receita - Agora com mesma aparência do Switch */}
            <div className="flex-1 space-y-0.5">
              <Label htmlFor="tipo" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Categoria
              </Label>
              <div className="flex items-center justify-between rounded-lg md:rounded-2xl border border-white/5 bg-muted/20 h-8 md:h-12 px-1.5 md:px-5 shadow-sm overflow-hidden">
                <span className={cn(
                  "font-medium text-muted-foreground min-w-0 mr-1 truncate",
                  isMobile ? "text-[10px]" : "text-sm"
                )}>
                  {formData.tipo === "Outros" && formData.outroTipo 
                    ? formData.outroTipo 
                    : formData.tipo || (isMobile ? "Categoria" : "Selecione uma categoria")}
                </span>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(val) => setFormData({ ...formData, tipo: val })}
                >
                  <SelectTrigger className={cn(
                    "w-auto shrink-0 border-0 !bg-transparent p-0 shadow-none hover:!bg-transparent focus:ring-0 cursor-pointer transition-colors text-primary/80 hover:text-primary gap-0.5",
                    isMobile ? "h-4.5 ml-2 text-[8px] [&_svg]:size-2.5" : "h-auto ml-4 text-sm [&_svg]:size-4"
                  )}>
                    <SelectValue placeholder={isMobile ? "Sel." : "Selecionar"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
                    {todasCategorias.sort().map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-[11px] md:text-sm py-1 md:py-1.5 px-2">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recorrência Switch */}
            <div className="flex-1 space-y-0.5">
              <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Recorrência</Label>
              <div className="flex items-center justify-between rounded-lg md:rounded-2xl border border-white/5 bg-muted/20 h-8 md:h-12 px-1.5 md:px-5 shadow-sm">
                <span className={isMobile ? "text-[9px] font-medium text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>
                  {isMobile ? "Recorrente" : "Receita Recorrente"}
                </span>
                <Switch
                  className={isMobile ? "scale-[0.6] origin-right" : "scale-100"}
                  checked={formData.recorrente}
                  onCheckedChange={(val) => setFormData({ ...formData, recorrente: val })}
                />
              </div>
            </div>
          </div>

          {/* Seção de Detalhes (Opcional) */}
          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6 pt-2 md:pt-4 border-t border-white/5">
            {/* Descrição Detalhada */}
            <div className="flex-1 space-y-0.5">
              <Label htmlFor="income-descricao" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Descrição
              </Label>
              <div className="relative group">
                <Input
                  id="income-descricao"
                  placeholder="Ex: Referente ao projeto X, venda de produto..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className={cn(
                    "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all focus:bg-muted/30",
                    isMobile ? "h-8 text-[10px] px-2" : "h-12 text-sm px-5"
                  )}
                />
              </div>
            </div>

            {/* Observações */}
            <div className="flex-1 space-y-0.5">
              <Label htmlFor="income-obs" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Observações
              </Label>
              <div className="relative group">
                <Input
                  id="income-obs"
                  placeholder="Ex: Receber até dia 10, lembrete importante..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className={cn(
                    "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                    isMobile ? "h-8 text-[10px] px-2" : "h-12 text-sm px-5"
                  )}
                />
              </div>
            </div>
          </div>

          {formData.tipo === "Outros" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="outroTipo" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Especifique a categoria</Label>
              <div className="relative group">
                <Input
                  id="outroTipo"
                  value={formData.outroTipo}
                  onChange={(e) => setFormData({ ...formData, outroTipo: e.target.value })}
                  placeholder="Ex: Reembolso, Presente, Venda de Item..."
                  className="h-12 bg-muted/20 border-white/5 rounded-2xl px-5 transition-all focus:bg-muted/30"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-primary/40 transition-colors">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 md:pt-6 border-t border-white/5 flex items-center justify-end gap-2 md:gap-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1 md:flex-none min-w-[100px] md:min-w-[140px] h-9 md:h-12 text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-white/5"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving} 
            className="flex-1 md:flex-none min-w-[100px] md:min-w-[140px] h-9 md:h-12 bg-primary text-primary-foreground text-xs md:text-sm font-bold rounded-lg md:rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {initialData ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </PremiumModal>
  )
}