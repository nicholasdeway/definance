"use client"

import { useState } from "react"
import { 
  CreditCard,
  Landmark,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, generateId } from "@/lib/utils"
import { CurrencyInput } from "@/components/ui/currency-input"
import { useOnboarding } from "@/components/onboarding/hooks/use-onboarding"
import { FieldLabel } from "@/components/onboarding/components/field-label"
import { Debt } from "@/components/onboarding/types"
import { Button } from "@/components/ui/button"
import { useAutoSave } from "@/components/onboarding/hooks/use-auto-save"
import { parseCurrencyInput, formatCurrency } from "@/lib/currency"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

export const DebtsSection = ({ onSavingStateChange }: { onSavingStateChange?: (saving: boolean) => void }) => {
    const { 
        debts, 
        setDebts, 
        wasAttempted 
    } = useOnboarding()
    const { persistStep } = useAutoSave()
    
    const [expandedValue, setExpandedValue] = useState<string | undefined>(undefined)
    const [newExtras, setNewExtras] = useState<Record<string, { descricao: string; valor: number }>>({})
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const { toast } = useToast()
    
    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        onSavingStateChange?.(true);
        try {
            // Sanitização para garantir tipos numéricos
            const sanitizedDebts = debts.map(d => ({
                ...d,
                valor: Number(d.valor) || 0,
                parcelasTotal: d.parcelasTotal ? Number(d.parcelasTotal) : 0,
                parcelasPagas: d.parcelasPagas ? Number(d.parcelasPagas) : 0,
                vencimento: d.vencimento || "",
                extras: d.extras?.map(e => ({
                    ...e,
                    valor: Number(e.valor) || 0
                })) || []
            }))

            const success = await persistStep(6, sanitizedDebts);
            if (success) {
                await apiClient("/api/onboarding/sync-debts", { method: "POST" });
                setDebts(sanitizedDebts); // Atualiza estado local com dados limpos
                window.dispatchEvent(new CustomEvent("finance-update"));
                toast({ title: "Dívidas salvas com sucesso!", variant: "default" });
                setExpandedValue(undefined);
            } else {
                toast({ title: "Erro ao salvar", description: "Tente novamente mais tarde.", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Erro inesperado", variant: "destructive" });
        } finally {
            setIsSaving(false);
            onSavingStateChange?.(false);
        }
    }
    const addDebt = () => {
        const newId = generateId()
        setDebts(prev => [
            ...prev,
            { id: newId, descricao: "", valor: 0, parcelado: false, parcelasTotal: 0, parcelasPagas: 0, vencimento: "", extras: [] },
        ])
        setExpandedValue(newId)
    }
    
    const removeDebt = (id: string) => {
        setDebts(prev => prev.filter(d => d.id !== id))
    }
    
    const updateDebt = (id: string, field: keyof Omit<Debt, "id">, value: any) => {
        setDebts(prev => prev.map(d => (d.id === id ? { ...d, [field]: value } : d)))
    }
    
    const updateDebtValue = (id: string, raw: string) => {
        const decimalValue = parseCurrencyInput(raw)
        setDebts(prev => prev.map(d => (d.id === id ? { ...d, valor: decimalValue } : d)))
    }

    const handleAddNewExtra = (debtId: string) => {
        const data = newExtras[debtId]
        if (!data || !data.descricao) return

        setDebts(prev => prev.map(d => {
            if (d.id === debtId) {
                return {
                    ...d,
                    extras: [...(d.extras || []), { id: generateId(), descricao: data.descricao, valor: data.valor }]
                }
            }
            return d
        }))

        setNewExtras(prev => {
            const copy = { ...prev }
            delete copy[debtId]
            return copy
        })
    }

    const removeExtra = (debtId: string, extraId: string) => {
        setDebts(prev => prev.map(d => {
            if (d.id === debtId) {
                return { ...d, extras: (d.extras || []).filter(e => e.id !== extraId) }
            }
            return d
        }))
    }

    return (
        <div className="space-y-4">
            <Accordion type="single" collapsible value={expandedValue} onValueChange={setExpandedValue} className="w-full space-y-3">
                {debts.map((debt, idx) => {
                    const isExpanded = expandedValue === debt.id
                    
                    const hasError = wasAttempted && (
                        !debt.descricao || 
                        !debt.valor || 
                        debt.valor === 0 ||
                        !debt.vencimento ||
                        (debt.parcelado && (!debt.parcelasTotal || debt.parcelasTotal === 0))
                    )

                    return (
                        <AccordionItem key={debt.id} value={debt.id} className={cn(
                        "w-full rounded-xl border overflow-hidden transition-all duration-300",
                        isExpanded && "border-primary/30 shadow-lg bg-white/[0.03]",
                        hasError && "border-destructive/30",
                        !isExpanded && !hasError && "border-white/5 bg-white/[0.02]"
                    )}>
                            <AccordionTrigger className="hover:no-underline px-5 py-4 group data-[state=open]:pb-2 w-full">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 text-left">
                                        <div className={cn(
                                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
                                            isExpanded ? "bg-primary/20 scale-110" : "bg-muted"
                                        )}>
                                            <CreditCard className={cn("h-5 w-5", isExpanded ? "text-primary" : "text-muted-foreground")} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-medium text-card-foreground truncate">
                                                {debt.descricao || `Dívida ${idx + 1}`}
                                            </span>
                                            {hasError && (
                                                <div className="flex items-center gap-1 text-[10px] text-destructive mt-0.5 font-medium animate-pulse">
                                                    <AlertCircle className="h-3 w-3" /> Pendente
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-muted-foreground/70">
                                                    {debt.valor ? formatCurrency(debt.valor) : "R$ 0,00"}
                                                </span>
                                                {debt.extras && debt.extras.length > 0 && (
                                                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                                                        + {formatCurrency(debt.extras.reduce((acc, curr) => acc + curr.valor, 0))} extras
                                                    </span>
                                                )}
                                                {debt.parcelado && (
                                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] h-4 px-1.5 flex items-center gap-0.5 shrink-0">
                                                        <Landmark className="h-2 w-2" /> 
                                                        {debt.parcelasTotal ? `${debt.parcelasPagas || 0}/${debt.parcelasTotal} parc` : "Parcelado"}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 ml-auto">
                                        <span className="text-[9px] uppercase text-muted-foreground/40 tracking-wider hidden md:inline-block">
                                            {isExpanded ? "Recolher" : "Ver detalhes"}
                                        </span>
                                        
                                        <div className="h-6 w-px bg-border/40" />
                                        
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => { 
                                                e.preventDefault()
                                                e.stopPropagation(); 
                                                setItemToDelete(debt.id); 
                                            }} 
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    e.stopPropagation(); 
                                                    setItemToDelete(debt.id); 
                                                }
                                            }}
                                            className="p-2 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer shrink-0 z-20"
                                            title="Remover dívida"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="px-4 pb-4 border-t border-border/20 bg-muted/5">
                                <div className="pt-4 grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <FieldLabel 
                                            label="Descrição" 
                                            required 
                                            isEmpty={!debt.descricao} 
                                            wasAttempted={wasAttempted} 
                                        />
                                        <Input
                                            placeholder="Ex: Cartão de crédito..."
                                            value={debt.descricao || ""}
                                            onChange={(e) => updateDebt(debt.id, "descricao", e.target.value)}
                                            className={cn(
                                                "h-9 bg-background",
                                                wasAttempted && !debt.descricao && "border-destructive/50"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <FieldLabel 
                                            label="Valor Total" 
                                            required 
                                            isEmpty={!debt.valor || debt.valor === 0} 
                                            wasAttempted={wasAttempted} 
                                        />
                                        <CurrencyInput
                                            id={`debt-valor-${debt.id}`}
                                            placeholder="R$ 0,00"
                                            value={debt.valor ? Math.round(Number(debt.valor) * 100).toString() : ""}
                                            onChange={(value) => updateDebtValue(debt.id, value)}
                                            className={cn(
                                                "h-9 bg-background font-medium",
                                                wasAttempted && (!debt.valor || debt.valor === 0) && "border-destructive/50"
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <FieldLabel 
                                            label="Vencimento / Início" 
                                            required 
                                            isEmpty={!debt.vencimento} 
                                            wasAttempted={wasAttempted} 
                                        />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-background h-9 px-3",
                                                        !debt.vencimento && "text-muted-foreground",
                                                        wasAttempted && !debt.vencimento && "border-destructive/50"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary opacity-70" />
                                                    <span className="text-sm">
                                                        {debt.vencimento ? format(parseISO(debt.vencimento), "dd/MM/yyyy") : "Selecione a data"}
                                                    </span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-[#0a0a0a]" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={debt.vencimento ? parseISO(debt.vencimento) : undefined}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            updateDebt(debt.id, "vencimento", format(date, "yyyy-MM-dd"))
                                                        }
                                                    }}
                                                    locale={ptBR}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <Label className="text-[9px] font-medium text-primary/70 uppercase">Parcelada?</Label>
                                        <Switch checked={debt.parcelado} onCheckedChange={(checked) => updateDebt(debt.id, "parcelado", checked)} />
                                    </div>

                                    {debt.parcelado && (
                                        <>
                                            <div className="grid grid-cols-2 gap-3 sm:col-span-2 pt-2 border-t border-border/20">
                                                <div className="space-y-1.5">
                                                    <FieldLabel 
                                                        label="Total Parcelas" 
                                                        required 
                                                        isEmpty={!debt.parcelasTotal || debt.parcelasTotal === 0} 
                                                        wasAttempted={wasAttempted} 
                                                    />
                                                    <Input
                                                        placeholder="12"
                                                        value={debt.parcelasTotal !== undefined ? String(debt.parcelasTotal) : ""}
                                                        onChange={(e) => updateDebt(debt.id, "parcelasTotal", Number(e.target.value.replace(/\D/g, "")))}
                                                        className={cn(
                                                            "h-9 bg-background",
                                                            wasAttempted && debt.parcelado && (!debt.parcelasTotal || debt.parcelasTotal === 0) && "border-destructive/50"
                                                        )}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Pagas</Label>
                                                    <Input
                                                        placeholder="3"
                                                        value={debt.parcelasPagas !== undefined ? String(debt.parcelasPagas) : ""}
                                                        onChange={(e) => updateDebt(debt.id, "parcelasPagas", Number(e.target.value.replace(/\D/g, "")))}
                                                        className="h-9 bg-background"
                                                    />
                                                </div>
                                            </div>

                                            {/* Resumo calculado da dívida */}
                                            {!!debt.parcelasTotal && !!debt.valor && (
                                                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in zoom-in-95 duration-300">
                                                {(() => {
                                                    const pTotal = debt.parcelasTotal || 1
                                                    const pPagas = debt.parcelasPagas || 0
                                                    const valorTotal = debt.valor || 0
                                                    const vParcela = valorTotal / pTotal
                                                    const restantes = Math.max(0, pTotal - pPagas)
                                                    const totalRestante = restantes * vParcela
                                                    return (
                                                    <>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Resíduo</p>
                                                            <p className="text-base font-bold text-card-foreground">{restantes}x restantes</p>
                                                        </div>
                                                        <div className="space-y-0.5 border-l border-primary/10 pl-3">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Saldo Aberto</p>
                                                            <p className="text-base font-bold text-primary">
                                                                {formatCurrency(totalRestante)}
                                                            </p>
                                                        </div>
                                                    </>
                                                    )
                                                })()}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Gastos Adicionais da Dívida */}
                                    <div className="space-y-3 border-t border-border/20 pt-4 sm:col-span-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[9px] uppercase text-muted-foreground/60">Gastos Extras desta Dívida</Label>
                                        </div>

                                        {debt.extras && debt.extras.length > 0 && (
                                            <div className="space-y-2 mb-2">
                                                {debt.extras.map((extra) => (
                                                    <div key={extra.id} className="flex items-center justify-between bg-muted/10 p-3 rounded-lg border border-border/40 hover:border-border/80 transition-colors group/item">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                                                <span className="text-xs font-semibold text-muted-foreground uppercase">{extra.descricao}</span>
                                                            </div>
                                                            <span className="text-sm text-foreground font-medium pl-3.5 sm:pl-0">{extra.valor ? formatCurrency(extra.valor) : "R$ 0,00"}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExtra(debt.id, extra.id)}
                                                            className="text-muted-foreground hover:text-destructive transition-all rounded-md hover:bg-destructive/10 p-1.5 opacity-0 group-hover/item:opacity-100"
                                                            title="Remover"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {newExtras[debt.id] ? (
                                            <div className="flex flex-col gap-3 bg-primary/5 p-4 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Descrição</Label>
                                                        <Input 
                                                            value={newExtras[debt.id].descricao} 
                                                            onChange={e => setNewExtras(p => ({...p, [debt.id]: {...p[debt.id], descricao: e.target.value}}))}
                                                            placeholder="Ex: Taxas, Seguro..."
                                                            className="h-9 text-xs bg-background"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Valor</Label>
                                                        <CurrencyInput 
                                                            id={`new-extra-valor-debt-${debt.id}`}
                                                            value={newExtras[debt.id].valor ? Math.round(Number(newExtras[debt.id].valor) * 100).toString() : ""} 
                                                            onChange={val => setNewExtras(p => ({...p, [debt.id]: {...p[debt.id], valor: parseCurrencyInput(val)}}))}
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
                                                        onClick={() => setNewExtras(p => { const copy = {...p}; delete copy[debt.id]; return copy; })}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button 
                                                        type="button"
                                                        size="sm" 
                                                        className="h-8 text-xs bg-primary/70 text-primary-foreground hover:bg-primary/80" 
                                                        onClick={() => handleAddNewExtra(debt.id)}
                                                    >
                                                        Salvar Gasto
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setNewExtras(p => ({...p, [debt.id]: {descricao: "", valor: 0}}))}
                                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary cursor-pointer transition-all"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Adicionar gasto extra
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end pt-6 border-t border-border/20 mt-4 sm:col-span-2">
                                        <Button 
                                            type="button" 
                                            disabled={isSaving}
                                            onClick={handleSave}
                                            className="w-full sm:w-auto bg-primary/70 text-primary-foreground hover:bg-primary font-bold cursor-pointer"
                                        >
                                            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Dívida"}
                                        </Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>

            <button type="button" onClick={addDebt} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/5 p-2.5 text-[10px] text-muted-foreground/70 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer">
                <Plus className="h-4 w-4" />
                Adicionar dívida
            </button>

            <ConfirmDeleteDialog
                open={itemToDelete !== null}
                onOpenChange={(open) => !open && !isDeleting && setItemToDelete(null)}
                loading={isDeleting}
                onConfirm={async () => {
                    if (itemToDelete) {
                        setIsDeleting(true)
                        try {
                            const updatedDebts = debts.filter(d => d.id !== itemToDelete)
                            setDebts(updatedDebts)
                            
                            const success = await persistStep(6, updatedDebts)
                            if (success) {
                                window.dispatchEvent(new CustomEvent("finance-update"))
                                toast({ title: "Dívida removida com sucesso!" })
                            } else {
                                toast({ 
                                    title: "Atenção", 
                                    description: "A dívida foi removida da tela, mas houve um erro ao sincronizar com o servidor.",
                                    variant: "destructive" 
                                })
                            }
                        } catch (error) {
                            console.error("Erro ao deletar dívida", error)
                        } finally {
                            setIsDeleting(false)
                            setItemToDelete(null)
                        }
                    }
                }}
                title="Confirmar Exclusão"
                description="Tem certeza que deseja remover esta dívida? Esta ação não poderá ser desfeita e os dados associados serão perdidos tanto aqui quanto no seu dashboard."
            />
        </div>
    )
}