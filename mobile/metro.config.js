const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Path to shared packages
const packagesPath = path.resolve(__dirname, "../packages");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Watch the packages folder for changes
config.watchFolders = [packagesPath];

// Configure resolver for shared types
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(packagesPath, "types/src"),
];

// Add alias for @cancer-compass/types
config.resolver.extraNodeModules = {
  "@cancer-compass/types": path.resolve(packagesPath, "types/src"),
};

module.exports = config;
