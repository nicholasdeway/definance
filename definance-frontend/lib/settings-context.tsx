"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface SettingsContextType {
  discreetMode: boolean
  setDiscreetMode: (value: boolean) => void
  showOverdueAlerts: boolean
  setShowOverdueAlerts: (value: boolean) => void
  showSetupAlerts: boolean
  setShowSetupAlerts: (value: boolean) => void
  showDueSoonAlerts: boolean
  setShowDueSoonAlerts: (value: boolean) => void
  showBudgetAlerts: boolean
  setShowBudgetAlerts: (value: boolean) => void
  showSpendingAlerts: boolean
  setShowSpendingAlerts: (value: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [discreetMode, setDiscreetModeState] = useState(false)
  const [showOverdueAlerts, setShowOverdueAlertsState] = useState(true)
  const [showSetupAlerts, setShowSetupAlertsState] = useState(true)
  const [showDueSoonAlerts, setShowDueSoonAlertsState] = useState(true)
  const [showBudgetAlerts, setShowBudgetAlertsState] = useState(true)
  const [showSpendingAlerts, setShowSpendingAlertsState] = useState(true)

  useEffect(() => {
    const savedDiscreet = localStorage.getItem("discreetMode")
    if (savedDiscreet !== null) setDiscreetModeState(savedDiscreet === "true")

    const savedOverdue = localStorage.getItem("showOverdueAlerts")
    if (savedOverdue !== null) setShowOverdueAlertsState(savedOverdue === "true")

    const savedSetup = localStorage.getItem("showSetupAlerts")
    if (savedSetup !== null) setShowSetupAlertsState(savedSetup === "true")

    const savedDueSoon = localStorage.getItem("showDueSoonAlerts")
    if (savedDueSoon !== null) setShowDueSoonAlertsState(savedDueSoon === "true")

    const savedBudget = localStorage.getItem("showBudgetAlerts")
    if (savedBudget !== null) setShowBudgetAlertsState(savedBudget === "true")

    const savedSpending = localStorage.getItem("showSpendingAlerts")
    if (savedSpending !== null) setShowSpendingAlertsState(savedSpending === "true")
  }, [])

  const setDiscreetMode = (value: boolean) => {
    setDiscreetModeState(value)
    localStorage.setItem("discreetMode", String(value))
  }

  const setShowOverdueAlerts = (value: boolean) => {
    setShowOverdueAlertsState(value)
    localStorage.setItem("showOverdueAlerts", String(value))
  }

  const setShowSetupAlerts = (value: boolean) => {
    setShowSetupAlertsState(value)
    localStorage.setItem("showSetupAlerts", String(value))
  }

  const setShowDueSoonAlerts = (value: boolean) => {
    setShowDueSoonAlertsState(value)
    localStorage.setItem("showDueSoonAlerts", String(value))
  }

  const setShowBudgetAlerts = (value: boolean) => {
    setShowBudgetAlertsState(value)
    localStorage.setItem("showBudgetAlerts", String(value))
  }

  const setShowSpendingAlerts = (value: boolean) => {
    setShowSpendingAlertsState(value)
    localStorage.setItem("showSpendingAlerts", String(value))
  }

  return (
    <SettingsContext.Provider value={{
      discreetMode,
      setDiscreetMode,
      showOverdueAlerts,
      setShowOverdueAlerts,
      showSetupAlerts,
      setShowSetupAlerts,
      showDueSoonAlerts,
      setShowDueSoonAlerts,
      showBudgetAlerts,
      setShowBudgetAlerts,
      showSpendingAlerts,
      setShowSpendingAlerts,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}