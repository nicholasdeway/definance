"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
  prefix?: string
}

export function CurrencyInput({
  value,
  onChange,
  prefix = "R$",
  className,
  ...props
}: CurrencyInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const formatDisplay = (val: string): string => {
    if (!val) return ""
    const numericValue = parseInt(val.replace(/\D/g, ""), 10)
    if (isNaN(numericValue)) return ""

    return (numericValue / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cursorPosition = e.target.selectionStart
    const originalLength = e.target.value.length
    
    // Remove tudo que não é dígito
    let digits = e.target.value.replace(/\D/g, "")
    
    // Se o usuário apagou tudo
    if (!digits) {
      onChange("")
      return
    }

    // Lógica para evitar que "00" iniciais fiquem travados
    digits = parseInt(digits, 10).toString()

    onChange(digits)

    // Ajuste de cursor básico
    setTimeout(() => {
      if (inputRef.current) {
        const newLength = inputRef.current.value.length
        const newSelectionStart = (cursorPosition || 0) + (newLength - originalLength)
        inputRef.current.setSelectionRange(newSelectionStart, newSelectionStart)
      }
    }, 0)
  }

  const displayValue = formatDisplay(value)

  return (
    <div className="relative group/input">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/60 group-focus-within/input:text-primary transition-colors">
        {prefix}
      </span>
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={cn(
          "pl-10 font-mono font-medium focus:ring-1 focus:ring-primary/20", 
          className
        )}
        placeholder="0,00"
        {...props}
      />
    </div>
  )
}
