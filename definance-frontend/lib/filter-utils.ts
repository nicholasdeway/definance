import { SortOption } from "@/components/dashboard/filter-bar"

export interface FilterableItem {
  id: string | number
  nome: string
  valor: number
  data?: string
  vencimento?: string
  categoria?: string
  tipo?: string
  rawDate?: Date
}

export function filterAndSortItems<T extends FilterableItem>(
  items: T[],
  search: string,
  sortBy: SortOption,
  selectedCategories: string[] = [],
  categoryKey: keyof T = "categoria" as keyof T,
  allCategories: any[] = []
): T[] {
  const searchTerm = search.toLowerCase();

  // 1. Filtragem por busca e categoria
  let filtered = items.filter((item) => {
    const itemCategoryName = (item[categoryKey] as string)?.toLowerCase();

    // Busca nas keywords da categoria se houver correspondência
    const categoryWithKeywords = allCategories.find(c => c.name.toLowerCase() === itemCategoryName);
    const keywordsMatch = categoryWithKeywords?.keywords?.toLowerCase().includes(searchTerm);

    const matchesSearch =
      item.nome.toLowerCase().includes(searchTerm) ||
      (item.categoria && item.categoria.toLowerCase().includes(searchTerm)) ||
      (item.tipo && item.tipo.toLowerCase().includes(searchTerm)) ||
      keywordsMatch;

    const matchesCategory =
      selectedCategories.length === 0 ||
      (item[categoryKey] && selectedCategories.includes(item[categoryKey] as string))

    return matchesSearch && matchesCategory
  })

  // 2. Ordenação
  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "valor-maior":
        return b.valor - a.valor
      case "valor-menor":
        return a.valor - b.valor
      case "nome-az":
        return a.nome.localeCompare(b.nome)
      case "nome-za":
        return b.nome.localeCompare(a.nome)
      case "data-recente": {
        if (a.rawDate && b.rawDate) return b.rawDate.getTime() - a.rawDate.getTime();
        const dateA = parseDate(a.vencimento || a.data || "")
        const dateB = parseDate(b.vencimento || b.data || "")
        return dateB.getTime() - dateA.getTime()
      }
      case "data-antiga": {
        if (a.rawDate && b.rawDate) return a.rawDate.getTime() - b.rawDate.getTime();
        const dateA = parseDate(a.vencimento || a.data || "")
        const dateB = parseDate(b.vencimento || b.data || "")
        return dateA.getTime() - dateB.getTime()
      }
      default:
        return 0
    }
  })
}

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date(0)

  // Formato DD/MM/YYYY
  if (dateStr.includes("/")) {
    const [d, m, y] = dateStr.split("/").map(Number)
    return new Date(y, m - 1, d)
  }

  // Formato YYYY-MM-DD
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? new Date(0) : date
}