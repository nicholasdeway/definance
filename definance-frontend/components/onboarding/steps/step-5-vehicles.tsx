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
  AccordionTrigger,
} from "@/components/ui/accordion"

import { cn } from "@/lib/utils"

import { useOnboarding } from "../hooks/use-onboarding"

import { vehicleTypes } from "../constants"

import { FieldLabel } from "../components/field-label"

import { Vehicle } from "../types"

import { useState } from "react"

export const Step5Vehicles = () => {
  const {
    vehicles,
    setVehicles,
    wasAttempted
  } = useOnboarding()

  const [expandedValue, setExpandedValue] = useState<string | undefined>(undefined)

  // Formata valor decimal (Reais) para exibição em BRL
  function displayBRL(value: number): string {
    if (!value) return ""
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
    const digits = rawValue.replace(/\D/g, "")
    const decimalValue = Number(digits) / 100
    updateVehicle(id, field as any, decimalValue)
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

          // Validação simples para indicador de erro no Trigger
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

                  {/* Custos (IPVA/Multas) */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <FieldLabel label="IPVA pendente/médio" />
                      <CurrencyInput
                        id={`v-ipva-${v.id}`}
                        placeholder="R$ 0,00"
                        value={v.ipva ? Math.round(v.ipva * 100).toString() : ""}
                        onChange={(value) => updateVehicleCurrency(v.id, "ipva", value)}
                        className="h-8 bg-background text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel label="Multas em aberto" />
                      <CurrencyInput
                        id={`v-multas-${v.id}`}
                        placeholder="R$ 0,00"
                        value={v.multas ? Math.round(v.multas * 100).toString() : ""}
                        onChange={(value) => updateVehicleCurrency(v.id, "multas", value)}
                        className="h-8 bg-background text-xs"
                      />
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
                          <FieldLabel label="Valor anual do seguro" required />
                          <CurrencyInput
                            id={`v-vseguro-${v.id}`}
                            placeholder="R$ 0,00"
                            value={v.valorSeguro ? Math.round(v.valorSeguro * 100).toString() : ""}
                            onChange={(value) => updateVehicleCurrency(v.id, "valorSeguro", value)}
                            className="h-8 bg-background text-sm"
                          />
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