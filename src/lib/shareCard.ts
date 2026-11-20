import { PLANET_META, PLANET_ORDER } from "@/shared/planets";
import type { PlanetId, Report } from "@/shared/types";

const W = 1080;
const H = 1920;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function drawStars(ctx: CanvasRenderingContext2D, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = 0; i < 260; i += 1) {
    const x = rand() * W;
    const y = rand() * H;
    const r = rand() * 1.8 + 0.3;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${0.12 + rand() * 0.6})`;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlanet(
  ctx: CanvasRenderingContext2D,
  planet: PlanetId,
  lit: number,
  cx: number,
  cy: number,
  radius: number,
  logo: HTMLImageElement | null,
) {
  const color = PLANET_META[planet].color;
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.65);
  glow.addColorStop(0, `${color}cc`);
  glow.addColorStop(0.5, `${color}33`);
  glow.addColorStop(1, `${color}00`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.65, 0, Math.PI * 2);
  ctx.fill();

  const g = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.4, radius * 0.1, cx, cy, radius);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.18, color);
  g.addColorStop(0.62, "#0d1738");
  g.addColorStop(1, "#04081a");
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = g;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // dải bề mặt
  ctx.globalAlpha = 0.18 + lit * 0.2;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(cx, cy + i * radius * 0.25, radius * 1.1, radius * 0.08, -0.18, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // city lights
  if (lit > 0.3) {
    ctx.fillStyle = PLANET_META[planet].glow;
    ctx.globalAlpha = 0.25 + lit * 0.6;
    for (let i = 0; i < 26; i += 1) {
      const a = (i * 137.5 * Math.PI) / 180;
      const rr = radius * (0.2 + ((i * 37) % 60) / 100);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr * 0.9;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // vignette
  const v = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,.7)");
  ctx.fillStyle = v;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();

  // decal logo
  if (logo) {
    const size = radius * 0.5;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(4,8,26,.55)";
    ctx.fill();
    ctx.drawImage(logo, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();
  }

  // vệ tinh
  if (planet === "IM" && lit > 0.3) {
    ctx.strokeStyle = `${PLANET_META[planet].glow}88`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.35, radius * 0.42, -0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PLANET_META[planet].glow;
    ctx.beginPath();
    ctx.arc(cx + radius * 1.2, cy - radius * 0.55, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRadar(
  ctx: CanvasRenderingContext2D,
  values: Partial<Record<PlanetId, number>>,
  cx: number,
  cy: number,
  maxR: number,
) {
  const n = PLANET_ORDER.length;
  ctx.save();
  for (const ring of [0.25, 0.5, 0.75, 1]) {
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * ring, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = ring === 1 ? 2 : 1;
    ctx.stroke();
  }
  const pts: { x: number; y: number }[] = [];
  PLANET_ORDER.forEach((id, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / n;
    const x = cx + Math.cos(angle) * maxR;
    const y = cy + Math.sin(angle) * maxR;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(255,255,255,.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const v = Math.max(0, Math.min(10, values[id] ?? 0));
    const px = cx + Math.cos(angle) * maxR * (v / 10);
    const py = cy + Math.sin(angle) * maxR * (v / 10);
    pts.push({ x: px, y: py });

    const lx = cx + Math.cos(angle) * (maxR + 42);
    const ly = cy + Math.sin(angle) * (maxR + 42);
    ctx.fillStyle = PLANET_META[id].color;
    ctx.font = "700 26px 'Be Vietnam Pro', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(id, lx, ly);
  });

  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.fillStyle = "rgba(250,166,52,.22)";
  ctx.fill();
  ctx.strokeStyle = "#faa634";
  ctx.lineWidth = 3.5;
  ctx.stroke();

  pts.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd79b";
    ctx.fill();
    ctx.strokeStyle = "#050a24";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  ctx.restore();
}

export async function createShareCard(report: Report): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#030718");
  bg.addColorStop(0.45, "#050a24");
  bg.addColorStop(1, "#0a1a5c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const neb = ctx.createRadialGradient(W * 0.78, H * 0.2, 0, W * 0.78, H * 0.2, 700);
  neb.addColorStop(0, "rgba(33,64,154,.55)");
  neb.addColorStop(1, "rgba(33,64,154,0)");
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, W, H);

  drawStars(ctx, report.brand.name.length * 977 + 7);

  const saokim = await loadImage("/brand/logo-saokim-white.svg");
  if (saokim) {
    const h = 48;
    const w = (saokim.width / saokim.height) * h || 280;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(saokim, 72, 84, w, h);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = "rgba(255,255,255,.5)";
  ctx.font = "600 26px 'Be Vietnam Pro', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("BẢN ĐỒ THƯƠNG HIỆU · SAOKIM FRAMEWORK", 72, 196);

  // brand logo
  const brandLogo = report.brand.logo?.url ? await loadImage(report.brand.logo.url) : null;
  if (brandLogo) {
    roundRect(ctx, 72, 232, 132, 132, 30);
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.fill();
    const max = 100;
    const ratio = Math.min(max / (brandLogo.width || max), max / (brandLogo.height || max));
    const lw = (brandLogo.width || max) * ratio;
    const lh = (brandLogo.height || max) * ratio;
    ctx.drawImage(brandLogo, 72 + (132 - lw) / 2, 232 + (132 - lh) / 2, lw, lh);
  } else {
    roundRect(ctx, 72, 232, 132, 132, 30);
    ctx.fillStyle = report.brand.palette[0]?.hex ?? "#21409a";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 54px 'Be Vietnam Pro', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      report.brand.name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join(""),
      138,
      298,
    );
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f4f6fb";
  ctx.font = "700 62px 'Be Vietnam Pro', sans-serif";
  const nameLines = wrapText(ctx, report.brand.name, 660, 70, 2);
  nameLines.forEach((line, i) => ctx.fillText(line, 234, 300 + i * 70));
  ctx.fillStyle = "rgba(201,210,230,.7)";
  ctx.font = "500 28px 'Be Vietnam Pro', sans-serif";
  ctx.fillText(report.brand.industry ?? "Doanh nghiệp", 234, 380);

  drawPlanet(ctx, report.result.weak[0] ?? "IM", 0.72, W / 2, 760, 215, brandLogo);

  // score
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6fb";
  ctx.font = "700 150px 'Be Vietnam Pro', sans-serif";
  ctx.fillText(`${report.result.overall.toFixed(1)}`, W / 2 - 50, 1110);
  ctx.fillStyle = "rgba(201,210,230,.65)";
  ctx.font = "600 44px 'Be Vietnam Pro', sans-serif";
  ctx.fillText("/10", W / 2 + 145, 1100);

  ctx.fillStyle = "#faa634";
  ctx.font = "700 46px 'Be Vietnam Pro', sans-serif";
  ctx.fillText(report.result.title, W / 2, 1180);

  // stars
  const stars = report.result.stars;
  for (let i = 0; i < 5; i += 1) {
    const x = W / 2 - 120 + i * 60;
    drawStarShape(ctx, x, 1232, 20, i < Math.round(stars) ? "#faa634" : "rgba(255,255,255,.15)");
  }

  // radar
  drawRadar(
    ctx,
    Object.fromEntries(PLANET_ORDER.map((id) => [id, report.result.planets[id]?.score ?? 0])),
    W / 2,
    1540,
    150,
  );

  // footer
  ctx.strokeStyle = "rgba(255,255,255,.1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(72, 1770);
  ctx.lineTo(W - 72, 1770);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#f4f6fb";
  ctx.font = "600 30px 'Be Vietnam Pro', sans-serif";
  ctx.fillText("5 trạm. 1 ngôi sao.", 72, 1822);
  ctx.fillStyle = "rgba(201,210,230,.55)";
  ctx.font = "400 24px 'Be Vietnam Pro', sans-serif";
  ctx.fillText(`Tạo bản đồ của bạn tại ${window.location.host}`, 72, 1862);

  const shareUrl =
    report.id.startsWith("local-") || typeof window === "undefined"
      ? `${window.location.origin}/`
      : `${window.location.origin}/r/${report.id}`;
  try {
    const qr = await loadImage(`/api/qr?data=${encodeURIComponent(shareUrl)}`);
    if (qr) {
      ctx.fillStyle = "rgba(255,255,255,.94)";
      roundRect(ctx, W - 242, 1760, 170, 170, 18);
      ctx.fill();
      ctx.drawImage(qr, W - 232, 1770, 150, 150);
    }
  } catch {
    /* QR là phụ */
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Không tạo được ảnh"))), "image/png", 0.92);
  });
}

function drawStarShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export async function shareReportCard(report: Report): Promise<"shared" | "downloaded" | "failed"> {
  try {
    const blob = await createShareCard(report);
    const file = new File([blob], `ban-do-thuong-hieu-${report.brand.name.replace(/\s+/g, "-").toLowerCase()}.png`, {
      type: "image/png",
    });
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };
    if (nav.canShare?.({ files: [file] }) && nav.share) {
      await nav.share({
        files: [file],
        title: `Bản đồ thương hiệu ${report.brand.name}`,
        text: `${report.result.overall.toFixed(1)}/10 — ${report.result.title}`,
      });
      return "shared";
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return "downloaded";
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return "failed";
    // Mở ảnh ở tab mới để người dùng lưu thủ công (Zalo/Facebook webview)
    try {
      const blob = await createShareCard(report);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      return "downloaded";
    } catch {
      return "failed";
    }
  }
}

