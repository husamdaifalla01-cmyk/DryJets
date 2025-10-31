/**
 * ESLint Configuration for React/Next.js Applications
 *
 * @description Extends base config with React and Next.js rules
 * @usage Extend this in your .eslintrc.json:
 *   { "extends": ["@dryjets/config/eslint-react"] }
 */

module.exports = {
  extends: [
    './eslint-preset.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'next/core-web-vitals',
  ],
  plugins: ['react', 'react-hooks', 'jsx-a11y'],
  rules: {
    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js 13+
    'react/prop-types': 'off', // Using TypeScript for type checking
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'warn',

    // Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Accessibility
    'jsx-a11y/anchor-is-valid': 'off', // Next.js Link component

    // TypeScript overrides for React
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',

    // Allow React component naming patterns
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'], // Allow PascalCase for React components
      },
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'], // Allow PascalCase for components
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
};
