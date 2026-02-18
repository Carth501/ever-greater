import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
      include: ["packages/domain/src/**/*.ts", "apps/api/src/modules/**/*.ts"],
      exclude: ["**/*.test.ts", "**/index.ts"],
    },
  },
});
