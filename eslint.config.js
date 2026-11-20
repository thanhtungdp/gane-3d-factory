import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["dist/**", "dist-server/**", "node_modules/**", ".data/**", "coverage/**", "playwright-report/**", "src/game/content/generated/**", "src/three/__tmp-*/**", "src/three/__runtime-check.tsx"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["server/**/*.ts", "tests/**/*.ts", "scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.config.{ts,js,mjs}", "eslint.config.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: { globals: { console: "readonly", process: "readonly", URL: "readonly" } },
  },
);
