module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/services/website/specs/**/*.spec.[jt]s?(x)',
    '<rootDir>/services/website/specs/**/*.test.[jt]s?(x)',
  ],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleNameMapper: {
    '^next/image$': '<rootDir>/test/mocks/next-image.cjs',
    '^@platform/(.*)$': '<rootDir>/platform/$1',
    '^content-collections$':
      '<rootDir>/services/website/.content-collections/generated/index',
    '^content-collections/generated/(.*)$':
      '<rootDir>/services/website/.content-collections/generated/$1',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/dist/',
    '<rootDir>/services/website/out/',
    '<rootDir>/services/website/storybook-static/',
  ],
};
