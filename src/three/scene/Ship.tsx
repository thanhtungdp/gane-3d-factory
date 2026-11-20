/* eslint-disable react-hooks/immutability -- Cập nhật uniforms/Object3D theo frame là pattern chuẩn của R3F. */
/** Tàu low-poly: decal logo (CanvasTexture), thruster theo palette, vệt đuôi additive. */
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  SRGBColorSpace,
  Vector3,
  type BufferAttribute,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type Points,
  type ShaderMaterial,
  type Sprite,
  type SpriteMaterial,
} from "three";
import { useScene } from "@/state/scene";
import { SHIP_MODES, damp, damp3, hexToRgb, mixHex } from "./tokens";
import { flightPoseAt, flightProgress, isVenusFlight } from "./flight";
import { TRAIL_FRAG, TRAIL_VERT } from "./shaders";

const TRAIL_LENGTH = 20;
const DECAL_SIZE = 512;

/** damp góc có wrap [-π, π] để yaw không quay vòng dài. */
function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  const delta = ((target - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return current + delta * (1 - Math.exp(-lambda * dt));
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function paintBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
  ctx.beginPath();
  for (let k = 0; k < 4; k += 1) {
    const angle = (k * Math.PI) / 2 - Math.PI / 2;
    const next = angle + Math.PI / 2;
    const tipX = cx + Math.cos(angle) * radius;
    const tipY = cy + Math.sin(angle) * radius;
    const nextX = cx + Math.cos(next) * radius;
    const nextY = cy + Math.sin(next) * radius;
    const c1x = cx + Math.cos(angle + Math.PI / 4) * radius * 0.14;
    const c1y = cy + Math.sin(angle + Math.PI / 4) * radius * 0.14;
    const c2x = cx + Math.cos(next - Math.PI / 4) * radius * 0.14;
    const c2y = cy + Math.sin(next - Math.PI / 4) * radius * 0.14;
    if (k === 0) ctx.moveTo(tipX, tipY);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, nextX, nextY);
  }
  ctx.closePath();
  ctx.fill();
}

function createGlowTexture(): CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.72)");
  gradient.addColorStop(0.65, "rgba(255, 255, 255, 0.14)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

interface ShipProps {
  reduced: boolean;
}

export function Ship({ reduced }: ShipProps) {
  const mode = useScene((s) => s.mode);
  const logoUrl = useScene((s) => s.logoUrl);
  const brandName = useScene((s) => s.brandName);
  const palette = useScene((s) => s.palette);
  const flight = useScene((s) => s.flight);
  const { width } = useThree((s) => s.size);
  const mobile = width < 900;
  const introStartedAt = useRef<number | null>(null);

  useEffect(() => {
    introStartedAt.current = mode === "intro" ? performance.now() : null;
  }, [mode]);


  const groupRef = useRef<Group>(null);
  const flameRef = useRef<Mesh>(null);
  const flameMatRef = useRef<MeshBasicMaterial>(null);
  const glowRef = useRef<Sprite>(null);
  const glowMatRef = useRef<SpriteMaterial>(null);
  const trailRef = useRef<Points>(null);
  const trailMatRef = useRef<ShaderMaterial>(null);
  const initialized = useRef(false);
  const thrust = useRef(0.6);

  const accent = palette[1] ?? "#faa634";
  const accentRgb = useMemo(() => hexToRgb(accent), [accent]);
  const hull = useMemo(() => mixHex(palette[0] ?? "#21409a", "#eef2fb", 0.78), [palette]);
  const glowColor = useMemo(() => mixHex(accent, "#ffffff", 0.35), [accent]);
  const dpr = useThree((s) => s.viewport.dpr);

  const [decal, setDecal] = useState<CanvasTexture | null>(null);
  const glowTexture = useMemo(() => createGlowTexture(), []);

  const trail = useMemo(() => {
    const positions = new Float32Array(TRAIL_LENGTH * 3);
    const alphas = new Float32Array(TRAIL_LENGTH);
    for (let i = 0; i < TRAIL_LENGTH; i += 1) alphas[i] = Math.max(0, 1 - i / TRAIL_LENGTH);
    return { positions, alphas };
  }, []);

  const trailUniforms = useMemo(
    () => ({
      uColor: { value: accentRgb },
      uPixel: { value: dpr },
      uStrength: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Thân tàu dùng thứ tự YXZ để yaw → pitch → bank ổn định trong chuyến bay.
  useEffect(() => {
    if (groupRef.current) groupRef.current.rotation.order = "YXZ";
  }, []);

  /* Decal logo: badge tròn tối + logo khách (same-origin) hoặc monogram/star fallback. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    let alive = true;
    const canvas = document.createElement("canvas");
    canvas.width = DECAL_SIZE;
    canvas.height = DECAL_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paintBase = () => {
      ctx.clearRect(0, 0, DECAL_SIZE, DECAL_SIZE);
      roundedRect(ctx, 46, 46, DECAL_SIZE - 92, DECAL_SIZE - 92, 116);
      ctx.fillStyle = "rgba(5, 10, 36, 0.78)";
      ctx.fill();
      roundedRect(ctx, 46, 46, DECAL_SIZE - 92, DECAL_SIZE - 92, 116);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 8;
      ctx.stroke();
    };

    const commit = () => {
      if (!alive) return;
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
      setDecal(texture);
    };

    const paintFallback = () => {
      paintBase();
      ctx.fillStyle = "#faa634";
      paintBadge(ctx, DECAL_SIZE / 2, 196, 108);
      const words = (brandName || "Sao Kim").trim().split(/\s+/).slice(0, 2);
      const initials = words.map((w) => w.charAt(0).toUpperCase()).join("") || "SK";
      ctx.fillStyle = "#f4f6fb";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "600 116px 'Be Vietnam Pro', system-ui, sans-serif";
      ctx.fillText(initials, DECAL_SIZE / 2, 372);
      commit();
    };

    if (logoUrl) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        if (!alive) return;
        paintBase();
        const box = 288;
        const scale = Math.min(box / Math.max(1, image.width), box / Math.max(1, image.height));
        const width = image.width * scale;
        const height = image.height * scale;
        ctx.drawImage(image, DECAL_SIZE / 2 - width / 2, DECAL_SIZE / 2 - height / 2, width, height);
        commit();
      };
      image.onerror = () => {
        if (alive) paintFallback();
      };
      image.src = logoUrl;
      return () => {
        alive = false;
      };
    }

    paintFallback();
    return () => {
      alive = false;
    };
  }, [logoUrl, brandName]);

  useEffect(
    () => () => {
      decal?.dispose();
    },
    [decal],
  );

  useEffect(
    () => () => {
      glowTexture?.dispose();
    },
    [glowTexture],
  );

  useEffect(() => {
    trailUniforms.uColor.value = accentRgb;
  }, [trailUniforms, accentRgb]);

  useEffect(() => {
    trailUniforms.uPixel.value = dpr;
  }, [trailUniforms, dpr]);

  const initial = SHIP_MODES[mode];
  const engineLocal = useMemo(() => new Vector3(), []);
  const engineWorld = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const target = SHIP_MODES[mode];
    const group = groupRef.current;
    const flightMode = mode === "flight";
    const flightPose = flightMode
      ? flightPoseAt(flightProgress(flight), { venus: isVenusFlight(flight?.to), reduced })
      : null;

    const targetThrust = flightPose
      ? flightPose.thrust
      : mode === "intro"
        ? 0.3
        : mode === "launch"
          ? 1.5
          : mode === "finale"
            ? 0.95
            : mode === "planet"
              ? 0.32
              : 0.6;
    thrust.current = reduced && mode === "intro"
      ? targetThrust
      : damp(thrust.current, targetThrust, flightMode ? 5 : 2.5, dt);

    if (group) {
      if (mode === "intro" && mobile) {
        // Mobile/fold: tàu bay vòng quanh hành tinh thay vì đứng mép khung.
        if (reduced) {
          group.position.set(0.55, 0.15, 2.55);
          group.scale.setScalar(0.52);
          group.rotation.set(0.1, -0.55, -0.15);
        } else {
          const started = introStartedAt.current ?? performance.now();
          const angle = ((performance.now() - started) / 1000) * 0.62;
          const x = 0.38 + Math.cos(angle) * 1.12;
          const z = 2.55 + Math.sin(angle * 1.5) * 0.12;
          group.position.set(x, 0.45 + Math.sin(angle) * 0.48, z);
          group.scale.setScalar(0.52);
          group.rotation.x = 0.08;
          group.rotation.y = -0.55 + Math.sin(angle) * 0.45;
          group.rotation.z = Math.cos(angle) * 0.28;
        }
      } else if (flightPose) {
        // Theo Bezier + hướng tiếp tuyến; damp nhanh để vào/ra chuyến bay mượt.
        const [x, y, z] = damp3(
          [group.position.x, group.position.y, group.position.z],
          flightPose.position,
          9,
          dt,
        );
        group.position.set(x, y, z);
        const scale = damp(group.scale.x, flightPose.scale, 7, dt);
        group.scale.setScalar(Math.max(0.001, scale));
        group.rotation.x = damp(group.rotation.x, flightPose.pitch, 8, dt);
        group.rotation.y = dampAngle(group.rotation.y, flightPose.yaw, 8, dt);
        group.rotation.z = damp(group.rotation.z, flightPose.bank, 8, dt);
      } else {
        const bob = reduced ? 0 : Math.sin(t * 1.25) * 0.035;
        const [x, y, z] = damp3(
          [group.position.x, group.position.y, group.position.z],
          [target.pos[0], target.pos[1] + bob, target.pos[2]],
          2.3,
          dt,
        );
        group.position.set(x, y, z);
        const scale = damp(group.scale.x, target.scale, 2.3, dt);
        group.scale.setScalar(Math.max(0.001, scale));
        group.rotation.x = damp(group.rotation.x, target.rot[0], 2.1, dt);
        group.rotation.y = damp(group.rotation.y, target.rot[1], 2.1, dt);
        const roll = target.rot[2] + (reduced ? 0 : Math.sin(t * 0.85) * 0.06);
        group.rotation.z = damp(group.rotation.z, roll, 2.1, dt);
      }
    }

    const flame = flameRef.current;
    if (flame) {
      const flicker = reduced ? 1 : 1 + Math.sin(t * 17) * 0.16 + Math.sin(t * 6.3) * 0.09;
      flame.scale.set(1, Math.max(0.2, thrust.current * flicker), 1);
      if (flameMatRef.current) flameMatRef.current.opacity = Math.min(0.92, 0.4 + thrust.current * 0.3);
    }
    const glow = glowRef.current;
    if (glow && glowMatRef.current) {
      const shimmer = reduced ? 1 : 1 + Math.sin(t * 11) * 0.1;
      const size = (0.7 + thrust.current * 0.55) * shimmer;
      glow.scale.set(size, size, 1);
      glowMatRef.current.opacity = Math.min(0.95, 0.4 + thrust.current * 0.4);
    }

    // vệt đuôi: kéo vị trí cũ lùi dần, điểm mới lấy từ động cơ trong world space
    const trailPoints = trailRef.current;
    if (trailPoints && group) {
      const geometry = trailPoints.geometry;
      const attribute = geometry.getAttribute("position") as BufferAttribute | undefined;
      const array = attribute?.array as Float32Array | undefined;
      if (attribute && array) {
        group.updateMatrixWorld();
        engineLocal.set(0, 0, 0.95);
        engineWorld.copy(engineLocal).applyMatrix4(group.matrixWorld);
        if (!initialized.current) {
          for (let i = 0; i < TRAIL_LENGTH; i += 1) {
            array[i * 3] = engineWorld.x;
            array[i * 3 + 1] = engineWorld.y;
            array[i * 3 + 2] = engineWorld.z;
          }
          initialized.current = true;
        } else {
          for (let i = TRAIL_LENGTH - 1; i > 0; i -= 1) {
            array[i * 3] = array[(i - 1) * 3] ?? 0;
            array[i * 3 + 1] = array[(i - 1) * 3 + 1] ?? 0;
            array[i * 3 + 2] = array[(i - 1) * 3 + 2] ?? 0;
          }
          array[0] = engineWorld.x;
          array[1] = engineWorld.y;
          array[2] = engineWorld.z;
        }
        attribute.needsUpdate = true;
      }
      trailPoints.visible =
        flightMode || (mode !== "landing" && thrust.current > 0.45);
      if (trailMatRef.current) {
        trailMatRef.current.uniforms.uColor.value = accentRgb;
        trailMatRef.current.uniforms.uStrength.value = flightMode ? (flightPose?.trail ?? 1) : 1;
      }
    }
  });

  return (
    <>
      <group ref={groupRef} position={initial.pos} rotation={initial.rot} scale={initial.scale}>
        {/* thân chính + mũi + đuôi */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.2, 0.95, 8]} />
          <meshBasicMaterial color={hull} />
        </mesh>
        <mesh position={[0, 0, -0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.2, 0.5, 8]} />
          <meshBasicMaterial color={hull} />
        </mesh>
        <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.2, 0.3, 8]} />
          <meshBasicMaterial color={hull} />
        </mesh>

        {/* khoang lái */}
        <mesh position={[0, 0.13, -0.22]} scale={[0.85, 0.62, 1.5]}>
          <sphereGeometry args={[0.16, 14, 10]} />
          <meshBasicMaterial color="#9fdcff" />
        </mesh>

        {/* vòng accent + động cơ */}
        <mesh position={[0, 0, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.215, 0.215, 0.07, 8]} />
          <meshBasicMaterial color={accent} />
        </mesh>
        <mesh position={[0, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.17, 0.2, 8]} />
          <meshBasicMaterial color="#0b1630" />
        </mesh>
        <mesh position={[0, 0, 0.9]}>
          <sphereGeometry args={[0.11, 10, 8]} />
          <meshBasicMaterial color={glowColor} />
        </mesh>

        {/* cánh xuôi */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.5, -0.02, 0.34]} rotation={[0, side * 0.44, side * 0.12]}>
            <mesh>
              <boxGeometry args={[0.72, 0.045, 0.32]} />
              <meshBasicMaterial color={accent} />
            </mesh>
            <mesh position={[side * 0.37, 0, 0]}>
              <sphereGeometry args={[0.032, 8, 6]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>
          </group>
        ))}

        {/* đuôi đứng */}
        <mesh position={[0, 0.19, 0.58]} rotation={[0.16, 0, 0]}>
          <boxGeometry args={[0.045, 0.3, 0.2]} />
          <meshBasicMaterial color={accent} />
        </mesh>

        {/* decal logo trên/dưới thân — đủ nhỏ để không phá silhouette */}
        <mesh position={[0, 0.165, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial map={decal ?? undefined} transparent opacity={decal ? 1 : 0} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.17, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial map={decal ?? undefined} transparent opacity={decal ? 1 : 0} depthWrite={false} />
        </mesh>

        {/* lửa + quầng sáng động cơ */}
        <mesh ref={flameRef} position={[0, 0, 1.06]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.16, 1.2, 8]} />
          <meshBasicMaterial
            ref={flameMatRef}
            color={accent}
            transparent
            opacity={0.75}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <sprite ref={glowRef} position={[0, 0, 1.1]} scale={[0.8, 0.8, 1]}>
          <spriteMaterial
            ref={glowMatRef}
            map={glowTexture ?? undefined}
            color={accent}
            transparent
            opacity={0.85}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      </group>

      <points ref={trailRef} frustumCulled={false} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trail.positions, 3]} />
          <bufferAttribute attach="attributes-aAlpha" args={[trail.alphas, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={trailMatRef}
          uniforms={trailUniforms}
          vertexShader={TRAIL_VERT}
          fragmentShader={TRAIL_FRAG}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </>
  );
}
