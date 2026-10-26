import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProgressRail } from "@/components/layout/ProgressRail";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/hero/Hero";
import { ReportOutline } from "@/components/report/ReportOutline";
import { DataGlance } from "@/components/report/DataGlance";
import { DataHygiene } from "@/components/report/DataHygiene";
import { ExploreData } from "@/components/report/ExploreData";
import { AssumptionChecks } from "@/components/report/AssumptionChecks";
import { ModelResults } from "@/components/report/ModelResults";
import { ModelPerformance } from "@/components/report/ModelPerformance";
import { WhatIfExplorer } from "@/components/report/WhatIfExplorer";
import { TakeawaysExport } from "@/components/report/TakeawaysExport";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <ProgressRail />
      <main>
        <Hero />
        <ReportOutline />
        <DataGlance />
        <DataHygiene />
        <ExploreData />
        <AssumptionChecks />
        <ModelResults />
        <ModelPerformance />
        <WhatIfExplorer />
        <TakeawaysExport />
      </main>
      <SiteFooter />
    </>
  );
}
