import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const shared = {
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFiles: ["<rootDir>/jest/hermetic.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/", "<rootDir>/e2e/"],
};

const unit = await createJestConfig({
  ...shared,
  displayName: "unit",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/packages/**/tests/**/*.test.ts", "<rootDir>/src/app/api/**/*.test.ts"],
})();

const ui = await createJestConfig({
  ...shared,
  displayName: "ui",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest/setup-dom.ts"],
})();

/** @type {import("jest").Config} */
export default {
  projects: [unit, ui],
};
