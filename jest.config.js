module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/load/'],
  verbose: true,
  forceExit: true,
  testTimeout: 30000,
};