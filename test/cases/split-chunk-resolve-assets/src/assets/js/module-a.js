const lib = require('./lib');
const ansis = require('ansis');
let value = lib.methodA();
value = ansis.strip(value);

module.exports = value;