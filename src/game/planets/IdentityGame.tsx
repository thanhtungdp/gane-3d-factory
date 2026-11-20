import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrandMark, QuestionAnchor } from "../components";
import { GameDock } from "../components/GameDock";
import { colorVariants, hueShift, primaryColor } from "../engine/brand";
import { SPOT_WINDOW_MS, oTimeBonus } from "../engine/metrics";
import type { MiniGameProps } from "./types";

type Step = "spot" | "o1" | "memory" | "o2" | "o3";

interface Mockup {
  id: string;
  label: string;
  wrong: boolean;
  reason: "color" | "font";
}

const MOCKUPS: Mockup[] = [
  { id: "card", label: "Danh thiếp", wrong: false, reason: "color" },
  { id: "sign", label: "Biển hiệu", wrong: true, reason: "font" },
  { id: "uniform", label: "Đồng phục", wrong: false, reason: "color" },
  { id: "app", label: "App", wrong: true, reason: "color" },
  { id: "van", label: "Xe giao hàng", wrong: false, reason: "color" },
  { id: "fanpage", label: "Fanpage", wrong: false, reason: "color" },
];

const WRONG_WORD = {
  color: "Màu lệch khỏi màu chính.",
  font: "Font lệch khỏi font chính.",
} as const;

/** O — 6 bề mặt nhận diện, tìm lỗi nhanh, nhớ màu, trả timeBonus. */
export function IdentityGame({ content, brand, session, reducedMotion }: MiniGameProps) {
  const say = session.say;
  const [step, setStep] = useState<Step>("spot");
  const [found, setFound] = useState<string[]>([]);
  const [foundBoth, setFoundBoth] = useState(false);
  const [spotMs, setSpotMs] = useState(SPOT_WINDOW_MS);
  const [remainingMs, setRemainingMs] = useState(SPOT_WINDOW_MS);
  const [memoryCorrect, setMemoryCorrect] = useState(false);
  const [memoryStage, setMemoryStage] = useState<"flash" | "answer">("flash");

  const foundRef = useRef<string[]>([]);
  const spotStartRef = useRef(0);
  const primary = useMemo(() => primaryColor(brand), [brand]);
  const wrongColor = useMemo(() => hueShift(primary, 155), [primary]);
  const swatches = useMemo(() => {
    const variants = colorVariants(primary);
    const items = [
      { hex: primary, correct: true },
      { hex: variants[0], correct: false },
      { hex: variants[1], correct: false },
    ];
    const offset = (parseInt(primary.slice(1, 3), 16) || 0) % items.length;
    return [...items.slice(offset), ...items.slice(0, offset)];
  }, [primary]);

  const spot = content.decisions[0]!;
  const colorWhy = content.decisions[1]!;
  const guideline = content.decisions[2]!;

  const finishSpot = useCallback((both: boolean) => {
    setFoundBoth(both);
    setSpotMs(both ? Date.now() - spotStartRef.current : SPOT_WINDOW_MS);
    setRemainingMs(both ? Math.max(0, SPOT_WINDOW_MS - (Date.now() - spotStartRef.current)) : 0);
    setStep("o1");
  }, []);

  useEffect(() => {
    if (step !== "spot") return;
    spotStartRef.current = Date.now();
    const timer = setInterval(() => {
      const left = SPOT_WINDOW_MS - (Date.now() - spotStartRef.current);
      if (left <= 0) {
        clearInterval(timer);
        finishSpot(false);
        return;
      }
      setRemainingMs(left);
    }, 100);
    const hintTimer = setTimeout(() => {
      say("KIM: nhìn màu nền và kiểu chữ, không chỉ nhìn logo. Hai bề mặt đang nói khác phần còn lại.");
    }, 8_000);
    return () => {
      clearInterval(timer);
      clearTimeout(hintTimer);
    };
  }, [step, finishSpot, say]);

  useEffect(() => {
    if (step !== "memory") return;
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started >= 3_000) {
        clearInterval(timer);
        setMemoryStage("answer");
      }
    }, 100);
    return () => clearInterval(timer);
  }, [step]);

  function inspectMockup(mockup: Mockup) {
    if (step !== "spot") return;
    if (!mockup.wrong) {
      say(`KIM: ${mockup.label} đang khớp màu và font. Nhìn tiếp phần còn lại.`);
      return;
    }
    if (foundRef.current.includes(mockup.id)) return;
    const next = [...foundRef.current, mockup.id];
    foundRef.current = next;
    setFound(next);
    say(`KIM: đúng rồi. ${mockup.label}: ${WRONG_WORD[mockup.reason]}`);
    if (next.length >= 2) finishSpot(true);
  }

  function chooseMemory(hex: string) {
    const correct = hex === primary;
    setMemoryCorrect(correct);
    setStep("o2");
    say(
      correct
        ? "KIM: đúng màu chính. Màu chỉ có sức mạnh khi không đổi giữa các bề mặt."
        : "KIM: chưa đúng màu chính. Đây chính là lý do khách hay nhớ nhầm thương hiệu.",
    );
  }

  const timeBonus = oTimeBonus({ foundBoth, foundMs: spotMs, memoryCorrect });

  type DockInfo = { label: string; disabled?: boolean; onClick?: () => void };
  let dock: DockInfo;
  if (step === "spot") {
    dock = { label: `Tìm 2 bề mặt lệch · ${Math.ceil(remainingMs / 1000)}s`, disabled: true };
  } else if (step === "o1") {
    dock = session.answered[spot.id]
      ? {
          label: "Kiểm tra ghi nhớ màu",
          onClick: () => {
            setStep("memory");
            say("KIM: nhìn màu chính trong 3 giây. Sau đó chọn lại đúng màu.");
          },
        }
      : { label: "Chọn một cách trả lời", disabled: true };
  } else if (step === "memory") {
    dock = { label: memoryStage === "flash" ? "Ghi nhớ màu chính…" : "Chọn màu chính", disabled: true };
  } else if (step === "o2") {
    dock = session.answered[colorWhy.id]
      ? { label: "Tự soi thêm một câu", onClick: () => setStep("o3") }
      : { label: "Chọn một cách trả lời", disabled: true };
  } else {
    dock = session.answered[guideline.id]
      ? { label: "Hoàn tất trạm O", onClick: () => session.complete({ timeBonus }) }
      : { label: "Chọn một cách trả lời", disabled: true };
  }

  return (
    <div className="space-y-2">
      <div className="row-between">
        <p className="eyebrow">Xưởng Chế Tác</p>
        {step === "spot" ? (
          <span className={`mono-num text-[13px] font-semibold ${remainingMs < 5_000 ? "text-hot" : "text-amber"}`}>
            {(remainingMs / 1000).toFixed(1)}s
          </span>
        ) : (
          <span className="pill mono-num">{found.length}/2 bề mặt</span>
        )}
      </div>

      {step === "spot" ? (
        <>
          <p className="small muted">
            Màu chính{" "}
            <span className="inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: primary }} />{" "}
            <span className="mono-num">{primary}</span> · Font Be Vietnam Pro
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MOCKUPS.map((mockup, index) => {
              const isFound = found.includes(mockup.id);
              return (
                <button
                  key={mockup.id}
                  type="button"
                  data-testid={`mockup-${index}`}
                  aria-label={`Soi mockup ${mockup.label}`}
                  aria-pressed={isFound}
                  className={`min-h-20 rounded-xl border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                    isFound ? "border-[#4fd1c5]/60 bg-[#4fd1c5]/10" : "border-white/10 bg-white/[0.04] active:bg-white/10"
                  }`}
                  onClick={() => inspectMockup(mockup)}
                >
                  <span className="flex items-center justify-between gap-1">
                    <span className="text-[9.5px] font-semibold uppercase tracking-wide text-muted">{mockup.label}</span>
                    {isFound ? <span className="text-[9px] font-semibold text-[#a9fff2]">Đã soi</span> : null}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5">
                    <BrandMark brand={brand} size={22} />
                    <span
                      className={`truncate text-[11.5px] font-semibold ${mockup.reason === "font" && mockup.wrong ? "font-serif" : "font-sans"}`}
                      style={{ color: mockup.wrong && mockup.reason === "color" ? wrongColor : "#f4f6fb" }}
                    >
                      {brand.name}
                    </span>
                  </span>
                  <span
                    className="mt-2 block h-1.5 rounded-full"
                    style={{ backgroundColor: mockup.wrong && mockup.reason === "color" ? wrongColor : primary }}
                  />
                  {isFound ? (
                    <span className="mt-1 block text-[10px] leading-snug text-[#a9fff2]">{WRONG_WORD[mockup.reason]}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {found.length === 2 ? <p className="small text-[#a9fff2]">Tìm đủ hai bề mặt lệch.</p> : null}
        </>
      ) : null}

      {step === "o1" ? (
        <>
          <p className="small muted">
            {foundBoth ? "Bạn tìm đủ 2 bề mặt lệch." : "Hết giờ — hai bề mặt lệch đã được đánh dấu."}
          </p>
          <QuestionAnchor
            decision={spot}
            answeredOptionId={session.answered[spot.id]}
            onChoose={(option) => session.choose(spot, option)}
            onShown={session.markShown}
          />
        </>
      ) : null}

      {step === "memory" ? (
        <div className={`panel--flat p-4 text-center ${reducedMotion ? "" : "fade-up"}`}>
          {memoryStage === "flash" ? (
            <>
              <p className="eyebrow justify-center">Ghi nhớ màu chính · 3 giây</p>
              <div className="mx-auto mt-3 h-24 w-full max-w-52 rounded-2xl border border-white/15" style={{ backgroundColor: primary }} />
              <p className="small muted mt-2">Nhìn kỹ. Màu sẽ biến mất.</p>
            </>
          ) : (
            <>
              <p className="eyebrow justify-center">Chọn lại màu chính</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {swatches.map((swatch, index) => (
                  <button
                    key={`${swatch.hex}-${index}`}
                    type="button"
                    data-testid={`color-swatch-${index}`}
                    aria-label={`Màu phương án ${index + 1}`}
                    className="min-h-16 rounded-xl border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                    style={{ backgroundColor: swatch.hex }}
                    onClick={() => chooseMemory(swatch.hex)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      {step === "o2" ? (
        <>
          <p className="small">
            {memoryCorrect ? "Bạn nhớ đúng màu chính." : "Bạn chọn chưa đúng màu chính."}
          </p>
          <QuestionAnchor
            decision={colorWhy}
            answeredOptionId={session.answered[colorWhy.id]}
            onChoose={(option) => session.choose(colorWhy, option)}
            onShown={session.markShown}
          />
        </>
      ) : null}

      {step === "o3" ? (
        <>
          <div className="row flex-wrap gap-1.5">
            <span className="pill pill--live">{foundBoth ? "Đủ 2 bề mặt" : "Chưa đủ 2 bề mặt"}</span>
            <span className="pill mono-num">{(spotMs / 1000).toFixed(1)}s</span>
            <span className={`pill ${memoryCorrect ? "pill--live" : "pill--hot"}`}>
              {memoryCorrect ? "Nhớ đúng màu" : "Nhớ chưa đúng"}
            </span>
          </div>
          <QuestionAnchor
            decision={guideline}
            answeredOptionId={session.answered[guideline.id]}
            onChoose={(option) => session.choose(guideline, option)}
            onShown={session.markShown}
          />
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
