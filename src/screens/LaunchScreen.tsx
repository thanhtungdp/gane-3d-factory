import { useEffect, useRef } from "react";
import { useRun } from "@/state/run";
import { useScene } from "@/state/scene";
import { Button } from "@/ui/Controls";
import { IconArrowRight } from "@/ui/Icons";
import { PLANET_META } from "@/shared/planets";
import { track } from "@/lib/analytics";

export function LaunchScreen({ onDone }: { onDone: () => void }) {
  const brand = useRun((s) => s.brand);
  const results = useRun((s) => s.results);
  const soundOn = useScene((s) => s.soundOn);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(() => doneRef.current(), 3600);
    if (soundOn) {
      void import("@/lib/audio").then((a) => a.playSfx("launch")).catch(() => undefined);
    }
    return () => clearTimeout(t);
  }, [soundOn]);

  const layers = Object.keys(results).length;

  return (
    <div className="screen screen--center screen--locked" data-testid="launch-screen">
      <div className="content content--narrow relative text-center">
        <div className="eyebrow justify-center">
          <span className="dot text-amber animate-pulse" /> Đang cất cánh
        </div>
        <h1 className="headline mt-3">
          {brand?.name ?? "Thương hiệu của bạn"}
          <br />
          <span className="text-silver-dim">đã có tàu riêng.</span>
        </h1>
        <p className="lead mx-auto mt-4 max-w-[32ch]">
          Logo của bạn đã dán lên thân tàu. Màu thương hiệu đã thành đèn và vệt khói động cơ.
        </p>

        <div className="mt-8 space-y-2 text-left">
          {["Khởi động lõi năng lượng", "Kéo hành tinh thương hiệu vào quỹ đạo", "Mở bản đồ 5 trạm"].map(
            (line, i) => (
              <div
                key={line}
                className="glass panel--flat flex items-center gap-3 p-3"
                style={{ animation: `fadeUp .5s ${i * 0.35}s both` }}
              >
                <span className="mono-num grid h-7 w-7 place-items-center rounded-full border border-amber/30 bg-amber/10 text-[11px] font-bold text-amber">
                  {i + 1}
                </span>
                <span className="text-[12.5px] text-silver-dim">{line}</span>
                <span className="ml-auto text-[10px] text-muted">…</span>
              </div>
            ),
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-muted">
          <span className="dot text-[#4fd1c5]" />
          {layers === 0
            ? "Hành tinh thương hiệu đang xám. Nó cần 5 lớp sáng."
            : `${layers} lớp sáng đã được giữ lại từ lần trước.`}
        </div>

        <Button
          variant="plain"
          className="mt-6 text-muted"
          onClick={() => {
            track("launch_skip");
            doneRef.current();
          }}
          data-testid="skip-launch"
        >
          Bỏ qua <IconArrowRight size={15} />
        </Button>
      </div>

      <div className="pointer-events-none absolute bottom-[max(12px,env(safe-area-inset-bottom))] left-0 right-0 text-center text-[10px] text-white/20">
        {PLANET_META.S.world} · {PLANET_META.IM.world} · Sao Kim
      </div>
    </div>
  );
}
