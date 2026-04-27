"use client"

import { Category } from "@/lib/category-context"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Lock, Landmark, Wallet, Utensils, Home, CarFront, Palmtree, HeartPulse, BookOpen, TrendingUp, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

const iconMap: Record<string, any> = {
  Utensils, Home, CarFront, Palmtree, HeartPulse, BookOpen, Wallet, TrendingUp, MoreHorizontal, Landmark
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const IconComponent = category.icon && iconMap[category.icon] ? iconMap[category.icon] : MoreHorizontal
  const categoryColor = category.color || "#64748b"

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
      {/* Decorative colored border on the left */}
      <div 
        className="absolute left-0 top-0 h-full w-1.5" 
        style={{ backgroundColor: categoryColor }}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/30"
            style={{ color: categoryColor }}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-semibold text-foreground">{category.name}</h4>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              {category.type === "Ambos" ? "Entrada e Saída" : category.type}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
          {category.isSystem ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50" title="Categoria do Sistema">
              <Lock className="h-4 w-4" />
            </div>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer"
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
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive cursor-pointer"
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