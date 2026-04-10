"use client"

import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useOnboarding } from "../hooks/use-onboarding"
import { vehicleTypes } from "../constants"
import { FieldLabel } from "../components/field-label"
import { Vehicle } from "../types"

export const Step4Vehicles = () => {
  const { 
    vehicles, 
    setVehicles, 
    wasAttempted 
  } = useOnboarding()

  // Formata dígitos brutos (centavos) para exibição em BRL
  function displayBRL(digits: string): string {
    if (!digits) return ""
    const number = parseInt(digits, 10) / 100
    return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const addVehicle = () => {
    setVehicles(prev => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        tipo: "", nome: "", ano: "",
        ipva: "", multas: "",
        financiado: false,
        parcelasTotal: "", parcelasPagas: "", valorParcela: "",
        seguro: false, valorSeguro: "",
      },
    ])
  }

  const removeVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id))
  }

  const updateVehicle = (id: string, field: keyof Omit<Vehicle, "id">, value: string | boolean) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, [field]: value } : v)))
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Adicione todos os veículos que você possui e seus custos associados.
      </p>

      {/* Lista de veículos */}
      <div className="space-y-3">
        {vehicles.map((v, idx) => {
          const tipoInfo = vehicleTypes.find(t => t.key === v.tipo)
          const parcelasRestantes =
            v.parcelasTotal && v.parcelasPagas
              ? Math.max(0, parseInt(v.parcelasTotal) - parseInt(v.parcelasPagas))
              : null
          const valorTotalRestante =
            parcelasRestantes !== null && v.valorParcela
              ? parcelasRestantes * (parseInt(v.valorParcela) / 100)
              : null

          return (
            <div key={v.id || `v-${idx}`} className="space-y-4 rounded-xl border border-border/60 bg-background/50 p-4">

              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">
                  {tipoInfo
                    ? `${tipoInfo.emoji} ${v.nome || tipoInfo.label}`
                    : `Veículo ${idx + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeVehicle(v.id)}
                  className="text-muted-foreground transition-colors hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Seletor de tipo */}
              <div>
                <div className="mb-2">
                  <FieldLabel 
                    label="Tipo de veículo" 
                    required 
                    isEmpty={!v.tipo} 
                    wasAttempted={wasAttempted} 
                  />
                </div>
                <div className="flex overflow-x-auto pb-4 gap-2 snap-x scroll-px-4 no-scrollbar sm:grid sm:grid-cols-4 sm:overflow-x-visible sm:pb-0">
                  {vehicleTypes.map(t => {
                    const isSelected = v.tipo === t.key
                    const isInvalid = wasAttempted && !v.tipo
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => updateVehicle(v.id, "tipo", t.key)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all cursor-pointer",
                          "flex-shrink-0 w-22 h-20 sm:w-auto sm:h-auto snap-center",
                          isSelected 
                            ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                            : isInvalid 
                              ? "border-destructive/40 bg-destructive/5 hover:border-destructive"
                              : "border-border/50 bg-background/50 hover:border-primary/50"
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
                    label="Nome do veículo" 
                    required={v.tipo === "outro"}
                    isEmpty={!v.nome} 
                    wasAttempted={wasAttempted} 
                  />
                  <Input
                    type="text"
                    placeholder={v.tipo === "outro" ? "Ex: Trailer, Barco..." : "Ex: Meu Carro, Moto de trilha..."}
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
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={v.ipva ? displayBRL(v.ipva) : ""}
                      onChange={(e) => updateVehicle(v.id, "ipva", e.target.value.replace(/\D/g, ""))}
                      className="h-8 bg-background text-xs"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <FieldLabel label="Multas em aberto" />
                    <Input
                       type="text"
                       inputMode="numeric"
                       placeholder="R$ 0,00"
                       value={v.multas ? displayBRL(v.multas) : ""}
                       onChange={(e) => updateVehicle(v.id, "multas", e.target.value.replace(/\D/g, ""))}
                       className="h-8 bg-background text-xs"
                     />
                 </div>
              </div>

              {/* Financiamento */}
              <div className="space-y-3 border-t border-border/50 pt-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`v-fin-${v.id}`} className="text-sm text-card-foreground">Veículo financiado?</Label>
                  <Switch
                    id={`v-fin-${v.id}`}
                    checked={v.financiado}
                    onCheckedChange={(checked) => updateVehicle(v.id, "financiado", checked)}
                  />
                </div>

                {v.financiado && (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <FieldLabel 
                          label="Total parcelas" 
                          required 
                          isEmpty={!v.parcelasTotal || parseInt(v.parcelasTotal) === 0} 
                          wasAttempted={wasAttempted} 
                        />
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={v.parcelasTotal || ""}
                          onChange={(e) => updateVehicle(v.id, "parcelasTotal", e.target.value.replace(/\D/g, ""))}
                          className={cn(
                            "h-8 bg-background text-xs",
                            wasAttempted && (!v.parcelasTotal || parseInt(v.parcelasTotal) === 0) && "border-destructive/50"
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <FieldLabel label="Pagas" />
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={v.parcelasPagas || ""}
                          onChange={(e) => updateVehicle(v.id, "parcelasPagas", e.target.value.replace(/\D/g, ""))}
                          className="h-8 bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <FieldLabel 
                          label="Valor parcela" 
                          required 
                          isEmpty={!v.valorParcela || parseInt(v.valorParcela) === 0} 
                          wasAttempted={wasAttempted} 
                        />
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          value={v.valorParcela ? displayBRL(v.valorParcela) : ""}
                          onChange={(e) => updateVehicle(v.id, "valorParcela", e.target.value.replace(/\D/g, ""))}
                          className={cn(
                            "h-8 bg-background text-xs",
                            wasAttempted && (!v.valorParcela || parseInt(v.valorParcela) === 0) && "border-destructive/50"
                          )}
                        />
                      </div>
                    </div>

                    {/* Resumo calculado */}
                    {parcelasRestantes !== null && valorTotalRestante !== null && (
                      <div className="grid grid-cols-2 gap-2 rounded-lg border border-primary/10 bg-primary/5 p-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Parcelas restantes</p>
                          <p className="text-sm font-semibold text-card-foreground">{parcelasRestantes}x</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Total restante</p>
                          <p className="text-sm font-semibold text-primary">
                            {valorTotalRestante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Seguro */}
                  <div className="space-y-3 border-t border-border/50 pt-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`v-seg-${v.id}`} className="text-sm text-card-foreground">Possui seguro?</Label>
                      <Switch
                        id={`v-seg-${v.id}`}
                        checked={v.seguro}
                        onCheckedChange={(checked) => updateVehicle(v.id, "seguro", checked)}
                      />
                    </div>

                    {v.seguro && (
                      <div className="space-y-1">
                        <FieldLabel 
                          label="Valor anual do seguro" 
                          required={v.seguro}
                          isEmpty={!v.valorSeguro || parseInt(v.valorSeguro) === 0}
                          wasAttempted={wasAttempted}
                        />
                        <Input
                          id={`v-vseguro-${v.id}`}
                          type="text"
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          value={v.valorSeguro ? displayBRL(v.valorSeguro) : ""}
                          onChange={(e) => updateVehicle(v.id, "valorSeguro", e.target.value.replace(/\D/g, ""))}
                          className={cn(
                            "h-8 bg-background text-sm",
                            wasAttempted && v.seguro && (!v.valorSeguro || parseInt(v.valorSeguro) === 0) && "border-destructive/50"
                          )}
                        />
                      </div>
                    )}
                  </div>
              </div>
            </div>
          )
        })}
      </div>

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