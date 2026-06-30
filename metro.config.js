const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = config.watchFolders || [];
if (!Array.isArray(config.resolver.blockList)) {
  config.resolver.blockList = [config.resolver.blockList].filter(Boolean);
}
config.resolver.blockList.push(/\.cache[\/\\]dotslash/);
config.resolver.blockList.push(/backend/);
config.resolver.blockList.push(/www/);

module.exports = config;
