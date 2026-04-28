"use client"

import * as Icons from "lucide-react"
import { LucideProps } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryIconProps extends Omit<LucideProps, "ref" | "color" | "name"> {
  name: string | null | undefined
  color?: string | null
  fallback?: keyof typeof Icons
}

const iconMap: Record<string, any> = {
  "Alimentação": Icons.Utensils,
  "Restaurante": Icons.Utensils,
  "Mercado": Icons.ShoppingCart,
  "Transporte": Icons.Car,
  "Uber": Icons.Car,
  "Combustível": Icons.Fuel,
  "Moradia": Icons.Home,
  "Aluguel": Icons.Home,
  "Saúde": Icons.HeartPulse,
  "Farmácia": Icons.Pill,
  "Educação": Icons.BookOpen,
  "Lazer": Icons.Palmtree,
  "Entretenimento": Icons.Gamepad2,
  "Compras": Icons.ShoppingBag,
  "Vestuário": Icons.Shirt,
  "Serviços": Icons.Zap,
  "Contas": Icons.FileText,
  "Assinaturas": Icons.Tv,
  "Finanças": Icons.Landmark,
  "Salário": Icons.DollarSign,
  "Renda": Icons.TrendingUp,
  "Investimentos": Icons.BarChart3,
  "Pix": Icons.Zap,
  "Transferência": Icons.ArrowRightLeft,
  "Empréstimo": Icons.HandCoins,
  "Veículo": Icons.CarFront,
  "Viagem": Icons.Plane,
  "CLT": Icons.Briefcase,
  "PJ": Icons.Building2,
  "Extra": Icons.Coins,
  "Variável": Icons.Coins,
  "Renda Extra": Icons.Coins,
  "Entrada": Icons.Coins,
  "Entradas": Icons.Coins,
  "Autônomo": Icons.User,
  "Freelancer": Icons.Laptop,
  "Mesada": Icons.GraduationCap,
  "Bônus": Icons.Coins,

  // Finanças
  "Wallet": Icons.Wallet,
  "Landmark": Icons.Landmark,
  "TrendingUp": Icons.TrendingUp,
  "CreditCard": Icons.CreditCard,
  "DollarSign": Icons.DollarSign,
  
  // Estilo de Vida
  "Utensils": Icons.Utensils,
  "Coffee": Icons.Coffee,
  "Home": Icons.Home,
  "CarFront": Icons.CarFront,
  "Car": Icons.Car,
  "Palmtree": Icons.Palmtree,
  "HeartPulse": Icons.HeartPulse,
  "BookOpen": Icons.BookOpen,
  "ShoppingBag": Icons.ShoppingBag,
  "Gift": Icons.Gift,
  
  // Tecnologia / Entretenimento
  "Gamepad2": Icons.Gamepad2,
  "Gamepad": Icons.Gamepad,
  "Tv": Icons.Tv,
  "Music": Icons.Music,
  "Headphones": Icons.Headphones,
  "Steam": Icons.Gamepad2,
  
  // Outros
  "MoreHorizontal": Icons.MoreHorizontal,
  "Tag": Icons.Tag,
  "Check": Icons.Check,
  "Zap": Icons.Zap,
}

export function CategoryIcon({ name, color, fallback = "MoreHorizontal", className, ...props }: CategoryIconProps) {
  // Tenta encontrar pelo nome exato, depois em caixa alta (para PJ, CLT, etc), depois pelo mapeador padrão, e por fim usa o fallback
  const IconComponent = (name && (
    iconMap[name] || 
    iconMap[name.toUpperCase()] || 
    (Icons as any)[name]
  )) || iconMap[fallback]

  return (
    <IconComponent 
      className={cn("h-5 w-5", className)} 
      style={{ color: color || undefined }}
      {...props} 
    />
  )
}