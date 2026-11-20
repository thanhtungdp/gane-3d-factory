/* eslint-disable react-hooks/immutability -- Cập nhật uniforms/Object3D theo frame là pattern chuẩn của R3F. */
/** Hành tinh thủ tục: icosahedron dời đỉnh bằng noise + khí quyển fresnel + vệ tinh. */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BackSide, type Group, type Mesh, type MeshBasicMaterial, type ShaderMaterial } from "three";
import { useScene } from "@/state/scene";
import type { QualityTier } from "@/shared/types";
import {
  PLANET_MODES,
  TIER_3D,
  damp,
  damp3,
  grayPlanetVisual,
  hexToRgb,
  planetVisual,
} from "./tokens";
import { ATMOSPHERE_FRAG, ATMOSPHERE_VERT, PLANET_FRAG, PLANET_VERT } from "./shaders";
import { flightPlanetAt, flightProgress, isVenusFlight } from "./flight";

interface PlanetBodyProps {
  tier: QualityTier;
  reduced: boolean;
}

const SATELLITE_META = [
  { radius: 1.62, speed: 0.34, phase: 0.4, tilt: 0.4, size: 0.055 },
  { radius: 1.9, speed: -0.26, phase: 2.1, tilt: -0.7, size: 0.042 },
  { radius: 2.15, speed: 0.19, phase: 4.2, tilt: 1.1, size: 0.034 },
];

export function PlanetBody({ tier, reduced }: PlanetBodyProps) {
  const mode = useScene((s) => s.mode);
  const planet = useScene((s) => s.planet);
  const brandPalette = useScene((s) => s.palette);
  const lit = useScene((s) => s.lit);
  const flight = useScene((s) => s.flight);

  const groupRef = useRef<Group>(null);
  const coreRef = useRef<ShaderMaterial>(null);
  const atmoRef = useRef<ShaderMaterial>(null);
  const ringRef = useRef<Mesh>(null);
  const ringMatRef = useRef<MeshBasicMaterial>(null);
  const satellitesRef = useRef<Group>(null);
  const satelliteRefs = useRef<(Mesh | null)[]>([]);
  const smooth = useRef({ surface: 0.3, signal: 0.15, atmo: 0.3, fog: 0, finale: 0 });

  const activePlanet = planet ?? "S";
  const detail = TIER_3D[tier].planetDetail;
  const maxSatellites = TIER_3D[tier].satellites;

  const visual = useMemo(
    () => (mode === "launch" ? grayPlanetVisual() : planetVisual(activePlanet, brandPalette)),
    [mode, activePlanet, brandPalette],
  );
  const colors = useMemo(
    () => ({
      a: hexToRgb(visual.palette[0]),
      b: hexToRgb(visual.palette[1]),
      c: hexToRgb(visual.palette[2]),
      glow: hexToRgb(visual.glow),
    }),
    [visual],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSeed: { value: visual.seed },
      uSurface: { value: 0.3 },
      uSignal: { value: 0.15 },
      uAtmo: { value: 0.3 },
      uFog: { value: 0 },
      uReduced: { value: reduced ? 1 : 0 },
      uDetail: { value: tier === "high" ? 1 : 0.55 },
      uFinale: { value: 0 },
      uColorA: { value: colors.a },
      uColorB: { value: colors.b },
      uColorC: { value: colors.c },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const atmoUniforms = useMemo(
    () => ({
      uColor: { value: colors.glow },
      uStrength: { value: 0.4 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // palette / seed đổi khi brand kit hoặc trạm đổi → cập nhật uniform, không tạo material mới
  useEffect(() => {
    const mat = coreRef.current;
    if (mat) {
      mat.uniforms.uSeed.value = visual.seed;
      mat.uniforms.uColorA.value = colors.a;
      mat.uniforms.uColorB.value = colors.b;
      mat.uniforms.uColorC.value = colors.c;
    }
    const atmo = atmoRef.current;
    if (atmo) atmo.uniforms.uColor.value = colors.glow;
    if (ringMatRef.current) ringMatRef.current.color.set(visual.glow);
  }, [visual, colors]);

  useEffect(() => {
    uniforms.uReduced.value = reduced ? 1 : 0;
    uniforms.uDetail.value = tier === "high" ? 1 : 0.55;
  }, [uniforms, reduced, tier]);

  const initial = PLANET_MODES[mode];

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const target = PLANET_MODES[mode];
    const group = groupRef.current;
    const flightMode = mode === "flight";
    const venusFlight = flightMode && isVenusFlight(flight?.to);
    const flightPlanet = flightMode ? flightPlanetAt(flightProgress(flight), venusFlight) : null;

    if (group) {
      const targetPos = flightPlanet ? flightPlanet.pos : target.pos;
      const targetScale = flightPlanet ? flightPlanet.scale : target.scale;
      const lambda = flightMode ? 4.2 : 2.6;
      const [x, y, z] = damp3([group.position.x, group.position.y, group.position.z], targetPos, lambda, dt);
      group.position.set(x, y, z);
      const scale = damp(group.scale.x, targetScale, lambda, dt);
      group.scale.setScalar(Math.max(0.001, scale));
      group.rotation.x = damp(group.rotation.x, target.rot[0], 2, dt);
      group.rotation.z = damp(group.rotation.z, target.rot[2], 2, dt);
      const spin = (mode === "finale" ? 0.06 : 0.035) + lit.rotation * 0.16;
      // intro + reduced-motion: đứng yên hoàn toàn (khung intro tĩnh theo yêu cầu)
      const spinScale = reduced && mode === "intro" ? 0 : reduced ? 0.25 : 1;
      group.rotation.y += dt * spin * spinScale;
    }

    // độ sáng các lớp — launch/landing/flight là hành tinh chưa thắp sáng
    const asleep = mode === "launch" || mode === "landing" || flightMode;
    const targetSurface = asleep ? 0.66 : Math.min(1, 0.38 + lit.surface * 0.7);
    const targetSignal = asleep ? 0 : lit.signal;
    const targetAtmo = asleep ? 0.48 : Math.min(1, 0.3 + lit.atmosphere * 0.95);
    const targetFog = activePlanet === "S" && !asleep ? 0.22 + lit.atmosphere * 0.3 : 0;
    const targetFinale = mode === "finale" ? 1 : 0;

    const s = smooth.current;
    // intro + reduced-motion: khung phải tĩnh → snap lớp sáng thay vì ramp
    const snapLit = reduced && mode === "intro";
    s.surface = snapLit ? targetSurface : damp(s.surface, targetSurface, 2.4, dt);
    s.signal = snapLit ? targetSignal : damp(s.signal, targetSignal, 2.4, dt);
    s.atmo = snapLit ? targetAtmo : damp(s.atmo, targetAtmo, 2.4, dt);
    s.fog = snapLit ? targetFog : damp(s.fog, targetFog, 2.4, dt);
    s.finale = snapLit ? targetFinale : damp(s.finale, targetFinale, 2.4, dt);

    const mat = coreRef.current;
    if (mat) {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uSurface.value = s.surface;
      mat.uniforms.uSignal.value = s.signal;
      mat.uniforms.uAtmo.value = s.atmo;
      mat.uniforms.uFog.value = s.fog;
      mat.uniforms.uFinale.value = s.finale;
    }
    const atmo = atmoRef.current;
    if (atmo) atmo.uniforms.uStrength.value = 0.26 + s.atmo * 1.7 + (reduced ? 0 : Math.sin(t * 0.7) * 0.04);

    // ring: hiện theo lớp rotation, đậm hơn khi finale
    const ringOpacity = Math.min(0.55, 0.05 + lit.rotation * 0.4 + s.finale * 0.1) * (asleep ? 0.15 : 1);
    if (ringMatRef.current) ringMatRef.current.opacity = ringOpacity;
    if (ringRef.current) ringRef.current.rotation.z = 0.16 + (reduced ? 0 : Math.sin(t * 0.12) * 0.03);

    // vệ tinh: số lượng + độ sáng theo lớp satellites
    const countBase = mode === "finale" ? maxSatellites : Math.max(1, Math.round(maxSatellites * Math.min(1, lit.satellites * 3)));
    satelliteRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const meta = SATELLITE_META[index];
      if (!meta) return;
      const visible = !asleep && index < countBase;
      const currentScale = mesh.scale.x;
      mesh.scale.setScalar(damp(currentScale, visible ? 1 : 0.001, 3, dt));
      mesh.visible = currentScale > 0.01;
      const orbitScale = reduced && mode === "intro" ? 0 : reduced ? 0.3 : 1;
      const angle = t * meta.speed * orbitScale + meta.phase;
      mesh.position.set(
        Math.cos(angle) * meta.radius,
        Math.sin(angle) * meta.radius * Math.sin(meta.tilt),
        Math.sin(angle) * meta.radius * Math.cos(meta.tilt),
      );
      const material = mesh.material as MeshBasicMaterial;
      material.opacity = Math.min(1, 0.25 + lit.satellites * 1.1 + s.finale * 0.2);
    });
    if (satellitesRef.current) satellitesRef.current.visible = !asleep;
  });

  return (
    <group ref={groupRef} position={initial.pos} rotation={initial.rot} scale={initial.scale}>
      <mesh>
        <icosahedronGeometry args={[1, detail]} />
        <shaderMaterial ref={coreRef} uniforms={uniforms} vertexShader={PLANET_VERT} fragmentShader={PLANET_FRAG} />
      </mesh>

      <mesh scale={1.085}>
        <sphereGeometry args={[1, tier === "high" ? 48 : 32, tier === "high" ? 48 : 32]} />
        <shaderMaterial
          ref={atmoRef}
          uniforms={atmoUniforms}
          vertexShader={ATMOSPHERE_VERT}
          fragmentShader={ATMOSPHERE_FRAG}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          side={BackSide}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2 + 0.32, 0, 0.16]}>
        <torusGeometry args={[1.58, 0.008, 6, 96]} />
        <meshBasicMaterial
          ref={ringMatRef}
          color={visual.glow}
          transparent
          opacity={0.2}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <group ref={satellitesRef} visible={false}>
        {SATELLITE_META.map((meta, index) => (
          <mesh
            key={index}
            ref={(mesh) => {
              satelliteRefs.current[index] = mesh;
            }}
            scale={0.001}
            visible={false}
          >
            <sphereGeometry args={[meta.size, 10, 8]} />
            <meshBasicMaterial color={visual.glow} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
