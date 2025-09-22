module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
    es6: true,
  },
  ignorePatterns: [
    '.eslintrc.js',
    'jest.config.js',
    'jest.setup.js',
    'lib/**/*',
    'node_modules/**/*',
    'coverage/**/*',
  ],
  rules: {
    'no-unused-vars': 'off', // Disable base rule
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'off',
    'no-undef': 'off', // TypeScript handles this
  },
};