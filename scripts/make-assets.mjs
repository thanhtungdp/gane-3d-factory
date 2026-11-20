import sharp from "sharp";
import { Buffer } from "node:buffer";
import { mkdir } from "node:fs/promises";

const NAVY = "#050a24";
await mkdir("public/icons", { recursive: true });

const star = await sharp("public/brand/logo-saokim-star.svg").resize(300, 300).png().toBuffer();
const white = await sharp("public/brand/logo-saokim-white.svg").resize({ width: 760 }).png().toBuffer();

function icon(size, ratio) {
  const inner = Math.round(size * ratio);
  const s = sharp("public/brand/logo-saokim-star.svg").resize(inner, inner).png().toBuffer();
  return s.then((buf) =>
    sharp({
      create: { width: size, height: size, channels: 4, background: NAVY },
    })
      .composite([{ input: buf, gravity: "center" }])
      .png()
      .toBuffer(),
  );
}

await sharp(await icon(192, 0.58)).toFile("public/icons/icon-192.png");
await sharp(await icon(512, 0.58)).toFile("public/icons/icon-512.png");
await sharp(await icon(512, 0.44)).toFile("public/icons/icon-maskable-512.png");

const glow = Buffer.from(
  `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="72%" cy="38%" r="55%">
        <stop offset="0" stop-color="#21409a" stop-opacity=".9"/>
        <stop offset=".55" stop-color="#0a1a5c" stop-opacity=".5"/>
        <stop offset="1" stop-color="#050a24" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="#050a24"/>
    <rect width="1200" height="630" fill="url(#g)"/>
  </svg>`,
);

await sharp({
  create: { width: 1200, height: 630, channels: 4, background: NAVY },
})
  .composite([
    { input: glow, gravity: "center" },
    { input: white, left: 80, top: 72 },
    { input: star, left: 790, top: 245 },
  ])
  .jpeg({ quality: 88 })
  .toFile("public/brand/og-cover.jpg");

console.log("assets generated: icons + og-cover");
