"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/lib/settings-context"
import { formatCurrency, parseCurrencyInput } from "@/lib/currency"
import {
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  Info,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  AlertCircle,
  PiggyBank
} from "lucide-react"

// Types
type CardBrand = "Mastercard" | "Visa" | "Elo" | "Amex" | "Outra"

interface CreditCardItem {
  id: string
  name: string
  last4: string
  brand: CardBrand
  limit: number
  usedLimit: number
  dueDay: number
  gradient: string
}

interface SimulatedTransaction {
  id: string
  cardId: string
  description: string
  amount: number
  type: "expense" | "income"
  date: string
}

// Preset Premium Gradients
const CARD_GRADIENTS = [
  { id: "purple", label: "Roxo (Nubank)", value: "bg-gradient-to-br from-purple-600 via-indigo-700 to-violet-900 text-white" },
  { id: "orange", label: "Laranja (Itaú)", value: "bg-gradient-to-br from-orange-500 via-amber-600 to-red-600 text-white" },
  { id: "blue", label: "Azul (Inter)", value: "bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-800 text-white" },
  { id: "emerald", label: "Verde (Sicredi)", value: "bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 text-white" },
  { id: "black", label: "Black (Elite)", value: "bg-gradient-to-br from-zinc-800 via-neutral-900 to-zinc-950 border border-yellow-500/20 text-white shadow-xl shadow-black/25" }
]

// SVG Logos for Brands
const MastercardLogo = () => (
  <svg width="36" height="22" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
    <circle cx="11" cy="11" r="11" fill="#EB001B" />
    <circle cx="25" cy="11" r="11" fill="#F79E1B" />
    <path d="M18 17.5C19.9 15.9 21.1 13.6 21.1 11C21.1 8.4 19.9 6.1 18 4.5C16.1 6.1 14.9 8.4 14.9 11C14.9 13.6 16.1 15.9 18 17.5Z" fill="#FF5F00" />
  </svg>
)

const VisaLogo = () => (
  <svg width="42" height="14" viewBox="0 0 42 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-95">
    <path d="M16.5 0.3L11 13.7H7.7L4.7 3C4.1 2.3 3.3 1.5 2.1 1L0.1 0.3H0.3L5.3 13.7H8.7L14.7 0.3H16.5ZM26.3 0.3C24.3 0.3 22.8 1.3 22.8 3.2C22.8 7.3 28.5 7.1 28.5 9.4C28.5 10.1 27.8 10.8 26.3 10.8C24.8 10.8 23.3 10.2 22.3 9.7L21.7 12.8C23.1 13.4 24.8 13.7 26.5 13.7C28.7 13.7 31.8 12.5 31.8 9.5C31.8 5.1 26.1 5.3 26.1 3.2C26.1 2.5 26.8 1.8 28.3 1.8C29.6 1.8 31 2.3 31.7 2.7L32.3 0.3C31 0 28.5 0.3 26.3 0.3ZM39.6 0.3H38C36.8 0.3 35.8 1.1 35.5 2.3L32.9 13.7H36.3L37 10.8H41.2L41.6 13.7H44.6L42 0.3H39.6ZM37.5 8.1L39.1 2.9L40.1 8.1H37.5ZM20.7 0.3H17.4L14.7 13.7H18L20.7 0.3Z" fill="white" />
  </svg>
)

const EloLogo = () => (
  <svg width="32" height="15" viewBox="0 0 32 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
    <ellipse cx="6" cy="7.5" rx="6" ry="6" fill="#F05123" />
    <ellipse cx="16" cy="7.5" rx="6" ry="6" fill="#FFC20E" />
    <ellipse cx="26" cy="7.5" rx="6" ry="6" fill="#00AEEF" />
    <text x="5" y="11" fill="white" fontSize="9" fontWeight="900" fontFamily="sans-serif">elo</text>
  </svg>
)

const AmexLogo = () => (
  <svg width="32" height="18" viewBox="0 0 32 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-95">
    <rect width="32" height="18" rx="2" fill="#0170B9" />
    <text x="3" y="12" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">AMEX</text>
  </svg>
)

const GenericLogo = () => (
  <CreditCard className="h-5 w-5 opacity-70 text-white" />
)

// Brand Icon Selector
const getBrandLogo = (brand: CardBrand) => {
  switch (brand) {
    case "Mastercard": return <MastercardLogo />
    case "Visa": return <VisaLogo />
    case "Elo": return <EloLogo />
    case "Amex": return <AmexLogo />
    default: return <GenericLogo />
  }
}

// Initial Mock Cards
const INITIAL_CARDS: CreditCardItem[] = [
  { id: "card-1", name: "Nubank Ultravioleta", last4: "4920", brand: "Mastercard", limit: 12000, usedLimit: 4120.50, dueDay: 10, gradient: "bg-gradient-to-br from-purple-600 via-indigo-700 to-violet-900 text-white" },
  { id: "card-2", name: "Itaú Personalité", last4: "8821", brand: "Visa", limit: 35000, usedLimit: 14200.00, dueDay: 25, gradient: "bg-gradient-to-br from-zinc-800 via-neutral-900 to-zinc-950 border border-yellow-500/20 text-white shadow-xl shadow-black/25" }
]

const INITIAL_TRANSACTIONS: SimulatedTransaction[] = [
  { id: "tx-1", cardId: "card-1", description: "Supermercado Pão de Açúcar", amount: 350.50, type: "expense", date: "2026-06-29T14:20:00.000Z" },
  { id: "tx-2", cardId: "card-1", description: "Assinatura Netflix", amount: 55.90, type: "expense", date: "2026-06-28T09:15:00.000Z" },
  { id: "tx-3", cardId: "card-2", description: "Passagem Aérea Latam", amount: 1200.00, type: "expense", date: "2026-06-27T18:40:00.000Z" }
]

export default function CartoesPage() {
  const { discreetMode } = useSettings()
  const [cards, setCards] = useState<CreditCardItem[]>([])
  const [transactions, setTransactions] = useState<SimulatedTransaction[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  
  // Modals / Dialogs states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCardItem | null>(null)
  
  // Add/Edit Form states
  const [cardName, setCardName] = useState("")
  const [cardLast4, setCardLast4] = useState("")
  const [cardBrand, setCardBrand] = useState<CardBrand>("Mastercard")
  const [cardLimit, setCardLimit] = useState("")
  const [cardDueDay, setCardDueDay] = useState("10")
  const [cardGradient, setCardGradient] = useState(CARD_GRADIENTS[0].value)

  // Transaction Simulator Form states
  const [txDesc, setTxDesc] = useState("")
  const [txAmount, setTxAmount] = useState("")
  const [txType, setTxType] = useState<"expense" | "income">("expense")

  // Load from localStorage on mount
  useEffect(() => {
    const localCards = localStorage.getItem("definance_simulated_cards")
    const localTxs = localStorage.getItem("definance_simulated_txs")
    
    if (localCards) {
      try {
        const parsed = JSON.parse(localCards)
        setCards(parsed)
        if (parsed.length > 0) setSelectedCardId(parsed[0].id)
      } catch (e) {
        setCards(INITIAL_CARDS)
        setSelectedCardId(INITIAL_CARDS[0].id)
      }
    } else {
      setCards(INITIAL_CARDS)
      setSelectedCardId(INITIAL_CARDS[0].id)
      localStorage.setItem("definance_simulated_cards", JSON.stringify(INITIAL_CARDS))
    }

    if (localTxs) {
      try {
        setTransactions(JSON.parse(localTxs))
      } catch (e) {
        setTransactions(INITIAL_TRANSACTIONS)
      }
    } else {
      setTransactions(INITIAL_TRANSACTIONS)
      localStorage.setItem("definance_simulated_txs", JSON.stringify(INITIAL_TRANSACTIONS))
    }
  }, [])

  // Save to localStorage whenever cards/transactions change
  const saveState = (updatedCards: CreditCardItem[], updatedTxs: SimulatedTransaction[]) => {
    setCards(updatedCards)
    setTransactions(updatedTxs)
    localStorage.setItem("definance_simulated_cards", JSON.stringify(updatedCards))
    localStorage.setItem("definance_simulated_txs", JSON.stringify(updatedTxs))
  }

  // Selected Card Details
  const selectedCard = useMemo(() => {
    return cards.find(c => c.id === selectedCardId) ?? null
  }, [cards, selectedCardId])

  // Transactions linked to the selected Card
  const selectedCardTransactions = useMemo(() => {
    return transactions
      .filter(t => t.cardId === selectedCardId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, selectedCardId])

  // Open Form for Adding
  const openAddCard = () => {
    setEditingCard(null)
    setCardName("")
    setCardLast4("")
    setCardBrand("Mastercard")
    setCardLimit("")
    setCardDueDay("10")
    setCardGradient(CARD_GRADIENTS[0].value)
    setIsAddOpen(true)
  }

  // Open Form for Editing
  const openEditCard = (card: CreditCardItem) => {
    setEditingCard(card)
    setCardName(card.name)
    setCardLast4(card.last4)
    setCardBrand(card.brand)
    setCardLimit(formatCurrency(card.limit).replace("R$", "").trim())
    setCardDueDay(card.dueDay.toString())
    setCardGradient(card.gradient)
    setIsAddOpen(true)
  }

  // Handle Card Save (Add / Edit)
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardName.trim() || cardLast4.length !== 4) return

    const limitVal = parseCurrencyInput(cardLimit) || 0
    
    if (editingCard) {
      // Edit mode
      const updated = cards.map(c => {
        if (c.id === editingCard.id) {
          return {
            ...c,
            name: cardName.trim(),
            last4: cardLast4,
            brand: cardBrand,
            limit: limitVal,
            dueDay: parseInt(cardDueDay) || 10,
            gradient: cardGradient
          }
        }
        return c
      })
      saveState(updated, transactions)
    } else {
      // Add mode
      const newCard: CreditCardItem = {
        id: `card-${Date.now()}`,
        name: cardName.trim(),
        last4: cardLast4,
        brand: cardBrand,
        limit: limitVal,
        usedLimit: 0,
        dueDay: parseInt(cardDueDay) || 10,
        gradient: cardGradient
      }
      const updated = [...cards, newCard]
      saveState(updated, transactions)
      setSelectedCardId(newCard.id)
    }

    setIsAddOpen(false)
  }

  // Delete Card
  const handleDeleteCard = (cardId: string) => {
    const updatedCards = cards.filter(c => c.id !== cardId)
    const updatedTxs = transactions.filter(t => t.cardId !== cardId)
    
    let nextSelected = selectedCardId
    if (selectedCardId === cardId) {
      nextSelected = updatedCards.length > 0 ? updatedCards[0].id : null
    }

    saveState(updatedCards, updatedTxs)
    setSelectedCardId(nextSelected)
  }

  // Add Simulated Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCardId || !txDesc.trim() || !txAmount) return

    const amountVal = parseCurrencyInput(txAmount) || 0
    if (amountVal <= 0) return

    // Create Simulated Tx
    const newTx: SimulatedTransaction = {
      id: `tx-${Date.now()}`,
      cardId: selectedCardId,
      description: txDesc.trim(),
      amount: amountVal,
      type: txType,
      date: new Date().toISOString()
    }

    // Update Card Used Limit
    const updatedCards = cards.map(c => {
      if (c.id === selectedCardId) {
        const delta = txType === "expense" ? amountVal : -amountVal
        return {
          ...c,
          usedLimit: Math.max(0, Math.min(c.limit, c.usedLimit + delta))
        }
      }
      return c
    })

    const updatedTxs = [newTx, ...transactions]
    saveState(updatedCards, updatedTxs)

    // Reset Form
    setTxDesc("")
    setTxAmount("")
  }

  // Delete Single Transaction
  const handleDeleteTransaction = (txId: string, txAmount: number, txType: "expense" | "income") => {
    const updatedTxs = transactions.filter(t => t.id !== txId)
    
    const updatedCards = cards.map(c => {
      if (c.id === selectedCardId) {
        // Revert limit consumption
        const delta = txType === "expense" ? -txAmount : txAmount
        return {
          ...c,
          usedLimit: Math.max(0, Math.min(c.limit, c.usedLimit + delta))
        }
      }
      return c
    })

    saveState(updatedCards, updatedTxs)
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Cartões de Crédito</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">Cadastre cartões e simule despesas e faturas locais</p>
        </div>

        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary/70 dark:hover:bg-primary cursor-pointer w-full sm:w-auto h-9 text-xs sm:text-sm font-bold shadow-lg shadow-primary/20"
          onClick={openAddCard}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Cartão
        </Button>
      </div>

      {/* Prototype Banner Warning */}
      <div className="p-3.5 rounded-2xl border border-blue-500/10 bg-blue-500/5 text-blue-500 flex items-start gap-3 text-xs">
        <Info className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <span className="font-bold uppercase tracking-wider block text-[10px]">Protótipo de Avaliação</span>
          Esta é uma funcionalidade em modo piloto/demonstração. Os cartões e transações cadastrados nesta página são salvos localmente no navegador (`localStorage`) e não alteram a sua base de dados no servidor.
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-border/60 rounded-3xl space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Nenhum cartão cadastrado</h3>
            <p className="text-xs text-muted-foreground mt-1">Crie o seu primeiro cartão para simular despesas e limites.</p>
          </div>
          <Button size="sm" onClick={openAddCard} className="bg-primary text-primary-foreground">
            Adicionar Agora
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Cards List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Meus Cartões</h3>
            
            <div className="space-y-3.5">
              {cards.map((card) => {
                const isSelected = card.id === selectedCardId
                const available = card.limit - card.usedLimit
                
                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`cursor-pointer transition-all duration-300 relative rounded-3xl overflow-hidden p-5 flex flex-col justify-between h-[180px] group border ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 scale-[1.01] shadow-xl shadow-primary/5"
                        : "border-border/60 bg-muted/20 hover:border-border/90 hover:scale-[1.005] hover:shadow-md"
                    }`}
                  >
                    {/* Gradient Overlay for card background */}
                    <div className={`absolute inset-0 -z-10 ${card.gradient}`} />
                    
                    {/* Glassmorphic sheen */}
                    <div className="absolute inset-0 -z-10 bg-white/[0.03] backdrop-blur-[1px]" />
                    <div className="absolute -inset-[10px] -z-10 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

                    {/* Top Row: Name and Brand */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-[15px] tracking-wide truncate max-w-[200px] leading-tight text-white">
                          {card.name}
                        </h4>
                        <p className="text-[10px] text-white/60 font-medium">Final •••• {card.last4}</p>
                      </div>
                      <div className="bg-white/15 p-1.5 rounded-xl backdrop-blur-md">
                        {getBrandLogo(card.brand)}
                      </div>
                    </div>

                    {/* Chip Design Element */}
                    <div className="flex items-center gap-1.5 mt-2 opacity-85">
                      {/* Realistic Brass Chip shape */}
                      <div className="h-6 w-8 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-md border border-amber-600/30 flex flex-col justify-between p-1">
                        <div className="flex justify-between">
                          <span className="w-2.5 h-px bg-amber-800/40" />
                          <span className="w-2.5 h-px bg-amber-800/40" />
                        </div>
                        <div className="h-px bg-amber-800/40 w-full" />
                        <div className="flex justify-between">
                          <span className="w-2.5 h-px bg-amber-800/40" />
                          <span className="w-2.5 h-px bg-amber-800/40" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 opacity-60">
                        <span className="w-3.5 h-0.5 bg-white/60 rounded" />
                        <span className="w-3.5 h-0.5 bg-white/60 rounded" />
                        <span className="w-3.5 h-0.5 bg-white/60 rounded" />
                      </div>
                    </div>

                    {/* Bottom Row: Used / Available Limit */}
                    <div className="flex justify-between items-end pt-3">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-white/50">Disponível</span>
                        <p className="text-[14px] font-black text-white leading-none">
                          {discreetMode ? "••••" : formatCurrency(available)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-black uppercase tracking-wider text-white/50">Limite</span>
                        <p className="text-[12px] font-bold text-white/80 leading-none">
                          {discreetMode ? "••••" : formatCurrency(card.limit)}
                        </p>
                      </div>
                    </div>

                    {/* Delete button (only shows on hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCard(card.id)
                      }}
                      className="absolute right-4 bottom-14 h-8 w-8 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-md hover:bg-red-700"
                      title="Excluir Cartão"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Card Details & Transaction Simulation */}
          <div className="lg:col-span-7 space-y-6">
            {selectedCard ? (
              <>
                {/* Details Card */}
                <Card className="border-border/50 bg-card overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6 border-b border-border/20 bg-muted/10">
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        Ficha Técnica
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Configuração e limites do cartão selecionado
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-border/50 text-xs bg-card font-semibold hover:bg-muted"
                      onClick={() => openEditCard(selectedCard)}
                    >
                      Editar Cartão
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    
                    {/* Limit Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Consumo de Limite</span>
                        <span className="text-foreground">
                          {((selectedCard.usedLimit / selectedCard.limit) * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="h-2.5 w-full bg-border/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (selectedCard.usedLimit / selectedCard.limit) * 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-1.5 text-center">
                        <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                          <span className="text-[9px] font-black uppercase text-rose-500 tracking-widest block">Limite Consumido</span>
                          <p className="text-sm font-black text-rose-500 mt-0.5">
                            {discreetMode ? "••••" : formatCurrency(selectedCard.usedLimit)}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                          <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest block">Limite Disponível</span>
                          <p className="text-sm font-black text-emerald-500 mt-0.5">
                            {discreetMode ? "••••" : formatCurrency(selectedCard.limit - selectedCard.usedLimit)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground border-t border-border/20 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>Dia do Vencimento:</span>
                        <span className="font-bold text-foreground">Dia {selectedCard.dueDay}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary shrink-0" />
                        <span>Limite Total:</span>
                        <span className="font-bold text-foreground">
                          {discreetMode ? "••••" : formatCurrency(selectedCard.limit)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Simulated Transaction Generator */}
                <Card className="border-border/50 bg-card">
                  <CardHeader className="pb-3 pt-6 border-b border-border/20 bg-muted/10">
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-primary" />
                      Simular Compra ou Pagamento
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Insira transações simuladas para avaliar o consumo do limite
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      
                      {/* Description */}
                      <div className="md:col-span-5 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Descrição</label>
                        <input
                          type="text"
                          required
                          value={txDesc}
                          onChange={e => setTxDesc(e.target.value)}
                          placeholder="Ex: Assinatura Spotify, Uber..."
                          className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                        />
                      </div>

                      {/* Amount */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Valor (R$)</label>
                        <input
                          type="text"
                          required
                          value={txAmount}
                          onChange={e => setTxAmount(e.target.value)}
                          placeholder="0,00"
                          className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground text-right focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                        />
                      </div>

                      {/* Type */}
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tipo</label>
                        <select
                          value={txType}
                          onChange={e => setTxType(e.target.value as any)}
                          className="w-full h-9 rounded-xl border border-input bg-background px-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-all"
                        >
                          <option value="expense">Despesa</option>
                          <option value="income">Crédito/Pagam.</option>
                        </select>
                      </div>

                      {/* Submit */}
                      <div className="md:col-span-2">
                        <Button type="submit" size="sm" className="w-full h-9 bg-primary text-primary-foreground font-bold rounded-xl cursor-pointer">
                          Adicionar
                        </Button>
                      </div>

                    </form>
                  </CardContent>
                </Card>

                {/* Simulated Transactions List */}
                <Card className="border-border/50 bg-card">
                  <CardHeader className="pb-3 pt-6 border-b border-border/20 bg-muted/10">
                    <CardTitle className="text-base font-bold text-foreground">
                      Histórico do Cartão (Simulado)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Lista de despesas e pagamentos lançados localmente no cartão
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {selectedCardTransactions.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground italic">
                        Nenhum gasto ou crédito simulado neste cartão.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                        {selectedCardTransactions.map(tx => (
                          <div
                            key={tx.id}
                            className="flex justify-between items-center p-3 rounded-xl bg-muted/20 border border-border/40 group/tx hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${
                                tx.type === "expense" 
                                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              }`}>
                                {tx.type === "expense" ? (
                                  <TrendingDown className="h-4 w-4" />
                                ) : (
                                  <TrendingUp className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-foreground leading-tight">
                                  {tx.description}
                                </p>
                                <p className="text-[9px] text-muted-foreground mt-0.5">
                                  {new Date(tx.date).toLocaleString("pt-BR")}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <p className={`text-xs font-black tracking-tight ${
                                tx.type === "expense" ? "text-foreground" : "text-emerald-500"
                              }`}>
                                {tx.type === "expense" ? "-" : "+"} {formatCurrency(tx.amount)}
                              </p>
                              <button
                                onClick={() => handleDeleteTransaction(tx.id, tx.amount, tx.type)}
                                className="h-6 w-6 rounded-md bg-transparent text-muted-foreground hover:text-red-500 flex items-center justify-center opacity-0 group-hover/tx:opacity-100 transition-all cursor-pointer hover:bg-red-500/10 active:scale-95"
                                title="Remover Transação"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 border border-dashed border-border/50 rounded-3xl">
                <p className="text-xs text-muted-foreground italic">Selecione um cartão para ver os detalhes e simular gastos.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add / Edit Card Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl shadow-2xl p-6 w-full max-w-md space-y-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="font-bold text-lg text-foreground">
                {editingCard ? "Editar Cartão de Crédito" : "Adicionar Cartão de Crédito"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {editingCard ? "Atualize as informações do cartão selecionado" : "Cadastre um novo cartão para simulação"}
              </p>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4">
              
              {/* Card Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Nome do Cartão</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="Ex: Nubank Black, Itaú Visa..."
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Brand Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Bandeira</label>
                  <select
                    value={cardBrand}
                    onChange={e => setCardBrand(e.target.value as CardBrand)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-2.5 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="Mastercard">Mastercard</option>
                    <option value="Visa">Visa</option>
                    <option value="Elo">Elo</option>
                    <option value="Amex">American Express</option>
                    <option value="Outra">Outra</option>
                  </select>
                </div>

                {/* Last 4 Digits */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">4 Últimos Dígitos</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={cardLast4}
                    onChange={e => setCardLast4(e.target.value.replace(/\D/g, ""))}
                    placeholder="1234"
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Limit */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Limite do Cartão</label>
                  <input
                    type="text"
                    required
                    value={cardLimit}
                    onChange={e => setCardLimit(e.target.value)}
                    placeholder="Ex: 5.000,00"
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                  />
                </div>

                {/* Due Day */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Dia de Vencimento</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    value={cardDueDay}
                    onChange={e => setCardDueDay(e.target.value)}
                    placeholder="10"
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Gradient Style Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">Aparência do Cartão</label>
                <div className="flex flex-wrap gap-2.5">
                  {CARD_GRADIENTS.map(grad => {
                    const isSelected = grad.value === cardGradient
                    return (
                      <button
                        key={grad.id}
                        type="button"
                        onClick={() => setCardGradient(grad.value)}
                        className={`h-8 px-3 text-[10px] font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${grad.value} ${
                          isSelected
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 border-white/40"
                            : "opacity-80 hover:opacity-100 hover:scale-[1.02] border-transparent"
                        }`}
                      >
                        {grad.id === "black" ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        ) : null}
                        {grad.label.split(" ")[0]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-9 rounded-xl font-bold text-xs"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-primary/10"
                >
                  {editingCard ? "Salvar Alterações" : "Criar Cartão"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
