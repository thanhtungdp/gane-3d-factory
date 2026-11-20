// @vitest-environment node
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

describe("skill package", () => {
  it("skills, playbooks and kits pass the structural validator", () => {
    const output = execFileSync(process.execPath, ["scripts/validate-skills.mjs"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    expect(output).toContain("OK:");
  });
});
