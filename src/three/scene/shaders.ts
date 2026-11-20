/**
 * GLSL cho scene 3D — viết tay, không dùng postprocessing.
 *
 * Quy ước màu: shader ghi thẳng giá trị sRGB (không include colorspace_fragment)
 * nên uniform màu được truyền từ hex đã bỏ gamma (hexToRgb). Nhờ vậy màu khớp
 * với poster/SVG và không bị tối do color management.
 */

const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

/* ── Hành tinh: đỉnh bị dời theo noise, normal tính lại bằng finite difference ── */

export const PLANET_VERT = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uSurface;
uniform float uReduced;

varying vec3 vNormalW;
varying vec3 vPosW;
varying float vHeight;

${NOISE}

float dispAt(vec3 p, float t) {
  vec3 q = p * 1.9 + vec3(uSeed * 13.7, uSeed * 7.3, uSeed * 3.1);
  float h = snoise(q + vec3(0.0, t * 0.16, 0.0)) * 0.55;
  h += snoise(q * 2.13 + 7.0) * 0.26;
  h += snoise(q * 4.7 + 19.0) * 0.11;
  return h;
}

void main() {
  float t = mix(uTime, 0.0, clamp(uReduced, 0.0, 1.0));
  vec3 p = normalize(position);
  // biên độ dời đỉnh vừa phải: hành tinh mềm/hologram hơn, tránh gân nổi khi camera close-up
  float amp = 0.03 + 0.055 * uSurface;
  float h = dispAt(p, t);

  vec3 axis = abs(p.y) < 0.98 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(p, axis));
  vec3 bitan = normalize(cross(p, tangent));
  float eps = 0.06;
  vec3 pa = normalize(p + tangent * eps);
  vec3 pb = normalize(p + bitan * eps);

  vec3 d0 = p * (1.0 + h * amp);
  vec3 da = pa * (1.0 + dispAt(pa, t) * amp);
  vec3 db = pb * (1.0 + dispAt(pb, t) * amp);
  vec3 n = normalize(cross(da - d0, db - d0));

  vec4 world = modelMatrix * vec4(d0, 1.0);
  vHeight = h;
  vPosW = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const PLANET_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSeed;
uniform float uSurface;
uniform float uSignal;
uniform float uAtmo;
uniform float uFog;
uniform float uTime;
uniform float uReduced;
uniform float uDetail;
uniform float uFinale;

varying vec3 vNormalW;
varying vec3 vPosW;
varying float vHeight;

${NOISE}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec3 n = normalize(vNormalW);
  vec3 viewDir = normalize(cameraPosition - vPosW);
  vec3 dir = normalize(vPosW);
  float t = mix(uTime, 0.0, clamp(uReduced, 0.0, 1.0));

  // dải bề mặt theo vĩ độ + noise để không đều
  float lat = dir.y;
  float wobble = snoise(vec3(dir * 2.3 + uSeed * 3.1));
  float bandWave = sin(lat * (7.0 + uSeed * 1.8) + wobble * 2.0 + t * 0.05);
  float band = smoothstep(-0.9, 1.05, bandWave);
  float detail = snoise(vec3(dir * (6.5 + uSeed * 1.6) + uSeed * 5.0 + t * 0.02));
  float heightLight = 0.5 + 0.5 * vHeight;

  vec3 base = mix(uColorA, uColorB, band * 0.5 + 0.06 + heightLight * 0.08);
  base = mix(base, uColorC, smoothstep(0.1, 1.0, detail) * 0.28 * uDetail);

  // nắng định hướng, wrap nhẹ cho đỡ tối
  vec3 lightDir = normalize(vec3(-0.55, 0.62, 0.55));
  float diff = clamp(dot(n, lightDir) * 0.66 + 0.38, 0.0, 1.0);
  float surfaceLit = 0.18 + 0.82 * uSurface;
  vec3 col = base * diff * surfaceLit;

  // đèn thành phố — lưới trên uv cầu, sáng dần theo lớp signal
  vec2 uv = vec2(atan(dir.z, dir.x) / 6.2831853 + 0.5, asin(clamp(dir.y, -1.0, 1.0)) / 3.1415926 + 0.5);
  vec2 grid = uv * vec2(120.0, 62.0);
  vec2 cellId = floor(grid);
  vec2 cellUv = fract(grid) - 0.5;
  float h = hash21(cellId + uSeed * 23.0);
  float cityDot = smoothstep(0.14, 0.01, length(cellUv)) * step(0.9, h);
  float city = cityDot * smoothstep(0.06, 0.5, uSignal);
  col += vec3(1.0, 0.73, 0.34) * city * (0.9 + uSignal * 1.1);

  // vành tín hiệu xích đạo (K)
  float arcs = smoothstep(0.94, 1.0, sin(lat * 34.0 - t * 0.9)) * uSignal;
  col += uColorB * arcs * 0.16;

  // sương (S)
  float fogNoise = snoise(vec3(dir * 3.1 + uSeed * 8.0 + t * 0.06)) * 0.5 + 0.5;
  float fog = smoothstep(0.38, 1.0, fogNoise) * uFog;
  col = mix(col, mix(vec3(0.6, 0.74, 0.84), uColorB, 0.35), fog * 0.38);

  // fresnel khí quyển
  float fres = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 2.4);
  col += uColorB * fres * (0.35 + uAtmo * 1.9) * 0.95;

  col *= 1.0 + uFinale * 0.22;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ── Khí quyển: vỏ cầu additive, chỉ viền fresnel ─────────────────────── */

export const ATMOSPHERE_VERT = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vPosW;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPosW = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const ATMOSPHERE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;

varying vec3 vNormalW;
varying vec3 vPosW;

void main() {
  vec3 n = normalize(vNormalW);
  vec3 viewDir = normalize(cameraPosition - vPosW);
  float rim = pow(1.0 - abs(dot(n, viewDir)), 2.6);
  float a = clamp(rim * uStrength, 0.0, 1.0);
  // AdditiveBlending: alpha 1 để không nhân đôi độ mờ
  gl_FragColor = vec4(uColor * a, 1.0);
}
`;

/* ── Sao 4 cánh: SDF hình astroid + halo, cam–đỏ ──────────────────────── */

export const STAR_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const STAR_FRAG = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uIntensity;
uniform float uReduced;

varying vec2 vUv;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float t = mix(uTime, 0.0, clamp(uReduced, 0.0, 1.0));

  // 4 cánh: |x|^k + |y|^k < 1
  vec2 q = pow(abs(p), vec2(0.72));
  float d = q.x + q.y;

  float star = smoothstep(1.02, 0.88, d);
  float core = smoothstep(0.55, 0.0, d);
  float halo = exp(-d * 2.5) * 0.5 + exp(-length(p) * 2.4) * 0.18;
  float angle = atan(p.y, p.x);
  float shimmer = mix(0.86 + 0.14 * sin(angle * 4.0 + t * 0.7 + uSeed), 1.0, clamp(uReduced, 0.0, 1.0));

  vec3 hot = vec3(0.94, 0.25, 0.13);
  vec3 amber = vec3(0.98, 0.65, 0.2);
  vec3 white = vec3(1.0, 0.97, 0.9);
  vec3 col = mix(hot, amber, smoothstep(0.0, 1.0, d));
  col = mix(white, col, smoothstep(0.0, 0.42, d));

  float a = (star * 0.92 + halo * 0.5 + core * 0.35) * uIntensity * shimmer;
  gl_FragColor = vec4(col * a, a);
}
`;

/* ── Starfield: points instanced bằng attribute aSize/aPhase ──────────── */

export const STARFIELD_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;

uniform float uTime;
uniform float uPixel;
uniform float uReduced;

varying float vAlpha;
varying float vWarm;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float twinkle = 0.65 + 0.35 * sin(uTime * 1.4 + aPhase * 6.2831);
  vAlpha = mix(twinkle, 0.9, clamp(uReduced, 0.0, 1.0));
  vWarm = step(0.72, aPhase);
  gl_PointSize = aSize * (32.0 / max(0.1, -mv.z)) * uPixel;
  gl_Position = projectionMatrix * mv;
}
`;

export const STARFIELD_FRAG = /* glsl */ `
varying float vAlpha;
varying float vWarm;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.02, d) * vAlpha;
  vec3 col = mix(vec3(0.76, 0.84, 1.0), vec3(1.0, 0.93, 0.8), vWarm);
  gl_FragColor = vec4(col * a, a);
}
`;

/* ── Vệt đuôi tàu: points mờ dần, additive ────────────────────────────── */

export const TRAIL_VERT = /* glsl */ `
attribute float aAlpha;

uniform float uPixel;

varying float vA;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vA = aAlpha;
  gl_PointSize = (2.0 + aAlpha * 10.0) * uPixel * (2.0 / max(0.5, -mv.z));
  gl_Position = projectionMatrix * mv;
}
`;

export const TRAIL_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;

varying float vA;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.0, length(c)) * vA * uStrength;
  gl_FragColor = vec4(uColor * a, a);
}
`;
