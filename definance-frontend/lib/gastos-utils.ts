import React from "react"
import {
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Smartphone,
  Heart,
  Zap,
  Utensils,
  Shirt,
  Gamepad2
} from "lucide-react"

/**
 * Retorna o ícone correspondente à descrição do gasto baseado em palavras-chave.
 */
export const getGastoIcon = (descricao: string) => {
  const d = descricao.toLowerCase()

  if (d.includes("café") || d.includes("lanche") || d.includes("restaurante") || d.includes("almoço") || d.includes("janta") || d.includes("pizza"))
    return React.createElement(Utensils, { className: "h-5 w-5 text-orange-500" })

  if (d.includes("supermercado") || d.includes("mercado") || d.includes("compra"))
    return React.createElement(ShoppingBag, { className: "h-5 w-5 text-emerald-500" })

  if (d.includes("uber") || d.includes("transporte") || d.includes("ônibus") || d.includes("gasolina") || d.includes("combustível"))
    return React.createElement(Car, { className: "h-5 w-5 text-blue-500" })

  if (d.includes("farmácia") || d.includes("remédio") || d.includes("saúde") || d.includes("médico"))
    return React.createElement(Heart, { className: "h-5 w-5 text-red-500" })

  if (d.includes("casa") || d.includes("aluguel") || d.includes("condomínio") || d.includes("iptu"))
    return React.createElement(Home, { className: "h-5 w-5 text-amber-600" })

  if (d.includes("celular") || d.includes("internet") || d.includes("assinatura"))
    return React.createElement(Smartphone, { className: "h-5 w-5 text-purple-500" })

  if (d.includes("roupa") || d.includes("calça") || d.includes("camiseta") || d.includes("tênis"))
    return React.createElement(Shirt, { className: "h-5 w-5 text-pink-500" })

  if (d.includes("jogo") || d.includes("steam") || d.includes("game"))
    return React.createElement(Gamepad2, { className: "h-5 w-5 text-indigo-500" })

  if (d.includes("energia") || d.includes("água") || d.includes("luz") || d.includes("conta"))
    return React.createElement(Zap, { className: "h-5 w-5 text-yellow-500" })

  return React.createElement(Coffee, { className: "h-5 w-5 text-orange-500" })
}

/**
 * Formata a data para exibição amigável (Hoje, Ontem ou Data Local).
 */
export const formatGastoDate = (dateStr: string) => {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return "Hoje"
  if (d.toDateString() === yesterday.toDateString()) return "Ontem"
  return d.toLocaleDateString("pt-BR")
}