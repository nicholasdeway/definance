import React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FieldLabelProps {
  label: string
  required?: boolean
  isEmpty?: boolean
  wasAttempted?: boolean
  className?: string
}

export const FieldLabel = ({ 
  label, 
  required = false, 
  isEmpty = false, 
  wasAttempted = false,
  className
}: FieldLabelProps) => (
  <div className={cn("flex items-center justify-between mb-2", className)}>
    <Label className="flex items-center gap-1">
      {label}
      {required && <span className="text-destructive font-bold ml-0.5">*</span>}
    </Label>
    {required && isEmpty && wasAttempted && (
      <span className="text-[10px] text-destructive/80 font-semibold uppercase tracking-tight transition-all duration-300">
        Obrigatório
      </span>
    )}
  </div>
)