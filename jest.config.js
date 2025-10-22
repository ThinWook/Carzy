/**
 * Jest configuration for the monorepo root.
 * Only picks up tests under the root `test/` folder to avoid scanning packages.
 */
module.exports = {
  testMatch: ["<rootDir>/test/**/*.test.js"],
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.js"],
  testTimeout: 60000,
};
