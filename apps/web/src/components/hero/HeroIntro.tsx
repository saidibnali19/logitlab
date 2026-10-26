export function HeroIntro() {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="badge badge-brand reveal-up">
        Binary logistic regression, end to end
      </span>

      <h1 className="reveal-up reveal-delay-100 text-display mt-6 text-balance">
        <span className="block">Upload a CSV.</span>
        <span className="block">Get a statistician&apos;s analysis.</span>
      </h1>

      <p className="reveal-up reveal-delay-200 text-lead text-ink-muted mt-6 max-w-2xl text-balance">
        LogitLab cleans your data, tests the assumptions, fits the model and
        explains every choice. It refuses analyses that would mislead.
      </p>
    </div>
  );
}
