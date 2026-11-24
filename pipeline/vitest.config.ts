import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Docker-backed tests start containers and include a 5 second timeout case.
    testTimeout: 30_000,
  },
});
