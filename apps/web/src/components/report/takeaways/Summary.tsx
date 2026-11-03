import { VERDICT_ICON } from "@/lib/verdict";
import type { Level, Takeaways } from "@/lib/report/types";

type Topic = Takeaways["bullets"][number]["topic"];

const TOPICS: { topic: Topic; title: string }[] = [
  { topic: "finding", title: "What we found" },
  { topic: "performance", title: "How well it works" },
  { topic: "caution", title: "Read with care" },
];

// Full class names written out, so Tailwind can always see them.
const ICON_CLASS: Record<Level, string> = {
  pass: "text-pass",
  warn: "text-warn",
  refuse: "text-refuse",
  info: "text-ink-faint",
};

/** The headline, then the engine's bullets under the topic each one names. */
export function Summary({ data }: { data: Takeaways }) {
  return (
    <div className="space-y-8">
      <p className="text-lead max-w-3xl font-medium">{data.headline}</p>

      {TOPICS.map(({ topic, title }) => {
        const bullets = data.bullets.filter((b) => b.topic === topic);
        if (bullets.length === 0) return null;
        return (
          <div key={topic}>
            <h3 className="text-lg font-semibold">{title}</h3>
            <ul className="mt-3 space-y-2">
              {bullets.map((bullet) => {
                const Icon = VERDICT_ICON[bullet.level];
                return (
                  <li key={bullet.text} className="flex gap-3 text-sm">
                    <Icon
                      className={`mt-0.5 size-4 shrink-0 ${ICON_CLASS[bullet.level]}`}
                      aria-hidden="true"
                    />
                    <span>{bullet.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {data.nonSignificantNote ? (
        <div>
          <h3 className="text-lg font-semibold">No clear evidence</h3>
          <p className="text-ink-muted mt-2 max-w-3xl text-sm">
            {data.nonSignificantNote}
          </p>
        </div>
      ) : null}
    </div>
  );
}
