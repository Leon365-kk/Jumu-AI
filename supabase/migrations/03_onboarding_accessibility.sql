-- Migration: Add onboarding and accessibility fields to users and student_profiles
-- Run this in Supabase SQL editor

-- Extend users table with onboarding and accessibility data
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS disability_types TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS accessibility_needs TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_consent_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_assessed_disability TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_assessed_minor BOOLEAN DEFAULT FALSE;

-- Create index for age queries
CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date);

-- Extend student_profiles with accessibility fields
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS disability_types TEXT[] DEFAULT '{}';
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS accessibility_needs TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS ai_assessment_summary JSONB;
