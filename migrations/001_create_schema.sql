-- 001_create_schema.sql
-- Create core tables for 2xKOrdinator

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE,
  display_name TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  status TEXT,
  owner_id TEXT,
  metadata JSON,
  created_at INTEGER,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS guild_settings (
  guild_id TEXT PRIMARY KEY,
  settings JSON,
  updated_at INTEGER
);
