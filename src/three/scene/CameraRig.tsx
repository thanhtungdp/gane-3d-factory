/* eslint-disable react-hooks/immutability -- Camera three được cập nhật theo từng frame (R3F imperative rig), rule mới của react-hooks không áp dụng cho pattern này. */
/** Camera rig: nội suy vị trí/lookAt/fov theo mode, parallax nhẹ, không shake khi reduced. */
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type PerspectiveCamera } from "three";
import { useScene } from "@/state/scene";
import { CAMERA_MODES, INTRO_DOLLY_SECONDS, damp } from "./tokens";
import { flightCameraAt, flightProgress } from "./flight";

interface CameraRigProps {
  reduced: boolean;
}

export function CameraRig({ reduced }: CameraRigProps) {
  const mode = useScene((s) => s.mode);
  const flight = useScene((s) => s.flight);
  const camera = useThree((s) => s.camera);
  const pointer = useRef({ x: 0, y: 0 });
  const firstFrame = useRef(true);
  const introStartedAt = useRef<number | null>(null);
  const look = useMemo(() => new Vector3(), []);

  // mỗi lần vào intro, bấm lại đồng hồ dolly (kể cả replay intro→landing→intro)
  useEffect(() => {
    introStartedAt.current = mode === "intro" ? performance.now() : null;
  }, [mode]);

  useEffect(() => {
    if (reduced) return;
    const onPointerMove = (event: PointerEvent) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      pointer.current.x = (event.clientX / width) * 2 - 1;
      pointer.current.y = (event.clientY / height) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reduced]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const config = CAMERA_MODES[mode];
    const flightMode = mode === "flight";
    const flightCam = flightMode ? flightCameraAt(flightProgress(flight)) : null;
    const basePos = flightCam ? flightCam.pos : config.pos;
    const baseTarget = flightCam ? flightCam.target : config.target;

    let targetX = basePos[0];
    let targetY = basePos[1];
    let targetZ = basePos[2];
    let targetFov = flightCam ? flightCam.fov : config.fov;
    let introPush = 0;

    // intro: dolly chậm vào gần trong 10s (tắt khi reduced-motion → khung tĩnh)
    if (mode === "intro" && !reduced && introStartedAt.current !== null) {
      const seconds = (performance.now() - introStartedAt.current) / 1000;
      const raw = Math.max(0, Math.min(1, seconds / INTRO_DOLLY_SECONDS));
      introPush = raw * raw * (3 - 2 * raw);
      targetX -= 0.35 * introPush;
      targetY += 0.25 * introPush;
      targetZ -= 1.0 * introPush;
      targetFov -= 1.5 * introPush;
    }

    if (!reduced) {
      const parallax = flightMode ? 0.16 : 0.3;
      targetX += pointer.current.x * parallax;
      targetY += -pointer.current.y * (flightMode ? 0.12 : 0.22);
    }

    if (mode === "launch") {
      targetZ -= Math.min(1.2, t * 0.065);
      targetY += Math.sin(t * 0.7) * 0.05;
    } else if (mode === "finale") {
      targetZ += Math.min(1.4, t * 0.045);
    } else if (mode === "planet") {
      targetY += Math.sin(t * 0.35) * 0.03;
    }

    const lookX = baseTarget[0] + (reduced ? 0 : pointer.current.x * 0.12) - 0.35 * introPush;
    const lookY = baseTarget[1] + (reduced ? 0 : -pointer.current.y * 0.08) + 0.35 * introPush;
    const lookZ = baseTarget[2];

    if (firstFrame.current) {
      camera.position.set(targetX, targetY, targetZ);
      look.set(lookX, lookY, lookZ);
      const perspectiveCamera = camera as PerspectiveCamera;
      if (typeof perspectiveCamera.fov === "number") {
        perspectiveCamera.fov = targetFov;
        perspectiveCamera.updateProjectionMatrix();
      }
      firstFrame.current = false;
    } else {
      const k = 1 - Math.exp(-3.4 * dt);
      camera.position.x += (targetX - camera.position.x) * k;
      camera.position.y += (targetY - camera.position.y) * k;
      camera.position.z += (targetZ - camera.position.z) * k;
      look.x += (lookX - look.x) * k;
      look.y += (lookY - look.y) * k;
      look.z += (lookZ - look.z) * k;
    }

    // rung rất nhẹ khi phóng tàu, tắt hoàn toàn với reduced-motion
    if (!reduced && mode === "launch") {
      camera.position.x += Math.sin(t * 23.4) * 0.006;
      camera.position.y += Math.cos(t * 28.7) * 0.005;
    }

    camera.lookAt(look);

    const perspective = camera as PerspectiveCamera;
    if (typeof perspective.fov === "number") {
      const nextFov = damp(perspective.fov, targetFov, 3.4, dt);
      if (Math.abs(nextFov - perspective.fov) > 0.0005) {
        perspective.fov = nextFov;
        perspective.updateProjectionMatrix();
      }
    }

  });

  return null;
}
