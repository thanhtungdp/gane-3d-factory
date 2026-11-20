/** Hook phiên chơi một trạm: chống double-submit, đếm giờ, gợi ý, bỏ qua. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Decision, DecisionOption, DecisionRecord } from "@/shared/types";
import type { PlanetGameComplete } from "@/shared/game";

export interface PlanetSession {
  records: DecisionRecord[];
  /** decisionId → optionId đã chốt. */
  answered: Record<string, string>;
  answeredCount: number;
  total: number;
  completed: boolean;
  elapsedMs: number;
  /** Câu KIM đang hiển thị trong khung game. */
  guide: string | null;
  hintAvailable: boolean;
  skipAvailable: boolean;
  markShown: (decisionId: string) => void;
  choose: (decision: Decision, option: DecisionOption) => boolean;
  say: (text: string) => void;
  showHint: () => void;
  complete: (payload?: PlanetGameComplete) => void;
  skip: () => void;
}

export interface UsePlanetSessionOptions {
  decisions: Decision[];
  onDecision: (record: DecisionRecord) => void;
  onComplete: (payload: PlanetGameComplete) => void;
  onGuide?: (text: string) => void;
  hintAfterMs?: number;
  skipAfterMs?: number;
}

export function usePlanetSession({
  decisions,
  onDecision,
  onComplete,
  onGuide,
  hintAfterMs = 25_000,
  skipAfterMs = 45_000,
}: UsePlanetSessionOptions): PlanetSession {
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [answered, setAnswered] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [guide, setGuide] = useState<string | null>(null);

  const startedAtRef = useRef(0);
  const shownAtRef = useRef(new Map<string, number>());
  const lockedRef = useRef(new Set<string>());
  const completedRef = useRef(false);
  const onDecisionRef = useRef(onDecision);
  const onCompleteRef = useRef(onComplete);
  const onGuideRef = useRef(onGuide);
  const decisionsRef = useRef(decisions);

  // Đồng bộ callback/decisions mới nhất sau mỗi lần render (không ghi ref khi render).
  useEffect(() => {
    onDecisionRef.current = onDecision;
    onCompleteRef.current = onComplete;
    onGuideRef.current = onGuide;
    decisionsRef.current = decisions;
  });

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  // Đồng hồ: phục vụ gợi ý sau 25 giây và nút bỏ qua sau 45 giây.
  useEffect(() => {
    if (completed) return;
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - startedAtRef.current);
    }, 500);
    return () => clearInterval(timer);
  }, [completed]);

  const say = useCallback((text: string) => {
    setGuide(text);
    onGuideRef.current?.(text);
  }, []);

  const markShown = useCallback((decisionId: string) => {
    if (!shownAtRef.current.has(decisionId)) {
      shownAtRef.current.set(decisionId, Date.now());
    }
  }, []);

  const choose = useCallback(
    (decision: Decision, option: DecisionOption): boolean => {
      if (completedRef.current || lockedRef.current.has(decision.id)) return false;
      lockedRef.current.add(decision.id);
      const now = Date.now();
      const startedAt = startedAtRef.current || now;
      const shownAt = shownAtRef.current.get(decision.id) ?? startedAt;
      const record: DecisionRecord = {
        decisionId: decision.id,
        optionId: option.id,
        kind: decision.kind,
        points: option.points,
        ms: Math.max(0, now - shownAt),
      };
      setAnswered((prev) => ({ ...prev, [decision.id]: option.id }));
      setRecords((prev) => [...prev, record]);
      // Feedback hiển thị ngay trong thẻ quyết định; đẩy câu KIM cho host,
      // không lặp lại nguyên câu dài ở thanh KIM phía trên.
      setGuide(null);
      onGuideRef.current?.(option.feedback);
      onDecisionRef.current(record);
      return true;
    },
    [],
  );

  const complete = useCallback((payload: PlanetGameComplete = {}) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setCompleted(true);
    setElapsedMs(Date.now() - startedAtRef.current);
    onCompleteRef.current(payload);
  }, []);

  const skip = useCallback(() => complete({ skipped: true }), [complete]);

  const showHint = useCallback(() => {
    const next = decisionsRef.current.find((d) => !lockedRef.current.has(d.id));
    if (!next) {
      say("Bạn đã trả lời hết các tín hiệu. Chạm nút bên dưới để hoàn tất trạm.");
      return;
    }
    say(next.hint ?? "Chọn câu khiến bạn phải suy nghĩ lâu nhất — thường đó là câu đúng.");
  }, [say]);

  // Nhắc nhẹ đúng lúc nút Gợi ý xuất hiện (một lần).
  useEffect(() => {
    if (completed) return;
    const startedAt = startedAtRef.current || Date.now();
    const delay = Math.max(0, hintAfterMs - (Date.now() - startedAt));
    const timer = setTimeout(() => {
      say("KIM ở đây. Nếu cần, chạm Gợi ý ở góc trên; hoặc đi tiếp bất cứ lúc nào sau 45 giây.");
    }, delay);
    return () => clearTimeout(timer);
  }, [completed, hintAfterMs, say]);

  return useMemo<PlanetSession>(
    () => ({
      records,
      answered,
      answeredCount: records.length,
      total: decisions.length,
      completed,
      elapsedMs,
      guide,
      hintAvailable: !completed && elapsedMs >= hintAfterMs,
      skipAvailable: !completed && elapsedMs >= skipAfterMs,
      markShown,
      choose,
      say,
      showHint,
      complete,
      skip,
    }),
    [
      records,
      answered,
      decisions.length,
      completed,
      elapsedMs,
      guide,
      hintAfterMs,
      skipAfterMs,
      markShown,
      choose,
      say,
      showHint,
      complete,
      skip,
    ],
  );
}
