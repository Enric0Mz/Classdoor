/**
 * In-memory sliding window rate limiter.
 *
 * Each entry in the store is keyed by a string (e.g. the client IP combined
 * with a route group name) and holds a list of timestamps of requests that
 * occurred within the current window.
 *
 * NOTE: Because this is in-memory:
 * - Counters reset when the server process restarts.
 * - Counters are NOT shared across multiple server instances.
 * For multi-instance deployments, replace `requestTimestampsByKey` with
 * a Redis-backed store.
 */

const requestTimestampsByKey = new Map();

/**
 * Removes timestamps that fall outside the current sliding window.
 * Keeps the store from accumulating stale data over time.
 *
 * @param {number[]} timestamps
 * @param {number} windowMs
 * @returns {number[]}
 */
function pruneExpiredTimestamps(timestamps, windowMs) {
  const cutoffTime = Date.now() - windowMs;
  return timestamps.filter((timestamp) => timestamp > cutoffTime);
}

/**
 * Checks whether a request identified by `key` is within its rate limit.
 * Records the current request timestamp if it is allowed.
 *
 * @param {string} key - Unique string combining IP address and route group (e.g. "1.2.3.4:auth").
 * @param {number} maxRequests - Maximum number of requests allowed in the window.
 * @param {number} windowMs - Length of the sliding window in milliseconds.
 * @returns {boolean} true if the request is allowed, false if the limit is exceeded.
 */
export function isRequestAllowed(key, maxRequests, windowMs) {
  const now = Date.now();
  const previousTimestamps = requestTimestampsByKey.get(key) ?? [];
  const activeTimestamps = pruneExpiredTimestamps(previousTimestamps, windowMs);

  if (activeTimestamps.length >= maxRequests) {
    return false;
  }

  activeTimestamps.push(now);
  requestTimestampsByKey.set(key, activeTimestamps);
  return true;
}
