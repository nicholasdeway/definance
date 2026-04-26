"use client"

import { TrendingUp } from "lucide-react"

export const EmptyChart = ({ message }: { message: string }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 py-10 animate-in fade-in duration-500">
    <div className="rounded-full bg-muted/30 p-4 border border-dashed border-border/60">
      <TrendingUp className="h-6 w-6 text-muted-foreground/40" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-sm font-semibold text-foreground/80">Sem dados</p>
      <p className="text-[11px] text-muted-foreground/70 max-w-[180px]">
        {message}
      </p>
    </div>
  </div>
)