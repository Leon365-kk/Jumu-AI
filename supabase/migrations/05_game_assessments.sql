-- Migration: Create game_assessments table
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS game_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    game_version TEXT,
    turns JSONB,
    metrics JSONB,
    completed BOOLEAN DEFAULT FALSE,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_assessments_user ON game_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_game_assessments_game ON game_assessments(game);
