"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CurrencyInput } from "@/components/ui/currency-input"
import { 
  CalendarRange, 
  Clock, 
  Loader2, 
  LucideIcon, 
  Plane, 
  Car, 
  Home, 
  GraduationCap, 
  Shield, 
  Star, 
  Target, 
  Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, parseCurrencyInput, toCents } from "@/lib/currency"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { Goal, CreateUpdateGoalDto } from "@/lib/goals"
import { PremiumModal } from "@/components/ui/premium-modal"
import { useIsMobile } from "@/components/ui/use-mobile"

interface GoalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreateUpdateGoalDto) => Promise<void>
  meta?: Goal | null
  saving: boolean
}

type Categoria = {
  id: string
  label: string
  icon: LucideIcon
  cor: string
  bgCor: string
}

const CATEGORIAS: Categoria[] = [
  { id: "viagem",   label: "Viagem",   icon: Plane,         cor: "text-blue-400",   bgCor: "bg-blue-400/10"   },
  { id: "veiculo",  label: "Veículo",  icon: Car,           cor: "text-purple-400", bgCor: "bg-purple-400/10" },
  { id: "moradia",  label: "Moradia",  icon: Home,          cor: "text-primary",    bgCor: "bg-primary/10"    },
  { id: "educacao", label: "Educação", icon: GraduationCap, cor: "text-red-400",    bgCor: "bg-red-400/10"    },
  { id: "reserva",  label: "Reserva",  icon: Shield,        cor: "text-yellow-400", bgCor: "bg-yellow-400/10" },
  { id: "outros",   label: "Outros",   icon: Star,          cor: "text-orange-400", bgCor: "bg-orange-400/10" },
]

const FORM_VAZIO = { nome: "", valorAlvo: "", categoria: "outros", reservaMensal: "", diaReserva: "" }

export function GoalFormDialog({ open, onOpenChange, onSave, meta, saving }: GoalFormDialogProps) {
  const isMobile = useIsMobile()
  const [form, setForm] = useState(FORM_VAZIO)
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [monthStart, setMonthStart] = useState<Date>(new Date())
  const [monthEnd, setMonthEnd] = useState<Date>(new Date())

  useEffect(() => {
    if (open) {
      if (meta) {
        const start = parseISO(meta.startDate)
        const end   = parseISO(meta.endDate)
        setForm({
          nome: meta.name,
          valorAlvo: toCents(meta.targetAmount).toString(),
          categoria: meta.category,
          reservaMensal: toCents(meta.monthlyReserve).toString(),
          diaReserva: String(meta.reserveDay),
        })
        setRange({ from: start, to: end })
        setMonthStart(start)
        setMonthEnd(end)
      } else {
        setForm(FORM_VAZIO)
        setRange(undefined)
        setMonthStart(new Date())
        setMonthEnd(new Date())
      }
    }
  }, [open, meta])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.valorAlvo || !range?.from || !range?.to || !form.reservaMensal || !form.diaReserva) return

    await onSave({
      name: form.nome,
      targetAmount: parseCurrencyInput(form.valorAlvo),
      startDate: format(range.from, "yyyy-MM-dd"),
      endDate: format(range.to, "yyyy-MM-dd"),
      category: form.categoria,
      monthlyReserve: parseCurrencyInput(form.reservaMensal),
      reserveDay: parseInt(form.diaReserva) || 5,
    })
  }

  const isRangeValid = range?.from && range?.to && range.to > range.from;
  const isReservaValid = form.reservaMensal && form.reservaMensal !== "0" && form.diaReserva;
  const isFormValid = form.nome && form.valorAlvo && isReservaValid && isRangeValid;

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title={meta ? "Editar Meta" : "Nova Meta"}
      description={meta ? "Atualize as informações do seu objetivo." : "Defina um objetivo financeiro claro."}
      icon={<Target className="h-8 w-8 text-primary" />}
    >
      <form onSubmit={handleSubmit} className={cn("flex flex-col h-full", isMobile ? "space-y-4" : "space-y-8")}>
        <div className={cn("flex-1", isMobile ? "space-y-3" : "space-y-6")}>
          {/* Nome da Meta */}
          <div className="space-y-0.5 sm:space-y-2">
            <Label htmlFor="meta-nome" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
              Nome do Objetivo
            </Label>
            <Input
              id="meta-nome"
              placeholder={isMobile ? "Ex: Europa, Carro..." : "Ex: Viagem para Europa, Carro Novo..."}
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className={cn(
                "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                isMobile ? "h-8 text-[11px] px-2" : "h-12 text-lg px-5"
              )}
            />
          </div>

          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
            {/* Valor Alvo */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label htmlFor="meta-valor" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 md:h-10 md:flex md:items-end md:pb-1">
                {isMobile ? "Alvo" : "Quanto você quer juntar?"}
              </Label>
              <CurrencyInput
                id="meta-valor"
                value={form.valorAlvo}
                onChange={(value) => setForm({ ...form, valorAlvo: value })}
                placeholder="0,00"
                className={cn(
                  "font-black bg-primary/5 border-primary/10 text-primary rounded-lg md:rounded-2xl",
                  isMobile ? "h-8 text-xs pl-8 pr-1" : "h-12 text-2xl pl-12 pr-5"
                )}
              />
            </div>

            {/* Período */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 md:h-10 md:flex md:items-end md:pb-1">Período</Label>
              <div className="grid grid-cols-2 gap-1.5 md:gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full overflow-hidden bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                        isMobile ? "h-8 px-2 text-[10px]" : "h-12 px-4",
                        !range?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarRange className={cn("shrink-0 text-primary", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
                      <span className="truncate">{range?.from ? format(range.from, "dd/MM/yy") : "Início"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={range?.from}
                      onSelect={(d) => setRange(prev => ({ from: d, to: prev?.to }))}
                      month={monthStart}
                      onMonthChange={setMonthStart}
                      locale={ptBR}
                      captionLayout="dropdown"
                      fromYear={new Date().getFullYear()}
                      toYear={new Date().getFullYear() + 20}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full overflow-hidden bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                        isMobile ? "h-8 px-2 text-[10px]" : "h-12 px-4",
                        !range?.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarRange className={cn("shrink-0 text-primary", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
                      <span className="truncate">{range?.to ? format(range.to, "dd/MM/yy") : "Fim"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={range?.to}
                      onSelect={(d) => setRange(prev => ({ from: prev?.from, to: d }))}
                      month={monthEnd}
                      onMonthChange={setMonthEnd}
                      locale={ptBR}
                      captionLayout="dropdown"
                      fromDate={range?.from}
                      toYear={new Date().getFullYear() + 20}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-6">
            {/* Reserva Mensal */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label htmlFor="meta-reserva" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 md:h-10 md:flex md:items-end md:pb-1">
                Reserva Mensal
              </Label>
              <CurrencyInput
                id="meta-reserva"
                value={form.reservaMensal}
                onChange={(value) => setForm({ ...form, reservaMensal: value })}
                placeholder="0,00"
                className={cn(
                  "font-bold bg-muted/20 border-white/5 rounded-lg md:rounded-2xl focus:ring-primary/20",
                  isMobile ? "h-8 text-xs pl-8 pr-1" : "h-12 text-lg pl-12 pr-5"
                )}
              />
            </div>

            {/* Dia da Reserva */}
            <div className="flex-1 space-y-0.5 sm:space-y-2">
              <Label htmlFor="meta-dia" className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 md:h-10 md:flex md:items-end md:pb-1">
                Dia do Depósito
              </Label>
              <div className="relative">
                <Input
                  id="meta-dia"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Ex: 5"
                  className={cn(
                    "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl px-5 transition-all font-mono no-spinner",
                    isMobile ? "h-8 text-[11px]" : "h-12"
                  )}
                  value={form.diaReserva}
                  onChange={(e) => {
                    const val = e.target.value
                    const num = parseInt(val)
                    if (val === "") setForm({ ...form, diaReserva: "" })
                    else if (!isNaN(num) && num >= 1 && num <= 31) setForm({ ...form, diaReserva: String(num) })
                  }}
                />
                {!isMobile && (
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-muted-foreground/40">
                    Todo mês
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Projeção de Reserva */}
          {range?.from && range?.to && form.valorAlvo && parseCurrencyInput(form.valorAlvo) > 0 && (() => {
            const alvo = parseCurrencyInput(form.valorAlvo)
            const diffInMonths = Math.max(1, (range.to.getFullYear() - range.from.getFullYear()) * 12 + (range.to.getMonth() - range.from.getMonth()))
            const sugerido = alvo / diffInMonths
            
            return (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <div className={cn(
                  "flex items-center gap-2 md:gap-4 rounded-xl md:rounded-3xl border border-primary/20 bg-primary/5",
                  isMobile ? "p-2.5" : "p-4"
                )}>
                  <div className={cn(
                    "flex shrink-0 items-center justify-center rounded-lg md:rounded-2xl bg-primary/10",
                    isMobile ? "h-8 w-8" : "h-12 w-12"
                  )}>
                    <Clock className={cn("text-primary", isMobile ? "h-4 w-4" : "h-6 w-6")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5", isMobile ? "text-[7px]" : "text-[10px]")}>
                      Sugestão
                    </p>
                    <p className={cn("font-medium text-foreground truncate", isMobile ? "text-[9px]" : "text-sm")}>
                      Reserve <span className="text-primary font-bold">{formatCurrency(sugerido)}</span>/mês em {diffInMonths} meses.
                    </p>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "rounded-lg md:rounded-xl hover:bg-primary/20 text-primary font-bold uppercase tracking-wider cursor-pointer",
                      isMobile ? "h-6 px-2 text-[8px]" : "h-10 px-4 text-xs"
                    )}
                    onClick={() => setForm({ ...form, reservaMensal: toCents(sugerido).toString() })}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            )
          })()}

          {/* Categoria Grid */}
          <div className="space-y-2 md:space-y-3">
            <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Escolha um Ícone</Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
              {CATEGORIAS.map((cat) => {
                const Icon = cat.icon
                const sel  = form.categoria === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, categoria: cat.id })}
                    className={cn(
                      "flex flex-col items-center gap-1 md:gap-2 rounded-xl md:rounded-2xl border transition-all duration-300 group cursor-pointer",
                      isMobile ? "p-2" : "p-4",
                      sel
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]"
                        : "border-white/5 bg-muted/10 hover:bg-muted/20 hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center rounded-lg md:rounded-xl transition-all duration-300",
                      isMobile ? "h-7 w-7" : "h-10 w-10",
                      sel ? "bg-primary text-primary-foreground rotate-6" : cn(cat.bgCor, cat.cor, "group-hover:scale-110")
                    )}>
                      <Icon className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                    </div>
                    <span className={cn("font-bold uppercase tracking-widest transition-colors", isMobile ? "text-[7px]" : "text-[10px]", sel ? "text-primary" : "text-muted-foreground")}>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
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
            className="flex-1 md:flex-none min-w-[100px] md:min-w-[140px] h-9 md:h-12 bg-primary text-primary-foreground text-xs md:text-sm font-bold rounded-lg md:rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            disabled={saving || !isFormValid}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {meta ? "Salvar" : "Criar"}
          </Button>
        </div>
      </form>
    </PremiumModal>
  )
}