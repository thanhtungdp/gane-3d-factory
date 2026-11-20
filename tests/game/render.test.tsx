import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PLANET_IDS, type PlanetId } from "@/shared/types";
import { PlanetGame } from "@/game";
import { makeBrand, makePreScan, NOOP } from "./helpers";

/** Testid bắt buộc phải có ngay khi trạm được mở (chưa tương tác). */
const INITIAL_TESTIDS: Record<PlanetId, string[]> = {
  S: ["fog-zone-0", "fog-zone-1", "fog-zone-2", "fog-zone-3"],
  A: ["star-0", "star-1", "star-2"],
  O: ["mockup-0", "mockup-1", "mockup-2", "mockup-3", "mockup-4", "mockup-5"],
  K: ["launch-slot-0", "launch-slot-4"],
  IM: ["im-event-0", "meter-state"],
};

describe("PlanetGame — render tĩnh 5 trạm", () => {
  for (const planet of PLANET_IDS) {
    it(`render trạm ${planet} với testid ổn định`, () => {
      const html = renderToStaticMarkup(
        <PlanetGame
          planet={planet}
          brand={makeBrand()}
          preScan={makePreScan()}
          answers={{ companySize: "6-20", role: "founder" }}
          onDecision={NOOP}
          onComplete={NOOP}
          onGuide={NOOP}
        />,
      );

      expect(html).toContain('data-testid="planet-game"');
      expect(html).toContain(`data-planet="${planet}"`);
      expect(html).toContain("KIM");
      for (const testId of INITIAL_TESTIDS[planet]) {
        expect(html, `${planet} thiếu testid ${testId}`).toContain(`data-testid="${testId}"`);
      }
    });
  }

  it("header KIM hiển thị lời dẫn trạm và có dock rỗng khi SSR", () => {
    const html = renderToStaticMarkup(
      <PlanetGame
        planet="IM"
        brand={makeBrand({ name: "Cà Phê Đất Việt", logo: null })}
        preScan={makePreScan()}
        answers={{ companySize: "6-20", role: "founder" }}
        onDecision={NOOP}
        onComplete={NOOP}
        onGuide={NOOP}
      />,
    );
    expect(html).toContain('data-testid="kim-speech"');
    expect(html).toContain("Tua 12 tháng");
    expect(html).toContain('data-testid="game-dock"');
  });
});
