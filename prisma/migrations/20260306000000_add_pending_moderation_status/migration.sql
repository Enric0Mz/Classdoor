-- AlterEnum
-- This must run outside a transaction so the new value is committed
-- before it can be referenced by SET DEFAULT.
ALTER TYPE "ModerationStatus" ADD VALUE IF NOT EXISTS 'PENDING_MODERATION';
