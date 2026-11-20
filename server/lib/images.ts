/** Chuẩn hoá ảnh logo: decode/rasterize (kể cả SVG) rồi xuất PNG duy nhất. */
import sharp, { type Metadata } from "sharp";

export interface ProcessedImage {
  png: Buffer;
  width: number;
  height: number;
  format: string;
}

export interface ProcessImageOptions {
  /** Cạnh lớn nhất của PNG đầu ra. */
  targetSize?: number;
  /** Cho phép upscale khi ảnh gốc ≥128px (favicon nhỏ giữ nguyên để không bị vỡ). */
  allowUpscale?: boolean;
  /** Mật độ rasterize cho SVG. */
  svgDensity?: number;
}

export class ImageProcessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageProcessError";
  }
}

const MIN_UPSCALE_SOURCE = 128;

export async function processToPng(buffer: Buffer, options: ProcessImageOptions = {}): Promise<ProcessedImage> {
  const targetSize = options.targetSize ?? 512;
  const allowUpscale = options.allowUpscale ?? true;
  const svgDensity = options.svgDensity ?? 300;

  let meta: Metadata;
  try {
    meta = await sharp(buffer, { density: svgDensity, limitInputPixels: 80_000_000 }).metadata();
  } catch {
    throw new ImageProcessError("Không đọc được ảnh.");
  }
  const format = meta.format ?? "unknown";
  const metaWidth = meta.width ?? 0;
  const metaHeight = meta.height ?? 0;
  const isSvg = format === "svg";
  const sourceMin = Math.min(metaWidth, metaHeight);

  const pipeline = sharp(buffer, { density: isSvg ? svgDensity : 72, limitInputPixels: 80_000_000 });
  const upscale = allowUpscale && (isSvg || sourceMin >= MIN_UPSCALE_SOURCE);
  try {
    const out = await pipeline
      .rotate()
      .resize({
        width: targetSize,
        height: targetSize,
        fit: "inside",
        withoutEnlargement: !upscale,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer({ resolveWithObject: true });
    return {
      png: out.data,
      width: out.info.width,
      height: out.info.height,
      format: isSvg ? "svg" : format,
    };
  } catch {
    throw new ImageProcessError("Không chuyển được ảnh sang PNG.");
  }
}

/** Đọc kích thước gốc (dùng để chấm điểm ứng viên trước khi tải full). */
export async function readImageMeta(buffer: Buffer): Promise<{ format: string; width: number; height: number }> {
  try {
    const meta = await sharp(buffer).metadata();
    return { format: meta.format ?? "unknown", width: meta.width ?? 0, height: meta.height ?? 0 };
  } catch {
    return { format: "unknown", width: 0, height: 0 };
  }
}
