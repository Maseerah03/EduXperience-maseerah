-- Check the actual structure of institution_profiles table
-- Run this first to see what columns actually exist

-- 1. Check if the table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institution_profiles')
    THEN 'Table EXISTS'
    ELSE 'Table DOES NOT EXIST'
  END as table_status;

-- 2. Show the actual table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'institution_profiles'
ORDER BY ordinal_position;

-- 3. Show the primary key
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'institution_profiles' 
  AND tc.constraint_type = 'PRIMARY KEY';

-- 4. Show foreign keys
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'institution_profiles' 
  AND tc.constraint_type = 'FOREIGN KEY';
