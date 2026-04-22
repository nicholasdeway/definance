import { SiteHeader } from "@/components/layout/site-header"
import { HeroSection } from "@/components/landing/hero-section"
import { BenefitsSection } from "@/components/landing/benefits-section"
import { DashboardPreview } from "@/components/landing/dashboard-preview"
import { MarqueeSection } from "@/components/landing/marquee-section"
import { FAQSection } from "@/components/landing/faq-section"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="landing" />
      <main>
        <HeroSection />
        <BenefitsSection />
        <DashboardPreview />
        <MarqueeSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}