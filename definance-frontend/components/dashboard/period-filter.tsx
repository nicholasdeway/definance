"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { CalendarDays } from "lucide-react"

export type PeriodType = "monthly" | "60_days" | "90_days" | "custom"

export interface PeriodFilterState {
  type: PeriodType
  month: number
  year: number
  startDate?: string
  endDate?: string
}

interface PeriodFilterProps {
  value: PeriodFilterState
  onChange: (value: PeriodFilterState) => void
  children?: React.ReactNode
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

export function PeriodFilter({ value, onChange, children }: PeriodFilterProps) {
  const updateState = (updates: Partial<PeriodFilterState>) => {
    onChange({ ...value, ...updates })
  }

  return (
    <div className="flex flex-row items-center flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto sm:ml-auto">
      <div className="hidden sm:flex items-center text-muted-foreground mr-1">
        <CalendarDays className="h-4 w-4 mr-2" />
        <span className="text-xs font-medium">Período:</span>
      </div>
      
      <Select value={value.type} onValueChange={(v: PeriodType) => updateState({ type: v })}>
        <SelectTrigger className="w-full sm:w-[160px] h-9 bg-card border-border/50 text-[11px] sm:text-sm px-2">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="monthly">Mensal</SelectItem>
          <SelectItem value="60_days">60 dias</SelectItem>
          <SelectItem value="90_days">90 dias</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {value.type === "monthly" && (
        <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
          <Select value={value.month.toString()} onValueChange={(v) => updateState({ month: parseInt(v) })}>
            <SelectTrigger className="flex-1 sm:w-[130px] h-9 bg-card border-border/50 text-[11px] sm:text-sm px-2">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={m} value={(i + 1).toString()} className="text-[11px] sm:text-sm">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
 
          <Select value={value.year.toString()} onValueChange={(v) => updateState({ year: parseInt(v) })}>
            <SelectTrigger className="w-[75px] sm:w-[100px] h-9 bg-card border-border/50 text-[11px] sm:text-sm px-2">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()} className="text-[11px] sm:text-sm">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {value.type === "custom" && (
        <div className="flex items-center gap-1.5 flex-1 sm:w-auto mt-0 sm:mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 sm:w-[140px] h-9 text-[10px] sm:text-xs justify-start text-left font-normal bg-muted/20 border-white/5 rounded-lg transition-all",
                  !value.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="shrink-0 text-primary opacity-50 h-3 w-3 mr-1.5" />
                <span className="truncate">
                  {value.startDate ? format(parseISO(value.startDate), "dd/MM/yy") : "Início"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-[#0a0a0a]" align="start">
              <Calendar
                mode="single"
                selected={value.startDate ? parseISO(value.startDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    updateState({ startDate: format(date, "yyyy-MM-dd") })
                  }
                }}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground text-[10px] shrink-0">até</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 sm:w-[140px] h-9 text-[10px] sm:text-xs justify-start text-left font-normal bg-muted/20 border-white/5 rounded-lg transition-all",
                  !value.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="shrink-0 text-primary opacity-50 h-3 w-3 mr-1.5" />
                <span className="truncate">
                  {value.endDate ? format(parseISO(value.endDate), "dd/MM/yy") : "Fim"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-[#0a0a0a]" align="end">
              <Calendar
                mode="single"
                selected={value.endDate ? parseISO(value.endDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    updateState({ endDate: format(date, "yyyy-MM-dd") })
                  }
                }}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {children && (
        <div className="shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}