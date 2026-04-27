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
  "Uber": Icons.Car,
  
  // Outros
  "MoreHorizontal": Icons.MoreHorizontal,
  "Tag": Icons.Tag,
  "Check": Icons.Check,
  "Zap": Icons.Zap,
}

export function CategoryIcon({ name, color, fallback = "MoreHorizontal", className, ...props }: CategoryIconProps) {
  // Tenta encontrar pelo nome exato, depois pelo mapeador, e por fim usa o fallback
  const IconComponent = (name && (iconMap[name] || (Icons as any)[name])) || iconMap[fallback]

  return (
    <IconComponent 
      className={cn("h-5 w-5", className)} 
      style={{ color: color || undefined }}
      {...props} 
    />
  )
}