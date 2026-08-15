-- Migration number: 0003 	 email verifications (ported from mongo EmailsVerification model)
CREATE TABLE IF NOT EXISTS email_verifications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  code TEXT,
  verified TEXT,                    -- ISO datetime of successful verification
  request_sent TEXT,                -- ISO datetime the last code email went out
  -- stateless replacement for v2.1's in-memory hooks: the polling hook lives
  -- on the row, expiry is timestamp math (EMAIL_HOOK_LIFESPAN_MS)
  hook_id TEXT,
  hook_created_at TEXT,
  number_of_inquiries INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_hook ON email_verifications(hook_id);
