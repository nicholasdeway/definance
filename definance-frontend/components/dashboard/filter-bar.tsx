"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, ArrowUpDown, Tag, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

export type SortOption = 
  | "valor-maior" 
  | "valor-menor" 
  | "nome-az" 
  | "nome-za" 
  | "data-recente" 
  | "data-antiga"

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
  categories?: string[]
  selectedCategories?: string[]
  onCategoriesChange?: (categories: string[]) => void
  placeholder?: string
}

export function FilterBar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  categories = [],
  selectedCategories = [],
  onCategoriesChange,
  placeholder = "Buscar..."
}: FilterBarProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  const toggleCategory = (category: string) => {
    if (!onCategoriesChange) return
    const newSelected = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    onCategoriesChange(newSelected)
  }

  const clearFilters = () => {
    onSearchChange("")
    onSortChange("data-recente")
    if (onCategoriesChange) onCategoriesChange([])
  }

  const hasActiveFilters = search !== "" || selectedCategories.length > 0 || sortBy !== "data-recente"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-muted/20 border-border/50 focus-visible:ring-primary h-10 rounded-xl placeholder:text-muted-foreground/50 placeholder:text-xs sm:placeholder:text-sm"
          />
          {search && (
            <button 
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Ordenação */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2 border-border/50 bg-muted/20 rounded-xl flex-1 sm:flex-none">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden lg:inline">Ordenar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>Opções de Ordenação</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
                <DropdownMenuRadioItem value="data-recente" className="rounded-lg">Mais recentes primeiro</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="data-antiga" className="rounded-lg">Mais antigos primeiro</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="valor-maior" className="rounded-lg">Maiores valores</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="valor-menor" className="rounded-lg">Menores valores</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="nome-az" className="rounded-lg">Nome: A-Z</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="nome-za" className="rounded-lg">Nome: Z-A</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Categorias / Produtos */}
          {categories.length > 0 && onCategoriesChange && (
            <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 border-border/50 bg-muted/20 rounded-xl flex-1 sm:flex-none">
                  <Tag className="h-4 w-4" />
                  <span className="hidden lg:inline">Categorias</span>
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1 h-5 min-w-[20px] justify-center bg-primary/20 text-primary border-none">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 rounded-xl overflow-hidden" align="end">
                <Command>
                  <CommandInput placeholder="Buscar categoria..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category}
                          onSelect={() => toggleCategory(category)}
                          className="flex items-center gap-2 cursor-pointer py-2 px-3 m-1 rounded-lg"
                        >
                          <div className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                            selectedCategories.includes(category) 
                              ? "bg-primary text-primary-foreground" 
                              : "opacity-50 [&_svg]:invisible"
                          )}>
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm">{category}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors"
              title="Limpar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Badges de filtros ativos */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mr-1">Filtros:</span>
          {selectedCategories.map(cat => (
            <Badge 
              key={cat} 
              variant="secondary" 
              className="pl-2 pr-1 py-0.5 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-none flex items-center gap-1 group transition-all"
            >
              {cat}
              <button 
                onClick={() => toggleCategory(cat)}
                className="hover:bg-primary/20 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button 
            variant="link" 
            className="h-6 px-2 text-[10px] text-muted-foreground"
            onClick={() => onCategoriesChange?.([])}
          >
            Limpar tudo
          </Button>
        </div>
      )}
    </div>
  )
}
