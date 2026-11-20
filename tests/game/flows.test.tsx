// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { DecisionRecord, PlanetId } from "@/shared/types";
import type { PlanetGameComplete, PlanetGameProps } from "@/shared/game";
import { PlanetGame } from "@/game";
import { GameDockProvider, GameDockSlot } from "@/game/components";
import { makeBrand, makePreScan } from "./helpers";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof globalThis.requestAnimationFrame !== "function") {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0) as unknown as number) as typeof requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number) => clearTimeout(id)) as typeof cancelAnimationFrame;
}

interface Harness {
  root: Root;
  decisions: DecisionRecord[];
  completed: PlanetGameComplete[];
  guides: string[];
  unmount: () => void;
}

function mount(planet: PlanetId): Harness {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const decisions: DecisionRecord[] = [];
  const completed: PlanetGameComplete[] = [];
  const guides: string[] = [];
  const props: PlanetGameProps = {
    planet,
    brand: makeBrand(),
    preScan: makePreScan(),
    answers: { companySize: "6-20", role: "founder" },
    onDecision: (record) => decisions.push(record),
    onComplete: (payload) => completed.push(payload),
    onGuide: (text) => guides.push(text),
  };
  act(() =>
    root.render(
      <GameDockProvider>
        <PlanetGame {...props} />
        <GameDockSlot />
      </GameDockProvider>,
    ),
  );
  return {
    root,
    decisions,
    completed,
    guides,
    unmount: () => act(() => root.unmount()),
  };
}

function el(testId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
}

function click(testId: string): void {
  const node = el(testId);
  if (!node) throw new Error(`Không tìm thấy testid ${testId}`);
  act(() => node.click());
}

function dockLabel(): string {
  return el("continue")?.textContent?.trim() ?? "";
}

/** Trả lời câu hỏi trong popup rồi bấm Tiếp tục. */
function answer(optionId: string): void {
  click(`question-option-${optionId}`);
  expect(el("question-modal"), "phải có popup trước khi chọn").toBeTruthy();
  click("question-continue");
}

async function wait(ms: number): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function meterValue(): number {
  const meter = document.querySelector('[role="meter"]');
  return Number(meter?.getAttribute("aria-valuenow"));
}

function mockRect(node: HTMLElement, size = 200): void {
  Object.defineProperty(node, "getBoundingClientRect", {
    configurable: true,
    value: () => ({ left: 0, top: 0, width: size, height: size, right: size, bottom: size, x: 0, y: 0, toJSON: () => ({}) }),
  });
}

function firePointer(node: HTMLElement, type: string, x: number, y: number): void {
  act(() => {
    node.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 }));
  });
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("luồng chơi một ngón tay — popup + dock", () => {
  it("S: dock luôn có 1 CTA, mở 4 vùng rồi trả lời lần lượt, trả {}", async () => {
    const h = mount("S");
    expect(el("game-dock")).toBeTruthy();
    expect(dockLabel()).toContain("Còn 4 vùng sương");
    expect((el("continue") as HTMLButtonElement).disabled).toBe(true);

    for (let i = 0; i < 4; i += 1) click(`fog-zone-${i}`);
    await wait(400);
    expect(document.querySelectorAll('[data-testid="question-modal"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-testid="continue"]')).toHaveLength(1);

    for (const id of ["s-team-one-line", "s-customer-words", "s-premium-reason", "s-slogan-reality"]) {
      answer(`${id}-a`);
    }
    expect(dockLabel()).toContain("Hoàn tất trạm S");
    click("continue");
    expect(h.decisions.map((r) => r.decisionId)).toEqual([
      "s-team-one-line",
      "s-customer-words",
      "s-premium-reason",
      "s-slogan-reality",
    ]);
    expect(h.decisions.every((r) => r.points === 2 && r.ms >= 0)).toBe(true);
    expect(h.completed).toEqual([{}]);
    expect(el("badge")).toBeTruthy();
    expect(h.guides.length).toBeGreaterThan(0);
    h.unmount();
  });

  it("S: rê ngón đánh dấu nhiều ô, thả tay mới mount câu hỏi", async () => {
    const h = mount("S");
    const grid = el("scan-grid");
    expect(grid).toBeTruthy();
    mockRect(grid!);
    firePointer(grid!, "pointerdown", 50, 50);
    firePointer(grid!, "pointermove", 150, 50);
    firePointer(grid!, "pointermove", 150, 150);
    firePointer(grid!, "pointerup", 150, 150);
    expect(el("question-modal")).toBeNull();
    await wait(400);
    expect(el("question-modal")).toBeTruthy();
    expect(document.body.textContent).toContain("Câu 1/4");
    h.unmount();
  });

  it("S: tap thật (pointerdown/up) mở popup dù pointerup bị retarget", async () => {
    const h = mount("S");
    const grid = el("scan-grid");
    expect(grid).toBeTruthy();
    mockRect(grid!);
    const cell = el("fog-zone-0")!;
    firePointer(cell, "pointerdown", 50, 50);
    firePointer(cell, "pointerup", 50, 50);
    expect(el("question-modal")).toBeNull();
    await wait(350);
    expect(el("question-modal")).toBeTruthy();
    expect(document.body.textContent).toContain("Câu 1/4");
    h.unmount();
  });

  it("A: nối sao, map chốt sau 850ms, đặt logo, chọn 2 tính cách", async () => {
    const h = mount("A");
    click("star-0");
    answer("a-mission-a");
    click("star-1");
    expect(el("vision-3")).toBeTruthy();
    click("star-2");
    answer("a-values-a");

    expect(dockLabel()).toContain("Đặt logo lên bản đồ định vị");
    click("continue");

    const map = el("align-map");
    expect(map).toBeTruthy();
    mockRect(map!);
    firePointer(map!, "pointerdown", 80, 80);
    firePointer(map!, "pointerup", 80, 80);
    expect(el("question-modal")).toBeNull();
    expect(dockLabel()).toContain("Đang chốt vị trí…");
    await wait(950);
    expect(el("question-modal")).toBeTruthy();
    answer("a-logo-premium-a");

    expect(dockLabel()).toContain("Chọn tính cách thương hiệu");
    click("continue");
    click("personality-cao-cap");
    click("personality-tinh-gon");
    expect(dockLabel()).toContain("Chốt hướng đi");
    click("continue");
    expect(h.decisions).toHaveLength(3);
    expect(h.completed).toEqual([{}]);
    h.unmount();
  });

  it("A: kéo lại trước 850ms sẽ huỷ hẹn chốt; preset chốt ngay", async () => {
    const h = mount("A");
    click("star-0");
    answer("a-mission-a");
    click("star-1");
    click("star-2");
    answer("a-values-a");
    click("continue");

    const map = el("align-map")!;
    mockRect(map);

    // Kéo-thả lần 1, rồi kéo lại trước hạn 850ms → hẹn bị huỷ.
    firePointer(map, "pointerdown", 40, 40);
    firePointer(map, "pointerup", 40, 40);
    await wait(300);
    firePointer(map, "pointerdown", 120, 120);
    await wait(700); // quá 850ms tính từ lần thả đầu, nhưng đã huỷ
    expect(el("question-modal")).toBeNull();
    firePointer(map, "pointerup", 120, 120);
    await wait(950);
    expect(el("question-modal")).toBeTruthy();
    h.unmount();
  });

  it("A: preset place-* chốt ngay, không phải chờ 850ms", () => {
    const h = mount("A");
    click("star-0");
    answer("a-mission-a");
    click("star-1");
    click("star-2");
    answer("a-values-a");
    click("continue");
    click("place-18");
    expect(el("question-modal")).toBeTruthy();
    h.unmount();
  });

  it("O: tìm 2 mockup lệch, nhớ màu, trả timeBonus", async () => {
    const h = mount("O");
    click("mockup-1");
    click("mockup-3");
    answer("o-why-mismatch-a");
    expect(dockLabel()).toContain("Kiểm tra ghi nhớ màu");
    click("continue");
    await wait(3_200);

    const swatches = Array.from(document.querySelectorAll<HTMLElement>('[data-testid^="color-swatch-"]'));
    const primary = swatches.find((node) => node.style.backgroundColor === "rgb(33, 64, 154)");
    expect(primary, "phải có swatch đúng màu chính").toBeTruthy();
    act(() => primary!.click());
    answer("o-color-memory-a");
    expect(dockLabel()).toContain("Tự soi thêm một câu");
    click("continue");
    answer("o-guideline-reality-a");
    expect(dockLabel()).toContain("Hoàn tất trạm O");
    click("continue");
    expect(h.completed).toHaveLength(1);
    const payload = h.completed[0]!;
    expect(payload.timeBonus).toBeGreaterThan(0.9);
    expect(payload.timeBonus).toBeLessThanOrEqual(1);
    h.unmount();
  });

  it("K: xếp card, nạp tên lửa, xử lý khủng hoảng nhanh → crisisFast", async () => {
    const h = mount("K");
    for (const id of ["goal", "content", "internal", "launch", "measure"]) {
      click(`launch-card-${id}`);
    }
    expect(dockLabel()).toContain("Kiểm tra thứ tự");
    click("continue");
    answer("k-order-a");
    click("continue");
    answer("k-one-line-a");
    expect(dockLabel()).toContain("Nạp năng lượng");
    click("continue");

    for (let i = 0; i < 9; i += 1) click("launch-hold");
    await wait(1_000);
    answer("k-spokesperson-a");
    click("continue");
    click("crisis-option-facts");
    expect(dockLabel()).toContain("Rút kinh nghiệm");
    click("continue");
    answer("k-debrief-a");
    expect(dockLabel()).toContain("Hoàn tất trạm K");
    click("continue");
    expect(h.decisions).toHaveLength(4);
    expect(h.completed).toHaveLength(1);
    expect(h.completed[0]?.crisisFast).toBe(true);
    h.unmount();
  });

  it("IM: 4 sự kiện tuần tự, dock đổi nhãn, trả meter 0..10", () => {
    const h = mount("IM");
    for (const id of ["im-new-hire", "im-dealer", "im-freelancer", "im-scale"]) {
      answer(`${id}-a`);
      click("continue");
    }
    expect(dockLabel()).toContain("Hoàn tất trạm IM");
    click("continue");
    expect(h.decisions).toHaveLength(4);
    expect(h.completed).toHaveLength(1);
    const meter = h.completed[0]?.meter;
    expect(typeof meter).toBe("number");
    expect(meter).toBeGreaterThanOrEqual(0);
    expect(meter).toBeLessThanOrEqual(10);
    h.unmount();
  });

  it("chống double-submit: chạm đáp án hai lần chỉ ghi một record", () => {
    const h = mount("IM");
    const option = el("question-option-im-new-hire-a");
    expect(option).toBeTruthy();
    act(() => {
      option!.click();
      option!.click();
    });
    expect(h.decisions).toHaveLength(1);
    h.unmount();
  });
});

describe("IM — đồng hồ dừng khi popup mở/ẩn", () => {
  it("meter không giảm khi popup mở hoặc đã ẩn, giảm lại sau khi tiếp tục", () => {
    vi.useFakeTimers();
    const h = mount("IM");

    expect(el("question-modal")).toBeTruthy();
    expect(el("meter-state")?.textContent).toContain("Tạm dừng");
    expect(meterValue()).toBe(10);
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(meterValue()).toBe(10);

    click("question-hide");
    expect(el("question-modal")).toBeNull();
    expect(el("question-pill")?.textContent).toContain("Câu hỏi 1/4 đang chờ");
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(meterValue()).toBe(10);

    click("question-pill");
    click("question-option-im-new-hire-a");
    click("question-continue");
    expect(el("meter-state")?.textContent).toContain("Đang giảm");
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(meterValue()).toBeLessThan(10);
    h.unmount();
  });
});

describe("a11y cơ bản", () => {
  it("có nút gợi ý sau 25 giây và đi tiếp sau 45 giây; gọi onComplete({skipped:true})", async () => {
    vi.useFakeTimers();
    try {
      const h = mount("IM");
      expect(el("hint")).toBeNull();
      await act(async () => {
        vi.advanceTimersByTime(25_500);
      });
      expect(el("hint")).not.toBeNull();
      await act(async () => {
        vi.advanceTimersByTime(20_000);
      });
      expect(el("game-skip")).not.toBeNull();
      click("game-skip");
      expect(h.completed).toEqual([{ skipped: true }]);
      h.unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});
