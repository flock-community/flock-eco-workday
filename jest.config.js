module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  testMatch: [
    '**/src/**/*.spec.ts',
    '**/src/**/*.spec.tsx',
    '**/src/**/*.test.ts',
    '**/src/**/*.test.tsx'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/', // Ignore Playwright tests
    '/dist/'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@workday-core$': '<rootDir>/workday-core/src/main/react',
    '^@workday-core/(.*)$': '<rootDir>/workday-core/src/main/react/$1',
    '^@workday-user$': '<rootDir>/workday-user/src/main/react',
    '^@workday-user/(.*)$': '<rootDir>/workday-user/src/main/react/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  }
};
