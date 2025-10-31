/**
 * ESLint Configuration for NestJS Applications
 *
 * @description Extends base config with NestJS-specific rules
 * @usage Extend this in your .eslintrc.json:
 *   { "extends": ["@dryjets/config/eslint-nest"] }
 */

module.exports = {
  extends: ['./eslint-preset.js'],
  rules: {
    // NestJS uses decorators extensively
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // Allow dependency injection patterns
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        // Allow unused parameters in constructors (common in DI)
        args: 'after-used',
      },
    ],

    // NestJS decorators don't need explicit return types
    '@typescript-eslint/explicit-function-return-type': 'off',

    // Allow empty interfaces for DTOs
    '@typescript-eslint/no-empty-interface': [
      'error',
      {
        allowSingleExtends: true,
      },
    ],

    // NestJS uses class-based architecture
    'max-classes-per-file': 'off',

    // Allow console in development (NestJS logger)
    'no-console': 'off',
  },
  env: {
    node: true,
    jest: true,
  },
};
