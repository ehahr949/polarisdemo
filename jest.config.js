/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // Pure-logic tests: compile to CommonJS and don't inherit the Expo
        // bundler tsconfig (which would choke ts-jest).
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node10",
          esModuleInterop: true,
          strict: true,
          skipLibCheck: true,
          isolatedModules: true,
          ignoreDeprecations: "6.0",
          rootDir: ".",
        },
      },
    ],
  },
};
