import { isRequestAllowed } from "@/lib/rateLimiter";

// Each test uses a unique key suffix so tests never share state in the module-level Map.
let testKeyCounter = 0;
function uniqueKey(group = "test") {
  return `test-ip-${++testKeyCounter}:${group}`;
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("isRequestAllowed", () => {
  describe("basic limiting", () => {
    it("allows requests that are within the limit", () => {
      const key = uniqueKey();
      expect(isRequestAllowed(key, 3, 60_000)).toBe(true);
      expect(isRequestAllowed(key, 3, 60_000)).toBe(true);
      expect(isRequestAllowed(key, 3, 60_000)).toBe(true);
    });

    it("blocks the request that exceeds the limit", () => {
      const key = uniqueKey();
      isRequestAllowed(key, 3, 60_000);
      isRequestAllowed(key, 3, 60_000);
      isRequestAllowed(key, 3, 60_000);

      expect(isRequestAllowed(key, 3, 60_000)).toBe(false);
    });

    it("continues blocking while the window has not expired", () => {
      const key = uniqueKey();
      isRequestAllowed(key, 2, 60_000);
      isRequestAllowed(key, 2, 60_000);

      jest.advanceTimersByTime(59_000); // still inside the window

      expect(isRequestAllowed(key, 2, 60_000)).toBe(false);
    });
  });

  describe("sliding window expiry", () => {
    it("allows requests again after the window has fully expired", () => {
      const key = uniqueKey();
      isRequestAllowed(key, 2, 60_000);
      isRequestAllowed(key, 2, 60_000);

      jest.advanceTimersByTime(60_001); // window expired

      expect(isRequestAllowed(key, 2, 60_000)).toBe(true);
    });

    it("only counts requests within the sliding window, not fixed blocks", () => {
      const key = uniqueKey();
      // t=0: fill the limit
      isRequestAllowed(key, 3, 60_000);
      isRequestAllowed(key, 3, 60_000);

      // t=30s: one more request — now at the limit
      jest.advanceTimersByTime(30_000);
      isRequestAllowed(key, 3, 60_000);
      expect(isRequestAllowed(key, 3, 60_000)).toBe(false);

      // t=61s: the first 2 requests (made at t=0) have expired.
      // Only the t=30s request is still in the window → 2 free slots.
      jest.advanceTimersByTime(31_000);
      expect(isRequestAllowed(key, 3, 60_000)).toBe(true);
      expect(isRequestAllowed(key, 3, 60_000)).toBe(true);
      expect(isRequestAllowed(key, 3, 60_000)).toBe(false);
    });
  });

  describe("key isolation", () => {
    it("tracks different IPs independently", () => {
      const keyA = uniqueKey("auth");
      const keyB = uniqueKey("auth");

      isRequestAllowed(keyA, 2, 60_000);
      isRequestAllowed(keyA, 2, 60_000);
      expect(isRequestAllowed(keyA, 2, 60_000)).toBe(false);

      // keyB is a different IP — should still be allowed
      expect(isRequestAllowed(keyB, 2, 60_000)).toBe(true);
    });

    it("tracks different groups for the same IP independently", () => {
      const authKey = `same-ip:auth-${uniqueKey()}`;
      const verifyKey = `same-ip:token-verify-${uniqueKey()}`;

      isRequestAllowed(authKey, 2, 60_000);
      isRequestAllowed(authKey, 2, 60_000);
      expect(isRequestAllowed(authKey, 2, 60_000)).toBe(false);

      // Same IP but different group — should not be affected
      expect(isRequestAllowed(verifyKey, 2, 60_000)).toBe(true);
    });
  });
});
