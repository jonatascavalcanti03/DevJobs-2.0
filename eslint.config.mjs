import prettierConfig from "eslint-config-prettier";
import nextConfig from "eslint-config-next/core-web-vitals";

// Flat Config using Next.js 16 native flat config arrays
const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  ...nextConfig,
  prettierConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default config;
