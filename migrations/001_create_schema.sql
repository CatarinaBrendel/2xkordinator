-- 001_create_schema.sql
-- Create core tables for 2xKOrdinator
-- 001_create_schema.sql
-- Full schema for resetting the database. Drops existing tables and recreates
-- all tables, indexes and constraints in a single file.

PRAGMA foreign_keys = OFF;

-- Drop in dependency order to allow clean reset
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS checkins;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS guild_config;
DROP TABLE IF EXISTS users;

PRAGMA foreign_keys = ON;

-- Users (lightweight identity table)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE,
  display_name TEXT,
  created_at_utc INTEGER
);

-- Guild-level configuration
CREATE TABLE guild_config (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  announcement_channel_id TEXT,
  staff_channel_id TEXT,
  admin_role_id TEXT,
  referee_role_id TEXT,
  caster_role_id TEXT,
  created_at_utc INTEGER,
  updated_at_utc INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_guild_config_guild_id ON guild_config (guild_id);

-- Tournaments
CREATE TABLE tournaments (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  name TEXT,
  startgg_slug TEXT,
  startgg_event_id TEXT,
  announcement_channel_id TEXT,
  created_at_utc INTEGER,
  updated_at_utc INTEGER,
  FOREIGN KEY (guild_id) REFERENCES guild_config(guild_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_tournaments_guild_slug ON tournaments (guild_id, startgg_slug);

-- Teams
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  name TEXT,
  discord_role_id TEXT,
  created_at_utc INTEGER,
  updated_at_utc INTEGER,
  FOREIGN KEY (guild_id) REFERENCES guild_config(guild_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_teams_guild_role ON teams (guild_id, discord_role_id);

-- Matches (durable workflow + external mappings)
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT,
  startgg_set_id TEXT,
  entrant1_id TEXT,
  entrant2_id TEXT,
  scheduled_start_utc INTEGER,
  competition_status TEXT,
  workflow_status TEXT,
  discord_event_id TEXT,
  primary_channel_id TEXT,
  assigned_referee_user_id TEXT,
  metadata JSON,
  created_at_utc INTEGER,
  updated_at_utc INTEGER,
  announced_at_utc INTEGER,
  live_at_utc INTEGER,
  completed_at_utc INTEGER,
  cancelled_at_utc INTEGER,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_matches_startgg_set_id ON matches (startgg_set_id) WHERE startgg_set_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_start_utc ON matches (scheduled_start_utc);
CREATE INDEX IF NOT EXISTS idx_matches_competition_status ON matches (competition_status);
CREATE INDEX IF NOT EXISTS idx_matches_workflow_status ON matches (workflow_status);

-- Reminders
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  type TEXT NOT NULL,
  scheduled_for_utc INTEGER NOT NULL,
  delivery_status TEXT,
  attempt_count INTEGER DEFAULT 0,
  last_error TEXT,
  sent_at_utc INTEGER,
  created_at_utc INTEGER,
  updated_at_utc INTEGER,
  FOREIGN KEY (match_id) REFERENCES matches(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_reminders_match_type_scheduled ON reminders (match_id, type, scheduled_for_utc);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_for_utc ON reminders (scheduled_for_utc);
CREATE INDEX IF NOT EXISTS idx_reminders_delivery_status ON reminders (delivery_status);

-- Checkins
CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  checked_in_by_user_id TEXT,
  checked_in_at_utc INTEGER,
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_checkins_match_team ON checkins (match_id, team_id);

-- Audit log
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  action TEXT NOT NULL,
  match_id TEXT,
  details_json JSON,
  created_at_utc INTEGER,
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

