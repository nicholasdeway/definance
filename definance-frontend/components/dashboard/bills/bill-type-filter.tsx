"use client"

import { Pin, Shuffle } from "lucide-react"

type TypeFilter = "Todas" | "Fixa" | "Variável"

interface BillTypeFilterProps {
  currentFilter: TypeFilter
  onFilterChange: (filter: TypeFilter) => void
  filteredCount: number
}

export const BillTypeFilter = ({
  currentFilter,
  onFilterChange,
  filteredCount
}: BillTypeFilterProps) => {
  return (
    <div className="flex items-center gap-1.5 mb-4 flex-wrap">
      <span className="text-xs text-muted-foreground mr-1 font-medium">Tipo:</span>
      {(["Todas", "Fixa", "Variável"] as TypeFilter[]).map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
            currentFilter === f
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          {f === "Fixa" && <Pin className="h-3 w-3" />}
          {f === "Variável" && <Shuffle className="h-3 w-3" />}
          {f}
        </button>
      ))}
      {currentFilter !== "Todas" && (
        <span className="text-xs text-muted-foreground ml-1">
          ({filteredCount} conta{filteredCount !== 1 ? "s" : ""})
        </span>
      )}
    </div>
  )
}