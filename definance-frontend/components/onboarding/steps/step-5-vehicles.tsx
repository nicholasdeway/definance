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
import { useOnboarding } from "../hooks/use-onboarding"
import { vehicleTypes } from "../constants"
import { FieldLabel } from "../components/field-label"
import { parseCurrencyInput, formatCurrency } from "@/lib/currency"
import { Vehicle } from "../types"
import { useState } from "react"

export const Step5Vehicles = () => {
  const {
    vehicles,
    setVehicles,
    wasAttempted
  } = useOnboarding()

  const [expandedValue, setExpandedValue] = useState<string | undefined>(undefined)



  const addVehicle = () => {
    const newId = Math.random().toString(36).slice(2)
    setVehicles(prev => [
      ...prev,
      {
        id: newId,
        tipo: "", nome: "", ano: "",
        ipvaAnos: [],
        multas: 0,
        financiado: false,
        seguro: false, valorSeguro: 0,
        seguroRecorrente: true,
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

  const updateVehicleCurrency = (id: string, field: keyof Vehicle, rawValue: string) => {
    updateVehicle(id, field as any, parseCurrencyInput(rawValue))
  }

  const addIpvaYear = (vehicleId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          ipvaAnos: [...(v.ipvaAnos || []), { id: Math.random().toString(36).slice(2), ano: "", parcelas: [] }]
        }
      }
      return v
    }))
  }

  const removeIpvaYear = (vehicleId: string, yearId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { ...v, ipvaAnos: (v.ipvaAnos || []).filter(y => y.id !== yearId) }
      }
      return v
    }))
  }

  const updateIpvaYear = (vehicleId: string, yearId: string, ano: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { ...v, ipvaAnos: (v.ipvaAnos || []).map(y => y.id === yearId ? { ...y, ano } : y) }
      }
      return v
    }))
  }

  const addIpvaInstallment = (vehicleId: string, yearId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          ipvaAnos: (v.ipvaAnos || []).map(y => y.id === yearId ? {
            ...y, parcelas: [...y.parcelas, { id: Math.random().toString(36).slice(2), valor: 0, vencimento: "" }]
          } : y)
        }
      }
      return v
    }))
  }

  const removeIpvaInstallment = (vehicleId: string, yearId: string, installmentId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          ipvaAnos: (v.ipvaAnos || []).map(y => y.id === yearId ? {
            ...y, parcelas: y.parcelas.filter(p => p.id !== installmentId)
          } : y)
        }
      }
      return v
    }))
  }

  const updateIpvaInstallment = (vehicleId: string, yearId: string, installmentId: string, field: "valor" | "vencimento", value: any) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          ipvaAnos: (v.ipvaAnos || []).map(y => y.id === yearId ? {
            ...y, parcelas: y.parcelas.map(p => p.id === installmentId ? { ...p, [field]: value } : p)
          } : y)
        }
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
        className="space-y-3"
      >
        {vehicles.map((v, idx) => {
          const tipoInfo = vehicleTypes.find(t => t.key === v.tipo)
          const pTotal = v.parcelasTotal || 0
          const pPagas = v.parcelasPagas || 0
          const vParcela = v.valorParcela || 0

          const parcelasRestantes = v.parcelasTotal ? Math.max(0, pTotal - pPagas) : 0
          const valorTotalRestante = parcelasRestantes * vParcela

          const hasIpvaError = v.ipvaAnos && v.ipvaAnos.length > 0 && v.ipvaAnos.some(y => 
            !y.ano || y.ano.length < 4 || y.parcelas.length === 0 || y.parcelas.some(p => !p.valor || !p.vencimento)
          )

          // Validação simples para indicador de erro no Trigger
          const hasError = wasAttempted && (
            !v.tipo ||
            (v.tipo === "outro" && !v.nome) ||
            (v.financiado && (!v.parcelasTotal || v.parcelasTotal === 0 || !v.valorParcela || v.valorParcela === 0)) ||
            (v.seguro && (!v.valorSeguro || v.valorSeguro === 0 || !v.vencimentoSeguro)) ||
            hasIpvaError
          )

          const isExpanded = expandedValue === v.id

          return (
            <AccordionItem
              key={v.id || `v-${idx}`}
              value={v.id}
              className={cn(
                "rounded-xl border border-border/60 bg-background/50 overflow-hidden transition-all duration-300",
                isExpanded && "border-primary/30 ring-1 ring-primary/10 shadow-lg bg-background",
                hasError && "border-destructive/30"
              )}
            >
              {/* Header personalizado sem o AccordionTrigger */}
              <div className="w-full">
                <div className="flex items-center justify-between w-full px-5 py-5">
                  {/* Lado Esquerdo: Info Básica + Badges - Torna clicável para expandir */}
                  <button
                    onClick={() => setExpandedValue(isExpanded ? undefined : v.id)}
                    className="flex items-center flex-1 text-left hover:no-underline focus:outline-none group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all shadow-sm ring-1 ring-border/50",
                        isExpanded ? "bg-primary/20 scale-105 ring-primary/30" : "bg-muted/80"
                      )}>
                        {tipoInfo?.emoji || "🚗"}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-card-foreground tracking-tight">
                            {v.nome || (tipoInfo ? tipoInfo.label : `Veículo ${idx + 1}`)}
                          </span>
                          <div className="hidden xs:flex items-center gap-1.5 ml-1">
                            {v.financiado && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider">
                                Financiado
                              </Badge>
                            )}
                            {v.seguro && (
                              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider">
                                Seguro
                              </Badge>
                            )}
                          </div>
                        </div>
                        {hasError && (
                          <div className="flex items-center gap-1 text-[10px] text-destructive mt-1 font-semibold animate-pulse">
                            <AlertCircle className="h-3 w-3" /> Preenchimento pendente
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Lado Direito: Ícones agrupados com gap/margin à direita */}
                  <div className="flex items-center gap-3 shrink-0 ml-6">
                    {/* Texto "Ver detalhes" clicável */}
                    <button
                      onClick={() => setExpandedValue(isExpanded ? undefined : v.id)}
                      className="text-[10px] uppercase font-black text-muted-foreground/40 tracking-[0.2em] hidden sm:inline-block transition-colors hover:text-primary whitespace-nowrap"
                    >
                      {isExpanded ? "Recolher" : "Ver detalhes"}
                    </button>

                    {/* Separador vertical */}
                    <div className="h-6 w-px bg-border/40 hidden sm:block" />

                    {/* Botão de remover (lixeira) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeVehicle(v.id)
                      }}
                      className="p-2 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer shrink-0"
                      title="Remover veículo"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
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

                  {/* IPVA e Multas */}
                  <div className="space-y-4 border-t border-border/50 pt-4 mt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <FieldLabel label="Multas em aberto" />
                        <CurrencyInput
                          id={`v-multas-${v.id}`}
                          placeholder="R$ 0,00"
                          value={v.multas ? Math.round(v.multas * 100).toString() : ""}
                          onChange={(value) => updateVehicleCurrency(v.id, "multas", value)}
                          className="h-9 bg-background"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 p-4 rounded-xl bg-muted/20 border border-border/50">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Parcelamento de IPVA</Label>
                      </div>
                      
                      {v.ipvaAnos?.map((ipvaYear) => (
                        <div key={ipvaYear.id} className="space-y-3 bg-background p-4 rounded-lg border border-border/60 relative group">
                          <button
                            type="button"
                            onClick={() => removeIpvaYear(v.id, ipvaYear.id)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="space-y-1.5 w-full sm:max-w-[200px]">
                              <Label className="text-xs font-bold uppercase">Ano Base <span className="text-destructive">*</span></Label>
                              <Input
                                placeholder="Ex: 2025"
                                value={ipvaYear.ano}
                                onChange={e => updateIpvaYear(v.id, ipvaYear.id, e.target.value.replace(/\D/g, "").slice(0, 4))}
                                className={cn("h-9 border-border/50", (!ipvaYear.ano || ipvaYear.ano.length < 4) && "border-destructive")}
                              />
                            </div>
                          </div>

                          <div className="space-y-2 mt-2 pt-2 border-t border-border/40">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs font-bold text-muted-foreground uppercase">Parcelas <span className="text-destructive">*</span></Label>
                            </div>
                            
                            {ipvaYear.parcelas.map((parcela, idx) => (
                              <div key={parcela.id} className={cn("flex flex-col sm:flex-row items-center gap-2 bg-muted/10 p-2 rounded-md border border-border/40", (!parcela.valor || !parcela.vencimento) && "border-destructive")}>
                                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                                  <span className="text-xs font-semibold w-6 text-center">{idx + 1}ª</span>
                                  <CurrencyInput
                                    id={`ipva-parcela-${parcela.id}`}
                                    placeholder="Valor *"
                                    value={parcela.valor ? Math.round(parcela.valor * 100).toString() : ""}
                                    onChange={(val) => {
                                      updateIpvaInstallment(v.id, ipvaYear.id, parcela.id, "valor", parseCurrencyInput(val))
                                    }}
                                    className="h-8 bg-background text-xs w-full"
                                  />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                                  <Input
                                    type="date"
                                    value={parcela.vencimento}
                                    onChange={(e) => updateIpvaInstallment(v.id, ipvaYear.id, parcela.id, "vencimento", e.target.value)}
                                    className="h-8 bg-background text-xs w-full"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeIpvaInstallment(v.id, ipvaYear.id, parcela.id)}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => addIpvaInstallment(v.id, ipvaYear.id)}
                              className="flex items-center justify-center gap-1.5 text-[11px] uppercase font-bold text-primary hover:bg-primary/10 py-1.5 px-3 rounded-md transition-colors w-full sm:w-auto mt-2 border border-primary/20 border-dashed"
                            >
                              <Plus className="h-3 w-3" /> Adicionar Parcela
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addIpvaYear(v.id)}
                        className="flex items-center justify-center gap-2 w-full p-3 rounded-lg border border-dashed border-primary/40 text-sm text-primary font-bold hover:bg-primary/5 transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Adicionar Ano do IPVA
                      </button>


                    </div>
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
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-1.5">
                            <FieldLabel label="Total parcelas" required />
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={v.parcelasTotal || ""}
                              onChange={(e) => updateVehicle(v.id, "parcelasTotal", Number(e.target.value.replace(/\D/g, "")))}
                              className="h-10 bg-background text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <FieldLabel label="Pagas" />
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={v.parcelasPagas || ""}
                              onChange={(e) => updateVehicle(v.id, "parcelasPagas", Number(e.target.value.replace(/\D/g, "")))}
                              className="h-10 bg-background text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <FieldLabel label="Valor parcela" required />
                            <CurrencyInput
                              id={`v-vparcela-${v.id}`}
                              placeholder="R$ 0,00"
                              value={v.valorParcela ? Math.round(v.valorParcela * 100).toString() : ""}
                              onChange={(value) => updateVehicleCurrency(v.id, "valorParcela", value)}
                              className="h-10 bg-background text-sm"
                            />
                          </div>
                        </div>

                        {!!v.parcelasTotal && !!v.valorParcela && (
                          <div className="grid grid-cols-2 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 mt-2 animate-in zoom-in-95 duration-300">
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Resíduo</p>
                              <p className="text-base font-bold text-card-foreground">{parcelasRestantes}x restantes</p>
                            </div>
                            <div className="space-y-0.5 border-l border-primary/10 pl-3">
                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Valor em aberto</p>
                              <p className="text-base font-bold text-primary">
                                {formatCurrency(valorTotalRestante)}
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
                        <div className="grid gap-3 sm:grid-cols-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-1.5">
                            <FieldLabel label="Valor do seguro" required />
                            <CurrencyInput
                              id={`v-vseguro-${v.id}`}
                              placeholder="R$ 0,00"
                              value={v.valorSeguro ? Math.round(v.valorSeguro * 100).toString() : ""}
                              onChange={(value) => updateVehicleCurrency(v.id, "valorSeguro", value)}
                              className="h-8 bg-background text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <FieldLabel label="Data de vencimento" required />
                            <Input
                              type="date"
                              value={v.vencimentoSeguro || ""}
                              onChange={(e) => updateVehicle(v.id, "vencimentoSeguro", e.target.value)}
                              className="h-8 bg-background text-sm"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2 pt-1 sm:col-span-2">
                            <Switch
                              id={`v-seg-rec-${v.id}`}
                              checked={v.seguroRecorrente ?? true}
                              onCheckedChange={(checked) => updateVehicle(v.id, "seguroRecorrente", checked)}
                            />
                            <Label htmlFor={`v-seg-rec-${v.id}`} className="text-[10px] font-bold uppercase text-muted-foreground cursor-pointer">
                              Pagamento mensal recorrente?
                            </Label>
                          </div>
                        </div>
                      )}
                    </div>
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