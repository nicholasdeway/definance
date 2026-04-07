"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "./api-client"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (data: any) => Promise<{ success: boolean; message?: string }>
  loginWithGoogle: () => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>
  confirmPasswordReset: (data: any) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      const profile = await apiClient<User>("/api/Auth/me")
      setUser(profile)
    } catch (error: any) {
      setUser(null)
      // Não logamos 401 (não autenticado) pois é o estado esperado ao carregar a página deslogado
      if (error.message !== "Não autenticado") {
        console.error("Auth check failed:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (identifier: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    try {
      await apiClient("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      })
      
      await checkAuth()
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: any): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone ? data.phone.replace(/\D/g, "") : null
      }

      await apiClient("/api/Auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      
      await checkAuth()
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    window.location.href = "http://localhost:5137/api/Auth/google/login"
    return true
  }

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    try {
      const response = await apiClient<any>("/api/Auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      return { success: true, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const confirmPasswordReset = async (data: any): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    try {
      const response = await apiClient<any>("/api/Auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return { success: true, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiClient("/api/Auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      router.push("/login")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        requestPasswordReset,
        confirmPasswordReset,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Contexto padrão para SSR e uso fora do provider
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginWithGoogle: async () => false,
  requestPasswordReset: async () => ({ success: false }),
  confirmPasswordReset: async () => ({ success: false }),
  logout: () => {},
  isAuthenticated: false,
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  return context ?? defaultAuthContext
}