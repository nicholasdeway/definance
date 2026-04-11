import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: number
  className?: string
  withCard?: boolean
  variant?: "muted" | "primary" | "none"
}

export function Logo({ size = 40, className, withCard = false, variant = "muted" }: LogoProps) {
  const logoImage = (
    <Image
      src="/logo.png"
      alt="Definance Logo"
      width={size}
      height={size}
      className={cn("rounded-lg h-auto", !withCard && className)}
      style={{ width: `${size}px`, height: "auto" }}
    />
  )

  if (withCard) {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-lg shrink-0",
        variant === "muted" && "bg-muted",
        variant === "primary" && "bg-primary",
        className
      )}
      style={{ width: `${size + 12}px`, height: `${size + 12}px` }}
      >
        {logoImage}
      </div>
    )
  }

  return logoImage
}