"use client"

import { Category } from "@/lib/category-context"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Lock, TrendingUp } from "lucide-react"
import { CategoryIcon } from "@/components/dashboard/shared/category-icon"
import { formatCurrency } from "@/lib/currency"

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onSetLimit?: (category: Category) => void
}

export function CategoryCard({ category, onEdit, onDelete, onSetLimit }: CategoryCardProps) {
  const categoryColor = category.color || "#64748b"

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-3.5 transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
      {/* Decorative colored border on the left */}
      <div 
        className="absolute left-0 top-0 h-full w-1" 
        style={{ backgroundColor: categoryColor }}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div 
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/20"
          >
            <CategoryIcon 
              name={category.icon} 
              color={categoryColor} 
              className="h-4.5 w-4.5"
            />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-foreground leading-tight">{category.name}</h4>
            <div className="flex items-center gap-2">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-bold">
                {category.type === "Ambos" ? "Ambos" : category.type}
              </p>
              {category.monthlyLimit && category.monthlyLimit > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/5 text-blue-400/90 border border-blue-500/10">
                  <TrendingUp className="h-2 w-2" />
                  <span className="text-[9px] font-bold tracking-tight">
                    {formatCurrency(category.monthlyLimit)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 relative z-10">
          {category.isSystem ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer text-muted-foreground/40 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onSetLimit?.(category)
                }}
                title="Definir teto mensal"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/30" title="Categoria do Sistema">
                <Lock className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer text-muted-foreground/40 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onSetLimit?.(category)
                }}
                title="Definir teto mensal"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer text-muted-foreground/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(category);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive cursor-pointer text-muted-foreground/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(category);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Visual background gradient subtle */}
      <div 
        className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] blur-2xl pointer-events-none" 
        style={{ backgroundColor: categoryColor }}
      />
    </div>
  )
}