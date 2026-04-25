"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface SettingsContextType {
  discreetMode: boolean
  setDiscreetMode: (value: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [discreetMode, setDiscreetModeState] = useState(false)

  // Carregar do localStorage no início
  useEffect(() => {
    const saved = localStorage.getItem("discreetMode")
    if (saved !== null) {
      setDiscreetModeState(saved === "true")
    }
  }, [])

  const setDiscreetMode = (value: boolean) => {
    setDiscreetModeState(value)
    localStorage.setItem("discreetMode", String(value))
  }

  return (
    <SettingsContext.Provider value={{ discreetMode, setDiscreetMode }}>
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
