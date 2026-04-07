import Link from "next/link"
import { Wallet } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Definance</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Simplifique suas finanças pessoais com uma plataforma intuitiva e poderosa.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#beneficios" className="text-muted-foreground transition-colors hover:text-foreground">
                  Benefícios
                </Link>
              </li>
              <li>
                <Link href="#como-funciona" className="text-muted-foreground transition-colors hover:text-foreground">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground transition-colors hover:text-foreground">
                  Criar conta
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 Definance. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}