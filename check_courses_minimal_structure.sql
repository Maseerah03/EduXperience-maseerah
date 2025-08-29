-- Check the minimal structure of the courses table
SELECT 'Courses Table - Exact Columns:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses'
ORDER BY ordinal_position;
