const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAliases({
  '@shared': path.resolve(__dirname, '/shared')
});
