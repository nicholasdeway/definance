"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const row1 = [
  "Recebi 10 mil reais de salário",
  "Quanto gastei hoje?",
  "Saldo do mês?",
  "Pergunte e registre o que quiser",
  "Paguei 30 reais de gasolina",
  "Quanto entrou na conta hoje?",
  "Qual meu gasto com lazer?",
  "Saldo atualizado por favor",
]

const row2 = [
  "Tenho 2 mil reais pro aluguel dia 22",
  "Quanto gastei esse mês?",
  "Quais lembretes eu tenho hoje?",
  "Paguei 100 reais no mercado",
  "Lembre de pagar a conta de luz",
  "Quanto falta para minha meta?",
  "Adicione gasto de 50 reais",
]

const row3 = [
  "Gastei quanto em alimentação?",
  "Recebi quanto esse mês?",
  "Tenho saldo positivo?",
  "Tenho 3 reuniões hoje?",
  "Qual o valor da minha fatura?",
  "Registrar entrada de bônus",
  "Resumo da semana, por favor",
]

const row4 = [
  "Como está meu saldo?",
  "Quanto tenho pra receber esse mês?",
  "Registro de compromissos",
  "Quais as contas para amanhã?",
  "Paguei a academia hoje",
  "Ver histórico de transações",
  "Quanto sobrou do salário?",
]

function MarqueeRow({ items, direction = "left", speed = 2 }: { items: string[], direction?: "left" | "right", speed?: number }) {
  const totalChars = items.join("").length;
  const duration = totalChars / speed;

  return (
    <div className="flex overflow-hidden py-2 select-none">
      <motion.div
        key={speed}
        animate={{ 
          x: direction === "left" ? [0, "-25%"] : ["-25%", 0] 
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }}
        className="flex gap-3 md:gap-4 whitespace-nowrap px-1.5"
      >
        {/* Render items 4 times and animate only 25% for a super smooth, slow loop */}
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            className="rounded-full border border-border bg-card/50 px-4 py-1.5 md:px-5 md:py-2 text-[13.5px] md:text-[15px] font-medium text-foreground/80 shadow-sm transition-all hover:border-primary hover:text-primary hover:bg-primary/5 cursor-default"
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function MarqueeSection() {
  return (
    <section className="relative bg-muted/20 py-24 md:py-32 overflow-hidden border-y border-border/50">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[100px] -z-10" />

      <div className="container relative mb-16 px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="mb-6 text-pretty text-[34px] font-bold tracking-tight text-foreground md:text-[58px] leading-[1.1]">
            Interaja com o Definance <span className="text-primary">24h por dia</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[19px] md:text-[21px] text-muted-foreground">
            Pergunte o que quiser e como quiser sobre as suas finanças ou seus compromissos. 
            Nossa inteligência ajuda você a ter controle total em segundos.
          </p>
        </motion.div>
      </div>

      <div className="relative flex flex-col gap-1.5 md:gap-3">
        {/* Fading Edges Overlay */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        {/* Agora o valor de speed controla a velocidade real (maior = mais rápido) */}
        <MarqueeRow items={row1} direction="left" speed={0.8} />
        <MarqueeRow items={row2} direction="right" speed={1.2} />
        <MarqueeRow items={row3} direction="left" speed={1} />
        <MarqueeRow items={row4} direction="right" speed={0.7} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-16 flex justify-center"
      >
        <Link href="/login">
          <Button className="group h-8 rounded-full bg-primary px-10 text-sm font-bold text-primary-foreground hover:scale-105 transition-all shadow-xl shadow-primary/20 cursor-pointer">
            QUERO COMEÇAR
            <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </motion.div>
    </section>
  )
}