// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Decision, DecisionOption } from "@/shared/types";
import { QuestionAnchor, QuestionFlowProvider } from "@/game/components/QuestionFlow";
import { PLANET_CONTENT } from "@/game/content";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const decisions = PLANET_CONTENT.S.decisions;

beforeAll(() => {
  if (typeof globalThis.requestAnimationFrame !== "function") {
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      setTimeout(() => cb(Date.now()), 0) as unknown as number) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((id: number) => clearTimeout(id)) as typeof cancelAnimationFrame;
  }
});

afterAll(() => {
  // polyfill only affects jsdom test env
});

function FlowHarness({
  visibleIds = decisions.map((d) => d.id),
  onChoose,
}: {
  visibleIds?: string[];
  onChoose?: (decision: Decision, option: DecisionOption) => void;
}) {
  return (
    <QuestionFlowProvider questionOrder={decisions.map((d) => d.id)}>
      {decisions
        .filter((d) => visibleIds.includes(d.id))
        .map((d) => (
          <QuestionAnchor key={d.id} decision={d} onChoose={(option) => onChoose?.(d, option)} />
        ))}
    </QuestionFlowProvider>
  );
}

let root: Root | null = null;
let container: HTMLElement | null = null;

function mount(visibleIds?: string[]) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  const chosen: { decision: Decision; option: DecisionOption }[] = [];
  act(() =>
    root!.render(<FlowHarness visibleIds={visibleIds} onChoose={(decision, option) => chosen.push({ decision, option })} />),
  );
  return chosen;
}

function rerender(visibleIds: string[], chosen: { decision: Decision; option: DecisionOption }[]) {
  act(() =>
    root!.render(<FlowHarness visibleIds={visibleIds} onChoose={(decision, option) => chosen.push({ decision, option })} />),
  );
}

function q<T extends HTMLElement = HTMLElement>(testId: string): T | null {
  return document.querySelector<T>(`[data-testid="${testId}"]`);
}

function click(testId: string) {
  const node = q(testId);
  if (!node) throw new Error(`Không tìm thấy testid ${testId}`);
  act(() => node.click());
}

function modalCount(): number {
  return document.querySelectorAll('[data-testid="question-modal"]').length;
}

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = null;
  container = null;
  document.body.innerHTML = "";
});

describe("QuestionFlow — một popup, FIFO, ẩn/mở", () => {
  it("S 4 câu: mở lần lượt 1/4 → 4/4, đúng một dialog tại mỗi bước", () => {
    const chosen = mount();
    expect(modalCount()).toBe(1);
    expect(document.body.textContent).toContain("Câu 1/4 · Hiểu đúng");

    const ids = ["s-team-one-line-a", "s-customer-words-a", "s-premium-reason-a", "s-slogan-reality-a"];
    ids.forEach((optionId, index) => {
      expect(modalCount()).toBe(1);
      expect(document.body.textContent).toContain(`Câu ${index + 1}/4`);
      if (index === 3) expect(document.body.textContent).toContain("Câu 4/4 · Tự soi");
      expect(document.querySelectorAll('[data-testid^="question-option-"]')).toHaveLength(3);
      click(`question-option-${optionId}`);
      expect(document.body.textContent).toContain("Tiếp tục");
      click("question-continue");
    });

    expect(modalCount()).toBe(0);
    expect(q("question-pill")).toBeNull();
    expect(chosen.map((item) => item.decision.id)).toEqual(decisions.map((d) => d.id));
    expect(chosen.every((item) => item.option.points === 2)).toBe(true);
  });

  it("nút Ẩn/X/Escape → pill đang chờ và mở lại đúng câu", () => {
    mount();
    click("question-hide");
    expect(modalCount()).toBe(0);
    expect(q("question-pill")?.textContent).toContain("Câu hỏi 1/4 đang chờ");

    click("question-pill");
    expect(modalCount()).toBe(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(modalCount()).toBe(0);
    expect(q("question-pill")).not.toBeNull();

    click("question-pill");
    expect(modalCount()).toBe(1);
    expect(document.body.textContent).toContain("Câu 1/4 · Hiểu đúng");

    // Nút X của Sheet cũng chỉ ẩn xuống pill, không đóng vĩnh viễn.
    const close = document.querySelector<HTMLButtonElement>('[data-testid="question-modal"] button[aria-label="Đóng"]');
    expect(close).toBeTruthy();
    act(() => close!.click());
    expect(modalCount()).toBe(0);
    expect(q("question-pill")).not.toBeNull();
  });

  it("feedback không mất khi game đổi phase và unmount anchor", () => {
    const chosen = mount([decisions[0]!.id, decisions[1]!.id]);
    click("question-option-s-team-one-line-a");
    expect(chosen).toHaveLength(1);
    const feedback = chosen[0]!.option.feedback;
    expect(document.body.textContent).toContain(feedback);

    // Game đổi phase: anchor câu 1 unmount, câu 2 vẫn còn.
    rerender([decisions[1]!.id], chosen);
    expect(modalCount()).toBe(1);
    expect(document.body.textContent).toContain(feedback);
    expect(q("question-continue")).not.toBeNull();

    click("question-continue");
    // Sau khi tiếp tục, câu 2 đang chờ trong queue tự mở.
    expect(modalCount()).toBe(1);
    expect(document.body.textContent).toContain("Câu 2/4");
  });

  it("chỉ một dialog dù nhiều anchor cùng đăng ký", () => {
    mount();
    expect(modalCount()).toBe(1);
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    click("question-hide");
    expect(modalCount()).toBe(0);
    click("question-pill");
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  });
});
