/** Font tiếng Việt cho PDF: ưu tiên Be Vietnam Pro vendored, fallback DejaVu, cuối cùng Helvetica. */
import { existsSync } from "node:fs";
import path from "node:path";

export interface PdfFontPaths {
  regular: string | null;
  bold: string | null;
  label: string;
}

const DEJAVU_CANDIDATES = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  "/usr/share/fonts/dejavu/DejaVuSans.ttf",
  "/usr/share/fonts/TTF/DejaVuSans.ttf",
];
const DEJAVU_BOLD_CANDIDATES = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
];

function firstExisting(paths: string[]): string | null {
  return paths.find((p) => existsSync(p)) ?? null;
}

export function resolvePdfFonts(fontsDir: string): PdfFontPaths {
  const regular = firstExisting([
    path.join(fontsDir, "BeVietnamPro-Regular.ttf"),
    ...DEJAVU_CANDIDATES,
  ]);
  const bold = firstExisting([
    path.join(fontsDir, "BeVietnamPro-Bold.ttf"),
    ...DEJAVU_BOLD_CANDIDATES,
  ]);
  const label = regular?.includes("BeVietnamPro") ? "Be Vietnam Pro" : regular ? "DejaVu Sans" : "Helvetica";
  return { regular, bold, label };
}
