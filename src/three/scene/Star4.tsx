/* eslint-disable react-hooks/immutability -- Cập nhật uniforms/Object3D theo frame là pattern chuẩn của R3F. */
/** Sao 4 cánh cam–đỏ — SDF astroid + halo additive, bùng sáng ở finale. */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Group, type ShaderMaterial } from "three";
import { useScene } from "@/state/scene";
import { STAR_MODES, damp, damp3 } from "./tokens";
import { flightProgress, flightStarAt, isVenusFlight } from "./flight";
import { STAR_FRAG, STAR_VERT } from "./shaders";

export function Star4({ reduced }: { reduced: boolean }) {
  const mode = useScene((s) => s.mode);
  const flight = useScene((s) => s.flight);
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const smooth = useRef({ intensity: STAR_MODES.landing.intensity, scale: STAR_MODES.landing.scale });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSeed: { value: 3.7 },
      uIntensity: { value: STAR_MODES.landing.intensity },
      uReduced: { value: reduced ? 1 : 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uReduced.value = reduced ? 1 : 0;
  }, [uniforms, reduced]);

  const initial = STAR_MODES[mode];

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const flightMode = mode === "flight";
    const venusFlight = flightMode && isVenusFlight(flight?.to);
    const flightStar = flightMode ? flightStarAt(flightProgress(flight), venusFlight) : null;
    const target = STAR_MODES[mode];
    const targetPos = flightStar ? flightStar.pos : target.pos;
    const targetScale = flightStar ? flightStar.scale : target.scale;
    const targetIntensity = flightStar ? flightStar.intensity : target.intensity;
    const group = groupRef.current;

    const pulsing = (mode === "finale" || venusFlight || mode === "intro") && !reduced;
    const pulse = pulsing
      ? 1 + Math.sin(t * (mode === "intro" ? 0.8 : 1.5)) * (mode === "intro" ? 0.018 : venusFlight ? 0.035 : 0.045)
      : 1;
    const s = smooth.current;
    const snapStar = reduced && mode === "intro";
    s.intensity = snapStar ? targetIntensity * pulse : damp(s.intensity, targetIntensity * pulse, flightMode ? 3.4 : 2.6, dt);
    s.scale = snapStar ? targetScale : damp(s.scale, targetScale, flightMode ? 3.4 : 2.6, dt);

    if (group) {
      const [x, y, z] = damp3([group.position.x, group.position.y, group.position.z], targetPos, flightMode ? 4 : 2.6, dt);
      group.position.set(x, y, z);
      group.scale.setScalar(Math.max(0.001, s.scale * pulse));
      const drift = reduced ? 0 : Math.sin(t * 0.24) * 0.05;
      group.rotation.z = drift;
      group.rotation.y = reduced
        ? 0
        : Math.sin(t * 0.18) * 0.1 + (mode === "finale" ? Math.sin(t * 0.42) * 0.08 : 0);
    }

    const material = materialRef.current;
    if (material) {
      material.uniforms.uTime.value = t;
      material.uniforms.uIntensity.value = s.intensity;
    }
  });

  return (
    <group ref={groupRef} position={initial.pos} scale={initial.scale}>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={STAR_VERT}
          fragmentShader={STAR_FRAG}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
