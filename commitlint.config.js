const fs = require('fs');
const path = require('path');

// Read all directories under the 'images' folder
const getImagesDirectories = () => {
  const imagesPath = path.resolve(__dirname, 'images');

  if (!fs.existsSync(imagesPath)) return [];

  const items = fs.readdirSync(imagesPath, { withFileTypes: true });

  return items.filter((item) => item.isDirectory() && !item.name.startsWith('.')).map((dir) => dir.name);
};

const validScopes = ['global', ...getImagesDirectories()];

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', validScopes],
  },
};
