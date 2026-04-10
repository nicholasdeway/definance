import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 40, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Definance Logo"
      width={size}
      height={size}
      className={cn("rounded-lg h-auto", className)}
      style={{ width: `${size}px`, height: "auto" }}
    />
  )
}