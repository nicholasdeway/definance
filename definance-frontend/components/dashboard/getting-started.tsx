"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle2, 
  Circle, 
  ListChecks, 
  ChevronRight, 
  Settings,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useGettingStarted } from "@/hooks/use-getting-started"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export function GettingStarted() {
  const { status, isLoading } = useGettingStarted()
  const [isOpen, setIsOpen] = React.useState(false)

  if (isLoading || !status || status.progressPercentage === 100) return null

  const steps = [
    {
      id: "categories",
      title: "Cadastre suas categorias",
      description: "Organize seus gastos por tipo",
      completed: status.hasCategories,
      href: "/dashboard/categorias"
    },
    {
      id: "transactions",
      title: "Cadastre sua primeira transação",
      description: "Pode ser uma despesa, gasto diário ou receita",
      completed: status.hasTransactions,
      href: "/dashboard/saidas"
    }
  ]

  return (
    <AnimatePresence mode="wait">
      {(status && status.progressPercentage < 100) && (
        <motion.div 
          key="getting-started-widget"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex items-center justify-center h-14 w-14 rounded-full bg-card border border-border shadow-2xl transition-all duration-300",
                  status.progressPercentage === 100 ? "border-primary/50" : "border-border"
                )}
              >
                {/* Circular Progress */}
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-muted/20"
                    strokeWidth="2"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="2"
                    strokeDasharray="100 100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 100 - status.progressPercentage }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Icon */}
                <div className="relative z-10 flex items-center justify-center">
                  <ListChecks className="h-6 w-6 text-foreground" />
                </div>

                {/* Notification Dot */}
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card" />
              </motion.button>
            </PopoverTrigger>
            
            <PopoverContent 
              side="top" 
              align="start" 
              sideOffset={12}
              className="w-[calc(100vw-48px)] sm:w-80 p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                      Primeiros Passos
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Complete as tarefas para aproveitar ao máximo.
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsOpen(false)}
                    className="h-8 px-3 rounded-full text-primary hover:bg-primary/10 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0"
                  >
                    Ocultar
                  </Button>
                </div>

                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Progresso Total</span>
                    <span>{Math.round(status.progressPercentage)}%</span>
                  </div>
                  <Progress value={status.progressPercentage} className="h-1.5 bg-primary/10" />
                </div>

                {/* Steps List */}
                <div className="space-y-2 pt-2">
                  {steps.map((step) => (
                    <Link 
                      key={step.id} 
                      href={step.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "group flex items-start gap-3 sm:gap-4 p-3 rounded-2xl border transition-all active:scale-[0.98]",
                        step.completed 
                          ? "bg-primary/5 border-primary/20 opacity-80" 
                          : "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border/50"
                      )}
                    >
                      <div className="mt-1 shrink-0">
                        {step.completed ? (
                          <div className="bg-primary rounded-full p-1 shadow-lg shadow-primary/20">
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                        ) : (
                          <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-xs sm:text-sm font-semibold leading-tight",
                          step.completed && "line-through text-muted-foreground"
                        )}>
                          {step.title}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">
                          {step.description}
                        </p>
                      </div>
                      {!step.completed && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground self-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-muted/30 p-3 flex justify-center border-t border-border/50">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-70">
                    Plataforma Definance
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
