import { SiteHeader } from "@/components/layout/site-header"
import { HeroSection } from "@/components/landing/hero-section"
import { WhatsAppIntegration } from "@/components/landing/whatsapp-integration"
import { FeaturesShowcase } from "@/components/landing/features-showcase"
import { BenefitsSection } from "@/components/landing/benefits-section"
import { DashboardPreview } from "@/components/landing/dashboard-preview"
import { MarqueeSection } from "@/components/landing/marquee-section"
import { FAQSection } from "@/components/landing/faq-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { Footer } from "@/components/landing/footer"

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
      <SiteHeader variant="landing" />
      <main>
        <HeroSection />
        <WhatsAppIntegration />
        <FeaturesShowcase />
        <BenefitsSection />
        <DashboardPreview />
        <MarqueeSection />
        <FAQSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}