import type { ComponentType } from "react";
import type { PlanetId } from "@/shared/types";
import type { PlanetGameProps } from "@/shared/game";
import { PLANET_META } from "@/shared/planets";
import "./game.css";
import { PLANET_CONTENT } from "./content";
import { kimReaction } from "./content/kim";
import { usePlanetSession } from "./engine/session";
import { usePrefersReducedMotion } from "./engine/useReducedMotion";
import { GameDockProvider, GameDockSlot } from "./components/GameDock";
import { KimSpeech, type KimMood } from "./components/KimCompanion";
import { QuestionFlowProvider } from "./components";
import { AlignGame } from "./planets/AlignGame";
import { IdentityGame } from "./planets/IdentityGame";
import { ImplementGame } from "./planets/ImplementGame";
import { KickoffGame } from "./planets/KickoffGame";
import { ScanGame } from "./planets/ScanGame";
import type { MiniGameProps } from "./planets/types";

const GAMES: Record<PlanetId, ComponentType<MiniGameProps>> = {
  S: ScanGame,
  A: AlignGame,
  O: IdentityGame,
  K: KickoffGame,
  IM: ImplementGame,
};

/**
 * Host một trạm: HUD KIM gọn + mini-game + dock CTA cố định.
 * Dock nằm ngoài vùng cuộn để nút chính không bao giờ bị khuất.
 */
export function PlanetGame({ planet, brand, preScan, onDecision, onComplete, onGuide }: PlanetGameProps) {
  const content = PLANET_CONTENT[planet];
  const meta = PLANET_META[planet];
  const reducedMotion = usePrefersReducedMotion();
  const session = usePlanetSession({
    decisions: content.decisions,
    onDecision,
    onComplete,
    onGuide,
  });
  const Game = GAMES[planet];
  const lastPoints = session.records.at(-1)?.points;
  const mood: KimMood =
    session.completed || lastPoints === 2 ? "happy" : lastPoints === 1 ? "thinking" : lastPoints === 0 ? "curious" : "idle";
  const rawLine = session.guide ?? (typeof lastPoints === "number" ? kimReaction(lastPoints) : null) ?? meta.mapHint;
  const line = rawLine.replace(/^KIM:\s*/i, "");

  return (
    <GameDockProvider>
      <section
        data-testid="planet-game"
        data-planet={planet}
        aria-label={`Trạm ${meta.letter} — ${meta.stepVi}`}
        className="kim-game relative flex h-full min-h-0 flex-col overflow-hidden text-silver"
      >
        <header className="kim-game__hud">
          <KimSpeech text={line} mood={mood} size={34} className="kim-game__kim" />
          <div className="kim-game__tools">
            <span
              className="pill mono-num shrink-0"
              aria-label={`Đã trả lời ${session.answeredCount} trên ${session.total} quyết định`}
            >
              {session.answeredCount}/{session.total}
            </span>
            {session.hintAvailable ? (
              <button
                type="button"
                data-testid="hint"
                className="btn btn-ghost btn-sm px-2.5"
                aria-label="Gợi ý cho bước hiện tại"
                onClick={session.showHint}
              >
                Gợi ý
              </button>
            ) : null}
            {session.skipAvailable ? (
              <button
                type="button"
                data-testid="game-skip"
                className="btn btn-ghost btn-sm px-2.5"
                aria-label="Đi tiếp, bỏ qua trạm này"
                onClick={session.skip}
              >
                Đi tiếp
              </button>
            ) : null}
          </div>
        </header>

        <div className="kim-game__body">
          {session.completed ? (
            <div data-testid="badge" className="fade-up panel glass mt-2 text-center">
              <p className="eyebrow justify-center">Huy hiệu trạm {meta.letter}</p>
              <p className="h2 mt-1">{content.badge.name}</p>
              <p className="body mt-1.5">{content.badge.blurb}</p>
              <p className="small muted mt-2">KIM đang chuyển bạn về bản đồ hành trình…</p>
            </div>
          ) : (
            <QuestionFlowProvider questionOrder={content.decisions.map((decision) => decision.id)}>
              <Game
                content={content}
                brand={brand}
                preScan={preScan}
                session={session}
                reducedMotion={reducedMotion}
              />
            </QuestionFlowProvider>
          )}
        </div>

        <GameDockSlot />
      </section>
    </GameDockProvider>
  );
}
