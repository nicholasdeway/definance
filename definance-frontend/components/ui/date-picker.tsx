"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: string | Date
  onChange: (date: string) => void
  placeholder?: string
  className?: string
  size?: "sm" | "default" | "lg"
}

export function DatePicker({
  date,
  onChange,
  placeholder = "Selecionar data",
  className,
  size = "default"
}: DatePickerProps) {
  const selectedDate = React.useMemo(() => {
    if (!date) return undefined
    if (date instanceof Date) return date
    try {
      const parsed = parseISO(date)
      return isValid(parsed) ? parsed : undefined
    } catch {
      return undefined
    }
  }, [date])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-muted/20 border-border/50 transition-all",
            size === "sm" ? "h-7 px-2 text-[10px]" : size === "lg" ? "h-12 px-5 text-base" : "h-9 px-3 text-sm",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className={cn("shrink-0 text-primary opacity-50", size === "sm" ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} />
          <span className="truncate">
            {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl border-border/50 bg-popover shadow-xl" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "yyyy-MM-dd"))
            }
          }}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
