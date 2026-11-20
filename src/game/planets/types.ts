import type { BrandProfile, PlanetContent, PreScan } from "@/shared/types";
import type { PlanetSession } from "../engine/session";

export interface MiniGameProps {
  content: PlanetContent;
  brand: BrandProfile;
  preScan: PreScan;
  session: PlanetSession;
  reducedMotion: boolean;
}
