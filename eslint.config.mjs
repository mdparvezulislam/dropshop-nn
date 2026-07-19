import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next/dist/index.js";

export default tseslint.config(
  {
    ignores: [".next/*", "node_modules/*", "out/*", "build/*", "coverage/*"],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);
