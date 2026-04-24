"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const updateState = (updates: Partial<PeriodFilterState>) => {
    onChange({ ...value, ...updates })
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <div className="hidden sm:flex items-center text-muted-foreground mr-1">
        <CalendarDays className="h-4 w-4 mr-2" />
        <span className="text-xs font-medium">Período:</span>
      </div>
      
      <Select value={value.type} onValueChange={(v: PeriodType) => updateState({ type: v })}>
        <SelectTrigger className="w-[160px] h-9 bg-card border-border/50 text-xs sm:text-sm">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="monthly">Mensal</SelectItem>
          <SelectItem value="60_days">Últimos 60 dias</SelectItem>
          <SelectItem value="90_days">Últimos 90 dias</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {value.type === "monthly" && (
        <div className="flex items-center gap-2">
          <Select value={value.month.toString()} onValueChange={(v) => updateState({ month: parseInt(v) })}>
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

          <Select value={value.year.toString()} onValueChange={(v) => updateState({ year: parseInt(v) })}>
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
      )}

      {value.type === "custom" && (
        <div className="flex items-center gap-2">
          <Input 
            type="date" 
            value={value.startDate || ""} 
            onChange={(e) => updateState({ startDate: e.target.value })}
            className="w-[150px] sm:w-[160px] h-9 text-xs sm:text-sm"
          />
          <span className="text-muted-foreground text-xs">até</span>
          <Input 
            type="date" 
            value={value.endDate || ""} 
            onChange={(e) => updateState({ endDate: e.target.value })}
            className="w-[150px] sm:w-[160px] h-9 text-xs sm:text-sm"
          />
        </div>
      )}
    </div>
  )
}