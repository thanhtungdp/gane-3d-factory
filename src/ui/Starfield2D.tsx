import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
  depth: number;
}

/**
 * Starfield 2D cho landing/scan/map — không kéo three. Tự dừng khi prefers-reduced-motion.
 */
export function Starfield2D({
  density = 1,
  className,
}: {
  density?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    let stars: Star[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    function resize() {
      if (!canvas) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(220, Math.round(((w * h) / 12000) * density));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.35 + 0.25,
        a: Math.random() * 0.6 + 0.15,
        tw: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.7 + 0.3,
      }));
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!reduced) {
          s.tw += 0.008 + s.depth * 0.004;
          s.y -= s.depth * 0.035;
          if (s.y < -4) {
            s.y = h + 4;
            s.x = Math.random() * w;
          }
        }
        const alpha = reduced ? s.a * 0.7 : s.a * (0.6 + Math.sin(s.tw) * 0.4);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.depth > 0.8 ? "255,236,205" : "220,230,255"},${alpha.toFixed(3)})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.r > 1.1) {
          ctx.fillStyle = `rgba(255,255,255,${(alpha * 0.12).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    const onResize = () => {
      resize();
      if (reduced) draw();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return <canvas ref={ref} className={className ?? "starfield"} aria-hidden />;
}
