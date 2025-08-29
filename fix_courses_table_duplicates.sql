-- Fix script for courses table duplicates and RLS issues

-- 1. First, let's see the exact duplicate columns
SELECT 'Duplicate Columns Check:' as info;
SELECT 
  column_name,
  COUNT(*) as count,
  STRING_AGG(ordinal_position::text, ', ') as positions
FROM information_schema.columns 
WHERE table_name = 'courses' 
  AND column_name = 'institution_profile_id'
GROUP BY column_name
HAVING COUNT(*) > 1;

-- 2. Check which column has the correct constraints
SELECT 'Column Constraints Check:' as info;
SELECT 
  c.ordinal_position,
  c.column_name,
  c.is_nullable,
  c.column_default,
  CASE 
    WHEN kcu.constraint_name IS NOT NULL THEN 'Has Constraint'
    ELSE 'No Constraint'
  END as constraint_status
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu 
  ON c.table_name = kcu.table_name 
  AND c.column_name = kcu.column_name
WHERE c.table_name = 'courses' 
  AND c.column_name = 'institution_profile_id'
ORDER BY c.ordinal_position;

-- 3. Drop the duplicate column (keeping the one with constraints)
-- We'll drop the one without proper constraints
DO $$
DECLARE
    col_to_drop INTEGER;
BEGIN
    -- Find the column position that doesn't have proper constraints
    SELECT c.ordinal_position INTO col_to_drop
    FROM information_schema.columns c
    LEFT JOIN information_schema.key_column_usage kcu 
      ON c.table_name = kcu.table_name 
      AND c.column_name = kcu.column_name
    WHERE c.table_name = 'courses' 
      AND c.column_name = 'institution_profile_id'
      AND kcu.constraint_name IS NULL
    LIMIT 1;
    
    IF col_to_drop IS NOT NULL THEN
        -- Drop the duplicate column without constraints
        EXECUTE format('ALTER TABLE courses DROP COLUMN IF EXISTS institution_profile_id CASCADE');
        RAISE NOTICE 'Dropped duplicate institution_profile_id column';
    ELSE
        RAISE NOTICE 'No duplicate columns found to drop';
    END IF;
END $$;

-- 4. Re-add the column with proper constraints if needed
DO $$
BEGIN
    -- Check if institution_profile_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
          AND column_name = 'institution_profile_id'
    ) THEN
        -- Add the column back with proper constraints
        ALTER TABLE courses ADD COLUMN institution_profile_id UUID NOT NULL REFERENCES institution_profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added institution_profile_id column with proper constraints';
    ELSE
        RAISE NOTICE 'institution_profile_id column already exists with proper constraints';
    END IF;
END $$;

-- 5. Verify the final structure
SELECT 'Final Table Structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'courses'
ORDER BY ordinal_position;

-- 6. Check RLS policies
SELECT 'RLS Policies Status:' as info;
SELECT 
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'courses'
ORDER BY policyname;
