import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuestionAnchor } from "../components";
import { GameDock } from "../components/GameDock";
import { CRISIS_WINDOW_MS, isCrisisFast } from "../engine/metrics";
import type { MiniGameProps } from "./types";

const CARDS = [
  { id: "goal", label: "Mục tiêu & thông điệp", short: "Mục tiêu" },
  { id: "content", label: "Nội dung", short: "Nội dung" },
  { id: "internal", label: "Kích hoạt nội bộ", short: "Nội bộ" },
  { id: "launch", label: "Ra mắt", short: "Ra mắt" },
  { id: "measure", label: "Đo lường", short: "Đo lường" },
] as const;

const CORRECT_ORDER = CARDS.map((card) => card.id).join("|");

const CRISIS_OPTIONS = [
  { id: "facts", label: "Trả lời công khai bằng dữ kiện, nhận sai, nêu khắc phục", tone: "best" },
  { id: "private", label: "Nhắn riêng, xin lỗi và xử lý", tone: "partial" },
  { id: "wait", label: "Chờ cho qua, không trả lời", tone: "miss" },
  { id: "delete", label: "Xoá bình luận, nói khách hiểu sai", tone: "miss" },
] as const;

const CRISIS_RESULT: Record<string, { text: string; mood: "calm" | "partial" | "worse" }> = {
  facts: {
    text: "Bạn đối diện bằng dữ kiện và nhận phần sai. Bình luận vẫn còn, nhưng giọng đã dịu.",
    mood: "calm",
  },
  private: {
    text: "Bạn xử lý riêng. Người trong cuộc hài lòng, nhưng nhiều người ngoài vẫn thấy im lặng.",
    mood: "partial",
  },
  wait: {
    text: "Bạn chọn im lặng. Trong khủng hoảng, im lặng cũng là một câu trả lời.",
    mood: "worse",
  },
  delete: {
    text: "Bạn xoá bình luận và đổ lỗi. Cách này thường tạo thêm một cuộc khủng hoảng mới.",
    mood: "worse",
  },
};

const COMMENTS = ["Sao đổi màu logo?", "Không thấy ai trả lời", "Quảng cáo nói một kiểu"];

const MOOD_CLASS = {
  storm: "border-hot/40 bg-hot/10 text-[#ffb39f]",
  worse: "border-hot/60 bg-hot/20 text-[#ffb39f]",
  partial: "border-amber/40 bg-amber/10 text-[#ffd79b]",
  calm: "border-[#4fd1c5]/40 bg-[#4fd1c5]/10 text-[#a9fff2]",
} as const;

type Phase = "order" | "k1" | "k2" | "launch" | "k3" | "crisis" | "k4";

/** K — xếp thẻ, nạp phóng, xử lý khủng hoảng; CTA nằm ở dock. */
export function KickoffGame({ content, session, reducedMotion }: MiniGameProps) {
  const { say, choose, complete, answered, markShown } = session;
  const [phase, setPhase] = useState<Phase>("order");
  const [order, setOrder] = useState<string[]>([]);
  const [orderError, setOrderError] = useState(false);
  const [charge, setCharge] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [crisisRemaining, setCrisisRemaining] = useState(CRISIS_WINDOW_MS);
  const [crisisChoice, setCrisisChoice] = useState<string | null>(null);
  const [crisisDone, setCrisisDone] = useState(false);
  const [crisisFast, setCrisisFast] = useState(false);

  const holdingRef = useRef(false);
  const launchedRef = useRef(false);
  const crisisStartRef = useRef(0);
  const crisisDoneRef = useRef(false);
  const endCrisisRef = useRef<(choiceId: string | null) => void>(() => {});

  const k1 = content.decisions[0]!;
  const k2 = content.decisions[1]!;
  const k3 = content.decisions[2]!;
  const k4 = content.decisions[3]!;

  const mood = useMemo(() => {
    if (!crisisDone) return "storm" as const;
    if (!crisisChoice) return "worse" as const;
    return CRISIS_RESULT[crisisChoice]?.mood ?? "worse";
  }, [crisisDone, crisisChoice]);

  const crisisResult = crisisDone
    ? crisisChoice
      ? CRISIS_RESULT[crisisChoice]
      : { text: "Bạn để đồng hồ chạy hết mà không trả lời. Im lặng cũng là một câu trả lời.", mood: "worse" as const }
    : null;

  const addCharge = useCallback((amount: number) => {
    setCharge((prev) => {
      if (launchedRef.current) return prev;
      const next = Math.min(100, prev + amount);
      if (next >= 100) {
        holdingRef.current = false;
        launchedRef.current = true;
        setLaunched(true);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!holdingRef.current || launchedRef.current) return;
      addCharge(2.6);
    }, 50);
    return () => clearInterval(timer);
  }, [addCharge]);

  useEffect(() => {
    if (!launched) return;
    say("KIM: tàu đã rời bệ phóng. Trước khi mở bình luận, chốt người phát ngôn.");
    const timer = setTimeout(() => setPhase("k3"), reducedMotion ? 200 : 900);
    return () => clearTimeout(timer);
  }, [launched, reducedMotion, say]);

  useEffect(() => {
    if (phase !== "crisis" || crisisDone) return;
    crisisStartRef.current = Date.now();
    const timer = setInterval(() => {
      const left = CRISIS_WINDOW_MS - (Date.now() - crisisStartRef.current);
      if (left <= 0) {
        clearInterval(timer);
        endCrisisRef.current(null);
        return;
      }
      setCrisisRemaining(left);
    }, 100);
    return () => clearInterval(timer);
  }, [phase, crisisDone]);

  const endCrisis = useCallback(
    (choiceId: string | null) => {
      if (crisisDoneRef.current) return;
      crisisDoneRef.current = true;
      const elapsed = Date.now() - crisisStartRef.current;
      setCrisisFast(isCrisisFast(elapsed));
      setCrisisChoice(choiceId);
      setCrisisDone(true);
      const option = choiceId ? CRISIS_OPTIONS.find((item) => item.id === choiceId) : null;
      say(
        choiceId
          ? `KIM: ${option?.tone === "best" ? "Đúng hướng." : "Cần cân nhắc."} ${CRISIS_RESULT[choiceId]?.text ?? ""}`
          : "KIM: hết 30 giây. Bạn chưa chọn cách phản hồi. Trong khủng hoảng, im lặng cũng là một câu trả lời.",
      );
    },
    [say],
  );

  useEffect(() => {
    endCrisisRef.current = endCrisis;
  }, [endCrisis]);

  function placeCard(cardId: string) {
    setOrder((prev) => (prev.includes(cardId) || prev.length >= 5 ? prev : [...prev, cardId]));
    setOrderError(false);
  }

  function removeCard(index: number) {
    setOrder((prev) => prev.filter((_, i) => i !== index));
    setOrderError(false);
  }

  function checkOrder() {
    if (order.length < CARDS.length) return;
    if (order.join("|") === CORRECT_ORDER) {
      setOrderError(false);
      setPhase("k1");
      say("KIM: thứ tự đúng. Giờ kiểm tra một câu trước khi ra mắt.");
      return;
    }
    setOrderError(true);
    say("KIM: thử lại thứ tự. Mục tiêu, nội dung, nội bộ, ra mắt, đo lường.");
  }

  type DockInfo = { label: string; disabled?: boolean; onClick?: () => void };
  let dock: DockInfo;
  if (phase === "order") {
    dock =
      order.length < CARDS.length
        ? { label: `Xếp đủ 5 thẻ · ${order.length}/5`, disabled: true }
        : { label: orderError ? "Thử lại thứ tự" : "Kiểm tra thứ tự", onClick: checkOrder };
  } else if (phase === "k1") {
    dock = answered[k1.id]
      ? { label: "Chọn câu cho màn hình ra mắt", onClick: () => setPhase("k2") }
      : { label: "Trả lời câu hỏi đang mở", disabled: true };
  } else if (phase === "k2") {
    dock = answered[k2.id]
      ? { label: "Nạp năng lượng", onClick: () => setPhase("launch") }
      : { label: "Trả lời câu hỏi đang mở", disabled: true };
  } else if (phase === "launch") {
    dock = { label: launched ? "Đang phóng…" : charge > 0 ? "Đang nạp…" : "Giữ nút để nạp", disabled: true };
  } else if (phase === "k3") {
    dock = answered[k3.id]
      ? {
          label: "Mở bình luận",
          onClick: () => {
            setPhase("crisis");
            say("KIM: 30 giây. Bình luận đang bay — chọn cách phản hồi.");
          },
        }
      : { label: "Trả lời câu hỏi đang mở", disabled: true };
  } else if (phase === "crisis") {
    dock = crisisDone
      ? { label: "Rút kinh nghiệm sau khủng hoảng", onClick: () => setPhase("k4") }
      : { label: `Chọn cách phản hồi · ${Math.ceil(crisisRemaining / 1000)}s`, disabled: true };
  } else {
    dock = answered[k4.id]
      ? { label: "Hoàn tất trạm K", onClick: () => complete({ crisisFast }) }
      : { label: "Trả lời câu hỏi đang mở", disabled: true };
  }

  return (
    <div className="space-y-2">
      {phase === "order" ? (
        <>
          <div className="row-between">
            <p className="eyebrow">Bệ Phóng · 5 việc</p>
            <span className="pill mono-num">{order.length}/5</span>
          </div>
          <p className="small muted">Chạm chip để xếp; chạm ô để bỏ ra.</p>
          <div className="flex gap-1" aria-label="Thứ tự 5 việc ra mắt">
            {Array.from({ length: 5 }).map((_, index) => {
              const cardId = order[index];
              const card = cardId ? CARDS.find((item) => item.id === cardId) : null;
              return (
                <button
                  key={`slot-${index}`}
                  type="button"
                  data-testid={`launch-slot-${index}`}
                  aria-label={card ? `Vị trí ${index + 1}: ${card.label}. Chạm để bỏ ra` : `Vị trí ${index + 1} còn trống`}
                  className={`launch-slot flex-1 ${card ? "launch-slot--filled" : ""}`}
                  onClick={() => (card ? removeCard(index) : undefined)}
                >
                  <span className="mono-num text-[10px] opacity-70">{index + 1}</span>
                  <span className="text-[10px] leading-tight">{card ? card.short : "…"}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CARDS.filter((card) => !order.includes(card.id)).map((card) => (
              <button
                key={card.id}
                type="button"
                data-testid={`launch-card-${card.id}`}
                className="chip min-h-11 px-3 text-[12px] active:bg-white/10"
                aria-label={`Xếp thẻ ${card.label}`}
                onClick={() => placeCard(card.id)}
              >
                {card.label}
              </button>
            ))}
          </div>
          {orderError ? (
            <p role="alert" className="small text-[#ffb39f]">
              Thứ tự chưa đúng. Gợi ý: thông điệp trước nội dung, đo lường sau ra mắt.
            </p>
          ) : null}
        </>
      ) : null}

      {phase === "k1" ? (
        <>
          <p className="eyebrow">Trước khi ra mắt</p>
          <QuestionAnchor decision={k1} answeredOptionId={answered[k1.id]} onChoose={(option) => choose(k1, option)} onShown={markShown} />
        </>
      ) : null}

      {phase === "k2" ? (
        <>
          <p className="eyebrow">Màn hình ra mắt</p>
          <QuestionAnchor decision={k2} answeredOptionId={answered[k2.id]} onChoose={(option) => choose(k2, option)} onShown={markShown} />
        </>
      ) : null}

      {phase === "launch" ? (
        <div className="panel--flat p-4 text-center">
          <p className="eyebrow justify-center">Nạp & phóng</p>
          <p className="small muted mt-1">Giữ nút, hoặc chạm liên tục tới khi đầy.</p>
          <div className="mt-3">
            <div
              className="relative h-3 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label="Năng lượng phóng"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(charge)}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber to-hot transition-[width] duration-100"
                style={{ width: `${charge}%` }}
              />
            </div>
            <p className="mono-num small mt-1 text-silver-dim">{Math.round(charge)} / 100</p>
          </div>
          <button
            type="button"
            data-testid="launch-hold"
            className={`btn btn-block mt-3 min-h-14 touch-none select-none ${launched ? "btn-silver" : "btn-primary"}`}
            aria-label="Giữ để nạp năng lượng và phóng tàu"
            disabled={launched}
            onPointerDown={() => {
              if (!launchedRef.current) holdingRef.current = true;
            }}
            onPointerUp={() => {
              holdingRef.current = false;
            }}
            onPointerLeave={() => {
              holdingRef.current = false;
            }}
            onPointerCancel={() => {
              holdingRef.current = false;
            }}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                if (!launchedRef.current) holdingRef.current = true;
              }
            }}
            onKeyUp={() => {
              holdingRef.current = false;
            }}
            onClick={() => addCharge(12)}
          >
            {launched ? "Đã phóng" : charge > 0 ? "Đang nạp…" : "Giữ để nạp"}
          </button>
          {launched ? <p className="small mt-2 text-[#ffd79b]">Tàu đã rời bệ phóng.</p> : null}
        </div>
      ) : null}

      {phase === "k3" ? (
        <>
          <p className="eyebrow">Trước khi mở bình luận</p>
          <QuestionAnchor decision={k3} answeredOptionId={answered[k3.id]} onChoose={(option) => choose(k3, option)} onShown={markShown} />
        </>
      ) : null}

      {phase === "crisis" ? (
        <>
          <div className="row-between">
            <p className="eyebrow">Khủng hoảng 30 giây</p>
            <span className={`mono-num text-[13px] font-semibold ${crisisRemaining < 10_000 ? "text-hot" : "text-amber"}`}>
              {crisisDone ? "Đã chốt" : `${(crisisRemaining / 1000).toFixed(1)}s`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${crisisRemaining < 10_000 ? "bg-hot" : "bg-amber"}`}
              style={{ width: `${Math.max(0, Math.min(100, (crisisRemaining / CRISIS_WINDOW_MS) * 100))}%` }}
            />
          </div>
          <div className="flex max-h-8 flex-nowrap gap-1.5 overflow-hidden" aria-label="Bình luận đang bay">
            {COMMENTS.map((comment, index) => (
              <span
                key={comment}
                className={`pill min-h-7 shrink-0 whitespace-nowrap px-2 text-[10.5px] ${MOOD_CLASS[mood]} ${reducedMotion ? "" : "float"}`}
                style={reducedMotion ? undefined : { animationDelay: `${index * 0.45}s`, animationDuration: `${5 + (index % 3)}s` }}
              >
                {comment}
              </span>
            ))}
          </div>
          {!crisisDone ? (
            <div className="grid gap-1.5">
              {CRISIS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  data-testid={`crisis-option-${option.id}`}
                  className="min-h-11 w-full rounded-xl border border-white/12 bg-white/[0.05] px-2.5 py-2 text-left text-[12px] leading-snug text-silver focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber active:bg-white/10"
                  onClick={() => endCrisis(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <div className={`rounded-xl border p-2.5 ${MOOD_CLASS[mood]}`} role="status">
              <p className="text-[12px] leading-snug">{crisisResult?.text}</p>
            </div>
          )}
        </>
      ) : null}

      {phase === "k4" ? (
        <>
          <p className="small muted">
            {crisisFast ? "Bạn phản hồi trong 10 giây đầu." : "Bạn phản hồi sau 10 giây đầu."} Ghi lại bài học.
          </p>
          <QuestionAnchor decision={k4} answeredOptionId={answered[k4.id]} onChoose={(option) => choose(k4, option)} onShown={markShown} />
        </>
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
