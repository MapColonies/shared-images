const fs = require('fs');
const path = require('path');

// Read all directories at the root of the repository
const getRootDirectories = () => {
  const rootPath = path.resolve(__dirname);
  const items = fs.readdirSync(rootPath, { withFileTypes: true });

  const ignoredDirs = ['.git', '.github', '.husky', 'node_modules'];

  return items.filter((item) => item.isDirectory() && !item.name.startsWith('.') && !ignoredDirs.includes(item.name)).map((dir) => dir.name);
};

const validScopes = ['global', ...getRootDirectories()];

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', validScopes],
  },
};
