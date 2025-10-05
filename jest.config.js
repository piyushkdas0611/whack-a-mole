export default {
  testEnvironment: 'jsdom',
  setupFiles: ['jest-environment-jsdom'],
  verbose: true,
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
