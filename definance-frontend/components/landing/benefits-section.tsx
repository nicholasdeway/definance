"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, BarChart3, Sparkles, Bell } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { SpotlightCard } from "@/components/ui/spotlight-card"

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

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export function BenefitsSection() {
  return (
    <section id="beneficios" className="dark border-t border-border bg-black dark:bg-muted/30 py-20 md:py-32 text-foreground">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tudo que você precisa para suas finanças
          </h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas poderosas e simples para você ter controle total do seu dinheiro.
          </p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit) => (
            <motion.div key={benefit.title} variants={itemVariants}>
              <SpotlightCard 
                className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg h-full"
                spotlightColor="rgba(0, 229, 255, 0.15)"
              >
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
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA de conversão após beneficios */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center gap-3 mt-14"
        >
          <a
            href="/register"
            className="inline-flex items-center gap-2 h-13 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            Quero começar grátis por 7 dias
            <Sparkles className="h-4 w-4" />
          </a>
          <p className="text-xs text-muted-foreground/60 font-medium">
            Sem cartão de crédito • Setup em 2 minutos
          </p>
        </motion.div>

      </div>
    </section>
  )
}