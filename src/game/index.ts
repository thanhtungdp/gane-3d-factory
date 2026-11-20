/** Điểm vào gameplay: nội dung, host và type hợp đồng với screens/report. */
export {
  PLANET_CONTENT,
  ALL_DECISIONS,
  decisionsFor,
  decisionsOfKind,
  decisionById,
} from "./content";
export { PlanetGame } from "./PlanetGame";
export { QuestionAnchor, QuestionFlowProvider, useQuestionFlow } from "./components/QuestionFlow";
export type { QuestionAnchorProps, QuestionFlowApi } from "./components/QuestionFlow";
export { usePlanetSession } from "./engine/session";
export type { PlanetSession } from "./engine/session";
export type { MiniGameProps } from "./planets/types";
export type { PlanetGameComplete, PlanetGameProps, PlanetGameHandle, PlanetResultMap } from "@/shared/game";
