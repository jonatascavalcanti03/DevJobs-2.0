import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturedJobsSection } from "@/components/landing/FeaturedJobsSection";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  let currentUser: { email: string | null; role: string | null } | null = null;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        currentUser = {
          email: user.email ?? null,
          role: userData?.role ?? null,
        };
      }
    }
  } catch {
    currentUser = null;
  }

  return (
    <>
      <Header user={currentUser} />
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
