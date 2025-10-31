/**
 * @dryjets/config - Shared Configuration Package
 *
 * @description Central configuration for ESLint, Prettier, and TypeScript
 * @usage
 *   // ESLint
 *   module.exports = { extends: ['@dryjets/config/eslint-nest'] }
 *
 *   // Prettier
 *   module.exports = require('@dryjets/config/prettier')
 *
 *   // TypeScript
 *   { "extends": "@dryjets/config/tsconfig-nest" }
 */

module.exports = {
  eslint: {
    preset: require('./eslint-preset'),
    nest: require('./eslint-nest'),
    react: require('./eslint-react'),
  },
  prettier: require('./prettier.config'),
};
