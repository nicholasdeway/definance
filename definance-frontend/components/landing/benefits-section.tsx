import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, BarChart3, Sparkles, Bell } from "lucide-react"

const benefits = [
  {
    icon: Wallet,
    title: "Controle de Gastos",
    description: "Acompanhe cada centavo que entra e sai. Categorize suas despesas automaticamente e entenda para onde vai seu dinheiro."
  },
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    description: "Visualize sua situação financeira com gráficos claros e métricas importantes. Tudo em um só lugar."
  },
  {
    icon: Sparkles,
    title: "Organização Automática",
    description: "Nossa IA categoriza suas transações automaticamente. Menos trabalho manual, mais insights úteis."
  },
  {
    icon: Bell,
    title: "Alertas Financeiros",
    description: "Receba notificações sobre contas a vencer, gastos excessivos e metas atingidas. Nunca mais esqueça uma conta."
  }
]

export function BenefitsSection() {
  return (
    <section id="beneficios" className="border-t border-border bg-muted/30 py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tudo que você precisa para suas finanças
          </h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas poderosas e simples para você ter controle total do seu dinheiro.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg text-card-foreground">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}