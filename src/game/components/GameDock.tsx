import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface DockContextValue {
  target: HTMLElement | null;
  setTarget: (node: HTMLElement | null) => void;
}

const GameDockContext = createContext<DockContextValue | null>(null);

/**
 * Vùng CTA cố định đáy khung trạm.
 *
 * Mini-game render nút chính qua <GameDock> để nút luôn nằm ngoài vùng cuộn.
 * Provider bọc <section planet-game>, slot nằm trong section để test/e2e vẫn
 * tìm thấy nút trong [data-testid="planet-game"].
 */
export function GameDockProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  return <GameDockContext.Provider value={{ target, setTarget }}>{children}</GameDockContext.Provider>;
}

/** Slot đặt trong section trạm, sau vùng nội dung cuộn. */
export function GameDockSlot() {
  const context = useContext(GameDockContext);
  return (
    <div
      ref={context?.setTarget}
      className="game-dock"
      data-testid="game-dock"
      // Dock luôn có mặt; nội dung do mini-game portal vào.
      aria-live="polite"
    />
  );
}

/** Nút CTA chính của pha hiện tại. Không render gì khi chưa có target (SSR). */
export function GameDock({ children }: { children: ReactNode }) {
  const context = useContext(GameDockContext);
  if (!context?.target) return null;
  return createPortal(children, context.target);
}
