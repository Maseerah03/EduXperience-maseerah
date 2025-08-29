-- Diagnostic script to check the actual structure of courses and batches tables

-- 1. Check if tables exist
SELECT 'Table Existence Check:' as info;
SELECT 
  table_name,
  CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'DOES NOT EXIST' END as status
FROM information_schema.tables 
WHERE table_name IN ('courses', 'batches')
ORDER BY table_name;

-- 2. Check courses table structure
SELECT 'Courses Table Structure:' as info;
SELECT 
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  CASE 
    WHEN tc.constraint_name IS NOT NULL THEN 'PRIMARY KEY'
    WHEN rc.constraint_name IS NOT NULL THEN 'FOREIGN KEY'
    ELSE ''
  END as constraints
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY'
LEFT JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE c.table_name = 'courses'
ORDER BY c.ordinal_position;

-- 3. Check batches table structure
SELECT 'Batches Table Structure:' as info;
SELECT 
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  CASE 
    WHEN tc.constraint_name IS NOT NULL THEN 'PRIMARY KEY'
    WHEN rc.constraint_name IS NOT NULL THEN 'FOREIGN KEY'
    ELSE ''
  END as constraints
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY'
LEFT JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE c.table_name = 'batches'
ORDER BY c.ordinal_position;

-- 4. Check foreign key constraints
SELECT 'Foreign Key Constraints:' as info;
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('courses', 'batches');

-- 5. Check RLS policies
SELECT 'RLS Policies:' as info;
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('courses', 'batches')
ORDER BY tablename, policyname;
