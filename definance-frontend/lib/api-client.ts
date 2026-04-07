const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5137"

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isServer = typeof window === "undefined"

  // No client, precisamos de credenciais se estivermos no navegador
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  }

  // Importante: incluir credenciais para cookies HttpOnly
  if (!isServer) {
    defaultOptions.credentials = "include"
  }

  const response = await fetch(`${API_URL}${endpoint}`, defaultOptions)

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Não autenticado")
    }

    const text = await response.text()
    let message = "Ocorreu um erro na requisição"

    try {
      const errorData = JSON.parse(text)
      message = errorData.message || errorData.title || errorData.error || message

      // Caso o ASP.NET Core retorne um objeto de erros do ModelState
      if (errorData.errors && typeof errorData.errors === 'object') {
        const firstError = Object.values(errorData.errors)[0]
        if (Array.isArray(firstError)) message = firstError[0]
      }
    } catch {
      // Se não for JSON, usamos o texto bruto se não estiver vazio
      if (text && text.length < 200) message = text
    }

    throw new Error(message)
  }

  // Logout e outros endpoints podem retornar no-content
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}