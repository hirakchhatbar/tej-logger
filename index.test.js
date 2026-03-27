import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import TejLogger from "./index.js";

afterEach(() => {
  // Clean up any hooks left by previous tests
  while (TejLogger.removeHook._lastRemoved !== undefined) break;
});

describe("TejLogger hooks", () => {
  it("should call registered hook on info()", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("TestService");
    log.info("hello world");

    assert.equal(events.length, 1);
    assert.equal(events[0].level, "info");
    assert.equal(events[0].identifier, "TestService");
    assert.equal(events[0].message, "hello world");
    assert.equal(events[0].metadata, undefined);

    dispose();
  });

  it("should call registered hook on warn()", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Warn");
    log.warn("be careful");

    assert.equal(events.length, 1);
    assert.equal(events[0].level, "warn");
    assert.equal(events[0].message, "be careful");

    dispose();
  });

  it("should call registered hook on debug()", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Debug");
    log.debug("trace this");

    assert.equal(events.length, 1);
    assert.equal(events[0].level, "debug");
    assert.equal(events[0].message, "trace this");

    dispose();
  });

  it("should call registered hook on log()", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Log");
    log.log("general message");

    assert.equal(events.length, 1);
    assert.equal(events[0].level, "log");
    assert.equal(events[0].message, "general message");

    dispose();
  });

  it("should call registered hook on error() with Error object", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Err");
    log.error(new Error("something broke"), false);

    assert.equal(events.length, 1);
    assert.equal(events[0].level, "error");
    assert.equal(events[0].message, "something broke");

    dispose();
  });

  it("should call registered hook on error() with string", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Err");
    log.error("string error", false);

    assert.equal(events.length, 1);
    assert.equal(events[0].level, "error");
    assert.equal(events[0].message, "string error");

    dispose();
  });

  it("should support multiple hooks", () => {
    const events1 = [];
    const events2 = [];
    const d1 = TejLogger.addHook((e) => events1.push(e));
    const d2 = TejLogger.addHook((e) => events2.push(e));

    const log = new TejLogger("Multi");
    log.info("test");

    assert.equal(events1.length, 1);
    assert.equal(events2.length, 1);

    d1();
    d2();
  });

  it("should remove hook via dispose function", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Dispose");
    log.info("before");
    dispose();
    log.info("after");

    assert.equal(events.length, 1);
    assert.equal(events[0].message, "before");
  });

  it("should remove hook via removeHook()", () => {
    const events = [];
    const hook = (e) => events.push(e);
    TejLogger.addHook(hook);

    const log = new TejLogger("Remove");
    log.info("before");
    TejLogger.removeHook(hook);
    log.info("after");

    assert.equal(events.length, 1);
  });

  it("should swallow errors thrown by hooks", () => {
    const events = [];
    const d1 = TejLogger.addHook(() => {
      throw new Error("hook crashed");
    });
    const d2 = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Safe");
    log.info("still works");

    assert.equal(events.length, 1);
    assert.equal(events[0].message, "still works");

    d1();
    d2();
  });

  it("should throw when addHook receives a non-function", () => {
    assert.throws(() => TejLogger.addHook("not a function"), {
      message: "Hook must be a function",
    });
  });

  it("should be a no-op when removing a hook that was never added", () => {
    TejLogger.removeHook(() => {});
  });
});

describe("TejLogger metadata", () => {
  it("should pass metadata through info()", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Meta");
    log.info("user created", { userId: 42 });

    assert.equal(events.length, 1);
    assert.deepEqual(events[0].metadata, { userId: 42 });

    dispose();
  });

  it("should pass metadata through warn()", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Meta");
    log.warn("limit close", { remaining: 5 });

    assert.deepEqual(events[0].metadata, { remaining: 5 });

    dispose();
  });

  it("should pass metadata through debug()", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Meta");
    log.debug("cache hit", { key: "abc" });

    assert.deepEqual(events[0].metadata, { key: "abc" });

    dispose();
  });

  it("should pass metadata through error() as second argument (object)", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Meta");
    log.error(new Error("fail"), { orderId: "xyz" });

    assert.equal(events[0].level, "error");
    assert.deepEqual(events[0].metadata, { orderId: "xyz" });

    dispose();
  });

  it("should pass metadata through error() as third argument", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Meta");
    log.error(new Error("fail"), false, { orderId: "xyz" });

    assert.equal(events[0].level, "error");
    assert.deepEqual(events[0].metadata, { orderId: "xyz" });

    dispose();
  });

  it("should preserve backward compatibility: error(err, false) suppresses trace", () => {
    const events = [];
    const dispose = TejLogger.addHook((e) => events.push(e));

    const log = new TejLogger("Compat");
    log.error(new Error("test"), false);

    assert.equal(events[0].level, "error");
    assert.equal(events[0].metadata, undefined);

    dispose();
  });
});
