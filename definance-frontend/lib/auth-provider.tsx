"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiClient } from "./api-client"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5137"

function normalizeUser(user: User | null): User | null {
  if (!user) return null
  
  if (user.pictureUrl) {
    if (user.pictureUrl.startsWith("http")) {
      user.avatar = user.pictureUrl
    } else {
      user.avatar = `${BACKEND_URL}${user.pictureUrl}`
    }
  }
  
  return user
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  pictureUrl?: string
  phone?: string | null
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
  updateProfile: (data: { firstName: string; lastName: string; phone?: string | null }) => Promise<{ success: boolean; user?: User; message?: string }>
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<{ success: boolean; message?: string }>
  updateAvatar: (file: Blob | File) => Promise<{ success: boolean; avatarUrl?: string; message?: string }>
  removeAvatar: () => Promise<{ success: boolean; message?: string }>
  logout: (force?: boolean) => void
  isAuthenticated: boolean
  isLoading: boolean
  refreshUser: (silent?: boolean) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ["/", "/login", "/register", "/auth/forgot-password", "/auth/reset-password", "/auth/google/callback"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  const [authError, setAuthError] = useState<string | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  
  const clearAuthError = useCallback(() => setAuthError(null), [])

  const isPublicRoute = useMemo(() => {
    if (!pathname) return true
    return PUBLIC_ROUTES.some(route => 
      route === "/" ? pathname === "/" : pathname.startsWith(route)
    )
  }, [pathname])

  const checkAuth = useCallback(async (silent = false) => {
    if (!silent) setIsAuthLoading(true)
    try {
      const profile = await apiClient<User>("/api/Auth/me")
      setUser(normalizeUser(profile))
    } catch (error: unknown) {
      setUser(null)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage !== "Não autenticado" && errorMessage !== "Sessão expirada") {
        console.error("Auth check failed:", error)
      }
    } finally {
      if (!silent) setIsAuthLoading(false)
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
      // Se não for forçado, mostramos erro mas permitimos que o finally limpe o estado local
      if (!force) {
        setAuthError("Sessão encerrada localmente (API indisponível).")
      }
    } finally {
      setUser(null)
      setIsActionLoading(false)
      // Só recarrega se não estivermos no login para evitar loop
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
  }, [])


  useEffect(() => {
    checkAuth()
  }, [checkAuth])
  
  // Listener para Logout Global (Disparado pelo api-client em caso de 401 fatal)
  useEffect(() => {
    const handleLogoutEvent = () => {
      // Se já estamos em rota pública, apenas limpamos o estado sem forçar redirecionamento
      if (isPublicRoute) {
        setUser(null)
        return
      }
      
      console.warn("Sessão invalidada via evento global. Forçando logout...")
      logout(true)
    }
    
    window.addEventListener("auth:logout", handleLogoutEvent)
    return () => window.removeEventListener("auth:logout", handleLogoutEvent)
  }, [logout, isPublicRoute])

  // 1. Efeito principal de redirecionamento e guards
  useEffect(() => {
    if (isAuthLoading) return

    // 1. Usuário LOGADO tentando acessar login/register
    if (user && (pathname === "/login" || pathname === "/register")) {
      const target = user.hasCompletedOnboarding ? "/dashboard" : "/onboarding"
      if ((pathname as string) !== target) {
        router.push(target)
      }
      return
    }

    // 2. Usuário NÃO LOGADO tentando acessar rota privada
    if (!user && !isPublicRoute) {
      if (pathname !== "/login") {
        router.push("/login")
      }
      return
    }

    // 3. Usuário LOGADO sem onboarding tentando acessar rota privada
    if (user && !isPublicRoute && !user.hasCompletedOnboarding) {
      if (pathname !== "/onboarding") {
        router.push("/onboarding")
      }
      return
    }

    // 4. Usuário LOGADO com onboarding completo tentando acessar /onboarding
    if (user && pathname?.startsWith("/onboarding") && user.hasCompletedOnboarding) {
      if (pathname !== "/dashboard") {
        router.push("/dashboard")
      }
      return
    }
  }, [user, isAuthLoading, pathname, router, isPublicRoute])

  const login = useCallback(async (identifier: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    setIsLoginLoading(true)
    setAuthError(null)
    try {
      await apiClient("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      })
      
      const profile = await apiClient<User>("/api/Auth/me")
      setUser(normalizeUser(profile))
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

    // Validação de Telefone
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
      
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao criar conta"
      setAuthError(message)
      return { success: false, message }
    } finally {
      setIsRegisterLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    window.location.href = `${BACKEND_URL}/api/Auth/google/login`
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



  const updateProfile = useCallback(async (data: { firstName: string; lastName: string; phone?: string | null }): Promise<{ success: boolean; user?: User; message?: string }> => {
    setIsActionLoading(true)
    setAuthError(null)
    try {
      await apiClient("/api/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      })
      await checkAuth(true)
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar perfil"
      setAuthError(message)
      return { success: false, message }
    } finally {
      setIsActionLoading(false)
    }
  }, [checkAuth])

  const changePassword = useCallback(async (data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string }> => {
    setIsActionLoading(true)
    setAuthError(null)
    try {
      await apiClient("/api/profile/password", {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          confirmNewPassword: data.newPassword
        }),
      })
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao alterar senha"
      setAuthError(message)
      return { success: false, message }
    } finally {
      setIsActionLoading(false)
    }
  }, [])

  const updateAvatar = useCallback(async (file: Blob | File): Promise<{ success: boolean; avatarUrl?: string; message?: string }> => {
    setIsActionLoading(true)
    setAuthError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await apiClient<{ pictureUrl: string }>("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })
      
      await checkAuth(true)
      return { success: true, avatarUrl: response.pictureUrl }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar avatar"
      setAuthError(message)
      return { success: false, message }
    } finally {
      setIsActionLoading(false)
    }
  }, [checkAuth])

  const removeAvatar = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    setIsActionLoading(true)
    setAuthError(null)
    try {
      await apiClient("/api/profile/avatar", {
        method: "DELETE",
      })
      await checkAuth(true)
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao remover avatar"
      setAuthError(message)
      return { success: false, message }
    } finally {
      setIsActionLoading(false)
    }
  }, [checkAuth])

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
    updateProfile,
    changePassword,
    updateAvatar,
    removeAvatar,
    logout,
    isAuthenticated: !!user,
    isLoading: isAuthLoading,
    refreshUser: checkAuth
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
    updateProfile,
    changePassword,
    updateAvatar,
    removeAvatar,
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
  updateProfile: async () => ({ success: false }),
  changePassword: async () => ({ success: false }),
  updateAvatar: async () => ({ success: false }),
  removeAvatar: async () => ({ success: false }),
  logout: () => {},
  isAuthenticated: false,
  isLoading: false,
  refreshUser: async () => {}
} as any

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  return context ?? (defaultAuthContext as AuthContextType)
}