const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api-proxy"

// Fila para gerenciar múltiplas requisições durante o refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (reason?: any) => void
  endpoint: string
  options: RequestInit
}> = []

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      // Re-executa a requisição original (cookies já foram atualizados)
      apiClient(prom.endpoint, prom.options)
        .then(prom.resolve)
        .catch(prom.reject)
    }
  })
  failedQueue = []
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isServer = typeof window === "undefined"

  const isFormData = typeof window !== "undefined" && options.body instanceof FormData
  
  // No client, precisamos de credenciais se estivermos no navegador
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    },
  }

  // Importante: incluir credenciais para cookies HttpOnly no navegador
  if (typeof window !== "undefined") {
    defaultOptions.credentials = "include"
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, defaultOptions)

    if (!response.ok) {
      // Interceptador de 401 para Refresh Token
      if (response.status === 401 && !endpoint.includes("/api/Auth/refresh") && !isServer) {
        if (isRefreshing) {
          // Já existe um refresh em curso, enfileira esta requisição
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, endpoint, options })
          })
        }

        isRefreshing = true
        
        try {
          // Tenta renovar o token via cookie
          const refreshResponse = await fetch(`${API_URL}/api/Auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
          })
          
          if (!refreshResponse.ok) {
            throw new Error("Refresh failed")
          }
          
          isRefreshing = false
          processQueue(null)
          
          // Tenta a requisição original novamente
          return apiClient<T>(endpoint, options)
        } catch (refreshError) {
          isRefreshing = false
          processQueue(new Error("Sessão expirada"))
          
          // Notifica o sistema globalmente que a sessão caiu (Logout Silencioso)
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.dispatchEvent(new CustomEvent("auth:logout"))
          }
          
          throw new Error("Não autenticado")
        }
      }

      const text = await response.text()
      let message = "Ocorreu um erro na requisição"

      try {
        const errorData = JSON.parse(text)
        message = errorData.message || errorData.title || errorData.error || message

        if (errorData.errors && typeof errorData.errors === 'object') {
          const firstError = Object.values(errorData.errors)[0]
          if (Array.isArray(firstError)) message = firstError[0]
        }
      } catch {
        if (text && text.length < 200) message = text
      }

      throw new Error(message)
    }

    // Logout e outros endpoints podem retornar no-content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  } catch (error) {
    // Tratamento de erros de rede ou outros
    if (error instanceof Error && error.message === "Não autenticado") {
      throw error
    }
    throw error
  }
}