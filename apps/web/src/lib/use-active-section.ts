import { useEffect, useState } from "react";

/**
 * The id of the section crossing a reading line a third of the way down the
 * screen, or null while none does (above the first section, below the last).
 * The sections sit edge to edge, so at most two cross the line at once, and
 * the later one is the one that just reached it.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    // A refused analysis has fewer sections; only the ones on the page are watched.
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        const current = elements.filter((element) => crossing.has(element.id));
        setActive(current.at(-1)?.id ?? null);
      },
      // A one percent band, 30% of the way down: top and bottom margins leave only that strip.
      { rootMargin: "-30% 0px -69% 0px" },
    );
    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
