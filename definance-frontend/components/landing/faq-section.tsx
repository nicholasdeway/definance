"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

import { motion } from "framer-motion"

const faqs = [
  {
    question: "Como funciona o Definance?",
    answer: "O Definance é uma plataforma de gestão financeira inteligente que ajuda você a organizar seus gastos, planejar suas metas e ter uma visão clara do seu dinheiro. Através de automações e uma interface intuitiva, você consegue acompanhar suas finanças sem complicação."
  },
  {
    question: "Meus dados financeiros estão seguros?",
    answer: "Sim, a segurança é nossa prioridade máxima. Utilizamos criptografia de ponta a ponta e seguimos os mais rigorosos padrões de segurança para garantir que suas informações estejam sempre protegidas e acessíveis apenas por você."
  },
  {
    question: "Preciso ter conhecimentos técnicos para usar o Definance?",
    answer: "De forma alguma! O Definance foi desenhado para ser simples e intuitivo. Qualquer pessoa, independente do nível de conhecimento financeiro ou técnico, pode começar a usar e tirar proveito de todas as funcionalidades em poucos minutos."
  },
  {
    question: "Posso adicionar gastos recorrentes ou programados?",
    answer: "Sim! Você pode configurar contas fixas e gastos recorrentes (como aluguel, Netflix, academia) para que eles sejam lançados automaticamente ou apareçam como lembretes, ajudando você a nunca mais esquecer uma conta."
  },
  {
    question: "Posso usar o Definance para controlar gastos de toda a família?",
    answer: "Sim, você pode criar diferentes categorias e gerenciar múltiplas fontes de renda e despesas, permitindo um controle compartilhado ou individual de todos os fluxos financeiros da sua residência."
  },
  {
    question: "Como faço para começar a usar o Definance?",
    answer: "Basta clicar no botão 'Começar agora', realizar seu cadastro rápido e seguir o nosso fluxo de boas-vindas. Em menos de 2 minutos você já terá seu dashboard configurado e pronto para uso."
  }
]

export function FAQSection() {
  return (
    <section id="faq" className="relative overflow-hidden py-24 md:py-32">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 bottom-0 h-[400px] w-[800px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl opacity-50" />
      </div>

      <div className="container px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Tire suas dúvidas sobre como o Definance pode transformar sua relação com o dinheiro.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mx-auto max-w-4xl"
        >
          <div className="rounded-3xl border border-border bg-card/40 p-0.5 md:p-1.5 shadow-xl shadow-primary/5 backdrop-blur-md">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className={cn(
                    "border-b border-border/40 px-4 md:px-8 transition-all duration-150",
                    "hover:bg-muted/30 first:rounded-t-[1.4rem] last:rounded-b-[1.4rem] last:border-0"
                  )}
                >
                  <AccordionTrigger 
                    className={cn(
                      "py-5 md:py-7 text-left text-base font-semibold hover:no-underline transition-all duration-150",
                      "text-foreground/90 hover:text-foreground",
                      "flex items-center justify-between gap-4",
                      "[&[data-state=open]>span:last-child]:rotate-45 [&[data-state=open]>span:last-child]:text-primary [&[data-state=open]>span:last-child]:bg-primary/10"
                    )}
                    hideChevron
                  >
                    <span className="flex-1 leading-snug">{faq.question}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 transition-all duration-200 border border-border/50">
                      <Plus className="h-4 w-4" />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 md:pb-8 text-muted-foreground text-[14px] md:text-base leading-relaxed max-w-[95%] md:max-w-[90%]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  )
}