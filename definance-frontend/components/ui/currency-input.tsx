"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Limite de dígitos inteiros: permite até 999.999,99 (6 dígitos inteiros + 2 decimais)
const MAX_INTEGER_DIGITS = 9 // ex: 999.999.999 → R$ 999.999.999,99

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

  // Formata uma string de dígitos centavos para exibição pt-BR
  const formatDisplay = (val: string): string => {
    if (!val) return ""
    const digits = val.replace(/\D/g, "")
    if (!digits) return ""
    const cents = parseInt(digits, 10)
    if (isNaN(cents)) return ""
    return (cents / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cursorPosition = e.target.selectionStart
    const originalLength = e.target.value.length

    // 1. Extrai apenas dígitos
    let digits = e.target.value.replace(/\D/g, "")

    // 2. Remove zeros à esquerda
    digits = digits.replace(/^0+/, "") || ""

    // 3. Limita ao número máximo de dígitos (inteiros + 2 decimais)
    const maxDigits = MAX_INTEGER_DIGITS + 2
    if (digits.length > maxDigits) {
      digits = digits.slice(0, maxDigits)
    }

    onChange(digits)

    // 4. Reposiciona cursor
    setTimeout(() => {
      if (inputRef.current) {
        const newLength = inputRef.current.value.length
        const delta = newLength - originalLength
        const newPos = Math.max(0, (cursorPosition ?? 0) + delta)
        inputRef.current.setSelectionRange(newPos, newPos)
      }
    }, 0)
  }

  const displayValue = formatDisplay(value)

  return (
    <div className="relative group/input">
      <div className={cn(
        "pointer-events-none absolute left-0 top-0 bottom-0 flex items-center justify-center transition-colors",
        "w-9 gap-1.5 text-[10px]",
        "md:w-10 md:gap-2 md:text-[11px]"
      )}>
        <span className="font-bold text-muted-foreground/40 group-focus-within/input:text-primary/60">{prefix}</span>
        <span className="h-3 w-[1px] bg-white/10" />
      </div>
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={cn(
          "pl-12 md:pl-14 font-mono font-medium focus:ring-1 focus:ring-primary/20",
          className
        )}
        placeholder="0,00"
        {...props}
      />
    </div>
  )
}