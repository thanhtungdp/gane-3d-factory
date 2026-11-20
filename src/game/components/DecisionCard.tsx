import { useEffect } from "react";
import type { Decision, DecisionOption } from "@/shared/types";
import { TONE_LABEL, toneForPoints } from "../engine/metrics";

const RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900";

const TONE_CLASS = {
  best: "border-[#4fd1c5]/50 bg-[#4fd1c5]/10",
  partial: "border-amber/45 bg-amber/10",
  miss: "border-hot/45 bg-hot/10",
} as const;

const TONE_TEXT = {
  best: "text-[#a9fff2]",
  partial: "text-[#ffd79b]",
  miss: "text-[#ffb39f]",
} as const;

export interface DecisionCardProps {
  decision: Decision;
  answeredOptionId?: string;
  onChoose: (option: DecisionOption) => void;
  /** Gọi khi thẻ bắt đầu hiển thị — session dùng để tính `ms`. */
  onShown?: (decisionId: string) => void;
  className?: string;
}

const LETTERS = ["A", "B", "C", "D"] as const;

/**
 * Quyết định nằm ngay trong hành động: thẻ này được nhúng vào vùng sương,
 * ngôi sao, mockup, bệ phóng hoặc tháng vận hành — không phải màn quiz riêng.
 */
export function DecisionCard({ decision, answeredOptionId, onChoose, onShown, className = "" }: DecisionCardProps) {
  useEffect(() => {
    onShown?.(decision.id);
  }, [decision.id, onShown]);

  const answered = Boolean(answeredOptionId);
  const chosen = decision.options.find((o) => o.id === answeredOptionId);

  return (
    <fieldset data-testid={`decision-${decision.id}`} className={`min-w-0 ${className}`}>
      <legend className="sr-only">{decision.prompt}</legend>
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <span className="chip">{decision.kind === "diagnosis" ? "Tự soi" : "Hiểu đúng"}</span>
        {decision.evidenceKey && decision.evidenceLabel ? (
          <span className="chip border-white/15 text-silver-dim">Bằng chứng: {decision.evidenceLabel}</span>
        ) : null}
      </div>
      <p className="h3 text-balance">{decision.prompt}</p>

      <div className="mt-2.5 grid gap-2" role="group" aria-label="Chọn một cách trả lời">
        {decision.options.map((option, index) => {
          const isChosen = option.id === answeredOptionId;
          const tone = toneForPoints(option.points);
          return (
            <button
              key={option.id}
              type="button"
              data-testid={`option-${option.id}`}
              className={`flex min-h-12 w-full touch-manipulation items-start gap-2.5 rounded-2xl border px-3 py-2.5 text-left text-[13.5px] leading-snug transition-colors ${RING} ${
                isChosen
                  ? `${TONE_CLASS[tone]} text-silver`
                  : answered
                    ? "border-white/8 bg-white/[0.03] text-muted"
                    : "border-white/12 bg-white/[0.05] text-silver active:bg-white/10"
              }`}
              aria-pressed={isChosen}
              disabled={answered}
              onClick={() => onChoose(option)}
            >
              <span
                aria-hidden="true"
                className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                  isChosen ? "border-white/30 bg-white/10 text-silver" : "border-white/15 text-muted"
                }`}
              >
                {LETTERS[index]}
              </span>
              <span className="min-w-0 flex-1">{option.label}</span>
              {answered ? (
                <span className={`shrink-0 pt-0.5 text-[10.5px] font-semibold ${TONE_TEXT[tone]}`}>
                  {TONE_LABEL[tone]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {answered && chosen ? (
        <div className="fade-up mt-2.5 rounded-xl border border-white/10 bg-navy-900/60 p-3">
          <p className="body text-silver">{chosen.feedback}</p>
          <p className="small muted mt-1.5">{decision.explain}</p>
        </div>
      ) : null}
    </fieldset>
  );
}
