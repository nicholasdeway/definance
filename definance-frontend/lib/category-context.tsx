"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

export interface Category {
  id: string
  name: string
  type: "Entrada" | "Saída" | "Ambos"
  color: string | null
  icon: string | null
  keywords: string | null
  isSystem: boolean
}

interface CategoryContextType {
  categories: Category[]
  isLoading: boolean
  refreshCategories: () => Promise<void>
  createCategory: (data: Partial<Category>) => Promise<Category | null>
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await apiClient<Category[]>("/api/categories")
      setCategories(data || [])
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const createCategory = async (data: Partial<Category>) => {
    try {
      const response = await apiClient<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify(data),
      })
      if (response) {
        setCategories((prev) => [...prev, response])
        toast.success("Categoria criada com sucesso!")
        return response
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar categoria")
    }
    return null
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      const response = await apiClient<Category>(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      if (response) {
        setCategories((prev) => prev.map((c) => (c.id === id ? response : c)))
        toast.success("Categoria atualizada com sucesso!")
        return response
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar categoria")
    }
    return null
  }

  const deleteCategory = async (id: string) => {
    try {
      await apiClient(`/api/categories/${id}`, { method: "DELETE" })
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success("Categoria excluída com sucesso!")
      return true
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir categoria")
      return false
    }
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoading,
        refreshCategories: fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider")
  }
  return context
}
