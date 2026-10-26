import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 py-10">
      <div className="mx-auto max-w-5xl px-6">
        <ComponentPlaceholder
          name="SiteFooter"
          description="Privacy note, GitHub link, and a short credit for the final-year project."
        />
      </div>
    </footer>
  );
}
