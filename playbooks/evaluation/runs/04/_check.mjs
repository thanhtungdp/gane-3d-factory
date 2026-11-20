import { readFileSync } from "node:fs";

const dir = new URL("./", import.meta.url);
const read = (f) => readFileSync(new URL(f, dir), "utf8");
const data = JSON.parse(read("decisions.json"));
const loop = read("loop.md");
const sb = read("storyboard.md");
const cockpit = read("cockpit.md");
const qa = read("qa-plan.md");
const bible = read("story-bible.md");
const tone = read("tone-matrix.md");
const brief = read("brief.md");

const problems = [];
const files = {
  "run-brief.md": read("run-brief.md"), "brief.md": brief, "story-bible.md": bible,
  "tone-matrix.md": tone, "storyboard.md": sb, "sound-cue-sheet.md": read("sound-cue-sheet.md"),
  "loop.md": loop, "cockpit.md": cockpit, "qa-plan.md": qa,
};

// 1. placeholder còn sót
for (const [name, text] of Object.entries(files)) {
  const hits = [...text.matchAll(/\{\{[^}]+\}\}/g)].map((m) => m[0]);
  if (hits.length) problems.push(`${name}: placeholder ${hits.join(", ")}`);
}

// 2. loop.md phải chứa đúng prompt + 3 option của từng decision
for (const d of data.decisions) {
  for (const label of [d.prompt, ...d.options.map((o) => o.label)]) {
    if (!loop.includes(label)) problems.push(`loop.md thiếu copy của ${d.id}: "${label.slice(0, 40)}…"`);
  }
}

// 3. storyboard: đủ 10 cột, tổng 600s
const header = sb.split("\n").find((l) => l.startsWith("| # | Beat"));
const cols = header.split("|").filter((c) => c.trim()).length;
if (cols !== 10) problems.push(`storyboard: ${cols} cột (cần 10)`);
const beats = sb.split("\n").filter((l) => /^\| \d \|/.test(l));
if (beats.length !== 8) problems.push(`storyboard: ${beats.length} beat (cần 8)`);
const last = beats.at(-1).split("|")[9].trim();
if (!last.endsWith("600s")) problems.push(`storyboard: beat cuối kết thúc ${last} (cần 600s)`);

// 4. test id trong cockpit khớp qa-plan
for (const id of ["intro-cta", "continue", "question-modal", "handover-confirm"]) {
  if (!cockpit.includes(id)) problems.push(`cockpit thiếu test id ${id}`);
  if (!qa.includes(id) && id !== "handover-confirm") problems.push(`qa-plan không tham chiếu ${id}`);
}
if (!qa.includes("handover-confirm")) problems.push("qa-plan không tham chiếu handover-confirm");

// 5. loop: weights cộng 1.0
const weights = [...loop.matchAll(/\|\s*0\.25\s*\|/g)].length;
if (weights !== 4) problems.push(`report mapping: ${weights} dòng weight 0.25 (cần 4)`);

// 6. không % trong copy quyết định
const allCopy = data.decisions.flatMap((d) => [d.prompt, ...d.options.map((o) => o.label)]).join(" ");
if (allCopy.includes("%")) problems.push("copy decision có %");

console.log(JSON.stringify({ checks: 6, problems }, null, 2));
process.exit(problems.length ? 1 : 0);
