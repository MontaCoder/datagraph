import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // react-hooks v7 ships these brand-new, highly opinionated rules that
      // false-positive on legitimate SSR-safe patterns (on-mount localStorage
      // reads, IntersectionObserver fallbacks, locally-scoped icon helpers).
      // Keep them visible as warnings rather than blocking the lint/CI.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      // allow intentionally-unused identifiers when prefixed with "_"
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
