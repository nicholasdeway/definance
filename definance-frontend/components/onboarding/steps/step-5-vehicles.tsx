import { Plus, Trash2, Landmark, Shield, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion"

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

import { cn, generateId } from "@/lib/utils"
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
    const newId = generateId()
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

  const updateVehicleCurrency = (id: string, field: keyof Omit<Vehicle, "id">, rawValue: string) => {
    try {
      updateVehicle(id, field, parseCurrencyInput(rawValue))
    } catch (error) {
      console.error("Erro ao converter valor monetário:", error)
    }
  }

  const addIpvaYear = (vehicleId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          ipvaAnos: [...(v.ipvaAnos || []), { id: generateId(), ano: "", parcelas: [] }]
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
            ...y, parcelas: [...y.parcelas, { id: generateId(), valor: 0, vencimento: "" }]
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
    <div className="space-y-3 sm:space-y-4">
      <p className="text-[11px] sm:text-xs text-muted-foreground/60 px-1">
        Adicione todos os veículos que você possui e seus custos associados.
      </p>      {/* Lista de veículos */}
      <Accordion
        type="single"
        collapsible
        value={expandedValue}
        onValueChange={setExpandedValue}
        className="space-y-3 sm:space-y-4"
      >
        {vehicles.map((v, idx) => {
          const tipoInfo = vehicleTypes.find(t => t.key === v.tipo)
          const isExpanded = expandedValue === v.id
          
          const hasIpvaError = v.ipvaAnos && v.ipvaAnos.length > 0 && v.ipvaAnos.some(y => 
            !y.ano || y.ano.length < 4 || y.parcelas.length === 0 || y.parcelas.some(p => !p.valor || !p.vencimento)
          )

          const hasError = wasAttempted && (
            !v.tipo ||
            (v.tipo === "outro" && !v.nome) ||
            (v.financiado && (!v.parcelasTotal || v.parcelasTotal === 0 || !v.valorParcela || v.valorParcela === 0)) ||
            (v.seguro && (!v.valorSeguro || v.valorSeguro === 0 || !v.vencimentoSeguro)) ||
            hasIpvaError
          )

          return (
            <AccordionItem
              key={v.id || `v-${idx}`}
              value={v.id}
              className={cn(
                "rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300",
                isExpanded && "border-primary/30 ring-1 ring-primary/10 shadow-2xl bg-white/[0.04]",
                hasError && "border-destructive/30"
              )}
            >
              <AccordionTrigger className="hover:no-underline px-4 sm:px-6 py-4 sm:py-5 group data-[state=open]:pb-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 sm:gap-4 text-left">
                    <div className={cn(
                      "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-xl transition-all shadow-sm ring-1 ring-white/10",
                      isExpanded ? "bg-primary text-primary-foreground scale-105" : "bg-white/5 text-muted-foreground"
                    )}>
                      {tipoInfo ? <tipoInfo.icon className="h-5 w-5 sm:h-6 sm:w-6" /> : "🚗"}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                          {v.nome || (tipoInfo ? tipoInfo.label : `Veículo ${idx + 1}`)}
                        </span>
                        <div className="hidden xs:flex items-center gap-1.5 ml-1">
                          {v.financiado && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider">
                              Financiado
                            </Badge>
                          )}
                        </div>
                      </div>
                      {hasError && (
                        <div className="flex items-center gap-1 text-[10px] text-destructive mt-0.5 font-semibold animate-pulse">
                          <AlertCircle className="h-3 w-3" /> Pendente
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeVehicle(v.id)
                      }}
                      className="p-2 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer shrink-0 z-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 sm:px-6 pb-6">
                <div className="pt-2 space-y-5 sm:space-y-6">
                  {/* Seletor de tipo */}
                  <div className="space-y-3">
                    <FieldLabel
                      label="Tipo de veículo"
                      required
                      isEmpty={!v.tipo}
                      wasAttempted={wasAttempted}
                      className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
                    />
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
                      {vehicleTypes.map((t, index) => {
                        const isSelected = v.tipo === t.key
                        return (
                          <motion.button
                            key={t.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            type="button"
                            onClick={() => updateVehicle(v.id, "tipo", t.key)}
                            className={cn(
                              "relative flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 rounded-xl border p-2.5 sm:p-2 text-center sm:text-left transition-all duration-200 cursor-pointer group sm:h-[54px]",
                              isSelected 
                                ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/10" 
                                : "border-white/5 bg-white/5 hover:border-primary/20 hover:bg-primary/5"
                            )}
                          >
                            <div className={cn(
                              "flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                              isSelected 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-white/10 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                            )}>
                              <t.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={cn(
                                "text-[9px] sm:text-[11px] font-bold leading-tight truncate block",
                                isSelected ? "text-primary" : "text-foreground"
                              )}>
                                {t.label}
                              </span>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Dados básicos */}
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <FieldLabel
                        label="Nome do Veículo"
                        required={v.tipo === "outro"}
                        isEmpty={!v.nome}
                        wasAttempted={wasAttempted}
                        className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                      />
                      <Input
                        type="text"
                        placeholder={v.tipo === "outro" ? "Ex: Trailer, Barco..." : "Ex: Meu Carro, Moto..."}
                        value={v.nome || ""}
                        onChange={(e) => updateVehicle(v.id, "nome", e.target.value)}
                        className={cn(
                          "h-8 sm:h-9 bg-white/[0.03] border-white/10 text-xs sm:text-sm font-medium sm:font-semibold rounded-lg sm:rounded-xl transition-all focus:bg-white/[0.05]",
                          wasAttempted && v.tipo === "outro" && !v.nome && "border-destructive/50"
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel label="Ano" className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider" />
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ex: 2024"
                        value={v.ano || ""}
                        onChange={(e) => updateVehicle(v.id, "ano", e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="h-8 sm:h-9 bg-white/[0.03] border-white/10 text-xs sm:text-sm font-medium sm:font-semibold rounded-lg sm:rounded-xl transition-all focus:bg-white/[0.05]"
                      />
                    </div>
                  </div>

                  {/* IPVA e Multas */}
                  <div className="space-y-4 sm:space-y-5 border-t border-white/5 pt-4 sm:pt-5 mt-2">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Custos e IPVA</span>
                      <span className="h-px flex-1 bg-white/5" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <FieldLabel label="Multas em aberto" className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider" />
                        <CurrencyInput
                          id={`v-multas-${v.id}`}
                          placeholder="R$ 0,00"
                          value={v.multas ? Math.round(Number(v.multas) * 100).toString() : ""}
                          onChange={(value) => updateVehicleCurrency(v.id, "multas", value)}
                          className="h-8 sm:h-9 bg-white/[0.03] border-white/10 text-xs sm:text-sm font-medium sm:font-semibold rounded-lg sm:rounded-xl transition-all focus:bg-white/[0.05]"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] sm:text-[11px] font-bold text-primary/80 uppercase tracking-tight">Parcelamento de IPVA</Label>
                      </div>
                      
                      {v.ipvaAnos?.map((ipvaYear) => (
                        <motion.div 
                          key={ipvaYear.id} 
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-3 bg-white/[0.02] p-3 sm:p-4 rounded-xl border border-white/5 relative group"
                        >
                          <button
                            type="button"
                            onClick={() => removeIpvaYear(v.id, ipvaYear.id)}
                            className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="space-y-1 w-full sm:max-w-[120px]">
                              <Label className="text-[9px] font-bold text-muted-foreground uppercase">Ano Base</Label>
                              <Input
                                placeholder="Ex: 2025"
                                value={ipvaYear.ano}
                                onChange={e => updateIpvaYear(v.id, ipvaYear.id, e.target.value.replace(/\D/g, "").slice(0, 4))}
                                className={cn("h-8 bg-white/[0.03] border-white/10 text-xs font-bold", (!ipvaYear.ano || ipvaYear.ano.length < 4) && "border-destructive/50")}
                              />
                            </div>
                          </div>

                          <div className="space-y-2 mt-2 pt-2 border-t border-white/5">
                            {ipvaYear.parcelas.map((parcela, idx) => (
                              <div key={parcela.id} className={cn("flex flex-col sm:flex-row items-center gap-2 bg-white/[0.01] p-2 rounded-lg border border-white/5", (!parcela.valor || !parcela.vencimento) && "border-destructive/30")}>
                                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                                  <span className="text-[10px] font-bold w-5 text-center text-muted-foreground">{idx + 1}ª</span>
                                  <CurrencyInput
                                    id={`ipva-parcela-${parcela.id}`}
                                    placeholder="Valor"
                                    value={parcela.valor ? Math.round(Number(parcela.valor) * 100).toString() : ""}
                                    onChange={(val) => {
                                      try {
                                        updateIpvaInstallment(v.id, ipvaYear.id, parcela.id, "valor", parseCurrencyInput(val))
                                      } catch (e) {
                                        console.error("Erro ao converter valor do IPVA:", e)
                                      }
                                    }}
                                    className="h-7 bg-white/[0.03] border-white/10 text-[11px] font-bold w-full"
                                  />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                                  <Input
                                    type="date"
                                    value={parcela.vencimento}
                                    onChange={(e) => updateIpvaInstallment(v.id, ipvaYear.id, parcela.id, "vencimento", e.target.value)}
                                    className="h-7 bg-white/[0.03] border-white/10 text-[11px] font-medium w-full"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeIpvaInstallment(v.id, ipvaYear.id, parcela.id)}
                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => addIpvaInstallment(v.id, ipvaYear.id)}
                              className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-primary/70 hover:text-primary hover:bg-primary/5 py-1.5 px-3 rounded-lg transition-all w-full sm:w-auto mt-1 border border-primary/20 border-dashed"
                            >
                              <Plus className="h-3 w-3" /> Adicionar Parcela
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addIpvaYear(v.id)}
                        className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border border-dashed border-white/10 text-[11px] uppercase font-bold text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" /> Adicionar IPVA
                      </button>
                    </div>
                  </div>

                  {/* Financiamento */}
                  <div className="space-y-4 border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="space-y-0.5">
                        <Label htmlFor={`v-fin-${v.id}`} className="text-[11px] font-bold text-foreground uppercase tracking-tight">Financiado?</Label>
                        <p className="text-[9px] text-muted-foreground">O veículo possui parcelas pendentes</p>
                      </div>
                      <Switch
                        id={`v-fin-${v.id}`}
                        checked={v.financiado}
                        onCheckedChange={(checked) => updateVehicle(v.id, "financiado", checked)}
                        className="scale-90"
                      />
                    </div>

                    {v.financiado && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 p-3 sm:p-4 rounded-2xl bg-primary/[0.02] border border-primary/10"
                      >
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1.5">
                            <FieldLabel label="Total parcelas" required className="text-[9px] font-medium text-primary/70 uppercase" />
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="Ex: 12"
                              value={v.parcelasTotal || ""}
                              onChange={(e) => updateVehicle(v.id, "parcelasTotal", Number(e.target.value.replace(/\D/g, "")))}
                              className="h-8 bg-white/[0.03] border-primary/10 text-sm font-bold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <FieldLabel label="Pagas" className="text-[9px] font-medium text-primary/70 uppercase" />
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="Ex: 2 (opcional)"
                              value={v.parcelasPagas || ""}
                              onChange={(e) => updateVehicle(v.id, "parcelasPagas", Number(e.target.value.replace(/\D/g, "")))}
                              className="h-8 bg-white/[0.03] border-primary/10 text-sm font-bold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <FieldLabel label="Valor parcela" required className="text-[9px] font-medium text-primary/70 uppercase" />
                            <CurrencyInput
                              id={`v-vparcela-${v.id}`}
                              placeholder="R$ 0,00"
                              value={v.valorParcela ? Math.round(Number(v.valorParcela) * 100).toString() : ""}
                              onChange={(value) => updateVehicleCurrency(v.id, "valorParcela", value)}
                              className="h-8 bg-white/[0.03] border-primary/10 text-sm font-bold"
                            />
                          </div>
                        </div>

                        {!!v.parcelasTotal && !!v.valorParcela && (
                          <div className="grid grid-cols-2 gap-3 rounded-xl border border-primary/10 bg-white/[0.02] p-3 mt-1 animate-in zoom-in-95">
                            <div className="space-y-0.5">
                              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-70">Restantes</p>
                              <p className="text-sm font-bold text-foreground">{Math.max(0, (v.parcelasTotal || 0) - (v.parcelasPagas || 0))}x</p>
                            </div>
                            <div className="space-y-0.5 border-l border-primary/10 pl-3">
                              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-70">Saldo Devedor</p>
                              <p className="text-sm font-bold text-primary">
                                {formatCurrency(Math.max(0, (v.parcelasTotal || 0) - (v.parcelasPagas || 0)) * (v.valorParcela || 0))}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Seguro */}
                    <div className="space-y-4 border-t border-white/5 pt-4 mt-2">
                      <div className="flex items-center justify-between px-1">
                        <div className="space-y-0.5">
                          <Label htmlFor={`v-seg-${v.id}`} className="text-[11px] font-bold text-foreground uppercase tracking-tight">Seguro?</Label>
                          <p className="text-[9px] text-muted-foreground">Cobertura ativa para este veículo</p>
                        </div>
                        <Switch
                          id={`v-seg-${v.id}`}
                          checked={v.seguro}
                          onCheckedChange={(checked) => updateVehicle(v.id, "seguro", checked)}
                          className="scale-90"
                        />
                      </div>

                      {v.seguro && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid gap-3 sm:grid-cols-2 p-3 sm:p-4 rounded-2xl bg-blue-500/[0.02] border border-blue-500/10"
                        >
                          <div className="space-y-1.5">
                            <FieldLabel label="Parcela do seguro" required className="text-[9px] font-medium text-blue-400 uppercase" />
                            <CurrencyInput
                              id={`v-vseguro-${v.id}`}
                              placeholder="R$ 0,00"
                              value={v.valorSeguro ? Math.round(Number(v.valorSeguro) * 100).toString() : ""}
                              onChange={(value) => updateVehicleCurrency(v.id, "valorSeguro", value)}
                              className="h-8 bg-white/[0.03] border-blue-500/10 text-sm font-bold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <FieldLabel label="Vencimento" required className="text-[9px] font-medium text-blue-400 uppercase" />
                            <Input
                              type="date"
                              value={v.vencimentoSeguro || ""}
                              onChange={(e) => updateVehicle(v.id, "vencimentoSeguro", e.target.value)}
                              className="h-8 bg-white/[0.03] border-blue-500/10 text-sm font-medium"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2 pt-1 sm:col-span-2">
                            <Switch
                              id={`v-seg-rec-${v.id}`}
                              checked={v.seguroRecorrente ?? true}
                              onCheckedChange={(checked) => updateVehicle(v.id, "seguroRecorrente", checked)}
                              className="scale-75"
                            />
                            <Label htmlFor={`v-seg-rec-${v.id}`} className="text-[10px] font-bold uppercase text-muted-foreground cursor-pointer">
                              Recorrente mensal?
                            </Label>
                          </div>
                        </motion.div>
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
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="button"
        onClick={addVehicle}
        className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 p-3 sm:p-4 text-xs sm:text-[13px] font-bold text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary cursor-pointer mt-2"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-primary/20 group-hover:text-primary">
          <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
        </div>
        Adicionar veículo
      </motion.button>

      {vehicles.length === 0 && (
        <p className="text-center text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-widest mt-4 opacity-50">
          Sem veículos? Tudo bem! Você pode pular esta etapa.
        </p>
      )}
    </div>
  )
}