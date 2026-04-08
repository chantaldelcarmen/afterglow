module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/e2e/security/**/*.spec.ts'],
  testTimeout: 30000,
  injectGlobals: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};