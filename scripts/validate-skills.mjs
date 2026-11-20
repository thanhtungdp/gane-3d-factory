#!/usr/bin/env node
/**
 * Kiểm tra bộ skill/kit/playbook trong repo.
 * Chạy: npm run skills:check
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const skillsRoot = path.join(root, ".dsh", "skills");
const REQUIRED_HEADINGS = ["When to use", "Inputs", "Steps", "Outputs", "Quality gates", "Handoff"];
const EXPECTED_SKILLS = [
  "brand-game-factory",
  "game-brief-for-brand",
  "game-narrative-and-tone",
  "game-storyboard-and-sound",
  "brand-game-loop",
  "mobile-game-cockpit",
  "brand-crawl-to-kit",
  "brand-3d-world",
  "brand-report-gate",
  "game-qa-autopilot",
  "game-launch-kpi",
];
const EXPECTED_KITS = ["game-shell", "mobile-cockpit", "qa-playwright", "brand-crawl", "three-world", "audio", "report-lead"];
const EXPECTED_SCENARIOS = [
  "01-90s-booth-teaser.md",
  "02-4min-brand-diagnostic.md",
  "03-7min-product-launch.md",
  "04-10min-internal-training.md",
  "05-3min-fashion-drop.md",
];
const GENERIC_BANNED = [/Sao Kim/i, /Hành trình Sao Kim/i, /Tinh cầu Sương Mù/i, /S\/A\/O\/K\/IM/i, /\bKIM\b/, /5 trạm/i];
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (!m) continue;
    fields[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return fields;
}

function parseList(value) {
  if (!value) return [];
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function checkLinks(file, text) {
  const dir = path.dirname(file);
  const linkRegex = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of text.matchAll(linkRegex)) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith("#") || /^https?:/i.test(raw) || raw.startsWith("mailto:")) continue;
    if (raw.includes("{{") || raw.includes("}}")) continue;
    const target = path.resolve(dir, raw.split("#")[0]);
    if (!existsSync(target)) fail(`${path.relative(root, file)}: link gãy -> ${raw}`);
  }
}

async function checkSkills() {
  if (!existsSync(skillsRoot)) {
    fail("Thiếu .dsh/skills");
    return;
  }
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith("_")).map((entry) => entry.name);
  for (const name of EXPECTED_SKILLS) {
    if (!dirs.includes(name)) fail(`Thiếu skill ${name}`);
  }
  for (const name of dirs) {
    if (!EXPECTED_SKILLS.includes(name)) warnings.push(`Skill ngoài danh sách chuẩn: ${name}`);
    const file = path.join(skillsRoot, name, "SKILL.md");
    if (!existsSync(file)) {
      fail(`${name}: thiếu SKILL.md`);
      continue;
    }
    const text = await readFile(file, "utf8");
    const fm = parseFrontmatter(text);
    if (!fm) fail(`${name}: frontmatter không hợp lệ`);
    else {
      if (fm.name !== name) fail(`${name}: frontmatter name "${fm.name}" không khớp thư mục`);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.name ?? "")) fail(`${name}: name không kebab-case`);
      if (!fm.description) fail(`${name}: thiếu description`);
      else if (!/^Use when\b/i.test(fm.description)) fail(`${name}: description phải bắt đầu bằng "Use when"`);
      else if (/\s:\s/.test(fm.description)) fail(`${name}: description chứa ": " dễ làm YAML/DSH bỏ qua skill`);
    }
    if (text.length > 7500) fail(`${name}: SKILL.md ${text.length} ký tự (>7500)`);
    for (const heading of REQUIRED_HEADINGS) {
      const re = new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
      if (!re.test(text)) fail(`${name}: thiếu heading "## ${heading}"`);
    }
    for (const banned of GENERIC_BANNED) {
      if (banned.test(text)) fail(`${name}: còn nội dung brand hiện tại (${banned})`);
    }
    for (const match of text.matchAll(/`((?:templates|references)\/[^`]+)`/g)) {
      const resource = path.resolve(path.dirname(file), match[1]);
      if (!existsSync(resource)) fail(`${name}: thiếu resource ${match[1]}`);
    }
    checkLinks(file, text);
  }
}

async function checkGuide() {
  const guide = path.join(root, "SKILLS.md");
  if (!existsSync(guide)) {
    fail("Thiếu SKILLS.md");
    return;
  }
  const text = await readFile(guide, "utf8");
  for (const name of EXPECTED_SKILLS) {
    if (!text.includes(name)) fail(`SKILLS.md chưa liệt kê ${name}`);
  }
  for (const scenario of EXPECTED_SCENARIOS) {
    if (!text.includes(scenario)) fail(`SKILLS.md chưa link scenario ${scenario}`);
  }
  checkLinks(guide, text);
}

async function checkScenarios() {
  const dir = path.join(root, "playbooks", "scenarios");
  if (!existsSync(dir)) {
    fail("Thiếu playbooks/scenarios");
    return;
  }
  for (const scenario of EXPECTED_SCENARIOS) {
    const file = path.join(dir, scenario);
    if (!existsSync(file)) {
      fail(`Thiếu scenario ${scenario}`);
      continue;
    }
    const text = await readFile(file, "utf8");
    const fm = parseFrontmatter(text);
    if (text.includes("| # | Beat | Purpose | Visual | Interaction |")) {
      fail(`${scenario}: bảng storyboard thiếu cột Camera/Motion`);
    }
    if (!fm) fail(`${scenario}: thiếu frontmatter`);
    else {
      const skills = parseList(fm.skills);
      const outputs = parseList(fm.outputs);
      if (skills.length === 0) fail(`${scenario}: thiếu skills`);
      for (const name of skills) if (!EXPECTED_SKILLS.includes(name)) fail(`${scenario}: skill không tồn tại "${name}"`);
      if (outputs.length === 0) fail(`${scenario}: thiếu outputs`);
    }
    checkLinks(file, text);
  }
}

async function checkKitsAndPlaybooks() {
  for (const kit of EXPECTED_KITS) {
    if (!existsSync(path.join(root, "kits", kit, "README.md"))) fail(`Thiếu kits/${kit}/README.md`);
  }
  const required = [
    "playbooks/evaluation/rubric.md",
    "playbooks/evaluation/run-log.md",
    "playbooks/case-saokim.md",
    "playbooks/examples/tea-house.md",
    "playbooks/scenarios/README.md",
  ];
  for (const file of required) if (!existsSync(path.join(root, file))) fail(`Thiếu ${file}`);
}

async function main() {
  await checkSkills();
  await checkGuide();
  await checkScenarios();
  await checkKitsAndPlaybooks();

  if (warnings.length) {
    console.log("Warnings:");
    for (const warning of warnings) console.log(`  - ${warning}`);
  }
  if (errors.length) {
    console.error(`\nFAIL: ${errors.length} lỗi`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log(`OK: ${EXPECTED_SKILLS.length} skills, ${EXPECTED_SCENARIOS.length} scenarios, ${EXPECTED_KITS.length} kits`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
