import { HeroIntro } from "@/components/hero/HeroIntro";
import { UploadZone } from "@/components/hero/UploadZone";
import { SampleDataButton } from "@/components/hero/SampleDataButton";
import { TrustLine } from "@/components/hero/TrustLine";
import { ProductPreview } from "@/components/hero/ProductPreview";
import { ScrollCue } from "@/components/hero/ScrollCue";

export function Hero() {
  return (
    <section
      aria-label="Introduction"
      className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col gap-6 px-6 py-12"
    >
      <HeroIntro />
      <div className="reveal-up reveal-delay-300 mx-auto flex w-full max-w-2xl flex-col gap-6">
        <UploadZone />
        <SampleDataButton />
      </div>
      <TrustLine />
      <ProductPreview />
      <ScrollCue />
    </section>
  );
}
