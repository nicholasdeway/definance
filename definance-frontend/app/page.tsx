import { SiteHeader } from "@/components/layout/site-header"
import { HeroSection } from "@/components/landing/hero-section"
import { WhatsAppIntegration } from "@/components/landing/whatsapp-integration"
import { ConsultationSection } from "@/components/landing/consultation-section"
import { FeaturesShowcase } from "@/components/landing/features-showcase"
import { BenefitsSection } from "@/components/landing/benefits-section"
import { DashboardPreview } from "@/components/landing/dashboard-preview"
import { MarqueeSection } from "@/components/landing/marquee-section"
import { FAQSection } from "@/components/landing/faq-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { Footer } from "@/components/landing/footer"
import { UrgencyBanner, StickyMobileCta } from "@/components/landing/sticky-cta-banner"

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Definance',
    url: 'https://definance.com.br',
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Faixa fixa de urgência — fixed independente, sempre no top-0 */}
      <UrgencyBanner />
      <SiteHeader variant="landing" />
      <main>
        <HeroSection />
        <WhatsAppIntegration />
        {/* Prova social logo cedo — antes dos features detalhados */}
        <TestimonialsSection />
        <ConsultationSection />
        <FeaturesShowcase />
        <BenefitsSection />
        <DashboardPreview />
        <MarqueeSection />
        {/* Pricing antes do FAQ — visitante convicto não precisa do FAQ */}
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
      {/* CTA sticky no mobile — aparece após 300px de scroll */}
      <StickyMobileCta />
    </div>
  )
}