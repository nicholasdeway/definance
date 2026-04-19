"use client"

import React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { steps } from "../constants"
import { useOnboarding } from "../hooks/use-onboarding"

export const OnboardingProgress = () => {
  const { currentStep } = useOnboarding()

  return (
    <div className="w-full space-y-4">
      {/* Mobile: Segmented Progress Bar */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">
            Etapa {currentStep} de {steps.length}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="flex gap-1.5 w-full">
          {steps.map((step, i) => {
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div 
                key={step.id} 
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  isCompleted ? "bg-primary shadow-[0_0_8px_rgba(34,197,94,0.2)]" : 
                  isActive ? "bg-primary animate-pulse" : "bg-muted/30"
                )} 
              />
            )
          })}
        </div>
      </div>

      <ol className="hidden md:flex items-center w-full">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id
          const isActive = currentStep === step.id
          const isLast = idx === steps.length - 1
          
          return (
            <li 
              key={step.id} 
              className={cn(
                "flex items-center relative",
                !isLast ? "w-full" : ""
              )}
            >
              <div className="flex flex-col items-center relative group">
                <div 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all duration-500 z-10",
                    isCompleted 
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                      : isActive 
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                        : "bg-muted text-muted-foreground border-2 border-transparent group-hover:border-primary/30"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 animate-in zoom-in duration-300" />
                  ) : (
                    <step.icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
                  )}
                </div>
                <span className={cn(
                  "absolute -bottom-7 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground/40"
                )}>
                  {step.title}
                </span>
              </div>
              
              {!isLast && (
                <div 
                  className={cn(
                    "h-[3px] w-full -mx-1 rounded-full transition-all duration-700 ease-in-out",
                    isCompleted ? "bg-primary shadow-[0_0_10px_rgba(34,197,94,0.2)]" : "bg-muted/20"
                  )} 
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
