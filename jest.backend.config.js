export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/**/*.test.js"],

  // exclude the /client folder
  testPathIgnorePatterns: ["<rootDir>/client/"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "config/db.js",
    "controllers/**/*.js",
    "helpers/**/*.js",
    "middlewares/**/*.js",
    "models/**/*.js",
  ],
  coverageDirectory: "coverage/backend",
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};
