-- Comprehensive debug script for courses table

-- 1. Check if table exists
SELECT 'Table Existence:' as info;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'courses'
) as table_exists;

-- 2. Check table schema
SELECT 'Table Schema:' as info;
SELECT 
  table_name,
  table_schema,
  table_type
FROM information_schema.tables 
WHERE table_name = 'courses';

-- 3. Check all columns with more detail
SELECT 'All Columns Detail:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position,
  table_schema,
  table_name
FROM information_schema.columns 
WHERE table_name = 'courses'
ORDER BY ordinal_position;

-- 4. Check if we can describe the table
SELECT 'Table Description:' as info;
SELECT 
  schemaname,
  tablename,
  tableowner,
  tablespace
FROM pg_tables 
WHERE tablename = 'courses';

-- 5. Check for any constraints
SELECT 'Table Constraints:' as info;
SELECT 
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'courses'::regclass;

-- 6. Try to see the actual table structure
SELECT 'Raw Table Info:' as info;
SELECT 
  attname,
  atttypid::regtype,
  attnotnull,
  attnum
FROM pg_attribute 
WHERE attrelid = 'courses'::regclass 
  AND attnum > 0 
  AND NOT attisdropped
ORDER BY attnum;
