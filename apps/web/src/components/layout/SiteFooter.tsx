import { AboutProject } from "@/components/footer/AboutProject";
import { BuilderCard } from "@/components/footer/BuilderCard";
import { LimitsNote } from "@/components/footer/LimitsNote";
import { PrivacyDetails } from "@/components/footer/PrivacyDetails";
import { StackBadges } from "@/components/footer/StackBadges";
import { FooterBar } from "@/components/footer/FooterBar";

export function SiteFooter() {
  return (
    <footer className="print:hidden">
      <section
        id="about"
        aria-labelledby="about-title"
        className="border-line bg-surface-sunken scroll-mt-14 border-t py-16"
      >
        <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="scroll-reveal-up space-y-6">
            <AboutProject />
            <LimitsNote />
            <PrivacyDetails />
            <StackBadges />
          </div>
          <div className="scroll-reveal-up scroll-delay-100 lg:sticky lg:top-20">
            <BuilderCard />
          </div>
        </div>
      </section>
      <FooterBar />
    </footer>
  );
}
