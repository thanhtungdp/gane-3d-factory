/**
 * Điểm vào tiện dụng của lớp 3D/2.5D.
 *
 * QUAN TRỌNG (bundle): để ba không lọt vào initial bundle, app nên:
 *   - import `PlanetPoster`/`PlanetBackdrop`/`StarMark` TRỰC TIẾP từ `@/three/Poster`
 *     (file này không import three).
 *   - lazy-import `SceneCanvas` từ `@/three/SceneCanvas`.
 * Re-export dưới đây chỉ để tiện; ESM tree-shaking sẽ bỏ phần không dùng,
 * nhưng đường import trực tiếp vẫn an toàn nhất.
 */
export { default as SceneCanvas } from "./SceneCanvas";
export type { SceneCanvasProps } from "./SceneCanvas";
export { PlanetBackdrop, PlanetPoster, StarMark } from "./Poster";
export type { PlanetBackdropProps, PlanetPosterProps, PosterMode } from "./Poster";
