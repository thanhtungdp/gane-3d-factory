/** Lưu asset PNG (logo đã chuẩn hoá) — URL same-origin /api/assets/<id>. */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface StoredAsset {
  id: string;
  url: string;
  bytes: number;
}

export interface AssetStore {
  readonly dir: string;
  savePng(buffer: Buffer): Promise<StoredAsset>;
  read(id: string): Promise<Buffer | null>;
  pathFor(id: string): string;
}

const ASSET_ID_RE = /^[a-f0-9]{64}$/;

export function isValidAssetId(id: string): boolean {
  return ASSET_ID_RE.test(id);
}

export function createAssetStore(dir: string): AssetStore {
  const pathFor = (id: string) => path.join(dir, `${id}.png`);
  return {
    dir,
    pathFor,
    async savePng(buffer: Buffer): Promise<StoredAsset> {
      const id = createHash("sha256").update(buffer).digest("hex");
      await mkdir(dir, { recursive: true });
      const file = pathFor(id);
      try {
        await readFile(file);
      } catch {
        await writeFile(file, buffer);
      }
      return { id, url: `/api/assets/${id}`, bytes: buffer.byteLength };
    },
    async read(id: string): Promise<Buffer | null> {
      if (!isValidAssetId(id)) return null;
      try {
        return await readFile(pathFor(id));
      } catch {
        return null;
      }
    },
  };
}
