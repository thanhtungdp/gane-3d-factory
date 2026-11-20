/* eslint-disable react-hooks/immutability -- Cập nhật uniforms/Object3D theo frame là pattern chuẩn của R3F. */
/** Nền vũ trụ: starfield points + 2 lớp nebula (CanvasTexture thủ tục, không asset). */
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type Points,
} from "three";
import type { QualityTier } from "@/shared/types";
import { TIER_3D } from "./tokens";
import { STARFIELD_FRAG, STARFIELD_VERT } from "./shaders";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tinh vân procedural vẽ vào canvas 512² — rẻ hơn shader full-screen trên mobile. */
function createNebulaTexture(seed: number): CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rand = mulberry32(seed);
  const palette = ["33, 64, 154", "91, 75, 214", "42, 127, 158", "250, 166, 52", "122, 140, 255"];
  ctx.clearRect(0, 0, size, size);
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < 11; i += 1) {
    const x = size * (0.1 + rand() * 0.8);
    const y = size * (0.1 + rand() * 0.8);
    const radius = size * (0.1 + rand() * 0.24);
    const color = palette[i % palette.length]!;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${color}, ${0.12 + rand() * 0.2})`);
    gradient.addColorStop(0.55, `rgba(${color}, ${0.05 + rand() * 0.06})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // vài dải mây mỏng để nebula có "sợi"
  ctx.globalAlpha = 0.16;
  for (let i = 0; i < 5; i += 1) {
    ctx.strokeStyle = `rgba(${palette[i % palette.length]}, 0.5)`;
    ctx.lineWidth = size * (0.02 + rand() * 0.05);
    ctx.beginPath();
    const y = size * (0.2 + rand() * 0.6);
    ctx.moveTo(-size * 0.2, y);
    ctx.bezierCurveTo(size * 0.2, y - size * 0.18, size * 0.7, y + size * 0.2, size * 1.2, y - size * 0.06);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

interface SpaceBackdropProps {
  tier: QualityTier;
  reduced: boolean;
}

export function SpaceBackdrop({ tier, reduced }: SpaceBackdropProps) {
  const starCount = TIER_3D[tier].stars;
  const dpr = useThree((s) => s.viewport.dpr);
  const starsRef = useRef<Points>(null);
  const nebulaARef = useRef<Mesh>(null);
  const nebulaBRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  const starData = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount);
    const rand = mulberry32(20261114);
    for (let i = 0; i < starCount; i += 1) {
      const radius = 16 + rand() * 24;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius * 0.72;
      positions[i * 3 + 2] = Math.cos(phi) * radius - 8;
      sizes[i] = 0.6 + rand() * 1.9;
      phases[i] = rand();
    }
    return { positions, sizes, phases };
  }, [starCount]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixel: { value: dpr },
      uReduced: { value: reduced ? 1 : 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const textureA = useMemo(() => createNebulaTexture(7), []);
  const textureB = useMemo(() => createNebulaTexture(23), []);

  useEffect(() => {
    uniforms.uReduced.value = reduced ? 1 : 0;
    uniforms.uPixel.value = dpr;
  }, [uniforms, reduced, dpr]);

  useEffect(
    () => () => {
      textureA?.dispose();
    },
    [textureA],
  );
  useEffect(
    () => () => {
      textureB?.dispose();
    },
    [textureB],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (uniforms.uTime) uniforms.uTime.value = t;
    if (groupRef.current) {
      groupRef.current.rotation.z = reduced ? 0 : Math.sin(t * 0.04) * 0.04;
    }
    if (nebulaARef.current) {
      nebulaARef.current.rotation.z = 0.14 + (reduced ? 0 : Math.sin(t * 0.02) * 0.03);
      nebulaARef.current.position.x = reduced ? 0 : Math.sin(t * 0.035) * 1.2;
    }
    if (nebulaBRef.current) {
      nebulaBRef.current.rotation.z = -0.32 + (reduced ? 0 : Math.sin(t * 0.03) * 0.04);
      nebulaBRef.current.position.y = -4 + (reduced ? 0 : Math.cos(t * 0.028) * 1.1);
    }
    if (starsRef.current) {
      starsRef.current.rotation.y = reduced ? 0 : t * 0.004;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={nebulaARef} position={[0, 0, -26]} renderOrder={-10}>
        <planeGeometry args={[66, 42]} />
        <meshBasicMaterial
          map={textureA ?? undefined}
          transparent
          opacity={0.72}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={nebulaBRef} position={[5, -4, -33]} rotation={[0, 0, -0.32]} renderOrder={-11}>
        <planeGeometry args={[54, 36]} />
        <meshBasicMaterial
          map={textureB ?? undefined}
          transparent
          opacity={0.5}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {starCount > 0 ? (
        <points ref={starsRef} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[starData.positions, 3]} />
            <bufferAttribute attach="attributes-aSize" args={[starData.sizes, 1]} />
            <bufferAttribute attach="attributes-aPhase" args={[starData.phases, 1]} />
          </bufferGeometry>
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={STARFIELD_VERT}
            fragmentShader={STARFIELD_FRAG}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </points>
      ) : null}
    </group>
  );
}
