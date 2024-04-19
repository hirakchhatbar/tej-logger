const ansi = require('ansi-colors');
const {italic, bold, blue, white, bgGreen, bgRed, whiteBright} = ansi;

const TejLogger = require('./index');
const logger = new TejLogger('Example');

const nextLine = '\n';

console.log('');
console.log('');
console.log('');
console.log('');
console.log('');

try {
  throw new Error('Error thrown to demonstrate robust error handling of te.js');
} catch (error) {
  logger.error(error);
}

console.log('');
console.log('');
console.log('');
console.log('');
console.log('');
