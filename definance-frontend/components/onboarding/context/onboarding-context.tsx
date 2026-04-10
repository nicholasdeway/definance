"use client"

import React, { createContext } from "react"
import { useOnboardingState, OnboardingState } from "../hooks/use-onboarding-state"

const OnboardingContext = createContext<OnboardingState | undefined>(undefined)

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const state = useOnboardingState()

  return (
    <OnboardingContext.Provider value={state}>
      {children}
    </OnboardingContext.Provider>
  )
}

export { OnboardingContext }