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

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string | null
}

export interface ConfirmResetData {
  email: string
  token: string
  newPassword: string
  confirmNewPassword: string
}

interface AuthResponse {
  message?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>
  loginWithGoogle: () => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>
  confirmPasswordReset: (data: ConfirmResetData) => Promise<{ success: boolean; message?: string }>
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
    } catch (error: unknown) {
      setUser(null)
      const errorMessage = error instanceof Error ? error.message : String(error)
      // Não logamos 401 (não autenticado) pois é o estado esperado ao carregar a página deslogado
      if (errorMessage !== "Não autenticado") {
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao realizar login"
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao criar conta"
      return { success: false, message }
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
      const response = await apiClient<AuthResponse>("/api/Auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      return { success: true, message: response.message }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao solicitar recuperação de senha"
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }

  const confirmPasswordReset = async (data: ConfirmResetData): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    try {
      const response = await apiClient<AuthResponse>("/api/Auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return { success: true, message: response.message }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao redefinir senha"
      return { success: false, message }
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