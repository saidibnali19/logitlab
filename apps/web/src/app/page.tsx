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
      <SiteHeader />
      <ProgressRail />
      <main>
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
