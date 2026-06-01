"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
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

const maskDate = (value: string) => {
  const cleanValue = value.replace(/\D/g, "").slice(0, 8)
  
  if (cleanValue.length <= 2) {
    return cleanValue
  }
  if (cleanValue.length <= 4) {
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`
  }
  return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4)}`
}

export function DatePicker({
  date,
  onChange,
  placeholder = "Selecionar data",
  className,
  size = "default"
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState("")
  const lastEmittedRef = React.useRef("")

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

  React.useEffect(() => {
    if (date && date === lastEmittedRef.current) {
      return
    }
    if (!date) {
      setInputValue("")
      return
    }
    const d = date instanceof Date ? date : parseISO(date)
    if (isValid(d)) {
      setInputValue(format(d, "dd/MM/yyyy"))
    } else {
      if (typeof date === 'string' && date.includes('/')) {
        setInputValue(date)
      } else {
        setInputValue("")
      }
    }
  }, [date])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    const masked = maskDate(rawVal)
    setInputValue(masked)

    if (masked === "") {
      lastEmittedRef.current = ""
      onChange("")
      return
    }

    if (masked.length === 10) {
      const parts = masked.split("/")
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      
      const parsed = new Date(year, month, day)
      
      if (
        isValid(parsed) && 
        parsed.getDate() === day && 
        parsed.getMonth() === month && 
        parsed.getFullYear() === year
      ) {
        const formatted = format(parsed, "yyyy-MM-dd")
        lastEmittedRef.current = formatted
        onChange(formatted)
      } else {
        lastEmittedRef.current = masked
        onChange(masked)
      }
    } else {
      lastEmittedRef.current = masked
      onChange(masked)
    }
  }

  return (
    <Popover>
      <div className="relative flex items-center w-full">
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "absolute left-2.5 flex items-center justify-center text-primary/70 hover:text-primary transition-colors cursor-pointer",
              size === "sm" ? "h-5 w-5" : "h-6 w-6"
            )}
          >
            <CalendarIcon className={cn("shrink-0", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
          </button>
        </PopoverTrigger>
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className={cn(
            "w-full text-left font-normal bg-muted/20 border-border/50 transition-all",
            size === "sm" ? "h-7 pl-8 pr-2 text-[10px] rounded-md" : size === "lg" ? "h-12 pl-11 pr-5 text-base rounded-2xl" : "h-9 pl-10 pr-3 text-sm rounded-xl",
            className
          )}
        />
      </div>
      <PopoverContent className="w-auto p-0 rounded-2xl border-border/50 bg-popover shadow-xl" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => {
            if (d) {
              const formatted = format(d, "yyyy-MM-dd")
              lastEmittedRef.current = formatted
              onChange(formatted)
              setInputValue(format(d, "dd/MM/yyyy"))
            }
          }}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
