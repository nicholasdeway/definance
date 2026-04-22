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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CurrencyInput } from "@/components/ui/currency-input"
import { CalendarRange, Clock, Loader2, LucideIcon, Plane, Car, Home, GraduationCap, Shield, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, parseCurrencyInput, toCents } from "@/lib/currency"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { Goal, CreateUpdateGoalDto } from "@/lib/goals"

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

  const handleSubmit = async () => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {meta ? "Editar Meta" : "Nova Meta"}
          </DialogTitle>
          <DialogDescription>
            {meta ? "Atualize as informações do seu objetivo" : "Defina um objetivo financeiro para alcançar"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label htmlFor="meta-nome">
              Nome da meta <span className="text-destructive">*</span>
            </Label>
            <Input
              id="meta-nome"
              placeholder="Ex: Viagem para Europa"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meta-valor">
              Valor alvo <span className="text-destructive">*</span>
            </Label>
            <CurrencyInput
              id="meta-valor"
              value={form.valorAlvo}
              onChange={(value) => setForm({ ...form, valorAlvo: value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>
                Data de Início <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !range?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarRange className="mr-2 h-4 w-4 shrink-0 text-primary" />
                    {range?.from ? format(range.from, "dd/MM/yyyy") : "Início"}
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
            </div>

            <div className="grid gap-2">
              <Label>
                Data de Término <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !range?.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarRange className="mr-2 h-4 w-4 shrink-0 text-primary" />
                    {range?.to ? format(range.to, "dd/MM/yyyy") : "Fim"}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="meta-reserva">
                Reserva mensal <span className="text-destructive">*</span>
              </Label>
              <CurrencyInput
                id="meta-reserva"
                value={form.reservaMensal}
                onChange={(value) => setForm({ ...form, reservaMensal: value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meta-dia">
                Todo dia <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="meta-dia"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Ex: 5"
                  className="font-mono"
                  value={form.diaReserva}
                  onChange={(e) => {
                    const val = e.target.value
                    const num = parseInt(val)
                    if (val === "") {
                      setForm({ ...form, diaReserva: "" })
                    } else if (!isNaN(num) && num >= 1 && num <= 31) {
                      setForm({ ...form, diaReserva: String(num) })
                    }
                  }}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  do mês
                </span>
              </div>
            </div>
          </div>

          {/* Projeção de Reserva (Direta e Inversa) */}
          {range?.from && range?.to && form.valorAlvo && parseCurrencyInput(form.valorAlvo) > 0 && (() => {
            const alvo = parseCurrencyInput(form.valorAlvo)
            const diffInMonths = Math.max(1, (range.to.getFullYear() - range.from.getFullYear()) * 12 + (range.to.getMonth() - range.from.getMonth()))
            const sugerido = alvo / diffInMonths
            
            const reserva = parseCurrencyInput(form.reservaMensal)
            const mesesMeta = reserva > 0 ? Math.ceil(alvo / reserva) : 0

            return (
              <div className="space-y-3">
                {/* Sugestão baseada no prazo */}
                <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sugestão p/ atingir em {diffInMonths} meses:</p>
                    <p className="font-semibold text-foreground">
                      Reserve <span className="text-primary">{formatCurrency(sugerido)}</span> por mês
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto h-7 px-2 text-[10px] hover:bg-primary/20"
                    onClick={() => setForm({ ...form, reservaMensal: toCents(sugerido).toString() })}
                  >
                    Aplicar
                  </Button>
                </div>

                {/* Resultado baseado na reserva atual */}
                {reserva > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs">
                    <span className="text-primary">⚡️</span>
                    <span className="text-muted-foreground">
                      Com <span className="font-semibold text-foreground">{formatCurrency(reserva)}/mês</span>, 
                      você alcança em <span className="font-semibold text-primary">{mesesMeta} {mesesMeta === 1 ? "mês" : "meses"}</span>.
                    </span>
                  </div>
                )}
              </div>
            )
          })()}

          <div className="grid gap-2">
            <Label>Categoria</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIAS.map((cat) => {
                const Icon = cat.icon
                const sel  = form.categoria === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, categoria: cat.id })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all",
                      sel
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", sel ? "bg-primary/20" : cat.bgCor)}>
                      <Icon className={cn("h-4 w-4", sel ? "text-primary" : cat.cor)} />
                    </div>
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-4">
          <div className="flex-1 text-left">
            {!isFormValid && (
              <p className="text-[10px] text-muted-foreground">
                <span className="text-destructive mr-1">*</span> Preencha todos os campos obrigatórios
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={handleSubmit}
              disabled={saving || !isFormValid}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {meta ? "Salvar alterações" : "Criar Meta"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}