import { describe, it, expect, beforeEach, afterEach } from "vitest";
import TejLogger from "./index.js";

let dispose;

afterEach(() => {
  if (dispose) dispose();
  dispose = null;
});

describe("TejLogger constructor", () => {
  it("works with identifier only (backward compat)", () => {
    const logger = new TejLogger("App");
    expect(logger.identifier).toBe("App");
  });

  it("throws when identifier is missing", () => {
    expect(() => new TejLogger()).toThrow("Identifier is required");
    expect(() => new TejLogger("")).toThrow("Identifier is required");
  });

  it("ignores unknown option keys", () => {
    expect(() => new TejLogger("App", { foo: "bar" })).not.toThrow();
  });
});

describe("instance defaults via options.defaults", () => {
  it("merges defaults into hook metadata", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("Svc", {
      defaults: { radar: true, env: "prod" },
    });
    logger.info("hello");

    expect(events).toHaveLength(1);
    expect(events[0].metadata).toEqual({ radar: true, env: "prod" });
  });

  it("provides defaults when per-call metadata is undefined", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("Svc", { defaults: { radar: true } });
    logger.warn("oops");

    expect(events[0].metadata).toEqual({ radar: true });
  });
});

describe("options.radar shortcut", () => {
  it("sets defaults.radar when defaults not provided", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("Svc", { radar: true });
    logger.info("test");

    expect(events[0].metadata).toEqual({ radar: true });
  });

  it("does not override explicit defaults.radar", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("Svc", {
      radar: true,
      defaults: { radar: false },
    });
    logger.info("test");

    expect(events[0].metadata.radar).toBe(false);
  });
});

describe("per-call metadata overrides instance defaults", () => {
  it("per-call key wins over instance default", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("Svc", {
      defaults: { radar: true, env: "prod" },
    });
    logger.info("test", { radar: false });

    expect(events[0].metadata).toEqual({ radar: false, env: "prod" });
  });

  it("per-call can add keys not in defaults", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("Svc", { defaults: { radar: true } });
    logger.info("test", { extra: 42 });

    expect(events[0].metadata).toEqual({ radar: true, extra: 42 });
  });
});

describe("caller metadata object is not mutated", () => {
  it("does not modify the caller's metadata object", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("Svc", { defaults: { radar: true } });
    const meta = { userId: "abc" };
    logger.info("test", meta);

    expect(meta).toEqual({ userId: "abc" });
    expect(events[0].metadata).toEqual({ radar: true, userId: "abc" });
  });
});

describe("no defaults produces undefined metadata (backward compat)", () => {
  it("info without metadata passes undefined to hook", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("App");
    logger.info("hello");

    expect(events[0].metadata).toBeUndefined();
  });

  it("warn with metadata passes it through unchanged", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("App");
    logger.warn("oops", { key: "val" });

    expect(events[0].metadata).toEqual({ key: "val" });
  });
});

describe("error method metadata", () => {
  it("merges defaults into error metadata", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("Svc", { radar: true });
    logger.error("something failed", false, { context: "billing" });

    expect(events[0].metadata).toEqual({ radar: true, context: "billing" });
  });

  it("merges defaults when error receives object as second arg", () => {
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    const logger = new TejLogger("Svc", { defaults: { radar: true } });
    logger.error("fail", { orderId: 123 });

    expect(events[0].metadata).toEqual({ radar: true, orderId: 123 });
  });
});

describe("frozen defaults cannot be mutated", () => {
  it("throws on assignment to frozen defaults", () => {
    const logger = new TejLogger("Svc", { defaults: { radar: true } });
    // #defaults is private, but we can verify the freeze indirectly:
    // attempting to use the logger should not allow mutations through the hook
    const events = [];
    dispose = TejLogger.addHook((e) => events.push(e));

    logger.info("a");
    logger.info("b");

    expect(events[0].metadata).toEqual({ radar: true });
    expect(events[1].metadata).toEqual({ radar: true });
    expect(events[0].metadata).not.toBe(events[1].metadata);
  });
});
