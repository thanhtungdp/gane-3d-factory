import type {
  BrandProfile,
  DecisionRecord,
  PlanetId,
  PlanetResult,
  PreScan,
  ProfileAnswers,
} from "./types";

export interface PlanetGameComplete {
  meter?: number;
  timeBonus?: number;
  crisisFast?: boolean;
  skipped?: boolean;
}

export interface PlanetGameProps {
  planet: PlanetId;
  brand: BrandProfile;
  preScan: PreScan;
  answers: ProfileAnswers;
  /** Gọi mỗi khi người chơi chốt một lựa chọn. */
  onDecision: (record: DecisionRecord) => void;
  /** Gọi khi mini-game kết thúc; host sẽ tính điểm bằng shared scoring. */
  onComplete: (payload: PlanetGameComplete) => void;
  /** KIM nói một câu ngắn (host hiển thị trong khung hướng dẫn). */
  onGuide?: (text: string) => void;
}

export interface PlanetGameHandle {
  planet: PlanetId;
}

export type PlanetResultMap = Partial<Record<PlanetId, PlanetResult>>;
