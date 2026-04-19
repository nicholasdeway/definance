import { Badge } from "@/components/ui/badge"
import { Landmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface SyncBadgeProps {
  className?: string
}

export function SyncBadge({ className }: SyncBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-primary/5 text-primary border-primary/20 flex items-center gap-1 py-0 px-2 h-5 text-[10px] font-bold uppercase tracking-tighter cursor-default",
        className
      )}
      title="Sincronizado com seu Perfil Financeiro"
    >
      <Landmark className="h-2.5 w-2.5" />
      Perfil
    </Badge>
  )
}
