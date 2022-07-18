const lib = require('./lib');
const ansis = require('ansis');
let value = lib.methodB();
value = ansis.strip(value);

console.log('>> common used module <<');

module.exports = value;