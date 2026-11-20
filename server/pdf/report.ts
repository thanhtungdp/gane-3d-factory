/**
 * PDF báo cáo 3 trang: bìa, radar 5 trục + điểm, gói đề xuất + CTA.
 * Lỗi font → vẫn tạo PDF bằng Helvetica (có cảnh báo trong log, không chặn response).
 */
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import type { Report } from "../../src/shared/types";
import { PLANET_META, PLANET_ORDER } from "../../src/shared/planets";
import type { AppConfig } from "../config";
import { resolvePdfFonts } from "./fonts";
import type { Logger } from "../lib/log";
import type { AssetStore } from "../storage/assets";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const NAVY = "#050a24";
const NAVY_SOFT = "#101a3d";
const INK = "#151a2e";
const MUTED = "#5b6478";
const PAPER = "#f8f6f2";
const ACCENT = "#ef4123";
const GOLD = "#f59e6b";

export interface PdfReportInput {
  report: Report;
  config: AppConfig;
  assets: AssetStore;
  logger: Logger;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function drawStar(doc: PDFKit.PDFDocument, cx: number, cy: number, radius: number, fill: string): void {
  const inner = radius * 0.32;
  doc.save();
  doc.fillColor(fill);
  doc.moveTo(cx, cy - radius);
  doc.lineTo(cx + inner, cy - inner);
  doc.lineTo(cx + radius, cy);
  doc.lineTo(cx + inner, cy + inner);
  doc.lineTo(cx, cy + radius);
  doc.lineTo(cx - inner, cy + inner);
  doc.lineTo(cx - radius, cy);
  doc.lineTo(cx - inner, cy - inner);
  doc.closePath();
  doc.fill();
  doc.restore();
}

export async function renderReportPdf(input: PdfReportInput): Promise<Buffer> {
  const { report, config, assets, logger } = input;
  const fonts = resolvePdfFonts(config.fontsDir);
  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    autoFirstPage: true,
    bufferPages: true,
    info: {
      Title: `Bản đồ thương hiệu — ${report.brand.name}`,
      Author: "Sao Kim Branding",
      Subject: "Hành trình Sao Kim — báo cáo thương hiệu",
      Creator: "Hành trình Sao Kim",
    },
  });

  const chunks: Buffer[] = [];
  const completed = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  let bodyFont = "Helvetica";
  let boldFont = "Helvetica-Bold";
  try {
    if (fonts.regular) {
      doc.registerFont("BodyVi", fonts.regular);
      bodyFont = "BodyVi";
    }
    if (fonts.bold) {
      doc.registerFont("BoldVi", fonts.bold);
      boldFont = "BoldVi";
    }
  } catch {
    bodyFont = "Helvetica";
    boldFont = "Helvetica-Bold";
    logger.warn("pdf.font_fallback", { font: fonts.label });
  }
  if (!fonts.regular) logger.warn("pdf.font_missing", { fontsDir: config.fontsDir });

  doc.font(bodyFont);

  const logoBuffer = report.brand.logo?.id ? await assets.read(report.brand.logo.id) : null;
  const bookingUrl = config.bookingUrl || config.publicOrigin;
  const qrTarget = config.bookingUrl || `${config.publicOrigin}/?report=${encodeURIComponent(report.id)}`;
  let qrBuffer: Buffer | null = null;
  try {
    qrBuffer = await QRCode.toBuffer(qrTarget, { type: "png", width: 140, margin: 1, errorCorrectionLevel: "M" });
  } catch {
    qrBuffer = null;
  }

  const createdAt = new Date(report.createdAt);
  const dateLabel = Number.isNaN(createdAt.getTime())
    ? ""
    : createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  // ── Trang 1: bìa ────────────────────────────────────────────────────────
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(NAVY);
  doc.rect(0, 0, 8, PAGE_HEIGHT).fill(ACCENT);
  for (let i = 0; i < 22; i += 1) {
    const x = (i * 149) % PAGE_WIDTH;
    const y = (i * 233) % PAGE_HEIGHT;
    const alpha = 0.10 + ((i * 7) % 10) / 60;
    doc.save();
    doc.fillColor("#ffffff").opacity(alpha);
    doc.circle(x, y, 1.1 + (i % 3) * 0.7).fill();
    doc.restore();
  }
  drawStar(doc, PAGE_WIDTH - 96, 100, 44, ACCENT);
  drawStar(doc, PAGE_WIDTH - 96, 100, 20, GOLD);

  if (logoBuffer) {
    try {
      doc.roundedRect(56, 56, 104, 104, 18).fill(NAVY_SOFT);
      doc.image(logoBuffer, 64, 64, { fit: [88, 88], align: "center", valign: "center" });
    } catch {
      /* logo lỗi — bìa vẫn đẹp bằng chữ */
    }
  }
  doc.fillColor("#ffffff").font(boldFont).fontSize(34).text(truncate(report.brand.name, 46), 56, 214, {
    width: PAGE_WIDTH - 112,
  });
  doc.fillColor(GOLD).font(bodyFont).fontSize(13).text(
    report.brand.industry ? `${report.brand.industry} · ${report.brand.domain ?? ""}`.trim() : report.brand.domain ?? "",
    56,
    268,
    { width: PAGE_WIDTH - 112 },
  );

  doc.fillColor("#ffffff").font(boldFont).fontSize(30).text("Bản đồ thương hiệu", 56, 330, {
    width: PAGE_WIDTH - 112,
  });
  doc.fillColor(GOLD).font(bodyFont).fontSize(18).text(report.result.title, 56, 376, { width: PAGE_WIDTH - 112 });
  doc.fillColor("#c7cde0").font(bodyFont).fontSize(12).text(truncate(report.result.titleBlurb, 160), 56, 406, {
    width: PAGE_WIDTH - 300,
    lineGap: 3,
  });

  doc.roundedRect(56, 486, 240, 116, 18).fill(NAVY_SOFT);
  doc.fillColor("#ffffff").font(boldFont).fontSize(54).text(report.result.overall.toFixed(1), 76, 506, { width: 200 });
  doc.fillColor("#c7cde0").font(bodyFont).fontSize(12).text("trên 10 · điểm thương hiệu", 78, 570);

  const halfStars = report.result.stars;
  let starX = 330;
  for (let i = 0; i < 5; i += 1) {
    const filled = halfStars >= i + 1;
    drawStar(doc, starX, 520, 13, filled ? GOLD : "#2b335c");
    starX += 32;
  }
  doc.fillColor("#9aa3bd").font(bodyFont).fontSize(10).text("5 trạm thắp sáng thương hiệu", 330, 548, {
    width: 220,
  });

  doc.fillColor("#7d86a3").font(bodyFont).fontSize(10).text(`${dateLabel} · Sao Kim Branding`, 56, 690, {
    width: PAGE_WIDTH - 112,
  });
  doc.fillColor("#59618a").font(bodyFont).fontSize(9).text("hello@saokim.vn · saokim.vn", 56, 710, {
    width: PAGE_WIDTH - 112,
  });
  drawStar(doc, PAGE_WIDTH / 2, 780, 16, NAVY_SOFT);

  // ── Trang 2: radar + điểm ───────────────────────────────────────────────
  doc.addPage();
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(PAPER);
  doc.rect(0, 0, PAGE_WIDTH, 74).fill(NAVY);
  drawStar(doc, 36, 36, 14, ACCENT);
  doc.fillColor("#ffffff").font(boldFont).fontSize(20).text("Radar 5 trạm", 62, 25);
  doc.fillColor("#9aa3bd").font(bodyFont).fontSize(10).text(`Tổng ${report.result.overall.toFixed(1)}/10`, 400, 32, {
    width: 150,
    align: "right",
  });

  const centerX = PAGE_WIDTH / 2;
  const centerY = 360;
  const radius = 150;
  const angleFor = (index: number) => -Math.PI / 2 + (index * 2 * Math.PI) / 5;
  const point = (index: number, ratio: number): { x: number; y: number } => {
    const angle = angleFor(index);
    return { x: centerX + Math.cos(angle) * radius * ratio, y: centerY + Math.sin(angle) * radius * ratio };
  };

  for (let level = 2; level <= 10; level += 2) {
    const ratio = level / 10;
    const verts = PLANET_ORDER.map((_, i) => point(i, ratio));
    doc.save();
    doc.lineWidth(0.8).strokeColor("#d8d3c9");
    doc.moveTo(verts[0]!.x, verts[0]!.y);
    for (let i = 1; i < verts.length; i += 1) doc.lineTo(verts[i]!.x, verts[i]!.y);
    doc.closePath().stroke();
    if (level === 2) {
      doc.fillColor("#9aa3bd").fontSize(8).text("2", centerX + 4, point(0, ratio).y - 2);
    }
    if (level === 10) {
      doc.fillColor("#9aa3bd").fontSize(8).text("10", centerX + 4, point(0, ratio).y - 8);
    }
    doc.restore();
  }
  for (let i = 0; i < 5; i += 1) {
    const outer = point(i, 1);
    doc.save().lineWidth(0.8).strokeColor("#d8d3c9");
    doc.moveTo(centerX, centerY).lineTo(outer.x, outer.y).stroke().restore();
    const meta = PLANET_META[PLANET_ORDER[i]!];
    const labelPoint = {
      x: centerX + Math.cos(angleFor(i)) * (radius + 34),
      y: centerY + Math.sin(angleFor(i)) * (radius + 30),
    };
    doc.fillColor(INK).font(boldFont).fontSize(12).text(meta.letter, labelPoint.x - 20, labelPoint.y - 14, {
      width: 40,
      align: "center",
    });
    doc.fillColor(MUTED).font(bodyFont).fontSize(7.5).text(truncate(meta.stepVi, 18), labelPoint.x - 42, labelPoint.y + 4, {
      width: 84,
      align: "center",
    });
    const score = report.result.planets[meta.id]?.score ?? 0;
    doc.fillColor(ACCENT).font(boldFont).fontSize(10).text(`${score.toFixed(1)}/10`, labelPoint.x - 25, labelPoint.y + 16, {
      width: 50,
      align: "center",
    });
  }

  const scoreVerts = PLANET_ORDER.map((id, i) => point(i, Math.max(0.02, (report.result.planets[id]?.score ?? 0) / 10)));
  doc.save();
  doc.fillColor(ACCENT).opacity(0.18);
  doc.moveTo(scoreVerts[0]!.x, scoreVerts[0]!.y);
  for (let i = 1; i < scoreVerts.length; i += 1) doc.lineTo(scoreVerts[i]!.x, scoreVerts[i]!.y);
  doc.closePath().fill();
  doc.restore();
  doc.save().lineWidth(2).strokeColor(ACCENT);
  doc.moveTo(scoreVerts[0]!.x, scoreVerts[0]!.y);
  for (let i = 1; i < scoreVerts.length; i += 1) doc.lineTo(scoreVerts[i]!.x, scoreVerts[i]!.y);
  doc.closePath().stroke();
  doc.restore();
  for (const vertex of scoreVerts) {
    doc.save().fillColor(ACCENT).circle(vertex.x, vertex.y, 3).fill().restore();
  }

  let rowY = 560;
  doc.fillColor(INK).font(boldFont).fontSize(12).text("Điểm từng trạm", 56, rowY);
  rowY += 22;
  for (const planet of PLANET_ORDER) {
    const meta = PLANET_META[planet];
    const result = report.result.planets[planet];
    doc.fillColor(INK).font(boldFont).fontSize(10).text(`${meta.letter} — ${meta.stepVi}`, 56, rowY, { width: 300 });
    doc.fillColor(MUTED).font(bodyFont).fontSize(9).text(
      result ? `Kiến thức ${result.knowledge.toFixed(1)} · Chẩn đoán ${result.diagnosis.toFixed(1)}` : "Chưa hoàn thành",
      300,
      rowY + 1,
      { width: 200 },
    );
    doc.fillColor(ACCENT).font(boldFont).fontSize(10).text(`${(result?.score ?? 0).toFixed(1)}/10`, 500, rowY, {
      width: 60,
      align: "right",
    });
    rowY += 24;
  }

  doc.fillColor(INK).font(boldFont).fontSize(12).text("Hai bước yếu nhất", 56, 700);
  let weakY = 722;
  for (const weak of report.weaknesses.slice(0, 2)) {
    const meta = PLANET_META[weak.planet];
    doc.fillColor(ACCENT).font(boldFont).fontSize(10).text(
      `${meta.letter} — ${meta.stepVi} (${weak.score.toFixed(1)}/10)`,
      56,
      weakY,
    );
    doc.fillColor(MUTED).font(bodyFont).fontSize(9).text(truncate(weak.consequence, 150), 56, weakY + 13, {
      width: PAGE_WIDTH - 112,
      lineGap: 1,
    });
    weakY += 44;
  }

  // ── Trang 3: insight + gói + CTA ────────────────────────────────────────
  doc.addPage();
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(PAPER);
  doc.rect(0, 0, PAGE_WIDTH, 74).fill(NAVY);
  drawStar(doc, 36, 36, 14, GOLD);
  doc.fillColor("#ffffff").font(boldFont).fontSize(20).text("Điều đáng làm tiếp theo", 62, 25);

  let y = 96;
  for (const insight of report.insights.slice(0, 3)) {
    doc.fillColor(ACCENT).font(boldFont).fontSize(11).text(truncate(insight.title, 80), 56, y, { width: 480 });
    y += 16;
    doc.fillColor(INK).font(bodyFont).fontSize(9.5).text(truncate(insight.body, 220), 56, y, {
      width: 480,
      lineGap: 1.5,
    });
    y += doc.heightOfString(truncate(insight.body, 220), { width: 480, lineGap: 1.5 }) + 4;
    doc.fillColor(MUTED).font(bodyFont).fontSize(8).text(`Dẫn chứng: ${truncate(insight.evidence, 140)}`, 56, y, {
      width: 400,
    });
    y += 12;
    doc.fillColor(INK).font(boldFont).fontSize(8.5).text(`Việc nên làm: ${truncate(insight.action, 140)}`, 56, y, {
      width: 480,
    });
    y += 28;
  }

  y = Math.max(y, 400);
  doc.moveTo(56, y - 12).lineTo(PAGE_WIDTH - 56, y - 12).lineWidth(0.7).strokeColor("#d8d3c9").stroke();
  doc.fillColor(INK).font(boldFont).fontSize(13).text("Gói đề xuất cho bạn", 56, y);
  y += 20;
  for (const offer of report.offers.slice(0, 2)) {
    doc.fillColor(INK).font(boldFont).fontSize(11).text(truncate(offer.name, 60), 56, y);
    doc.fillColor(MUTED).font(bodyFont).fontSize(9).text(truncate(offer.tagline, 100), 180, y + 1, { width: 350 });
    y += 16;
    doc.fillColor("#3f475c").font(bodyFont).fontSize(8.5).text(truncate(offer.why, 230), 56, y, {
      width: PAGE_WIDTH - 112,
      lineGap: 1.2,
    });
    y += doc.heightOfString(truncate(offer.why, 230), { width: PAGE_WIDTH - 112, lineGap: 1.2 }) + 5;
    for (const pkg of offer.packages) {
      doc.fillColor(INK).font(bodyFont).fontSize(8.5).text(`· ${pkg.name} — ${pkg.price}`, 62, y, { width: 480 });
      y += 13;
    }
    y += 6;
    if (y > 690) break;
  }

  doc.roundedRect(56, 706, PAGE_WIDTH - 112, 92, 14).fill(NAVY);
  if (qrBuffer) {
    try {
      doc.image(qrBuffer, PAGE_WIDTH - 56 - 20 - 68, 718, { fit: [68, 68] });
    } catch {
      /* QR lỗi thì vẫn giữ CTA chữ */
    }
  }
  doc.fillColor("#ffffff").font(boldFont).fontSize(12).text("Đặt lịch tư vấn cùng Sao Kim", 74, 720);
  doc.fillColor("#c7cde0").font(bodyFont).fontSize(8.5).text(
    "Quét mã để mở lịch tư vấn. Báo cáo này được tạo từ chính dữ liệu bạn cung cấp.",
    74,
    740,
    { width: 360, lineGap: 1.5 },
  );
  doc.fillColor(GOLD).fontSize(8.5).text(truncate(bookingUrl, 90), 74, 770, { width: 360 });

  for (let i = 1; i <= 3; i += 1) {
    doc.save();
    doc.fillColor(i === 1 ? "#59618a" : "#9a938a").font(bodyFont).fontSize(7.5).text(
      `${i} / 3 · Sao Kim Branding · hello@saokim.vn`,
      56,
      PAGE_HEIGHT - 24,
      { width: PAGE_WIDTH - 112, align: "center" },
    );
    doc.restore();
  }

  doc.end();
  return completed;
}
