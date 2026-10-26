import { ROC } from "@/lib/preview-data";

const S = 220;
const L = 38;
const R = 10;
const T = 10;
const B = 34;
const PW = S - L - R;
const PH = S - T - B;

// Curve shape y = x^k with k chosen so the area under it equals the reported AUC.
const K = 1 / ROC.auc - 1;

const px = (fpr: number) => L + fpr * PW;
const py = (tpr: number) => T + (1 - tpr) * PH;

const points = Array.from({ length: 41 }, (_, i) => i / 40);
const line = points
  .map(
    (f, i) =>
      `${i === 0 ? "M" : "L"}${px(f).toFixed(1)} ${py(f ** K).toFixed(1)}`,
  )
  .join(" ");
const area = `${line} L${px(1)} ${py(0)} L${px(0)} ${py(0)} Z`;

export function MiniRocCurve() {
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      role="img"
      aria-label={`ROC curve with an AUC of ${ROC.auc}. At the threshold of ${ROC.point.threshold}, sensitivity is 72 percent.`}
      className="h-auto w-full"
    >
      {[0, 0.5, 1].map((v) => (
        <g key={v}>
          <line
            x1={L}
            x2={L + PW}
            y1={py(v)}
            y2={py(v)}
            className="stroke-chart-grid"
          />
          <text
            x={L - 6}
            y={py(v) + 3}
            textAnchor="end"
            className="fill-ink-muted text-[9px]"
          >
            {v}
          </text>
          <text
            x={px(v)}
            y={T + PH + 12}
            textAnchor="middle"
            className="fill-ink-muted text-[9px]"
          >
            {v}
          </text>
        </g>
      ))}

      <line
        x1={px(0)}
        y1={py(0)}
        x2={px(1)}
        y2={py(1)}
        className="stroke-chart-ref"
        strokeDasharray="4 3"
      />
      <path d={area} className="fill-chart-band" opacity={0.35} />
      <path d={line} fill="none" className="stroke-chart-1" strokeWidth={2.5} />

      <circle
        cx={px(ROC.point.fpr)}
        cy={py(ROC.point.tpr)}
        r={4.5}
        className="fill-surface stroke-chart-1"
        strokeWidth={2}
      />
      <text
        x={px(ROC.point.fpr) + 8}
        y={py(ROC.point.tpr) + 14}
        className="fill-ink text-[9px]"
      >
        threshold {ROC.point.threshold}
      </text>

      <text
        x={px(0.5)}
        y={S - 4}
        textAnchor="middle"
        className="fill-ink-muted text-[9px]"
      >
        1 − Specificity
      </text>
      <text
        transform={`translate(9 ${py(0.5)}) rotate(-90)`}
        textAnchor="middle"
        className="fill-ink-muted text-[9px]"
      >
        Sensitivity
      </text>
    </svg>
  );
}
