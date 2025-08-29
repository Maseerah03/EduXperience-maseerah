-- Check what values are allowed for the 'level' field in courses table
-- This will help us understand the check constraint

-- Method 1: Check the check constraint definition
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'courses'::regclass 
  AND contype = 'c'
  AND conname LIKE '%level%';

-- Method 2: Check if there are any existing courses to see what levels are used
SELECT DISTINCT level 
FROM courses 
WHERE level IS NOT NULL
ORDER BY level;

-- Method 3: Look at the table definition to see the check constraint
SELECT 
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_name = 'courses' 
  AND c.column_name = 'level';

-- Method 4: Try to see the actual constraint SQL
SELECT 
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'courses' 
  AND tc.constraint_type = 'CHECK';

-- Method 5: Get the actual check constraint definition
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'courses'::regclass 
  AND contype = 'c';
