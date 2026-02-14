module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/spec/tests'],
  testMatch: ['**/*-spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES6',
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        strict: false,
        noImplicitAny: false,
        strictNullChecks: false,
      }
    }],
    '\\.html$': '<rootDir>/spec/htmlTransformer.js',
  },
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/spec/__mocks__/styleMock.js',
    '\\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$': '<rootDir>/spec/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/spec/jest.setup.js'],
  collectCoverageFrom: [
    'core/**/*.ts',
    'components/**/*.ts',
    'pages/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 5000,
  bail: 1,              // Stop after first test failure
  forceExit: true,      // Force exit even with open handles
  detectOpenHandles: false  // Set to true when debugging hanging tests
};
