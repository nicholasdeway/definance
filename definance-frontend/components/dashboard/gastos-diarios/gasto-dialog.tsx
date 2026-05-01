"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CurrencyInput } from "@/components/ui/currency-input"
import { PremiumModal } from "@/components/ui/premium-modal"
import { useCategories } from "@/lib/category-context"
import { ShoppingBag, Loader2, Save, Plus, Calendar as CalendarIcon } from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"

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
  const isMobile = useIsMobile()
  
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
    
    // Captura o horário atual para preservar na edição
    const now = new Date()
    const [y, m, d] = formData.data.split('-').map(Number)
    const selectedDate = new Date(y, m - 1, d)
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds())
    
    const pad = (n: number) => n.toString().padStart(2, '0')
    const localDate = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}T${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}:${pad(selectedDate.getSeconds())}`

    onSave({
      id: formData.id,
      name: formData.nome,
      amount: parseFloat(formData.valor.replace(".", "").replace(",", ".")),
      category: formData.categoria,
      date: localDate,
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
      <form onSubmit={handleSubmit} className={cn("flex flex-col h-full", isMobile ? "space-y-4" : "space-y-8")}>
        <div className={cn("flex-1", isMobile ? "space-y-3" : "space-y-6")}>
          {/* Descrição */}
          <div className="space-y-0.5 sm:space-y-2">
            <Label htmlFor="nome" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
              Descrição do Gasto
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder={isMobile ? "Ex: Almoço, Uber..." : "Ex: Almoço no Centro, Uber Casa..."}
              className={cn(
                "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all focus:bg-muted/30",
                isMobile ? "h-8 text-[11px] px-2" : "h-12 text-lg px-5"
              )}
              required
            />
          </div>

          {/* Valor e Data */}
          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label htmlFor="valor" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Valor
              </Label>
              <CurrencyInput
                id="valor"
                value={formData.valor}
                onChange={(val) => setFormData({ ...formData, valor: val })}
                placeholder="0,00"
                className={cn(
                  "font-black bg-primary/5 border-primary/10 text-primary rounded-lg md:rounded-2xl focus:ring-primary/20",
                  isMobile ? "h-8 text-xs pl-9 pr-1" : "h-12 text-2xl pl-12 pr-5"
                )}
                required
              />
            </div>

            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label htmlFor="data" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                      isMobile ? "h-8 px-2 text-[10px]" : "h-12 px-5 text-sm",
                      !formData.data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className={cn("shrink-0 text-primary opacity-50", isMobile ? "h-3.3 w-3.3 mr-1.5" : "h-4 w-4 mr-2")} />
                    <span className="truncate">
                      {formData.data ? format(parseISO(formData.data), "dd/MM/yy") : "Selecionar data"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data ? parseISO(formData.data) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, data: format(date, "yyyy-MM-dd") })
                      }
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-0.5 sm:space-y-2">
            <Label htmlFor="categoria" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
              Categoria
            </Label>
            <div className={cn(
              "flex items-center justify-between rounded-lg md:rounded-2xl border border-white/5 bg-muted/20 shadow-sm overflow-hidden",
              isMobile ? "h-8 px-1.5" : "h-12 px-5"
            )}>
              <span className={cn(
                "font-medium text-muted-foreground min-w-0 mr-1 truncate",
                isMobile ? "text-[10px]" : "text-sm"
              )}>
                {formData.categoria}
              </span>
              <Select 
                value={formData.categoria} 
                onValueChange={(val) => setFormData({ ...formData, categoria: val })}
              >
                <SelectTrigger className={cn(
                  "w-auto shrink-0 border-0 !bg-transparent p-0 shadow-none hover:!bg-transparent focus:ring-0 cursor-pointer transition-colors text-primary/80 hover:text-primary gap-0.5",
                  isMobile ? "h-4.5 ml-2 text-[8px] [&_svg]:size-2.5" : "h-auto ml-4 text-sm [&_svg]:size-4"
                )}>
                  <SelectValue placeholder={isMobile ? "Sel." : "Selecionar"} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
                  {todasCategorias.sort().map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-[11px] md:text-sm py-1 md:py-1.5 px-2">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
            {initialData ? "Salvar Alterações" : "Criar Gasto"}
          </Button>
        </div>
      </form>
    </PremiumModal>
  )
}