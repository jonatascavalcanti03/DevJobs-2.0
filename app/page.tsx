import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturedJobsSection } from "@/components/landing/FeaturedJobsSection";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <BenefitsSection />
        <HowItWorksSection />
        <FeaturedJobsSection />
        <CommunitySection />
        <CtaFooterSection />
      </main>
    </>
  );
}
