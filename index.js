const ansi = require('ansi-colors');
const {Console} = require('node:console');

const {blue, red, green, yellow, cyan, white, italic} = ansi;

const time = () => {
  return `⏰  ${white(italic(new Date().toLocaleTimeString()))}`;
};

const argsToString = (...args) => {
  return args.map((arg) => {
    if (typeof arg === 'object') {
      return JSON.stringify(arg);
    }

    return arg;
  }).join(' ');
};

class TejLogger {
  constructor(identifier) {
    this.logger = new Console({
      stdout: process.stdout,
      stderr: process.stderr,
    });

    if (!identifier) throw new Error('Identifier is required for the logger');

    this.identifier = identifier;
  }

  log() {
    this.logger.log(
        `${time()} ${green('[LOG]')} ${blue(this.identifier)} => ${green(
            argsToString(...arguments))}`);
  }

  error(error, trace = true) {
    if (error instanceof Error) {
      this.logger.log(
          `${time()} ${red('[ERROR]')} ${blue(this.identifier)} => ${red(
              error.message)}. ${white(
              'Check stack trace below for more info')}`);

      if (trace)
        this.logger.trace(error.stack);
      return;
    }

    this.logger.log(
        `${time()} ${blue(this.identifier)} => ${red(error)}. ${white(
            'Check stack trace below for more info')}`);

    if (trace)
      this.logger.trace();
  }

  warn(message) {
    this.logger.debug(
        `${time()} ${yellow('[⚠ WARN]')} ${blue(
            this.identifier)} => ${yellow(message)}`);
  }

  info(message) {
    this.logger.log(
        `${time()} ${green('[★ INFO]')} ${blue(this.identifier)} => ${green(
            message)}`);
  }

  debug(message) {
    this.logger.debug(
        `${time()} ${cyan('[◉ DEBUG]')} ${blue(
            this.identifier)} => ${cyan(message)}`);
  }
}

module.exports = TejLogger;
