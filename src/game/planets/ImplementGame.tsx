import { useEffect, useState } from "react";
import type { Decision, DecisionOption } from "@/shared/types";
import { MeterBar, QuestionAnchor, useQuestionFlow } from "../components";
import { GameDock } from "../components/GameDock";
import { IM_METER_START, applyChoiceCost, finalMeter, tickMeter } from "../engine/metrics";
import type { MiniGameProps } from "./types";

interface EventMeta {
  month: number;
  title: string;
}

const EVENTS: EventMeta[] = [
  { month: 2, title: "Người mới, logo cũ" },
  { month: 5, title: "Đại lý tự in biển hiệu" },
  { month: 8, title: "Freelancer mới" },
  { month: 11, title: "Mở chi nhánh mới" },
];

/** IM — tua 12 tháng, meter nhất quán 0–10, CTA nằm ở dock. */
export function ImplementGame({ content, session, reducedMotion }: MiniGameProps) {
  const { say, choose, complete, answered, markShown } = session;
  const { paused } = useQuestionFlow();
  const [eventIndex, setEventIndex] = useState(0);
  const [meter, setMeter] = useState(IM_METER_START);

  const finished = eventIndex >= EVENTS.length;
  const decision: Decision | undefined = finished ? undefined : content.decisions[eventIndex];
  const event = EVENTS[eventIndex];
  const answeredCurrent = Boolean(decision && answered[decision.id]);

  useEffect(() => {
    if (finished || paused) return;
    const timer = setInterval(() => {
      setMeter((prev) => tickMeter(prev, 1));
    }, 1_000);
    return () => clearInterval(timer);
  }, [eventIndex, finished, paused]);

  function handleChoose(decisionToAnswer: Decision, option: DecisionOption) {
    if (!choose(decisionToAnswer, option)) return;
    setMeter((prev) => applyChoiceCost(prev, option.points));
  }

  function advance() {
    const nextIndex = eventIndex + 1;
    if (nextIndex >= EVENTS.length) {
      setEventIndex(nextIndex);
      return;
    }
    setEventIndex(nextIndex);
    const nextMeta = EVENTS[nextIndex];
    if (nextMeta) {
      say(`KIM: tháng ${nextMeta.month}. ${nextMeta.title}. Độ nhất quán vẫn đang trôi theo thời gian.`);
    }
  }

  const meterFinal = finalMeter(meter);

  let dock: { label: string; disabled?: boolean; onClick?: () => void };
  if (finished) {
    dock = { label: `Hoàn tất trạm IM · ${meterFinal.toFixed(1)}/10`, onClick: () => complete({ meter: meterFinal }) };
  } else if (answeredCurrent) {
    dock = {
      label: eventIndex === EVENTS.length - 1 ? "Tua tới tháng 12" : "Tháng tiếp theo",
      onClick: advance,
    };
  } else {
    dock = { label: "Trả lời câu hỏi đang mở", disabled: true };
  }

  return (
    <div className="space-y-2">
      <div className="row-between">
        <p className="eyebrow">Trạm Vận Hành · 12 tháng</p>
        <span className="small muted mono-num">{finished ? "Tháng 12/12" : `Tháng ${event.month}/12`}</span>
      </div>
      <div className="flex items-end gap-1" aria-label="Tiến trình 12 tháng">
        {Array.from({ length: 12 }).map((_, index) => {
          const month = index + 1;
          const current = !finished && month === event.month;
          const passed = finished || month < (event.month ?? 13);
          return (
            <span
              key={`month-${month}`}
              className={`h-2 flex-1 rounded-full ${current ? "bg-amber" : passed ? "bg-[#4fd1c5]/60" : "bg-white/10"}`}
              aria-hidden="true"
            />
          );
        })}
      </div>

      <MeterBar value={meter} label="Độ nhất quán" />
      <div className="row-between">
        <span className="small muted">Mỗi giây chờ trừ 0,1. Lựa chọn chưa khớp trừ thêm.</span>
        <span className={`pill shrink-0 ${paused ? "pill--amber" : "pill--live"}`} aria-live="polite" data-testid="meter-state">
          {paused ? "Tạm dừng" : "Đang giảm"}
        </span>
      </div>

      {finished ? (
        <div className={`panel--flat p-4 ${reducedMotion ? "" : "fade-up"}`}>
          <p className="eyebrow">Kết quả 12 tháng</p>
          <p className="h3 mt-1">
            {meterFinal >= 8
              ? "Giữ được lửa qua 12 tháng."
              : meterFinal >= 5
                ? "Giữ được phần lớn, nhưng đã có chỗ phai."
                : "Mỗi tháng lệch một chút đã tạo nên một thương hiệu khác."}
          </p>
          <div className="mt-3">
            <MeterBar value={meterFinal} label="Độ nhất quán cuối" />
          </div>
        </div>
      ) : decision ? (
        <div data-testid={`im-event-${eventIndex}`} className="space-y-2">
          <p className="eyebrow">
            Tháng {event.month} · {event.title}
          </p>
          <QuestionAnchor
            decision={decision}
            answeredOptionId={answered[decision.id]}
            onChoose={(option) => handleChoose(decision, option)}
            onShown={markShown}
          />
        </div>
      ) : null}

      <GameDock>
        <button
          type="button"
          data-testid="continue"
          className="btn btn-primary btn-block"
          disabled={dock.disabled}
          onClick={dock.onClick}
        >
          {dock.label}
        </button>
      </GameDock>
    </div>
  );
}
