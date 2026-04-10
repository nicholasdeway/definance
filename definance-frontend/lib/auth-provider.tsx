"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiClient } from "./api-client"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: string
  createdAt: string
  hasCompletedOnboarding: boolean
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
  isAuthLoading: boolean
  isLoginLoading: boolean
  isRegisterLoading: boolean
  isActionLoading: boolean
  authError: string | null
  clearAuthError: () => void
  login: (identifier: string, password: string) => Promise<{ success: boolean; user?: User; message?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; user?: User; message?: string }>
  loginWithGoogle: () => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>
  confirmPasswordReset: (data: ConfirmResetData) => Promise<{ success: boolean; message?: string }>
  logout: (force?: boolean) => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  
  // Estados de Carregamento Segmentados
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  // Estado de Erro
  const [authError, setAuthError] = useState<string | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  
  // Flag para evitar loops de redirecionamento
  const isRedirecting = useRef(false)

  const clearAuthError = useCallback(() => setAuthError(null), [])

  const checkAuth = useCallback(async () => {
    setIsAuthLoading(true)
    try {
      const profile = await apiClient<User>("/api/Auth/me")
      setUser(profile)
    } catch (error: unknown) {
      setUser(null)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage !== "Não autenticado" && errorMessage !== "Sessão expirada") {
        console.error("Auth check failed:", error)
      }
    } finally {
      setIsAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Lógica de Redirecionamento e Guards
  useEffect(() => {
    if (isAuthLoading) return

    const publicRoutes = ["/login", "/register", "/auth/forgot-password", "/auth/reset-password", "/auth/google/callback"]
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Se estivermos redirecionando, aguardamos a rota mudar
    if (isRedirecting.current) return

    // 1. Usuário LOGADO em rota PÚBLICA (login/register)
    if (user && (pathname === "/login" || pathname === "/register")) {
      isRedirecting.current = true
      router.push(user.hasCompletedOnboarding ? "/dashboard" : "/onboarding")
      // Reset da flag após pequeno delay para dar tempo do roteamento iniciar
      setTimeout(() => { isRedirecting.current = false }, 1000)
      return
    }

    // 2. Usuário LOGADO em rota PRIVADA
    if (user && !isPublicRoute) {
      if (!user.hasCompletedOnboarding && pathname !== "/onboarding") {
        isRedirecting.current = true
        router.push("/onboarding")
        setTimeout(() => { isRedirecting.current = false }, 1000)
      } else if (user.hasCompletedOnboarding && pathname === "/onboarding") {
        isRedirecting.current = true
        router.push("/dashboard")
        setTimeout(() => { isRedirecting.current = false }, 1000)
      }
    }
  }, [user, isAuthLoading, pathname, router])

  const login = useCallback(async (identifier: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    setIsLoginLoading(true)
    setAuthError(null)
    try {
      await apiClient("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      })
      
      const profile = await apiClient<User>("/api/Auth/me")
      setUser(profile)
      return { success: true, user: profile }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao realizar login"
      setAuthError(message)
      return { success: false, message }
    } finally {
      setIsLoginLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; user?: User; message?: string }> => {
    setIsRegisterLoading(true)
    setAuthError(null)

    // Validação de Telefone (Correção 10)
    const rawPhone = data.phone ? data.phone.replace(/\D/g, "") : ""
    if (data.phone && (rawPhone.length < 10 || rawPhone.length > 11)) {
      const errorMsg = "Telefone inválido. Use (11) 99999-9999 ou similar."
      setAuthError(errorMsg)
      setIsRegisterLoading(false)
      return { success: false, message: errorMsg }
    }

    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: rawPhone || null
      }

      await apiClient("/api/Auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      
      const profile = await apiClient<User>("/api/Auth/me")
      setUser(profile)
      return { success: true, user: profile }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao criar conta"
      setAuthError(message)
      return { success: false, message }
    } finally {
      setIsRegisterLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    window.location.href = "http://localhost:5137/api/Auth/google/login"
    return true
  }, [])

  const requestPasswordReset = useCallback(async (email: string): Promise<{ success: boolean; message?: string }> => {
    setIsActionLoading(true)
    setAuthError(null)
    try {
      const response = await apiClient<AuthResponse>("/api/Auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      return { success: true, message: response.message }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao solicitar recuperação de senha"
      setAuthError(message)
      return { success: false, message }
    } finally {
      setIsActionLoading(false)
    }
  }, [])

  const confirmPasswordReset = useCallback(async (data: ConfirmResetData): Promise<{ success: boolean; message?: string }> => {
    setIsActionLoading(true)
    setAuthError(null)
    try {
      const response = await apiClient<AuthResponse>("/api/Auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return { success: true, message: response.message }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao redefinir senha"
      setAuthError(message)
      return { success: false, message }
    } finally {
      setIsActionLoading(false)
    }
  }, [])

  const logout = useCallback(async (force = false) => {
    setIsActionLoading(true)
    try {
      if (!force) {
        await apiClient("/api/Auth/logout", { method: "POST" })
      }
    } catch (error) {
      console.error("Logout API failed:", error)
      if (!force) {
        setAuthError("Erro ao sair. Tente novamente ou force a saída.")
        setIsActionLoading(false)
        return
      }
    } finally {
      setUser(null)
      setIsActionLoading(false)
      router.push("/login")
    }
  }, [router])

  const contextValue = useMemo(() => ({
    user,
    isAuthLoading,
    isLoginLoading,
    isRegisterLoading,
    isActionLoading,
    authError,
    clearAuthError,
    login,
    register,
    loginWithGoogle,
    requestPasswordReset,
    confirmPasswordReset,
    logout,
    isAuthenticated: !!user,
    isLoading: isAuthLoading
  }), [
    user, 
    isAuthLoading, 
    isLoginLoading, 
    isRegisterLoading, 
    isActionLoading, 
    authError, 
    clearAuthError, 
    login, 
    register, 
    loginWithGoogle, 
    requestPasswordReset, 
    confirmPasswordReset, 
    logout
  ])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthLoading: false,
  isLoginLoading: false,
  isRegisterLoading: false,
  isActionLoading: false,
  authError: null,
  clearAuthError: () => {},
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginWithGoogle: async () => false,
  requestPasswordReset: async () => ({ success: false }),
  confirmPasswordReset: async () => ({ success: false }),
  logout: () => {},
  isAuthenticated: false,
  isLoading: false
} as any

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  return context ?? (defaultAuthContext as AuthContextType)
}