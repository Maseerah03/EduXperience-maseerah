-- Simple diagnostic script to check courses and batches tables

-- 1. Check if tables exist
SELECT 'Table Existence Check:' as info;
SELECT 
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_name IN ('courses', 'batches')
ORDER BY table_name;

-- 2. Check courses table columns
SELECT 'Courses Table Columns:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses'
ORDER BY ordinal_position;

-- 3. Check batches table columns
SELECT 'Batches Table Columns:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'batches'
ORDER BY ordinal_position;

-- 4. Check for institution-related columns
SELECT 'Institution Columns Found:' as info;
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('courses', 'batches') 
  AND column_name LIKE '%institution%'
ORDER BY table_name, column_name;

-- 5. Check RLS policies
SELECT 'RLS Policies:' as info;
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('courses', 'batches')
ORDER BY tablename, policyname;
