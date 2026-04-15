-- 002_indexes.sql
-- Add indexes to speed up common queries

CREATE INDEX IF NOT EXISTS idx_matches_status ON matches (status);
CREATE INDEX IF NOT EXISTS idx_matches_owner ON matches (owner_id);
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users (discord_id);
