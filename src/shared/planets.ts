import type { PlanetId } from "./types";

export interface PlanetMeta {
  id: PlanetId;
  letter: string;
  stepName: string;
  stepVi: string;
  world: string;
  worldTag: string;
  color: string;
  glow: string;
  layerKey: "atmosphere" | "rotation" | "surface" | "signal" | "satellites";
  layerLabel: string;
  durationLabel: string;
  mapHint: string;
}

export const PLANET_META: Record<PlanetId, PlanetMeta> = {
  S: {
    id: "S",
    letter: "S",
    stepName: "Scan Brand",
    stepVi: "Kiểm toán thương hiệu",
    world: "Tinh cầu Sương Mù",
    worldTag: "Nhìn lại trước khi tin vào giả định",
    color: "#7fb2c9",
    glow: "#bfe3f2",
    layerKey: "atmosphere",
    layerLabel: "Khí quyển",
    durationLabel: "Khoảng 90 giây",
    mapHint: "Quét sương, tìm tín hiệu đang bị che",
  },
  A: {
    id: "A",
    letter: "A",
    stepName: "Align Strategy",
    stepVi: "Chiến lược thương hiệu",
    world: "Đài Thiên Văn",
    worldTag: "Chọn hướng đi, chấp nhận từ chối",
    color: "#8b7cf6",
    glow: "#c9c0ff",
    layerKey: "rotation",
    layerLabel: "Trục quay",
    durationLabel: "Khoảng 100 giây",
    mapHint: "Nối chòm sao, đặt logo lên bản đồ định vị",
  },
  O: {
    id: "O",
    letter: "O",
    stepName: "Optimize Identity",
    stepVi: "Thiết kế thương hiệu",
    world: "Xưởng Chế Tác",
    worldTag: "Khoác áo hệ thống, không chỉ là logo",
    color: "#f59e6b",
    glow: "#ffd0b0",
    layerKey: "surface",
    layerLabel: "Bề mặt",
    durationLabel: "Khoảng 110 giây",
    mapHint: "Soi 6 bề mặt, tìm chỗ nhận diện bị lệch",
  },
  K: {
    id: "K",
    letter: "K",
    stepName: "Kickoff Communication",
    stepVi: "Ra mắt & truyền thông",
    world: "Bệ Phóng",
    worldTag: "Cất tiếng và đối mặt khủng hoảng",
    color: "#ef4123",
    glow: "#ff9a72",
    layerKey: "signal",
    layerLabel: "Tín hiệu",
    durationLabel: "Khoảng 120 giây",
    mapHint: "Sắp kế hoạch, phóng tàu, xử lý khủng hoảng",
  },
  IM: {
    id: "IM",
    letter: "IM",
    stepName: "Implement Consistency",
    stepVi: "Vận hành & phát triển",
    world: "Trạm Vận Hành",
    worldTag: "Giữ lửa qua thời gian, con người, quy mô",
    color: "#4fd1c5",
    glow: "#a9fff2",
    layerKey: "satellites",
    layerLabel: "Vệ tinh",
    durationLabel: "Khoảng 100 giây",
    mapHint: "Tua 12 tháng, xử lý sự kiện giữ nhất quán",
  },
};

export const PLANET_ORDER: PlanetId[] = ["S", "A", "O", "K", "IM"];

export function nextPlanet(id: PlanetId): PlanetId | null {
  const i = PLANET_ORDER.indexOf(id);
  return i >= 0 && i < PLANET_ORDER.length - 1 ? PLANET_ORDER[i + 1]! : null;
}

export function planetIndex(id: PlanetId): number {
  return PLANET_ORDER.indexOf(id);
}

export const PLANET_SLUGS: Record<PlanetId, string> = {
  S: "suong-mu",
  A: "dai-thien-van",
  O: "xuong-che-tac",
  K: "be-phong",
  IM: "tram-van-hanh",
};
