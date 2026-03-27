import ansi from "ansi-colors";
import { Console } from "node:console";

const { blue, red, green, yellow, cyan, white, italic } = ansi;

const time = () => {
  return `⏰  ${white(italic(new Date().toLocaleTimeString()))}`;
};

const argsToString = (...args) => {
  return args
    .map((arg) => {
      if (typeof arg === "object") {
        return JSON.stringify(arg);
      }

      return arg;
    })
    .join(" ");
};

class TejLogger {
  /** @type {Array<function({level: string, identifier: string, message: string, metadata?: unknown}): void>} */
  static #hooks = [];

  /**
   * Register a hook that is called for every log across all TejLogger instances.
   * Returns a dispose function that removes the hook when called.
   *
   * @param {function({level: string, identifier: string, message: string, metadata?: unknown}): void} fn
   * @returns {() => void} Dispose function to remove the hook.
   */
  static addHook(fn) {
    if (typeof fn !== "function") throw new Error("Hook must be a function");
    TejLogger.#hooks.push(fn);
    return () => TejLogger.removeHook(fn);
  }

  /**
   * Remove a previously registered hook.
   * @param {function} fn
   */
  static removeHook(fn) {
    const idx = TejLogger.#hooks.indexOf(fn);
    if (idx !== -1) TejLogger.#hooks.splice(idx, 1);
  }

  /**
   * Dispatch a log event to all registered hooks. Errors thrown by hooks are
   * silently swallowed so they never break the caller's logging flow.
   *
   * @param {string} level
   * @param {string} message
   * @param {unknown} [metadata]
   */
  #emit(level, message, metadata) {
    for (const hook of TejLogger.#hooks) {
      try {
        hook({ level, identifier: this.identifier, message, metadata });
      } catch {
        /* hooks must not break the logger */
      }
    }
  }

  constructor(identifier) {
    this.logger = new Console({
      stdout: process.stdout,
      stderr: process.stderr,
    });

    if (!identifier) throw new Error("Identifier is required for the logger");

    this.identifier = identifier;
  }

  /**
   * @param {...unknown} args
   */
  log() {
    const message = argsToString(...arguments);
    this.logger.log(
      `${time()} ${green("[LOG]")} ${blue(this.identifier)} => ${green(message)}`,
    );
    this.#emit("log", message);
  }

  /**
   * @param {Error|string} error
   * @param {boolean|Object} [traceOrMeta=true] - Pass `false` to suppress stack trace,
   *   or an object to attach structured metadata (trace defaults to `true`).
   * @param {Object} [metadata] - Structured metadata when second arg is a boolean.
   */
  error(error, traceOrMeta = true, metadata) {
    let trace = true;
    let meta = metadata;
    if (typeof traceOrMeta === "object" && traceOrMeta !== null) {
      meta = traceOrMeta;
    } else {
      trace = traceOrMeta !== false;
    }

    if (error instanceof Error) {
      this.logger.log(
        `${time()} ${red("[ERROR]")} ${blue(this.identifier)} => ${red(
          error.message,
        )}. ${white("Check stack trace below for more info")}`,
      );

      if (trace) this.logger.trace(error.stack);

      this.#emit("error", error.message, meta);
      return;
    }

    this.logger.log(
      `${time()} ${blue(this.identifier)} => ${red(error)}. ${white(
        "Check stack trace below for more info",
      )}`,
    );

    if (trace) this.logger.trace();

    this.#emit("error", String(error), meta);
  }

  /**
   * @param {string} message
   * @param {Object} [metadata]
   */
  warn(message, metadata) {
    this.logger.debug(
      `${time()} ${yellow("[⚠ WARN]")} ${blue(this.identifier)} => ${yellow(
        message,
      )}`,
    );
    this.#emit("warn", message, metadata);
  }

  /**
   * @param {string} message
   * @param {Object} [metadata]
   */
  info(message, metadata) {
    this.logger.log(
      `${time()} ${green("[★ INFO]")} ${blue(this.identifier)} => ${green(
        message,
      )}`,
    );
    this.#emit("info", message, metadata);
  }

  /**
   * @param {string} message
   * @param {Object} [metadata]
   */
  debug(message, metadata) {
    this.logger.debug(
      `${time()} ${cyan("[◉ DEBUG]")} ${blue(this.identifier)} => ${cyan(
        message,
      )}`,
    );
    this.#emit("debug", message, metadata);
  }
}

export default TejLogger;
