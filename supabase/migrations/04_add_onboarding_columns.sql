-- Migration: Add onboarding-related columns to users table
-- Run this in Supabase SQL editor

-- Add columns needed for onboarding flow
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_assessed_minor BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS disability_types TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS accessibility_needs TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_assessed_disability TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_consent_at TIMESTAMP;
