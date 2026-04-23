"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays } from "lucide-react"

interface MonthYearPickerProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

// Gera anos de 5 anos atrás até 5 anos no futuro
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

export function MonthYearPicker({ month, year, onMonthChange, onYearChange }: MonthYearPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center text-muted-foreground mr-1">
        <CalendarDays className="h-4 w-4 mr-2" />
        <span className="text-xs font-medium">Período:</span>
      </div>
      
      <Select value={month.toString()} onValueChange={(v) => onMonthChange(parseInt(v))}>
        <SelectTrigger className="w-[110px] sm:w-[130px] h-9 bg-card border-border/50 text-xs sm:text-sm">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m, i) => (
            <SelectItem key={m} value={(i + 1).toString()} className="text-xs sm:text-sm">
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
        <SelectTrigger className="w-[85px] sm:w-[100px] h-9 bg-card border-border/50 text-xs sm:text-sm">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()} className="text-xs sm:text-sm">
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}