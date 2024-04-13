import ansi from 'ansi-colors';
import {Console} from 'node:console';

const {blue, red, green, white, italic} = ansi;

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
}

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
        `${time()} ${blue(this.identifier)} => ${green(argsToString(...arguments))}`);
  }

  error(error) {
    if (error instanceof Error) {
      this.logger.log(`${time()} ${blue(this.identifier)} => ${red(error.message)}. ${white(
          'Check stack trace below for more info')}`);
      this.logger.trace(error.stack);
      return;
    }

    this.logger.log(`${time()} ${blue(this.identifier)} => ${red(error)}. ${white('Check stack trace below for more info')}`);
    this.logger.trace();
  }

  warn(message) {
    this.logger.warn({
      identifier: this.identifier,
      message,
    });
  }

  info(message) {
    if (typeof message === 'object') {
      this.logger.log({
        identifier: blue(this.identifier),
        log: message,
      });
      return;
    }

    this.logger.log(
        `${time()} ${blue(this.identifier)} => ${green(message)}`);
  }

  debug(message) {
    this.logger.debug({
      identifier: this.identifier,
      message,
    });
  }
}

export default TejLogger;
