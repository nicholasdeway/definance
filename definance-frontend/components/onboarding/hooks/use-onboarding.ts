"use client"

import { useContext } from "react"
import { OnboardingContext } from "../context/onboarding-context"
import { OnboardingState } from "./use-onboarding-state"

export const useOnboarding = (): OnboardingState => {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}