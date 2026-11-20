// Content audit theo brand-game-loop/templates/content-audit.md — chạy: node _audit.mjs
import { readFileSync } from "node:fs";

const R = { promptMax: 85, optionMin: 20, optionMax: 120, spreadMax: 55 };
const ALLOWED_EVIDENCE = new Set([
  "brand-vi", "checklist-open", "checklist-close", "sop-content-approval",
  "sop-pricing", "sop-customer-response", "sop-incident", "sop-store",
]);
const data = JSON.parse(readFileSync(new URL("./decisions.json", import.meta.url), "utf8"));

let hardFails = 0;
const rows = [];

for (const d of data.decisions) {
  const errs = [];
  const prompt = d.prompt.trim();
  if (prompt.length > R.promptMax) errs.push(`prompt ${prompt.length}>${R.promptMax}`);
  if (!prompt.endsWith("?")) errs.push("prompt không kết thúc ?");
  if (/đúng nhất/i.test(prompt + d.options.map(o => o.label).join(" "))) errs.push("meta-answer");

  const lens = d.options.map(o => o.label.trim().length);
  const spread = Math.max(...lens) - Math.min(...lens);
  lens.forEach((n, i) => {
    if (n < R.optionMin || n > R.optionMax) errs.push(`opt${i} ${n} ngoài ${R.optionMin}-${R.optionMax}`);
  });
  if (spread > R.spreadMax) errs.push(`spread ${spread}>${R.spreadMax}`);

  const pts = d.options.map(o => o.points).sort().join(",");
  if (pts !== "0,1,2") errs.push(`points=${pts}`);

  const all = [prompt, ...d.options.map(o => o.label)].join(" ");
  if (all.includes("%")) errs.push("% trong copy");
  if (/[[\]]/.test(all)) errs.push("template []");
  if (/(miễn phí|số 1|đột phá|hoàn hảo)/i.test(all)) errs.push("từ cấm");
  if (d.evidenceKey && !ALLOWED_EVIDENCE.has(d.evidenceKey)) errs.push(`evidenceKey lạ: ${d.evidenceKey}`);
  if (d.options.some(o => /^(đúng|sai|đúng rồi|sai rồi)\.?$/i.test(o.feedback.trim()))) errs.push("feedback chỉ đúng/sai");

  if (errs.length) hardFails++;
  rows.push({
    id: d.id, actId: d.actId, kind: d.kind,
    promptLen: prompt.length,
    optLens: lens.join("/"),
    spread,
    evidence: d.evidenceKey ?? "-",
    result: errs.length ? "FAIL" : "PASS",
    note: errs.join("; "),
    avgOpt: Math.round(lens.reduce((a, b) => a + b, 0) / lens.length),
  });
}

const acts = [...new Set(data.decisions.map(d => d.actId))];
const perAct = acts.map(a => `${a}=${data.decisions.filter(d => d.actId === a).length}`).join(" ");

console.log("| actId | decision id | kind | prompt len | option lens | spread | evidenceKey | Kết quả | Ghi chú |");
console.log("|---|---|---|---:|---|---:|---|---|---|");
for (const r of rows) {
  console.log(`| ${r.actId} | \`${r.id}\` | ${r.kind} | ${r.promptLen} | ${r.optLens} | ${r.spread} | \`${r.evidence}\` | ${r.result} | ${r.note || "—"} |`);
}
console.log("");
console.log(`Số decision: ${data.decisions.length} (${perAct})`);
console.log(`Quiz: ${data.quiz.length} câu`);
console.log(`Prompt dài nhất: ${Math.max(...rows.map(r => r.promptLen))}/${R.promptMax}`);
console.log(`Option trung bình ngắn nhất: ${Math.min(...rows.map(r => r.avgOpt))} ký tự`);
console.log(`Spread lớn nhất: ${Math.max(...rows.map(r => r.spread))}/${R.spreadMax}`);
console.log(`Cấu trúc 2/1/0: ${rows.every(r => r.note.includes("points") === false) ? "đúng 12/12" : "CÓ LỖI"}`);
console.log(`Hard fail: ${hardFails}`);
console.log(`GATE: ${hardFails === 0 ? "PASS (0 lỗi cứng)" : "FAIL"}`);
process.exit(hardFails === 0 ? 0 : 1);
