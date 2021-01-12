// jest.config.js

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFiles: ['../jest.setup-file.ts'],
};
