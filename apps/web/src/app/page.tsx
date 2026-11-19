import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProgressRail } from "@/components/layout/ProgressRail";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/hero/Hero";
import { ReportOutline } from "@/components/report/ReportOutline";
import { ReportSections } from "@/components/report/ReportSections";
import { ReportGate } from "@/components/report/ReportGate";

export default function Home() {
  return (
    <>
      {/* Off screen until it takes focus: the first thing a keyboard visitor can reach. */}
      <a
        href="#main"
        className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-5 focus:py-2.5"
      >
        Skip to content
      </a>
      <SiteHeader />
      <ProgressRail />
      <main id="main" tabIndex={-1} className="outline-none">
        <ReportGate
          intro={
            <>
              <Hero />
              <ReportOutline />
            </>
          }
        >
          <ReportSections />
        </ReportGate>
      </main>
      <SiteFooter />
    </>
  );
}
