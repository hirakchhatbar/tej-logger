import ansi from 'ansi-colors';
const {italic, bold, blue, white, bgGreen, bgRed, whiteBright} = ansi;

import TejLogger from './index.js';
const logger = new TejLogger('Example');

const nextLine = '\n';

console.log('');
console.log('');
console.log('');
console.log('');
console.log('');

logger.log("This is a log message");

console.log('');
console.log('');
console.log('');
console.log('');
console.log('');
