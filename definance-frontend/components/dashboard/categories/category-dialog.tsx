"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Category } from "@/lib/category-context"
import { cn } from "@/lib/utils"
import { Check, Tag, X, TrendingUp, Save, Loader2 } from "lucide-react"
import { CurrencyInput } from "@/components/ui/currency-input"
import { PremiumModal } from "@/components/ui/premium-modal"
import { useIsMobile } from "@/components/ui/use-mobile"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => Promise<void>
  initialData?: Category | null
  isSaving: boolean
}

const PRESET_COLORS = [
  "#F97316", "#22C55E", "#3B82F6", "#A855F7", "#EAB308", 
  "#FACC15", "#EF4444", "#10B981", "#06B6D4", "#64748b"
]

export function CategoryDialog({ open, onOpenChange, onSave, initialData, isSaving }: CategoryDialogProps) {
  const isMobile = useIsMobile()
  const [name, setName] = useState("")
  const [type, setType] = useState<"Entrada" | "Saída" | "Ambos">("Saída")
  const [color, setColor] = useState("#64748b")
  const [keywordInput, setKeywordInput] = useState("")
  const [keywordList, setKeywordList] = useState<string[]>([])
  const [limit, setLimit] = useState("")

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name)
        setType(initialData.type)
        setColor(initialData.color || "#64748b")
        setKeywordList(initialData.keywords ? initialData.keywords.split(",").filter(k => k) : [])
        setLimit(initialData.monthlyLimit ? (initialData.monthlyLimit * 100).toString() : "")
      } else {
        setName("")
        setType("Saída")
        setColor("#64748b")
        setKeywordList([])
        setLimit("")
      }
      setKeywordInput("")
    }
  }, [initialData, open])

  const handleSave = () => {
    if (!name.trim()) return

    onSave({ 
      name, 
      type, 
      color, 
      icon: "Tag",
      keywords: keywordList.join(","),
      monthlyLimit: limit ? parseFloat(limit) / 100 : null
    })
  }

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywordList.includes(keywordInput.trim().toLowerCase())) {
      setKeywordList([...keywordList, keywordInput.trim().toLowerCase()])
      setKeywordInput("")
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setKeywordList(keywordList.filter(k => k !== keyword))
  }

  return (
    <PremiumModal
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Editar Categoria" : "Nova Categoria"}
      description={initialData ? "Atualize as configurações desta categoria." : "Crie uma categoria para organizar seus lançamentos."}
      icon={<Tag className="h-8 w-8 text-primary" />}
    >
      <div className={cn("flex flex-col h-full", isMobile ? "space-y-4" : "space-y-8")}>
        <div className={cn("flex-1", isMobile ? "space-y-4" : "space-y-6")}>
          
          {/* Nome da Categoria */}
          <div className="space-y-0.5 sm:space-y-2">
            <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
              Nome da Categoria
            </Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Alimentação, Lazer..."
              className={cn(
                "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                isMobile ? "h-9 text-[11px] px-3" : "h-12 text-lg px-5"
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Tipo */}
            <div className="space-y-0.5 sm:space-y-2">
              <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                Tipo de Uso
              </Label>
              <div className={cn("flex p-1 bg-muted/20 rounded-lg md:rounded-2xl gap-1 border border-white/5", isMobile ? "h-9" : "h-12")}>
                {(["Saída", "Entrada", "Ambos"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "flex-1 font-bold rounded-md md:rounded-xl transition-all cursor-pointer",
                      isMobile ? "text-[10px]" : "text-xs",
                      type === t 
                        ? "bg-background text-white shadow-lg" 
                        : "text-muted-foreground hover:text-white/60"
                    )}
                  >
                    {t === "Saída" ? "Despesa" : t === "Entrada" ? "Receita" : "Ambos"}
                  </button>
                ))}
              </div>
            </div>

            {/* Teto Mensal */}
            <div className="space-y-0.5 sm:space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-primary/60" />
                <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Teto Mensal</Label>
              </div>
              <CurrencyInput 
                value={limit}
                onChange={setLimit}
                placeholder="0,00"
                className={cn(
                  "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl transition-all",
                  isMobile ? "h-9 text-[11px] pl-9" : "h-12 text-lg pl-12"
                )}
              />
            </div>
          </div>

          {/* Palavras-chave */}
          <div className="space-y-2 md:space-y-3">
            <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex justify-between items-center">
              <span>Palavras-chave Automáticas</span>
              <span className="text-[8px] opacity-40 lowercase italic font-medium tracking-normal">Separe por enter</span>
            </Label>
            <div className="flex gap-2">
              <Input 
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                placeholder="Ex: ifood, uber..."
                className={cn(
                  "bg-muted/20 border-white/5 rounded-lg md:rounded-2xl flex-1",
                  isMobile ? "h-9 text-[11px] px-3" : "h-11 text-sm px-4"
                )}
              />
              <Button 
                variant="outline" 
                onClick={handleAddKeyword}
                className={cn("rounded-lg md:rounded-2xl border-white/10 bg-white/5 font-bold hover:bg-white/10", isMobile ? "h-9 px-3 text-[10px]" : "h-11 px-5 text-xs")}
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1.5 min-h-[24px]">
              {keywordList.map((kw) => (
                <div 
                  key={kw} 
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full"
                >
                  <span className="text-[10px] font-bold text-primary">{kw}</span>
                  <button onClick={() => handleRemoveKeyword(kw)} className="text-primary/40 hover:text-primary transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {keywordList.length === 0 && (
                <p className="text-[10px] text-muted-foreground/30 italic">Nenhuma palavra-chave definida.</p>
              )}
            </div>
          </div>

          {/* Cores */}
          <div className="space-y-2 md:space-y-3 pt-2 md:pt-4 border-t border-white/5">
            <Label className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Identidade Visual</Label>
            <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/10 border border-white/5 rounded-xl md:rounded-2xl">
              <div className="flex flex-wrap gap-2.5 flex-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "rounded-full transition-all hover:scale-125 cursor-pointer shrink-0 shadow-lg",
                      isMobile ? "h-5 w-5" : "h-6 w-6",
                      color === c ? "ring-2 ring-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "opacity-70 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="h-6 w-[1px] bg-white/10 mx-1" />
              <div className="relative h-8 w-8 shrink-0">
                <input 
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 h-full w-full bg-transparent cursor-pointer border-none opacity-0"
                />
                <div className="h-full w-full rounded-lg border border-white/20 shadow-inner" style={{ backgroundColor: color }} />
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="pt-4 md:pt-6 border-t border-white/5 flex items-center justify-end gap-3 md:gap-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1 md:flex-none min-w-[100px] h-9 md:h-12 text-[10px] text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-white/5 border border-white/5"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="flex-1 md:flex-none min-w-[120px] h-9 md:h-12 bg-primary text-primary-foreground text-[10px] text-xs md:text-sm font-bold rounded-lg md:rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {initialData ? "Salvar" : "Criar Categoria"}
          </Button>
        </div>
      </div>
    </PremiumModal>
  )
}