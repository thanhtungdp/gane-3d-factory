import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Decision, DecisionOption } from "@/shared/types";
import { BrandMark, QuestionAnchor } from "../components";
import { GameDock } from "../components/GameDock";
import type { MiniGameProps } from "./types";

const STARS = [
  { key: "mission", label: "Sứ mệnh", x: 18, y: 70, decisionIndex: 0 },
  { key: "vision", label: "Tầm nhìn", x: 50, y: 20, decisionIndex: null },
  { key: "value", label: "Giá trị", x: 82, y: 68, decisionIndex: 1 },
] as const;

const HORIZONS = [
  { years: 1, label: "1 năm" },
  { years: 3, label: "3 năm" },
  { years: 5, label: "5 năm" },
] as const;

const COMPETITORS = [
  { id: "c1", x: 22, y: 82, label: "Đối thủ 1", desc: "giá rẻ, phổ thông" },
  { id: "c2", x: 52, y: 52, label: "Đối thủ 2", desc: "trọn gói, giá vừa" },
  { id: "c3", x: 79, y: 24, label: "Đối thủ 3", desc: "chuyên gia, giá cao" },
];

const PERSONALITIES = [
  { id: "cao-cap", label: "Cao cấp" },
  { id: "binh-dan", label: "Bình dân" },
  { id: "tinh-gon", label: "Tinh gọn" },
  { id: "thu-cong", label: "Thủ công" },
  { id: "doi-moi", label: "Đổi mới" },
  { id: "truyen-thong", label: "Truyền thống" },
] as const;

type Phase = "constellation" | "map" | "personality";
type Placement = { x: number; y: number };

function FlagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 21V4m0 0h11l-2.5 4L17 12H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScopeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function GemIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4h10l4 6-9 10L3 10l4-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 10h18M9 4l3 6 3-6M12 10v10" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const NODE_ICONS = [FlagIcon, ScopeIcon, GemIcon];

/** A — nối chòm sao bằng icon, đặt logo lên bản đồ định vị có delay chốt. */
export function AlignGame({ content, brand, session, reducedMotion }: MiniGameProps) {
  const say = session.say;
  const [phase, setPhase] = useState<Phase>("constellation");
  const [lit, setLit] = useState<boolean[]>([false, false, false]);
  const [nextStar, setNextStar] = useState(0);
  const [activeStar, setActiveStar] = useState<number | null>(null);
  const [horizon, setHorizon] = useState("3 năm");
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [personalities, setPersonalities] = useState<string[]>([]);
  const [conflict, setConflict] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mission = content.decisions[0]!;
  const values = content.decisions[1]!;
  const logoCheck = content.decisions[2]!;
  const activeDecision =
    activeStar === null ? null : activeStar === 0 ? mission : activeStar === 2 ? values : null;
  const constellationDone = nextStar >= 3;
  const logoCheckAnswered = Boolean(session.answered[logoCheck.id]);

  const clearCommitTimer = () => {
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    },
    [],
  );

  function handleStarTap(index: number) {
    if (activeDecision) {
      const answered = Boolean(session.answered[activeDecision.id]);
      if (!answered) {
        say("KIM: trả lời câu đang mở trước khi nối ngôi sao tiếp theo.");
        return;
      }
      if (!lit[index] && index !== nextStar) {
        say("KIM: đúng thứ tự là Sứ mệnh → Tầm nhìn → Giá trị. Chạm ngôi sao sáng tiếp theo.");
        return;
      }
      setActiveStar(null);
    }
    if (lit[index]) return;
    if (index !== nextStar) {
      say("KIM: đúng thứ tự là Sứ mệnh → Tầm nhìn → Giá trị. Chạm ngôi sao sáng tiếp theo.");
      return;
    }
    if (index === 1) {
      setLit((prev) => prev.map((value, i) => (i === 1 ? true : value)));
      setNextStar(2);
      say("KIM: tầm nhìn không phải giấc mơ. Đó là mốc thời gian cho một lời hứa.");
      return;
    }
    setActiveStar(index);
  }

  function handleConstellationChoose(decision: Decision, option: DecisionOption) {
    if (!session.choose(decision, option)) return;
    const index = activeStar;
    if (index === null) return;
    setLit((prev) => prev.map((value, i) => (i === index ? true : value)));
    setNextStar(index + 1);
  }

  function percentFromEvent(event: { clientX: number; clientY: number }): Placement | null {
    const map = mapRef.current;
    if (!map) return null;
    const rect = map.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return null;
    return {
      x: Math.max(6, Math.min(94, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(6, Math.min(94, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  }

  function scheduleCommit() {
    if (committed || logoCheckAnswered) return;
    clearCommitTimer();
    setCommitting(true);
    commitTimerRef.current = setTimeout(
      () => {
        commitTimerRef.current = null;
        setCommitting(false);
        setCommitted(true);
      },
      reducedMotion ? 250 : 850,
    );
  }

  function commitNow() {
    clearCommitTimer();
    setCommitting(false);
    setCommitted(true);
  }

  function handleMapPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (committed || logoCheckAnswered) return;
    clearCommitTimer();
    setCommitting(false);
    setDragging(true);
    const point = percentFromEvent(event);
    if (point) setPlacement(point);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleMapPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const point = percentFromEvent(event);
    if (point) setPlacement(point);
  }

  function handleMapPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const point = percentFromEvent(event);
    if (point) setPlacement(point);
    setDragging(false);
    scheduleCommit();
  }

  function togglePersonality(id: string) {
    setPersonalities((prev) => {
      if (prev.includes(id)) {
        setConflict(null);
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        say("KIM: chỉ chọn hai tính cách. Bỏ một cái trước khi thêm.");
        return prev;
      }
      const next = [...prev, id];
      if (placement) {
        const premium = placement.y < 45;
        const popular = placement.y > 55;
        if (premium && next.includes("binh-dan")) {
          setConflict("Bạn đặt logo ở mức cao cấp nhưng chọn tính cách bình dân. Khách sẽ thấy lệch.");
        } else if (popular && next.includes("cao-cap")) {
          setConflict("Bạn đặt logo ở mức bình dân nhưng chọn tính cách cao cấp. Hình ảnh sẽ nói ngược giá.");
        } else {
          setConflict(null);
        }
      }
      return next;
    });
  }

  type DockInfo = { label: string; disabled?: boolean; onClick?: () => void };
  let dock: DockInfo;
  if (phase === "constellation") {
    dock = constellationDone
      ? {
          label: "Đặt logo lên bản đồ định vị",
          onClick: () => {
            setPhase("map");
            say("KIM: chạm hoặc kéo trên bản đồ để đặt logo. Thả tay để chốt vị trí.");
          },
        }
      : { label: "Nối đủ 3 ngôi sao", disabled: true };
  } else if (phase === "map") {
    dock = logoCheckAnswered
      ? {
          label: "Chọn tính cách thương hiệu",
          onClick: () => {
            setPhase("personality");
            say("KIM: vị trí đã chốt. Giờ chọn hai tính cách bạn dám sống cùng.");
          },
        }
      : {
          label: committing ? "Đang chốt vị trí…" : dragging ? "Thả tay để chốt" : "Chạm hoặc kéo trên bản đồ",
          disabled: true,
        };
  } else {
    dock =
      personalities.length === 2
        ? { label: "Chốt hướng đi", onClick: () => session.complete({}) }
        : { label: "Chọn đủ 2 tính cách", disabled: true };
  }

  return (
    <div className="space-y-2">
      {phase === "constellation" ? (
        <>
          <p className="small muted">Chạm theo thứ tự: Sứ mệnh → Tầm nhìn → Giá trị.</p>
          <div className="align-stage relative min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-navy-900/50">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="align-link" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#faa634" />
                  <stop offset="1" stopColor="#8b7cf6" />
                </linearGradient>
              </defs>
              {STARS.map((star, index) => {
                if (index === 0) return null;
                const prev = STARS[index - 1]!;
                const visible = lit[index] && lit[index - 1];
                return (
                  <line
                    key={star.key}
                    x1={prev.x}
                    y1={prev.y}
                    x2={star.x}
                    y2={star.y}
                    stroke={visible ? "url(#align-link)" : "rgba(255,255,255,0.08)"}
                    strokeWidth={visible ? 1.3 : 0.6}
                    strokeDasharray={visible ? "0" : "2 2"}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>

            {STARS.map((star, index) => {
              const isLit = lit[index] ?? false;
              const isNext = nextStar === index;
              const Icon = NODE_ICONS[index]!;
              return (
                <button
                  key={star.key}
                  type="button"
                  data-testid={`star-${index}`}
                  aria-label={`Nối sao ${index + 1}: ${star.label}`}
                  aria-pressed={isLit}
                  className={`align-node absolute -translate-x-1/2 -translate-y-1/2 touch-manipulation ${
                    isLit ? "align-node--lit" : isNext ? "align-node--next" : ""
                  }`}
                  style={{ left: `${star.x}%`, top: `${star.y}%` }}
                  onClick={() => handleStarTap(index)}
                >
                  <span className="align-node__icon">
                    <Icon />
                  </span>
                  <span className="align-node__label">{star.label}</span>
                </button>
              );
            })}

            <p className="absolute bottom-2 left-3 right-3 text-center text-[10.5px] text-muted">
              Tầm nhìn: {horizon}
            </p>
          </div>

          {lit[1] ? (
            <div className="fade-up grid grid-cols-3 gap-2">
              {HORIZONS.map((item) => (
                <button
                  key={item.years}
                  type="button"
                  data-testid={`vision-${item.years}`}
                  className={`btn min-h-12 flex-col gap-1 py-2 ${horizon === item.label ? "btn-primary" : "btn-ghost"}`}
                  aria-pressed={horizon === item.label}
                  onClick={() => {
                    setHorizon(item.label);
                    say(`KIM: ${item.label} là mốc đủ gần để đội còn nhớ, đủ xa để thay đổi cách làm.`);
                  }}
                >
                  <ClockIcon />
                  <span className="text-[11.5px]">{item.label}</span>
                </button>
              ))}
            </div>
          ) : null}

          {activeDecision ? (
            <QuestionAnchor
              decision={activeDecision}
              answeredOptionId={session.answered[activeDecision.id]}
              onChoose={(option) => handleConstellationChoose(activeDecision, option)}
              onShown={session.markShown}
            />
          ) : null}
        </>
      ) : null}

      {phase === "map" ? (
        <>
          <div className="row-between">
            <p className="small muted">Kéo hoặc chạm để đặt logo.</p>
            <span className={`pill ${committed ? "pill--live" : committing ? "pill--amber" : ""}`}>
              {dragging ? "Thả tay để chốt" : committing ? "Đang chốt vị trí…" : committed ? "Vị trí đã chốt" : "Chưa chốt"}
            </span>
          </div>

          <div
            ref={mapRef}
            data-testid="align-map"
            className="align-map relative h-[clamp(200px,34dvh,320px)] w-full touch-none overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_40%,rgba(139,124,246,0.22),rgba(5,10,36,0.9))] select-none"
            onPointerDown={handleMapPointerDown}
            onPointerMove={handleMapPointerMove}
            onPointerUp={handleMapPointerUp}
            onPointerCancel={() => {
              setDragging(false);
              clearCommitTimer();
              setCommitting(false);
            }}
          >
            <span className="absolute left-1/2 top-2 -translate-x-1/2 text-[9.5px] font-semibold text-muted">CAO CẤP</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9.5px] font-semibold text-muted">BÌNH DÂN</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[9.5px] font-semibold text-muted">GẦN GŨI</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[9.5px] font-semibold text-muted">CHUYÊN SÂU</span>
            <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-4/5 -translate-x-1/2 bg-white/10" />
            <span className="pointer-events-none absolute left-1/2 top-1/2 h-4/5 w-px -translate-y-1/2 bg-white/10" />

            {COMPETITORS.map((comp) => (
              <div
                key={comp.id}
                className="pointer-events-none absolute max-w-24 -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ left: `${comp.x}%`, top: `${comp.y}%` }}
              >
                <span className="mx-auto block h-2.5 w-2.5 rounded-full border border-white/40 bg-white/10" />
                <span className="mt-1 block text-[9.5px] font-semibold leading-tight text-muted">{comp.label}</span>
                <span className="block text-[9px] leading-tight text-muted/80">{comp.desc}</span>
              </div>
            ))}

            {placement ? (
              <span
                className="align-map__token absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-amber/70 ring-offset-2 ring-offset-navy-900"
                style={{ left: `${placement.x}%`, top: `${placement.y}%` }}
                aria-hidden="true"
              >
                <BrandMark brand={brand} size={38} />
              </span>
            ) : null}
          </div>

          {!committed ? (
            <div className="row flex-wrap gap-2">
              <span className="small muted">Chọn nhanh:</span>
              {[
                { label: "Mức cao cấp", y: 18 },
                { label: "Mức vừa", y: 50 },
                { label: "Mức bình dân", y: 82 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  data-testid={`place-${preset.y}`}
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setPlacement({ x: 50, y: preset.y });
                    commitNow();
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          ) : null}

          {committed ? (
            <QuestionAnchor
              decision={logoCheck}
              answeredOptionId={session.answered[logoCheck.id]}
              onChoose={(option) => session.choose(logoCheck, option)}
              onShown={session.markShown}
            />
          ) : null}
        </>
      ) : null}

      {phase === "personality" ? (
        <>
          <p className="small muted">
            Vị trí đã đặt ở{" "}
            {placement ? (placement.y < 45 ? "mức cao cấp" : placement.y > 55 ? "mức bình dân" : "mức vừa") : "mức vừa"} — chọn 2 tính cách.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PERSONALITIES.map((item) => {
              const selected = personalities.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`personality-${item.id}`}
                  aria-pressed={selected}
                  className={`btn min-h-12 ${selected ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => togglePersonality(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          {conflict ? (
            <p role="alert" className="rounded-xl border border-hot/40 bg-hot/10 px-3 py-2 text-[12.5px] leading-snug text-[#ffb39f]">
              {conflict}
            </p>
          ) : personalities.length === 2 ? (
            <p className="small text-[#a9fff2]">Hai tính cách này đang nói cùng một mức với vị trí đã chốt.</p>
          ) : null}
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
