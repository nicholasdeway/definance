import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Controle seus gastos de forma inteligente
          </div>
          
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Controle total da sua{" "}
            <span className="animate-shimmer-text">vida financeira</span>
          </h1>
          
          <p className="mb-10 text-pretty text-lg text-muted-foreground md:text-xl">
            Organize seus gastos, entenda seu dinheiro e tome decisões melhores. 
            Simplifique suas finanças com uma plataforma intuitiva e poderosa.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button 
                className="group cursor-pointer w-full sm:w-auto h-12 min-w-[180px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:scale-105"
              >
                Começar agora
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#como-funciona">
              <Button 
                variant="outline" 
                className="cursor-pointer w-full sm:w-auto h-12 min-w-[180px] border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50 transition-all"
              >
                <Play className="mr-2 h-4 w-4 fill-current" />
                Ver como funciona
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}