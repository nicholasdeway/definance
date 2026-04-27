"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Category } from "@/lib/category-context"
import { cn } from "@/lib/utils"
import { Check, Tag, X } from "lucide-react"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => Promise<void>
  initialData?: Category | null
  isSaving: boolean
}

const PRESET_COLORS = [
  "#F97316", "#22C55E", "#3B82F6", "#A855F7", "#EAB308", 
  "#FACC15", "#EF4444", "#10B981", "#06B6D4", "#000000"
]

const ICONS = [
  { name: "Utensils", label: "Alimentação" },
  { name: "Home", label: "Moradia" },
  { name: "CarFront", label: "Transporte" },
  { name: "Palmtree", label: "Lazer" },
  { name: "HeartPulse", label: "Saúde" },
  { name: "BookOpen", label: "Educação" },
  { name: "Wallet", label: "Finanças" },
  { name: "TrendingUp", label: "Investimentos" },
  { name: "Landmark", label: "Bancos" },
  { name: "MoreHorizontal", label: "Outros" }
]

export function CategoryDialog({ open, onOpenChange, onSave, initialData, isSaving }: CategoryDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"Entrada" | "Saída" | "Ambos">("Saída")
  const [color, setColor] = useState("#64748b")
  const [keywordInput, setKeywordInput] = useState("")
  const [keywordList, setKeywordList] = useState<string[]>([])

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setType(initialData.type)
      setColor(initialData.color || "#64748b")
      setKeywordList(initialData.keywords ? initialData.keywords.split(",").filter(k => k) : [])
    } else {
      setName("")
      setType("Saída")
      setColor("#64748b")
      setKeywordList([])
    }
    setKeywordInput("")
  }, [initialData, open])

  const handleSave = () => {
    if (!name.trim()) return

    // Simple regex for name validation matching backend
    const nameRegex = /^[a-zA-Z0-9\sáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/
    if (!nameRegex.test(name)) {
      // We'll let the backend handle the message for now or add a local one
      // But for better UX, let's just send it and the backend will return the message
    }

    onSave({ 
      name, 
      type, 
      color, 
      icon: "Tag",
      keywords: keywordList.join(",")
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

  const handleColorClick = () => {
    document.getElementById("color-picker-input")?.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[1100px] bg-card border-border/20 shadow-2xl p-0 overflow-hidden rounded-[2.5rem]"
        showCloseButton={false}
      >
        {/* Custom Close Button */}
        <DialogClose className="absolute right-8 top-8 h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors z-50 cursor-pointer">
          <X className="h-5 w-5 text-white/70" />
        </DialogClose>

        <DialogHeader className="p-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-5">
            <div className="bg-orange-500/10 p-3.5 rounded-2xl border border-orange-500/20">
              <Tag className="h-7 w-7 text-orange-500" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-2xl font-bold text-white">
                {initialData ? "Editar Categoria" : "Adicionar Categoria"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground/80">
                Gerencie suas categorias
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-0">
          {/* Left Side: Basic Info */}
          <div className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                Dados da Categoria
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Tipo de Categoria</Label>
                <div className="flex p-1 bg-muted/20 rounded-2xl gap-1 border border-white/5">
                  {(["Saída", "Entrada", "Ambos"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        "flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer",
                        type === t 
                          ? "bg-background text-white shadow-xl" 
                          : "text-muted-foreground hover:text-white/60"
                      )}
                    >
                      {t === "Saída" ? "Despesa" : t === "Entrada" ? "Receita" : "Ambos"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Nome da Categoria</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Alimentação, Transporte..."
                  className="bg-muted/20 border-white/5 h-14 rounded-2xl text-lg px-6 focus:ring-orange-500/50 placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                    Palavras-chave <span className="text-[10px] ml-1 opacity-60">(Para identificação automática)</span>
                  </Label>
                </div>
                <div className="flex gap-3">
                  <Input 
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                    placeholder="Digite uma palavra-chave..."
                    className="bg-muted/20 border-white/5 h-14 rounded-2xl text-lg px-6 placeholder:text-muted-foreground/30 flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddKeyword}
                    className="h-14 rounded-2xl px-6 border-white/10 bg-white/5 text-base font-bold hover:bg-white/10 transition-colors"
                  >
                    + Adicionar
                  </Button>
                </div>
                
                {/* Keywords List */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {keywordList.map((kw) => (
                    <div 
                      key={kw} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full group/tag"
                    >
                      <span className="text-xs font-bold text-primary">{kw}</span>
                      <button 
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-primary/50 hover:text-primary transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {keywordList.length === 0 && (
                    <p className="text-xs text-muted-foreground/40 italic px-1">Nenhuma palavra-chave adicionada.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Appearance */}
          <div className="p-10 space-y-8 border-l border-white/5 bg-muted/5">
             <div className="space-y-6">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                Aparência
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Cor da Categoria</Label>
                <div className="p-6 bg-muted/20 rounded-[2rem] border border-white/5">
                  <div className="grid grid-cols-5 gap-5 mb-6">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={cn(
                          "h-11 w-11 rounded-full transition-all hover:scale-110 cursor-pointer",
                          color === c ? "ring-4 ring-white ring-offset-4 ring-offset-background" : ""
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="relative group cursor-pointer" onClick={handleColorClick}>
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm font-mono font-bold text-white/90 tracking-widest">{color.toUpperCase()}</span>
                    </div>
                    <Input 
                      readOnly
                      value="" 
                      className="bg-background/40 border-white/5 h-14 rounded-2xl pl-24 pr-6 text-right font-mono cursor-pointer"
                    />
                    <div 
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl shadow-lg border border-white/10 transition-transform active:scale-90" 
                      style={{ backgroundColor: color }} 
                    />
                    <input 
                      id="color-picker-input"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-muted/10 flex justify-end border-t border-white/5">
          <Button 
            onClick={handleSave} 
            disabled={!name || isSaving}
            className="bg-[#111111] hover:bg-[#222222] text-white border border-white/10 rounded-2xl h-14 px-10 text-lg font-bold gap-3 active:scale-95 transition-all shadow-2xl cursor-pointer"
          >
            {isSaving ? "Salvando..." : (
              <>
                <Check className="h-5 w-5 text-white/70" />
                Salvar Categoria
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
