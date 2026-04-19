"use client"

import { Plus, Trash2, Landmark, Shield, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useOnboarding } from "@/components/onboarding/hooks/use-onboarding"
import { vehicleTypes } from "@/components/onboarding/constants"
import { FieldLabel } from "@/components/onboarding/components/field-label"
import { Vehicle } from "@/components/onboarding/types"
import { Button } from "@/components/ui/button"
import { useAutoSave } from "@/components/onboarding/hooks/use-auto-save"
import { useState } from "react"

export const VehiclesSection = () => {
  const { 
    vehicles, 
    setVehicles, 
    wasAttempted 
  } = useOnboarding()
  const { persistStep } = useAutoSave()

  const [expandedValue, setExpandedValue] = useState<string | undefined>(undefined)
  const [newExtras, setNewExtras] = useState<Record<string, { descricao: string; valor: number }>>({})

  function displayBRL(value: number): string {
    if (value === undefined || value === null) return ""
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const addVehicle = () => {
    const newId = Math.random().toString(36).slice(2)
    setVehicles(prev => [
      ...prev,
      {
        id: newId,
        tipo: "", nome: "", ano: "",
        ipva: 0, multas: 0,
        financiado: false,
        parcelasTotal: 0, parcelasPagas: 0, valorParcela: 0,
        seguro: false, valorSeguro: 0,
        extras: [],
      },
    ])
    setExpandedValue(newId)
  }

  const removeVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id))
  }

  const updateVehicle = (id: string, field: keyof Omit<Vehicle, "id">, value: any) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, [field]: value } : v)))
  }

  const updateVehicleCurrency = (id: string, field: keyof Omit<Vehicle, "id">, raw: string) => {
    const digits = raw.replace(/\D/g, "")
    updateVehicle(id, field, Number(digits) / 100)
  }
  
  const handleAddNewExtra = (vehicleId: string) => {
    const data = newExtras[vehicleId]
    if (!data || !data.descricao) return

    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          extras: [...(v.extras || []), { id: Math.random().toString(36).slice(2), descricao: data.descricao, valor: Number(data.valor) / 100 }]
        }
      }
      return v
    }))

    setNewExtras(prev => {
        const copy = { ...prev }
        delete copy[vehicleId]
        return copy
    })
  }

  const removeExtra = (vehicleId: string, extraId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { ...v, extras: (v.extras || []).filter(e => e.id !== extraId) }
      }
      return v
    }))
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Adicione todos os veículos que você possui e seus custos associados.
      </p>

      {/* Lista de veículos */}
      <Accordion 
        type="single" 
        collapsible 
        value={expandedValue} 
        onValueChange={setExpandedValue} 
        className="w-full space-y-3"
      >
        {vehicles.map((v, idx) => {
          const tipoInfo = vehicleTypes.find(t => t.key === v.tipo)
          const pTotal = v.parcelasTotal || 0
          const pPagas = v.parcelasPagas || 0
          const vParcela = v.valorParcela || 0

          const parcelasRestantes = v.parcelasTotal ? Math.max(0, pTotal - pPagas) : 0
          const valorTotalRestante = parcelasRestantes * vParcela

          const hasError = wasAttempted && (
            !v.tipo || 
            (v.tipo === "outro" && !v.nome) ||
            (v.financiado && (!v.parcelasTotal || v.parcelasTotal === 0 || !v.valorParcela || v.valorParcela === 0)) ||
            (v.seguro && (!v.valorSeguro || v.valorSeguro === 0))
          )

          const isExpanded = expandedValue === v.id

          return (
            <AccordionItem 
              key={v.id || `v-${idx}`} 
              value={v.id} 
              className={cn(
                "w-full rounded-xl border border-border/60 bg-background/50 overflow-hidden transition-all duration-300",
                isExpanded && "border-primary/30 shadow-lg bg-background",
                hasError && "border-destructive/30"
              )}
            >
              <div 
                className="flex items-center justify-between w-full px-5 py-4 cursor-pointer hover:bg-muted/5 transition-colors"
                onClick={() => setExpandedValue(isExpanded ? undefined : v.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition-all",
                    isExpanded ? "bg-primary/20 scale-110" : "bg-muted"
                  )}>
                    {tipoInfo?.emoji || "🚗"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-card-foreground">
                      {v.nome || (tipoInfo ? tipoInfo.label : `Veículo ${idx + 1}`)}
                    </span>
                    {hasError && (
                      <div className="flex items-center gap-1 text-[10px] text-destructive mt-0.5 font-medium animate-pulse">
                        <AlertCircle className="h-3 w-3" /> Pendente
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                  <div className="hidden md:flex items-center gap-1.5">
                    {v.financiado && (
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] h-4 px-1.5 flex items-center gap-0.5">
                        <Landmark className="h-2 w-2" /> Financiado
                      </Badge>
                    )}
                    {v.seguro && (
                      <Badge variant="secondary" className="bg-blue-500/5 text-blue-500 border-blue-500/10 text-[9px] h-4 px-1.5 flex items-center gap-0.5">
                        <Shield className="h-2 w-2" /> Seguro
                      </Badge>
                    )}
                    {!v.nome && tipoInfo && <Badge variant="outline" className="text-[9px] h-4 px-1.5 uppercase opacity-60">Base</Badge>}
                  </div>
                  
                  {/* Texto "Ver detalhes" */}
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider hidden sm:inline-block hover:text-primary transition-colors">
                    {isExpanded ? "Recolher" : "Ver detalhes"}
                  </span>
                  
                  {/* Ícone da seta (expansão) */}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground/60" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
                  )}
                  
                  {/* Separador vertical */}
                  <div className="h-6 w-px bg-border/40" />
                  
                  {/* Botão de remover (lixeira) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeVehicle(v.id)
                    }}
                    className="p-1.5 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer shrink-0"
                    title="Remover veículo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <AccordionContent className="px-4 pb-4">
                <div className="pt-2 space-y-4">
                  {/* Seletor de tipo */}
                  <div className="space-y-3">
                    <FieldLabel 
                        label="Tipo de veículo" 
                        required 
                        isEmpty={!v.tipo} 
                        wasAttempted={wasAttempted} 
                    />
                    <div className="flex overflow-x-auto pb-2 gap-2 snap-x scroll-px-4 no-scrollbar sm:grid sm:grid-cols-4 sm:overflow-x-visible">
                      {vehicleTypes.map(t => {
                        const isSelected = v.tipo === t.key
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => updateVehicle(v.id, "tipo", t.key)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all cursor-pointer",
                              "flex-shrink-0 w-22 h-20 sm:w-auto sm:h-auto snap-center",
                              isSelected 
                                ? "border-primary bg-primary/10 shadow-sm" 
                                : "border-border/50 bg-background/50 hover:border-primary/30"
                            )}
                          >
                            <span className="text-xl">{t.emoji}</span>
                            <span className="text-[9px] font-medium text-muted-foreground truncate w-full">{t.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Dados básicos */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <FieldLabel 
                        label="Nome personalizado" 
                        required={v.tipo === "outro"}
                        isEmpty={!v.nome} 
                        wasAttempted={wasAttempted} 
                      />
                      <Input
                        type="text"
                        placeholder={v.tipo === "outro" ? "Ex: Trailer, Barco..." : "Ex: Meu Carro, Moto..."}
                        value={v.nome || ""}
                        onChange={(e) => updateVehicle(v.id, "nome", e.target.value)}
                        className={cn(
                          "h-9 bg-background",
                          wasAttempted && v.tipo === "outro" && !v.nome && "border-destructive/50"
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel label="Ano" />
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ex: 2024"
                        value={v.ano || ""}
                        onChange={(e) => updateVehicle(v.id, "ano", e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="h-9 bg-background"
                      />
                    </div>
                  </div>

                  {/* Custos e Dados Adicionais */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <FieldLabel label="IPVA pendente/médio" />
                      <CurrencyInput
                        id={`ipva-${v.id}`}
                        placeholder="R$ 0,00"
                        value={v.ipva ? (v.ipva * 100).toString() : ""}
                        onChange={(value) => updateVehicleCurrency(v.id, "ipva", value)}
                        className="h-8 bg-background text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel label="Multas em aberto" />
                      <CurrencyInput
                        id={`multas-${v.id}`}
                        placeholder="R$ 0,00"
                        value={v.multas ? (v.multas * 100).toString() : ""}
                        onChange={(value) => updateVehicleCurrency(v.id, "multas", value)}
                        className="h-8 bg-background text-xs font-medium"
                      />
                    </div>
                  </div>

                  {/* Gastos Adicionais do Veículo */}
                  <div className="space-y-3 border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Gastos Extras (ex: Lavagem, Estética)</Label>
                    </div>

                    {v.extras && v.extras.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {v.extras.map((extra) => (
                          <div key={extra.id} className="flex items-center justify-between bg-muted/10 p-3 rounded-lg border border-border/40 hover:border-border/80 transition-colors group/item">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                <span className="text-xs font-semibold text-muted-foreground uppercase">{extra.descricao}</span>
                              </div>
                              <span className="text-sm text-foreground font-medium pl-3.5 sm:pl-0">{extra.valor ? displayBRL(extra.valor) : "R$ 0,00"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExtra(v.id, extra.id)}
                              className="text-muted-foreground hover:text-destructive transition-all rounded-md hover:bg-destructive/10 p-1.5 opacity-0 group-hover/item:opacity-100"
                              title="Remover"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {newExtras[v.id] ? (
                      <div className="flex flex-col gap-3 bg-primary/5 p-4 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Descrição</Label>
                            <Input 
                              value={newExtras[v.id].descricao} 
                              onChange={e => setNewExtras(p => ({...p, [v.id]: {...p[v.id], descricao: e.target.value}}))}
                              placeholder="Ex: PPF, Estética..."
                              className="h-9 text-xs bg-background"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Valor</Label>
                            <CurrencyInput 
                              id={`new-extra-valor-${v.id}`}
                              value={newExtras[v.id].valor ? newExtras[v.id].valor.toString() : ""} 
                              onChange={value => {
                                const digits = value.replace(/\D/g, "")
                                setNewExtras(p => ({...p, [v.id]: {...p[v.id], valor: Number(digits)}}))
                              }}
                              placeholder="R$ 0,00"
                              className="h-9 text-xs bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs text-muted-foreground" 
                            onClick={() => setNewExtras(p => { const copy = {...p}; delete copy[v.id]; return copy; })}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="button"
                            size="sm" 
                            className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/70" 
                            onClick={() => handleAddNewExtra(v.id)}
                          >
                            Salvar Gasto
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setNewExtras(p => ({...p, [v.id]: {descricao: "", valor: 0}}))}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary cursor-pointer transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar gasto extra
                      </button>
                    )}
                  </div>

                  {/* Financiamento */}
                  <div className="space-y-3 border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`v-fin-${v.id}`} className="text-sm font-medium">Veículo financiado?</Label>
                      <Switch
                        id={`v-fin-${v.id}`}
                        checked={v.financiado}
                        onCheckedChange={(checked) => updateVehicle(v.id, "financiado", checked)}
                      />
                    </div>

                    {v.financiado && (
                      <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/40 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <FieldLabel label="Total parcelas" required />
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={v.parcelasTotal || ""}
                              onChange={(e) => updateVehicle(v.id, "parcelasTotal", Number(e.target.value.replace(/\D/g, "")))}
                              className="h-8 bg-background text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <FieldLabel label="Pagas" />
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={v.parcelasPagas || ""}
                              onChange={(e) => updateVehicle(v.id, "parcelasPagas", Number(e.target.value.replace(/\D/g, "")))}
                              className="h-8 bg-background text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <FieldLabel label="Valor parcela" required />
                            <CurrencyInput
                              id={`v-parcela-${v.id}`}
                              placeholder="R$ 0,00"
                              value={v.valorParcela ? (v.valorParcela * 100).toString() : ""}
                              onChange={(value) => updateVehicleCurrency(v.id, "valorParcela", value)}
                              className="h-8 bg-background text-sm font-medium"
                            />
                          </div>
                        </div>

                        {v.parcelasTotal && v.valorParcela && (
                          <div className="grid grid-cols-2 gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">Resíduo</p>
                              <p className="text-sm font-semibold text-card-foreground">{parcelasRestantes}x restantes</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">Valor Aberto</p>
                              <p className="text-sm font-semibold text-primary">
                                {valorTotalRestante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Seguro */}
                    <div className="space-y-3 border-t border-border/50 pt-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`v-seg-${v.id}`} className="text-sm font-medium">Possui seguro?</Label>
                        <Switch
                          id={`v-seg-${v.id}`}
                          checked={v.seguro}
                          onCheckedChange={(checked) => updateVehicle(v.id, "seguro", checked)}
                        />
                      </div>

                      {v.seguro && (
                        <div className="space-y-1.5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 animate-in slide-in-from-top-2 duration-300">
                          <CurrencyInput
                            id={`v-vseguro-${v.id}`}
                            placeholder="R$ 0,00"
                            value={v.valorSeguro ? (v.valorSeguro * 100).toString() : ""}
                            onChange={(value) => updateVehicleCurrency(v.id, "valorSeguro", value)}
                            className="h-8 bg-background text-sm font-medium"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-6 border-t border-border/20 mt-4">
                    <Button 
                      type="button" 
                      onClick={async () => {
                        const btn = document.activeElement as HTMLButtonElement
                        if (btn) {
                          const originalText = btn.innerText
                          btn.innerText = "Salvando..."
                          btn.disabled = true
                          
                          const success = await persistStep(5, vehicles)
                          
                          btn.disabled = false
                          if (success) {
                            btn.innerText = "Salvo!"
                            setTimeout(() => {
                              if (btn) btn.innerText = originalText
                              setExpandedValue(undefined)
                            }, 1000)
                          } else {
                            btn.innerText = "Erro ao Salvar"
                            setTimeout(() => { if (btn) btn.innerText = originalText }, 3000)
                          }
                        }
                      }}
                      className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/70 font-bold"
                    >
                      Salvar Veículo
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {/* Botão adicionar veículo */}
      <button
        type="button"
        onClick={addVehicle}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 p-3 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-primary cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Adicionar veículo
      </button>

      {vehicles.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Sem veículos? Tudo bem! Você pode pular esta etapa.
        </p>
      )}
    </div>
  )
}