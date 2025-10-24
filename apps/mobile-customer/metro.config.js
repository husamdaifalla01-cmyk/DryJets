// metro.config.js — Node.js-compatible CommonJS format for Expo
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo support
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];

// Prevent Node.js APIs from leaking into React Native bundle
// This blocks modules that use process.on, fs, etc. from being bundled
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // For React Native (not web), return empty module for Node-only APIs
  if (platform !== 'web') {
    // Block 'process' module entirely (causes process.on errors)
    if (moduleName === 'process') {
      return {
        type: 'empty',
      };
    }
  }

  // Use default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
