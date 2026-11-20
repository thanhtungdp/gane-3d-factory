import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import type { PreScan, PreScanCriterion, ScanSignal, SignalZone } from "@/shared/types";
import { QuestionAnchor } from "../components";
import { GameDock } from "../components/GameDock";
import type { MiniGameProps } from "./types";

interface ZoneDef {
  key: SignalZone;
  label: string;
  criterion: PreScanCriterion;
}

const ZONES: ZoneDef[] = [
  { key: "internal", label: "Nội tại", criterion: "slogan" },
  { key: "market", label: "Thị trường", criterion: "logo" },
  { key: "competitor", label: "Đối thủ", criterion: "social" },
  { key: "identity", label: "Nhận diện", criterion: "color" },
];

interface ZoneSignal {
  title: string;
  evidence: string;
  severity: ScanSignal["severity"];
}

/** Ưu tiên tín hiệu thật từ pre-scan; thiếu thì dùng bộ kiểm tra định kỳ theo tiêu chí. */
function signalFor(preScan: PreScan, zone: ZoneDef): ZoneSignal {
  const real = preScan.signals.find((s) => s.zone === zone.key);
  if (real) return { title: real.title, evidence: real.evidence, severity: real.severity };
  const criterion = preScan.criteria[zone.criterion];
  const severity: ScanSignal["severity"] = !criterion
    ? "watch"
    : criterion.score >= 7
      ? "strength"
      : criterion.score >= 4
        ? "watch"
        : "gap";
  return {
    title: criterion?.label ?? `Kiểm tra định kỳ: ${zone.label}`,
    evidence: criterion?.evidence?.trim() || "Chưa đủ dữ liệu. Đây là điểm nên tự kiểm tra lại cùng đội.",
    severity,
  };
}

const SEVERITY_LABEL: Record<ScanSignal["severity"], string> = {
  gap: "Cần chú ý",
  watch: "Theo dõi",
  strength: "Đang ổn",
};

const SEVERITY_PILL: Record<ScanSignal["severity"], string> = {
  gap: "pill--hot",
  watch: "pill--amber",
  strength: "pill--live",
};

const EMPTY_MARKS: boolean[] = [false, false, false, false];

/** S — quét sương bằng CSS thật: chạm mở một ô, rê đánh dấu nhiều ô rồi thả tay. */
export function ScanGame({ content, preScan, session, reducedMotion }: MiniGameProps) {
  const say = session.say;
  const signals = ZONES.map((zone) => signalFor(preScan, zone));

  const [opened, setOpened] = useState<boolean[]>(() => ZONES.map(() => false));
  const [dissolving, setDissolving] = useState<boolean[]>(() => ZONES.map(() => false));
  const [marked, setMarked] = useState<boolean[]>(EMPTY_MARKS);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(new Set<number>());
  const scheduledRef = useRef<boolean[]>([false, false, false, false]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    },
    [],
  );

  const scheduleOpen = useCallback(
    (indices: number[]) => {
      for (const index of indices) {
        if (index < 0 || index > 3 || opened[index] || scheduledRef.current[index]) continue;
        scheduledRef.current[index] = true;
        setDissolving((prev) => prev.map((value, i) => (i === index ? true : value)));
        const timer = setTimeout(() => {
          setOpened((prev) => prev.map((value, i) => (i === index ? true : value)));
          setDissolving((prev) => prev.map((value, i) => (i === index ? false : value)));
          say(`Đã mở ${ZONES[index]?.label ?? "vùng"}.`);
        }, reducedMotion ? 80 : 260);
        timersRef.current.push(timer);
      }
    },
    [opened, reducedMotion, say],
  );

  function cellAt(clientX: number, clientY: number): number {
    const grid = gridRef.current;
    if (!grid) return -1;
    const rect = grid.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return -1;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return -1;
    return (x > rect.width / 2 ? 1 : 0) + (y > rect.height / 2 ? 2 : 0);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    movedRef.current = false;
    draggedRef.current = new Set();
    setMarked(EMPTY_MARKS);
    startPointRef.current = { x: event.clientX, y: event.clientY };
    // Ô bắt đầu cũng là ô đã đi qua (tap sẽ dùng ô này).
    const startIndex = cellAt(event.clientX, event.clientY);
    if (startIndex >= 0) {
      draggedRef.current.add(startIndex);
      setMarked((prev) => prev.map((value, i) => (i === startIndex ? true : value)));
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const start = startPointRef.current;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) {
      movedRef.current = true;
    }
    if (!movedRef.current) return;
    const index = cellAt(event.clientX, event.clientY);
    if (index < 0 || draggedRef.current.has(index)) return;
    draggedRef.current.add(index);
    setMarked((prev) => prev.map((value, i) => (i === index ? true : value)));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const indexAtUp = cellAt(event.clientX, event.clientY);
    if (movedRef.current) {
      if (indexAtUp >= 0) draggedRef.current.add(indexAtUp);
      scheduleOpen([...draggedRef.current]);
    } else {
      // Pointer capture có thể retarget pointerup về grid nên click không bắn vào button.
      const tapIndex = indexAtUp >= 0 ? indexAtUp : [...draggedRef.current][0];
      if (tapIndex !== undefined) scheduleOpen([tapIndex]);
    }
    draggedRef.current = new Set();
    setMarked(EMPTY_MARKS);
  }

  const openCount = opened.filter(Boolean).length;
  const remainingZones = ZONES.length - openCount;
  const remainingQuestions = content.decisions.length - session.answeredCount;
  const ready = remainingZones <= 0 && remainingQuestions <= 0;
  const dockLabel = ready
    ? "Hoàn tất trạm S"
    : remainingZones > 0
      ? `Còn ${remainingZones} vùng sương`
      : `Còn ${remainingQuestions} câu hỏi`;

  return (
    <div className="space-y-1.5">
      <div className="row-between">
        <p className="eyebrow">Quét sương</p>
        <span className="pill mono-num" aria-label={`Đã mở ${openCount} trên 4 vùng`}>
          {openCount}/4 vùng
        </span>
      </div>
      <p className="small muted">Chạm một ô, hoặc rê ngón rồi thả tay.</p>

      <div
        ref={gridRef}
        data-testid="scan-grid"
        className="scan-grid grid touch-none grid-cols-2 gap-2 select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          draggingRef.current = false;
          setMarked(EMPTY_MARKS);
        }}
      >
        {ZONES.map((zone, index) => {
          const signal = signals[index]!;
          const isOpen = opened[index] ?? false;
          const isDissolving = dissolving[index] ?? false;
          const isMarked = marked[index] ?? false;
          return (
            <button
              key={zone.key}
              type="button"
              data-testid={`fog-zone-${index}`}
              data-opened={isOpen}
              data-marked={isMarked}
              aria-label={isOpen ? `Vùng ${zone.label} đã mở` : `Mở vùng ${zone.label}`}
              aria-expanded={isOpen}
              disabled={isOpen}
              onClick={() => {
                // Keyboard/jsdom (không có pointer event) và click thật sau tap.
                // scheduledRef bên trong scheduleOpen chống mở trùng.
                scheduleOpen([index]);
              }}
              className={`scan-cell relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                isMarked ? "scan-cell--marked" : ""
              } ${isDissolving ? "scan-cell--dissolving" : ""} ${isOpen ? "scan-cell--open" : "scan-cell--closed"}`}
            >
              <span className="scan-cell__fog" aria-hidden="true">
                <span className="scan-blob scan-blob--1" />
                <span className="scan-blob scan-blob--2" />
                <span className="scan-blob scan-blob--3" />
              </span>

              <span className="scan-cell__zone relative z-[3] flex items-center justify-between gap-1 p-2.5 pb-0">
                <span className="eyebrow min-w-0 truncate">{zone.label}</span>
                {isOpen ? (
                  <span className={`pill ${SEVERITY_PILL[signal.severity]}`} aria-hidden="true">
                    {SEVERITY_LABEL[signal.severity]}
                  </span>
                ) : (
                  <span className="text-[10.5px] text-muted" aria-hidden="true">
                    ?
                  </span>
                )}
              </span>
              <span className="scan-cell__content relative z-[2] flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden p-2.5" aria-hidden={!isOpen}>
                <span className="scan-cell__title h3 block text-balance">{signal.title}</span>
                <span className="scan-cell__evidence small muted line-clamp-2 block">{signal.evidence}</span>
                {!isOpen ? (
                  <span className="scan-cell__hint block text-[10px] text-muted" aria-hidden="true">
                    {isDissolving ? "Sương đang tan…" : "Chạm hoặc rê qua"}
                  </span>
                ) : null}
              </span>
              {!isOpen ? <span className="sr-only">{`Nội dung vùng ${zone.label} đang bị sương che`}</span> : null}
            </button>
          );
        })}
      </div>

      {opened.map((isOpen, index) => {
        const decision = content.decisions[index];
        if (!isOpen || !decision) return null;
        return (
          <QuestionAnchor
            key={decision.id}
            decision={decision}
            answeredOptionId={session.answered[decision.id]}
            onChoose={(option) => session.choose(decision, option)}
            onShown={session.markShown}
          />
        );
      })}

      <GameDock>
        <button
          type="button"
          data-testid="continue"
          className="btn btn-primary btn-block"
          disabled={!ready}
          onClick={() => session.complete({})}
        >
          {dockLabel}
        </button>
      </GameDock>
    </div>
  );
}
