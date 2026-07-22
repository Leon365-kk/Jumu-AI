-- Migration: Set up Row Level Security (RLS) policies
-- Run this in Supabase SQL editor

-- Enable RLS on all tables
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- 1. Student profiles - users can view/update their own
CREATE POLICY "Users can view own student profile"
ON student_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own student profile"
ON student_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own student profile"
ON student_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Student skill scores - users can view their own
CREATE POLICY "Users can view own skill scores"
ON student_skill_scores FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own skill scores"
ON student_skill_scores FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill scores"
ON student_skill_scores FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Institutions - only admins can create/view
CREATE POLICY "Authenticated users can create institutions"
ON institutions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view institutions they belong to"
ON institutions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM institution_profiles
    WHERE user_id = auth.uid()
    AND institution_id = institutions.id
  )
);

-- 4. Institution profiles
CREATE POLICY "Users can view institution profiles"
ON institution_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM institution_profiles ip2
    WHERE ip2.user_id = auth.uid()
    AND ip2.institution_id = institution_profiles.institution_id
  )
  OR auth.uid() = institution_profiles.user_id
);

CREATE POLICY "Users can insert own institution profile"
ON institution_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Organizations
CREATE POLICY "Authenticated users can create organizations"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view organizations they belong to"
ON organizations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_profiles
    WHERE user_id = auth.uid()
    AND organization_id = organizations.id
  )
);

-- 6. Organization profiles
CREATE POLICY "Users can view organization profiles"
ON organization_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_profiles op2
    WHERE op2.user_id = auth.uid()
    AND op2.organization_id = organization_profiles.organization_id
  )
  OR auth.uid() = organization_profiles.user_id
);

CREATE POLICY "Users can insert own organization profile"
ON organization_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 7. Classes - institution members can view
CREATE POLICY "Institution members can view classes"
ON classes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM institution_profiles
    WHERE user_id = auth.uid()
    AND institution_id = classes.institution_id
  )
);

CREATE POLICY "Institution admins can create classes"
ON classes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM institution_profiles
    WHERE user_id = auth.uid()
    AND institution_id = classes.institution_id
    AND role = 'admin'
  )
);

-- 8. Class memberships
CREATE POLICY "Users can view class memberships"
ON class_memberships FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM institution_profiles
    WHERE user_id = auth.uid()
    AND institution_id = (
      SELECT institution_id FROM classes WHERE id = class_memberships.class_id
    )
  )
  OR auth.uid() = class_memberships.student_id
);

-- 9. Groups - organization members can view
CREATE POLICY "Organization members can view groups"
ON groups FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_profiles
    WHERE user_id = auth.uid()
    AND organization_id = groups.organization_id
  )
);

CREATE POLICY "Organization admins can create groups"
ON groups FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_profiles
    WHERE user_id = auth.uid()
    AND organization_id = groups.organization_id
    AND role = 'admin'
  )
);

-- 10. Group memberships
CREATE POLICY "Users can view group memberships"
ON group_memberships FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_profiles
    WHERE user_id = auth.uid()
    AND organization_id = (
      SELECT organization_id FROM groups WHERE id = group_memberships.group_id
    )
  )
  OR auth.uid() = group_memberships.user_id
);

-- 11. Learning sessions - users can view their own
CREATE POLICY "Users can view own learning sessions"
ON learning_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning sessions"
ON learning_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 12. Recommendations - users can view their own
CREATE POLICY "Users can view own recommendations"
ON recommendations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
ON recommendations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
ON recommendations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);