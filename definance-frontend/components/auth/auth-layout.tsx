import Link from "next/link"
import { Wallet } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container relative flex min-h-screen flex-col items-center justify-center px-4 md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-background" />
          <Link href="/" className="relative z-20 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Definance</span>
          </Link>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg text-foreground">
                "O Definance mudou completamente a forma como eu gerencio minhas finanças. 
                Agora tenho clareza total sobre meus gastos e consegui economizar 30% mais."
              </p>
              <footer className="text-sm text-muted-foreground">Maria Silva - Empreendedora</footer>
            </blockquote>
          </div>
        </div>
        
        <div className="w-full lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <div className="flex justify-center mt-8 lg:hidden">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Wallet className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Definance</span>
              </Link>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}