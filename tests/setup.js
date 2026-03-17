/**
 * Jest global setup — provides default environment variables so that
 * module-level guards (JWT_SECRET, RESEND_API_KEY, etc.) don't crash
 * before mocks can kick in.
 *
 * Values here are **only** used during tests and are intentionally dummy.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_test_key";
process.env.ANTHROPIC_API_KEY =
  process.env.ANTHROPIC_API_KEY || "sk-ant-test-key";
process.env.CRON_SECRET = process.env.CRON_SECRET || "test-cron-secret";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test"; // secretlint-disable-line
