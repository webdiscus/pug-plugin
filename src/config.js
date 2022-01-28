const path = require('path');

const plugin = 'pug-plugin';
const isWin = path.sep === '\\';

module.exports = {
  plugin,
  isWin,
};
