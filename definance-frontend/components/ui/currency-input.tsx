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

  // Formata o valor para exibição
  const formatDisplay = (val: string): string => {
    const cleanValue = val.replace(/\D/g, "")
    if (!cleanValue) return ""
    const numericValue = parseInt(cleanValue, 10)
    const formatted = (numericValue / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return formatted
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "")
    onChange(rawValue)
  }

  const displayValue = formatDisplay(value)

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {prefix}
      </span>
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={cn("pl-10", className)}
        placeholder="0,00"
        {...props}
      />
    </div>
  )
}
