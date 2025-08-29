-- Fix script for courses and batches tables - handles column name mismatches

-- 1. First, let's see what columns actually exist
DO $$
DECLARE
    courses_col_exists BOOLEAN;
    batches_col_exists BOOLEAN;
BEGIN
    -- Check if institution_profile_id exists in courses
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'institution_profile_id'
    ) INTO courses_col_exists;
    
    -- Check if institution_profile_id exists in batches
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'batches' AND column_name = 'institution_profile_id'
    ) INTO batches_col_exists;
    
    -- If courses table doesn't have institution_profile_id, add it
    IF NOT courses_col_exists THEN
        -- Check if institution_id exists instead
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'courses' AND column_name = 'institution_id'
        ) THEN
            -- Rename institution_id to institution_profile_id
            ALTER TABLE courses RENAME COLUMN institution_id TO institution_profile_id;
            RAISE NOTICE 'Renamed institution_id to institution_profile_id in courses table';
        ELSE
            -- Add institution_profile_id column
            ALTER TABLE courses ADD COLUMN institution_profile_id UUID REFERENCES institution_profiles(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added institution_profile_id column to courses table';
        END IF;
    END IF;
    
    -- If batches table doesn't have institution_profile_id, add it
    IF NOT batches_col_exists THEN
        -- Check if institution_id exists instead
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'batches' AND column_name = 'institution_id'
        ) THEN
            -- Rename institution_id to institution_profile_id
            ALTER TABLE batches RENAME COLUMN institution_id TO institution_profile_id;
            RAISE NOTICE 'Renamed institution_id to institution_profile_id in batches table';
        ELSE
            -- Add institution_profile_id column
            ALTER TABLE batches ADD COLUMN institution_profile_id UUID REFERENCES institution_profiles(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added institution_profile_id column to batches table';
        END IF;
    END IF;
END $$;

-- 2. Update indexes to use the correct column name
DROP INDEX IF EXISTS idx_courses_institution_id;
DROP INDEX IF EXISTS idx_batches_institution_id;

CREATE INDEX IF NOT EXISTS idx_courses_institution_profile_id ON courses(institution_profile_id);
CREATE INDEX IF NOT EXISTS idx_batches_institution_profile_id ON batches(institution_profile_id);

-- 3. Update RLS policies to use the correct column name
-- Drop existing policies
DROP POLICY IF EXISTS "Institutions can view their own courses" ON courses;
DROP POLICY IF EXISTS "Institutions can insert their own courses" ON courses;
DROP POLICY IF EXISTS "Institutions can update their own courses" ON courses;
DROP POLICY IF EXISTS "Institutions can delete their own courses" ON courses;

DROP POLICY IF EXISTS "Institutions can view their own batches" ON batches;
DROP POLICY IF EXISTS "Institutions can insert their own batches" ON batches;
DROP POLICY IF EXISTS "Institutions can update their own batches" ON batches;
DROP POLICY IF EXISTS "Institutions can delete their own batches" ON batches;

-- Create new policies with correct column name
CREATE POLICY "Institutions can view their own courses" ON courses
  FOR SELECT USING (
    institution_profile_id IN (
      SELECT id FROM institution_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can insert their own courses" ON courses
  FOR INSERT WITH CHECK (
    institution_profile_id IN (
      SELECT id FROM institution_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can update their own courses" ON courses
  FOR UPDATE USING (
    institution_profile_id IN (
      SELECT id FROM institution_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can delete their own courses" ON courses
  FOR DELETE USING (
    institution_profile_id IN (
      SELECT id FROM institution_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can view their own batches" ON batches
  FOR SELECT USING (
    institution_profile_id IN (
      SELECT id FROM institution_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can insert their own batches" ON batches
  FOR INSERT WITH CHECK (
    institution_profile_id IN (
      SELECT id FROM institution_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can update their own batches" ON batches
  FOR UPDATE USING (
    institution_profile_id IN (
      SELECT id FROM institution_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can delete their own batches" ON batches
  FOR DELETE USING (
    institution_profile_id IN (
      SELECT id FROM institution_profiles WHERE user_id = auth.uid()
    )
  );

-- 4. Verify the fix
SELECT 'Verification - Final Table Structure:' as info;
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('courses', 'batches') 
  AND column_name LIKE '%institution%'
ORDER BY table_name, column_name;

SELECT 'Verification - RLS Policies:' as info;
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('courses', 'batches')
ORDER BY tablename, policyname;
