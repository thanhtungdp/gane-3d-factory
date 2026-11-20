import { useEffect, useRef, useState } from "react";
import { useRun } from "@/state/run";
import { useScene } from "@/state/scene";
import { Button } from "@/ui/Controls";
import { StarGem } from "@/ui/StarGem";
import { IconArrowRight, IconRocket, IconSparkle } from "@/ui/Icons";
import { createReport, createSession } from "@/lib/api";
import { buildLocalReport } from "@/lib/report";
import { track } from "@/lib/analytics";
import { PLANET_ORDER } from "@/shared/planets";
import { CONSENT_VERSION } from "@/shared/types";

export function FinaleScreen() {
  const brand = useRun((s) => s.brand);
  const preScan = useRun((s) => s.preScan);
  const answers = useRun((s) => s.answers);
  const results = useRun((s) => s.results);
  const startedAt = useRun((s) => s.startedAt);
  const setReport = useRun((s) => s.setReport);
  const setScreen = useRun((s) => s.setScreen);
  const soundOn = useScene((s) => s.soundOn);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const started = useRef(false);

  const all = PLANET_ORDER.map((id) => results[id]).filter((r): r is NonNullable<typeof r> => Boolean(r));
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1400);
    if (soundOn) void import("@/lib/audio").then((a) => a.playSfx("ignite")).catch(() => undefined);
    track("finale_view", { completed: all.length });
    return () => clearTimeout(t);
  }, [soundOn, all.length]);

  async function openReport() {
    if (busy || started.current) return;
    started.current = true;
    const durationMs = Math.max(0, Date.now() - new Date(startedAt).getTime());
    setBusy(true);
    setError("");
    try {
      if (!brand || !preScan) throw new Error("missing brand");
      let sessionId = useRun.getState().sessionId;
      const scan = useRun.getState().scan;
      if (!sessionId && scan) {
        const { sessionId: sid } = await createSession({
          scanId: scan.scanId,
          brand,
          answers,
          preScan,
          consent: { accepted: true, version: CONSENT_VERSION },
        });
        sessionId = sid;
        useRun.getState().setSessionId(sid);
      }
      if (sessionId) {
        const { report } = await createReport({ sessionId, results: all, durationMs });
        setReport(report);
        track("report_created", { source: "server" });
      } else {
        throw new Error("no session");
      }
    } catch {
      if (brand && preScan) {
        const report = buildLocalReport({ brand, preScan, answers, results: all, durationMs });
        setReport(report);
        track("report_created", { source: "local" });
      } else {
        setError("Chưa đủ dữ liệu để dựng báo cáo. Bạn quay lại bản đồ nhé.");
        started.current = false;
      }
    } finally {
      setBusy(false);
      if (useRun.getState().report) {
        setScreen("report");
        window.scrollTo({ top: 0 });
      }
    }
  }

  const complete = all.length === PLANET_ORDER.length;

  return (
    <div className="screen screen--center screen--locked" data-testid="finale-screen">
      <div className="content content--narrow relative text-center">
        <div className="relative mx-auto mb-4 w-fit">
          <StarGem size={190} className="float" />
          <div className="absolute inset-0 -z-10 rounded-full bg-amber/20 blur-3xl" />
        </div>

        <div className="eyebrow justify-center">
          <IconSparkle size={12} className="text-amber" /> Đích đến
        </div>
        <h1 className="headline mt-3">
          Sao Kim
          <br />
          đã nhận ra bạn.
        </h1>
        <p className="lead mx-auto mt-4 max-w-[30ch]">
          {complete
            ? `Hành tinh của ${brand?.name ?? "bạn"} đã đi đủ 5 trạm. Những vùng còn tối là những nơi bạn chưa quyết.`
            : "Bạn chưa đi đủ 5 trạm, nên hành tinh vẫn còn những vùng tối."}
        </p>

        <div className="glass panel mt-7 text-left">
          <p className="eyebrow">Bước tiếp theo</p>
          <h2 className="h3 mt-1.5">Bản đồ thương hiệu của bạn</h2>
          <ul className="mt-3 space-y-2 text-[12.5px] text-silver-dim">
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber" /> Radar 5 trục từ chính lựa chọn của bạn
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber" /> 2 vùng tối nhất và hệ quả kinh doanh
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber" /> 3 nhận định riêng + gói phù hợp
            </li>
          </ul>
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        <Button
          variant="primary"
          block
          className="mt-5"
          onClick={() => void openReport()}
          loading={busy}
          data-testid="open-report-button"
          style={{ opacity: ready ? 1 : 0.6 }}
        >
          {busy ? "Đang tổng hợp 5 lớp sáng…" : "Mở Bản đồ thương hiệu"}{" "}
          {!busy ? <IconArrowRight size={18} className="arrow" /> : null}
        </Button>
        <button
          className="mt-3 text-[11.5px] text-muted underline underline-offset-4"
          onClick={() => {
            setScreen("map");
            useScene.getState().setMode("landing");
          }}
          type="button"
        >
          <IconRocket size={12} className="mr-1 inline" /> Quay lại bản đồ
        </button>
      </div>
    </div>
  );
}
