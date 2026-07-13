"use client"

import * as React from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Eye, Database, Share2, Scale, HelpCircle } from "lucide-react"

export default function PrivacidadePage() {
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
            <Shield className="h-3.5 w-3.5" />
            LGPD Compliance
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground text-sm">
            Última atualização: 13 de julho de 2026
          </p>
        </div>

        {/* Document Content */}
        <div className="space-y-10 text-muted-foreground leading-relaxed text-sm md:text-base">

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">1</span>
              Compromisso com a Privacidade (LGPD)
            </h2>
            <p>
              O <strong>Definance</strong> assume o compromisso de proteger a privacidade e os dados pessoais de seus usuários de acordo com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong>. Esta política descreve de forma clara e transparente quais dados nós coletamos, como eles são tratados, quem possui acesso e como você pode gerenciar os seus direitos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">2</span>
              Quais Dados Nós Coletamos?
            </h2>
            <p>
              Durante a sua jornada de uso no ecossistema Definance, coletamos os seguintes tipos de informações:
            </p>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="border border-border/60 rounded-2xl p-5 space-y-2 bg-muted/20">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Perfil do Onboarding
                </h4>
                <p className="text-xs">
                  Dados de renda declarada, despesas recorrentes domésticas (água, luz, internet, etc.), custos e parcelamentos de veículos ou empréstimos ativos informados voluntariamente no questionário inicial.
                </p>
              </div>

              <div className="border border-border/60 rounded-2xl p-5 space-y-2 bg-muted/20">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Dados da Conta e Acesso
                </h4>
                <p className="text-xs">
                  Nome, endereço de e-mail e hash criptografado da senha de acesso. Para conexão e segurança dos dados, utilizamos autenticação robusta via tokens JWT.
                </p>
              </div>

              <div className="border border-border/60 rounded-2xl p-5 space-y-2 bg-muted/20">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Mensageria e Integração IA
                </h4>
                <p className="text-xs">
                  O número de telefone celular formatado no padrão internacional (E.164) e as mensagens de áudio ou texto de interações operadas através do nosso bot financeiro no WhatsApp.
                </p>
              </div>

              <div className="border border-border/60 rounded-2xl p-5 space-y-2 bg-muted/20">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  Dados de Faturamento (Checkout)
                </h4>
                <p className="text-xs">
                  Identificadores de transação (IDs de cliente e assinatura Stripe e Mercado Pago) utilizados para validar o status da assinatura e a idempotência contra duplicidade de cobrança.
                </p>
              </div>
            </div>
            <p className="mt-4">
              <strong>Cookies e Pixels de Terceiros:</strong> Utilizamos tecnologias de rastreamento como o <strong>Meta Pixel (Meta Platforms, Inc.)</strong> para coletar dados comportamentais (como visitas ao site, cliques em botões e início de assinaturas). Isso nos ajuda a mensurar a performance de nossas campanhas de marketing, otimizar anúncios e oferecer uma experiência personalizada. Você pode gerenciar ou desativar o rastreamento de cookies diretamente nas configurações do seu navegador.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">3</span>
              Finalidade do Tratamento de Dados
            </h2>
            <p>
              O processamento e o tratamento dos dados coletados pelo Definance possuem finalidades exclusivamente operacionais e estatísticas:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Consolidação Visual:</strong> Agregação e organização de receitas e despesas por categorias no Dashboard, alimentando gráficos (Recharts) e relatórios.</li>
              <li><strong>Sincronização Ativa:</strong> Manter o alinhamento das contas recorrentes declaradas com o perfil de usuário. Se uma despesa associada for excluída no Dashboard, ela também é ajustada automaticamente no JSON do perfil financeiro para garantir a consistência das projeções.</li>
              <li><strong>Processamento de IA (Natural Language):</strong> Análise de comandos enviados no WhatsApp para mapear de forma autônoma valores e categorizações no banco de dados.</li>
              <li><strong>Controle de Assinatura:</strong> Proteção de endpoints analíticos usando filtros de acesso e a checagem da flag `IsPremium` com base na data do último faturamento no banco de dados PostgreSQL.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">4</span>
              Compartilhamento Seguro com Parceiros
            </h2>
            <p>
              Não comercializamos nem alugamos dados pessoais. Para o funcionamento correto da plataforma, compartilhamos dados de forma estritamente controlada com os seguintes parceiros homologados:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>OpenAI Inc. (API):</strong> Transmissão de áudios e textos enviados via WhatsApp para processamento de linguagem natural. As mensagens enviadas são anonimizadas para remover dados pessoais diretos.</li>
              <li><strong>Twilio Inc. (WhatsApp API):</strong> Para recebimento e despacho das mensagens e arquivos de mídia do chatbot de IA.</li>
              <li><strong>Stripe e Mercado Pago (Gateways de Checkout):</strong> Para validação, processamento e renovação automática de planos Premium e processamento idempotente de notificações de webhook de estornos/reembolsos.</li>
              <li><strong>Meta Platforms, Inc. (Meta Pixel / WhatsApp):</strong> Rastreamento de eventos de conversão (acesso ao site, cliques e finalizações de checkout) para otimização de publicidade, além da infraestrutura de envio e recebimento de mensagens do chatbot no WhatsApp.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">5</span>
              Seus Direitos sob a LGPD
            </h2>
            <p>
              Como titular dos dados pessoais, você pode exercer os seguintes direitos a qualquer momento:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Confirmação e Acesso:</strong> Obter a confirmação de tratamento de dados e o detalhamento de tudo o que está registrado no seu perfil financeiro.</li>
              <li><strong>Retificação:</strong> Corrigir dados incompletos ou inexatos no painel de configurações da conta.</li>
              <li><strong>Eliminação (Direito ao Esquecimento):</strong> Solicitar a exclusão definitiva dos seus dados pessoais. O backend apagará de forma definitiva os registros de transações, vinculações de WhatsApp e dados de onboarding em nossos servidores.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">6</span>
              Segurança e Guarda de Informações
            </h2>
            <p>
              Adotamos práticas robustas de segurança da informação para blindar a nossa base de dados:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uso de criptografia HTTPS/TLS para tráfego seguro de requisições.</li>
              <li>Senhas criptografadas por algoritmos modernos no backend (.NET Core).</li>
              <li>Sistemas de filas idempotentes que registram chaves exclusivas de eventos de checkout na tabela `processed_webhook_events` para mitigar ataques ou duplicações em transações Stripe e Mercado Pago.</li>
            </ul>
          </section>

          <section className="space-y-4 border-t border-border/60 pt-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Dúvidas ou Requisições LGPD?
            </h3>
            <p>
              Caso tenha dúvidas sobre como seus dados são coletados e processados, ou se desejar exercer qualquer um dos seus direitos listados acima, entre em contato direto com o nosso Encarregado pelo Tratamento de Dados Pessoais (DPO) através do e-mail: <a href="mailto:suporte@definance.com.br" className="text-primary hover:underline">suporte@definance.com.br</a>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
