-- Migration: Create tables for progress tracking and multi-entity onboarding
-- Run this in Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. skill_master: Defines all skills in the system
CREATE TABLE IF NOT EXISTS skill_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial skill data
INSERT INTO skill_master (category, name, description) VALUES
    ('reading', 'comprehension', 'Understanding and interpreting text'),
    ('reading', 'vocabulary', 'Word knowledge and usage'),
    ('reading', 'fluency', 'Reading speed and accuracy'),
    ('reading', 'retention', 'Remembering what was read'),
    ('math', 'arithmetic', 'Basic math operations'),
    ('math', 'algebra', 'Algebraic expressions and equations'),
    ('math', 'geometry', 'Shapes and spatial reasoning'),
    ('math', 'problem_solving', 'Word problems and logic'),
    ('focus', 'attention_span', 'Ability to maintain focus'),
    ('focus', 'consistency', 'Regular practice and engagement'),
    ('focus', 'improvement_rate', 'Rate of skill improvement'),
    ('writing', 'grammar', 'Grammar and syntax'),
    ('writing', 'creativity', 'Creative expression'),
    ('writing', 'structure', 'Organization and flow')
ON CONFLICT DO NOTHING;

-- 2. student_profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    grade_level TEXT,
    learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing')),
    interests TEXT[],
    learning_pace TEXT CHECK (learning_pace IN ('slow', 'medium', 'fast')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. student_skill_scores
CREATE TABLE IF NOT EXISTS student_skill_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skill_master(id) ON DELETE CASCADE,
    score NUMERIC(5,2) DEFAULT 0,
    confidence NUMERIC(5,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- 4. institutions
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('school', 'college', 'university', 'training_center')),
    address TEXT,
    contact_email TEXT,
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. institution_profiles
CREATE TABLE IF NOT EXISTS institution_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'teacher', 'student')),
    department TEXT,
    employee_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('ngo', 'corporate', 'community', 'other')),
    description TEXT,
    contact_email TEXT,
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. organization_profiles
CREATE TABLE IF NOT EXISTS organization_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'member')),
    team TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. classes
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    description TEXT,
    teacher_id UUID REFERENCES auth.users(id),
    grade_level TEXT,
    subject TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. class_memberships
CREATE TABLE IF NOT EXISTS class_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 10. groups
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    admin_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. group_memberships
CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- 12. learning_sessions
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT CHECK (session_type IN ('reading', 'math', 'focus', 'writing')),
    content_id TEXT,
    duration_minutes INTEGER,
    metrics JSONB,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- 13. recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('content', 'skill', 'challenge', 'reminder')),
    content_id TEXT,
    reason TEXT,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add entity_type column to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN ('student', 'institution', 'organization'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS entity_id UUID;

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_student_skill_scores_user_skill ON student_skill_scores(user_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_completed ON recommendations(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_skill_master_category_name ON skill_master(category, name);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_class_memberships_student ON class_memberships(student_id);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_user ON organization_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_user ON institution_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_xp ON progress(xp);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_completed ON learning_sessions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_priority_created ON recommendations(user_id, priority, created_at);