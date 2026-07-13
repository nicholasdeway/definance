"use client"

import * as React from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Shield, Sparkles, CreditCard, MessageSquare, AlertCircle } from "lucide-react"

export default function TermosPage() {
  React.useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader variant="landing" />

      <main className="flex-1 container max-w-4xl mx-auto px-6 py-24 md:py-32">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Voltar para o Início
        </Link>

        {/* Page Header */}
        <div className="space-y-4 mb-12 border-b border-border/60 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <FileText className="h-3.5 w-3.5" />
            Legal
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Termos de Uso
          </h1>
          <p className="text-muted-foreground text-sm">
            Última atualização: 14 de junho de 2026
          </p>
        </div>

        {/* Document Content */}
        <div className="space-y-10 text-muted-foreground leading-relaxed text-sm md:text-base">

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">1</span>
              Aceitação dos Termos
            </h2>
            <p>
              Ao criar uma conta ou utilizar qualquer funcionalidade do <strong>Definance</strong> (definance.com.br), você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer uma das condições aqui estabelecidas, recomendamos que não utilize a nossa plataforma nem integre nossos serviços.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">2</span>
              Descrição do Serviço
            </h2>
            <p>
              O <strong>Definance</strong> é um ecossistema tecnológico voltado para a gestão financeira pessoal. Ele disponibiliza:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mapeamento inicial de perfil financeiro por meio de onboarding passo a passo.</li>
              <li>Sincronização e projeção automática de rendimentos (receitas semanais, quinzenais e mensais).</li>
              <li>Acompanhamento de despesas fixas, financiamento de veículos e quitação de dívidas.</li>
              <li>Painel visual de controle (Dashboard) com métricas de fluxo de caixa, limites orçamentários por categoria e metas de poupança (Metas).</li>
              <li>Assistente cognitivo de IA via integração com WhatsApp para registro de despesas e consultas em linguagem natural.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">3</span>
              Onboarding e Sincronização de Dados
            </h2>
            <p>
              Para melhor aproveitamento da plataforma, o usuário declara e concorda que:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ao preencher as informações de despesas e rendas no assistente de onboarding, o sistema gerará lançamentos projetados automáticos em sua conta para o mês corrente, evitando o retrabalho de digitação manual.</li>
              <li>O backend do Definance realiza um alinhamento bidirecional. Caso o usuário opte por excluir uma conta sincronizada no painel de controle, o sistema removerá a referência correspondente dentro do seu JSON de perfil para evitar que o registro ressurja em futuras sincronizações.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">4</span>
              Integração de IA via WhatsApp
            </h2>
            <div className="bg-muted/40 border border-border/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <MessageSquare className="h-5 w-5 text-emerald-500" />
                Interações por Mensagem e Áudio
              </div>
              <p className="text-sm">
                O Definance disponibiliza um assistente financeiro no WhatsApp operacionalizado pela API da Groq. O usuário compreende que as mensagens de texto e áudios enviados ao número oficial do Definance são processados cognitivamente para identificar parâmetros de transação (valores, categorias e datas).
              </p>
              <p className="text-sm">
                Para garantir a segurança, transações complexas ou baixas de contas (pagamento) exigirão a confirmação explícita do usuário antes da efetivação no banco de dados. A IA não processará comandos que não contenham parâmetros mínimos necessários para a consistência fiscal (como valor e descrição).
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">5</span>
              Planos, Assinaturas e Pagamentos
            </h2>
            <p>
              O acesso aos recursos analíticos avançados e consultas ilimitadas da IA é protegido pelo status <strong>Premium</strong>.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Checkout e Gateways:</strong> Os pagamentos são processados via Stripe (assinaturas recorrentes) e Mercado Pago (cobrança única avulsa com fallback de validação via API e chaves de idempotência anti-duplicidade).</li>
              <li><strong>Controle de Acesso:</strong> Se a assinatura expirar ou for cancelada, o backend bloqueará o acesso às ferramentas premium utilizando um filtro centralizado que retornará código HTTP <code className="text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded">402 Payment Required</code>.</li>
              <li><strong>Políticas de Reembolso e Estorno:</strong> Garantimos o direito de arrependimento e reembolso integral em até 7 (sete) dias após a contratação. O processamento do reembolso rebaixa o usuário ao plano gratuito instantaneamente por meio de webhooks de notificação de estorno.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">6</span>
              Limitação de Responsabilidade
            </h2>
            <div className="flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
              <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-sm md:text-base">Isenção de Aconselhamento Financeiro</h4>
                <p className="text-sm">
                  O Definance é estritamente uma ferramenta tecnológica de consolidação de dados e acompanhamento financeiro. As análises de rentabilidade, gráficos de evolução patrimonial ou estimativas futuras não constituem recomendações, consultorias de investimentos, assessoria jurídica ou fiscal. Toda e qualquer decisão financeira tomada pelo usuário com base nos dados exibidos na plataforma é de sua inteira responsabilidade.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">7</span>
              Alterações nos Termos
            </h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento para refletir melhorias no produto, mudanças regulatórias ou novos fluxos de dados. Eventuais mudanças significativas serão notificadas diretamente no painel do usuário ou por e-mail cadastrado.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
