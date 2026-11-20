import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Decision, DecisionOption } from "@/shared/types";
import { Sheet } from "@/ui/Sheet";
import { playSfx } from "@/lib/audio";
import { TONE_LABEL, toneForPoints } from "../engine/metrics";
import { KimCompanion, type KimMood } from "./KimCompanion";
import type { DecisionCardProps } from "./DecisionCard";

interface Entry {
  decision: Decision;
}

interface AnchorHandlers {
  answeredOptionId?: string;
  onChoose: (option: DecisionOption) => void;
  onShown?: (decisionId: string) => void;
}

interface FeedbackSnapshot {
  decision: Decision;
  option: DecisionOption;
}

export interface QuestionFlowApi {
  /** Có câu hỏi đang mở hoặc đang ẩn chờ trả lời (game nên dừng đồng hồ). */
  paused: boolean;
  /** Số câu đã đăng ký và chưa trả lời. */
  pending: number;
  activeQuestionId: string | null;
  register: (id: string, decision: Decision, getHandlers: () => AnchorHandlers) => void;
  unregister: (id: string) => void;
  markAnswered: (id: string) => void;
}

const NOOP_FLOW: QuestionFlowApi = {
  paused: false,
  pending: 0,
  activeQuestionId: null,
  register: () => {},
  unregister: () => {},
  markAnswered: () => {},
};

const QuestionFlowContext = createContext<QuestionFlowApi | null>(null);

/** Dùng trong mini-game: `const { paused } = useQuestionFlow();` */
export function useQuestionFlow(): QuestionFlowApi {
  return useContext(QuestionFlowContext) ?? NOOP_FLOW;
}

const DESKTOP_QUERY = "(min-width: 900px)";

function subscribeDesktop(callback: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener?.("change", callback);
  return () => media.removeEventListener?.("change", callback);
}

function desktopSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function desktopServerSnapshot(): boolean {
  return false;
}

function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribeDesktop, desktopSnapshot, desktopServerSnapshot);
}

export interface QuestionFlowProviderProps {
  children: ReactNode;
  /** Thứ tự câu trong trạm để hiển thị "Câu X/N" ổn định. */
  questionOrder?: string[];
}

/**
 * Điều phối popup một câu: các QuestionAnchor chỉ đăng ký câu hỏi,
 * provider mở đúng một Sheet tại một thời điểm theo FIFO.
 */
export function QuestionFlowProvider({ children, questionOrder = [] }: QuestionFlowProviderProps) {
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [answered, setAnswered] = useState<Record<string, true>>({});
  const [snapshot, setSnapshot] = useState<FeedbackSnapshot | null>(null);
  const [hiddenFor, setHiddenFor] = useState<string | null>(null);

  const handlersRef = useRef(new Map<string, () => AnchorHandlers>());
  const shownRef = useRef(new Set<string>());
  const isDesktop = useIsDesktop();

  const register = useCallback((id: string, decision: Decision, getHandlers: () => AnchorHandlers) => {
    handlersRef.current.set(id, getHandlers);
    setEntries((prev) => (prev[id] ? prev : { ...prev, [id]: { decision } }));
    setQueue((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const unregister = useCallback((id: string) => {
    handlersRef.current.delete(id);
    setEntries((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setQueue((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : prev));
  }, []);

  const markAnswered = useCallback((id: string) => {
    setAnswered((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  // FIFO: câu đầu tiên đã đăng ký mà chưa trả lời. Không cần setState trong effect.
  const pendingId = queue.find((id) => entries[id] && !answered[id]) ?? null;
  const currentId = snapshot ? snapshot.decision.id : pendingId;
  const currentDecision = snapshot ? snapshot.decision : pendingId ? entries[pendingId]?.decision ?? null : null;
  const hidden = Boolean(currentId && hiddenFor === currentId);
  const open = Boolean(currentId && currentDecision && !hidden);
  const paused = Boolean(currentId);

  const position = useMemo(() => {
    if (!currentId) return 0;
    const ordered = questionOrder.indexOf(currentId);
    if (ordered >= 0) return ordered + 1;
    const queued = queue.indexOf(currentId);
    return queued >= 0 ? queued + 1 : 1;
  }, [currentId, questionOrder, queue]);
  const total = questionOrder.length || queue.length || 1;
  const kindLabel = currentDecision?.kind === "diagnosis" ? "Tự soi" : "Hiểu đúng";

  // onShown chỉ gọi khi popup thực sự hiện câu này lần đầu (đo ms chính xác).
  useEffect(() => {
    if (!currentId || !open) return;
    if (shownRef.current.has(currentId)) return;
    shownRef.current.add(currentId);
    handlersRef.current.get(currentId)?.().onShown?.(currentId);
  }, [currentId, open]);

  const chooseOption = useCallback(
    (option: DecisionOption) => {
      if (!currentDecision || snapshot || choosingRef.current === currentDecision.id) return;
      choosingRef.current = currentDecision.id;
      const handlers = handlersRef.current.get(currentDecision.id)?.();
      if (!handlers) {
        choosingRef.current = null;
        return;
      }
      handlers.onChoose(option);
      playSfx("answer");
      markAnswered(currentDecision.id);
      setSnapshot({ decision: currentDecision, option });
    },
    [currentDecision, snapshot, markAnswered],
  );

  const hideQuestion = useCallback(() => {
    if (currentId) setHiddenFor(currentId);
  }, [currentId]);

  const openQuestion = useCallback(() => setHiddenFor(null), []);

  const continueQuestion = useCallback(() => {
    if (!snapshot) return;
    setSnapshot(null);
    setHiddenFor(null);
  }, [snapshot]);

  const api = useMemo<QuestionFlowApi>(
    () => ({
      paused,
      pending: queue.filter((id) => entries[id] && !answered[id]).length,
      activeQuestionId: currentId,
      register,
      unregister,
      markAnswered,
    }),
    [paused, queue, entries, answered, currentId, register, unregister, markAnswered],
  );

  const choosingRef = useRef<string | null>(null);
  const chosenTone = snapshot ? toneForPoints(snapshot.option.points) : null;

  // Sau khi chốt, đưa feedback lên đầu vùng đọc để không phải cuộn.
  useEffect(() => {
    if (!snapshot) return;
    const body = document.querySelector<HTMLElement>('[data-testid="question-modal"] .sheet__body');
    if (body) body.scrollTop = 0;
  }, [snapshot]);

  return (
    <QuestionFlowContext.Provider value={api}>
      {currentId && hidden ? (
        <div className="sticky top-0 z-40 -mx-0.5 mb-2">
          <button
            type="button"
            data-testid="question-pill"
            className="btn btn-primary btn-block min-h-11"
            aria-label={`Mở lại câu hỏi ${position} trên ${total} đang chờ`}
            onClick={openQuestion}
          >
            Câu hỏi {position}/{total} đang chờ
          </button>
        </div>
      ) : null}

      {children}

      <Sheet
        open={open}
        onClose={hideQuestion}
        variant={isDesktop ? "center" : "bottom"}
        testId="question-modal"
        className="sheet--question"
        eyebrow={`Câu ${position}/${total} · ${kindLabel}`}
        title={currentDecision?.prompt}
        footer={
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="question-hide"
              className="btn btn-ghost btn-sm shrink-0"
              onClick={hideQuestion}
              aria-label="Ẩn câu hỏi, mở lại sau"
            >
              Ẩn
            </button>
            {snapshot ? (
              <button
                type="button"
                data-testid="question-continue"
                className="btn btn-primary btn-sm flex-1"
                onClick={continueQuestion}
              >
                Tiếp tục
              </button>
            ) : (
              <span className="small muted flex-1 text-center">Chọn một đáp án</span>
            )}
          </div>
        }
      >
        {currentDecision ? (
          <div data-question-id={currentDecision.id}>
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {currentDecision.evidenceKey && currentDecision.evidenceLabel ? (
                <span className="chip border-white/15 text-silver-dim">Bằng chứng: {currentDecision.evidenceLabel}</span>
              ) : null}
            </div>

            {snapshot ? (
              <div className="space-y-2.5">
                <div className="question-chosen" data-testid="question-chosen">
                  <span aria-hidden="true" className="question-chosen__letter">
                    {["A", "B", "C", "D"][currentDecision.options.findIndex((option) => option.id === snapshot.option.id)] ?? "•"}
                  </span>
                  <span className="min-w-0 flex-1">{snapshot.option.label}</span>
                  <span className={`shrink-0 text-[10.5px] font-semibold ${chosenTone ? TONE_TEXT[chosenTone] : "text-muted"}`}>
                    {chosenTone ? TONE_LABEL[chosenTone] : "Ghi nhận"}
                  </span>
                </div>
                <div
                  className="fade-up question-feedback"
                  data-testid="question-feedback"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-start gap-2.5">
                    <KimCompanion
                      size={30}
                      mood={(chosenTone === "best" ? "happy" : chosenTone === "partial" ? "thinking" : "curious") as KimMood}
                      speaking
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="small font-semibold text-amber">
                        {chosenTone ? TONE_LABEL[chosenTone] : "Ghi nhận"}
                      </p>
                      <p className="body mt-1 text-silver">{snapshot.option.feedback}</p>
                    </div>
                  </div>
                  <p className="small muted mt-2">{snapshot.decision.explain}</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-2" role="group" aria-label="Chọn một cách trả lời">
                {currentDecision.options.map((option, index) => (
                  <button
                    key={option.id}
                    type="button"
                    data-testid={`question-option-${option.id}`}
                    onClick={() => chooseOption(option)}
                    className="question-option"
                  >
                    <span aria-hidden="true" className="question-option__letter">
                      {["A", "B", "C", "D"][index] ?? index + 1}
                    </span>
                    <span className="min-w-0 flex-1">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </Sheet>
    </QuestionFlowContext.Provider>
  );
}

export type QuestionAnchorProps = DecisionCardProps;

/**
 * Chỉ đăng ký câu hỏi với provider, không render gì inline.
 * Props giữ nguyên như DecisionCard để logic phase/choose của mini-game không đổi.
 */
export function QuestionAnchor({ decision, answeredOptionId, onChoose, onShown }: QuestionAnchorProps) {
  const { register, unregister, markAnswered } = useQuestionFlow();
  const handlersRef = useRef<AnchorHandlers>({ onChoose, onShown, answeredOptionId });

  useEffect(() => {
    handlersRef.current = { onChoose, onShown, answeredOptionId };
  });

  useEffect(() => {
    register(decision.id, decision, () => handlersRef.current);
    return () => unregister(decision.id);
  }, [decision, decision.id, register, unregister]);

  useEffect(() => {
    if (answeredOptionId) markAnswered(decision.id);
  }, [answeredOptionId, decision.id, markAnswered]);

  return null;
}

const TONE_TEXT = {
  best: "text-[#a9fff2]",
  partial: "text-[#ffd79b]",
  miss: "text-[#ffb39f]",
} as const;
