const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api-proxy"



// Cache de promessas em voo para evitar requisições duplicadas simultâneas
const pendingRequests = new Map<string, Promise<any>>()

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
    // Desabilitar cache para garantir dados sempre atualizados
    cache: options.method === "GET" || !options.method ? "no-store" : "default"
  }

  // Importante: incluir credenciais para cookies HttpOnly no navegador
  if (typeof window !== "undefined") {
    defaultOptions.credentials = "include"
  }

  // Só deduplicamos requisições GET
  const cacheKey = `${options.method || 'GET'}:${endpoint}`
  const isGet = !options.method || options.method.toUpperCase() === 'GET'

  if (isGet && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<T>
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, defaultOptions)

    if (!response.ok) {
      // Interceptador de 401
      if (response.status === 401 && !isServer) {
        // Notifica o sistema globalmente que a sessão caiu (Logout Silencioso)
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.dispatchEvent(new CustomEvent("auth:logout"))
        }
        
        throw new Error("Não autenticado")
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
    } catch (error: any) {
      // 1. Interceptar erros de rede diretos (o famoso 'Failed to fetch')
      if (
        error.name === 'TypeError' && 
        (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('failed'))
      ) {
        throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente em instantes.")
      }

      // 1.5 Interceptar erros de proxy do Next.js (quando o backend está offline)
      if (error instanceof Error && (error.message.includes("Internal Server Error") || error.message.includes("Bad Gateway") || error.message.includes("Service Unavailable"))) {
        throw new Error("Não foi possível comunicar com o servidor no momento. Tente novamente em instantes.")
      }

      // 2. Se já for um erro que nós tratamos (com mensagem amigável), só repassa
      if (error instanceof Error && error.message === "Não autenticado") {
        throw error
      }

      // 3. Caso contrário, repassa o erro original ou uma mensagem genérica
      throw error
    } finally {
      if (isGet) pendingRequests.delete(cacheKey)
    }
  })()

  if (isGet) pendingRequests.set(cacheKey, fetchPromise)
  
  return fetchPromise
}