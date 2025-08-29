-- Check the exact structure of the courses table
SELECT 'Courses Table - All Columns:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'courses'
ORDER BY ordinal_position;

-- Check what columns we're trying to insert
SELECT 'Columns we want to insert:' as info;
SELECT 
  'institution_profile_id' as column_name,
  'name' as column_name,
  'category' as column_name,
  'description' as column_name,
  'duration' as column_name,
  'fee' as column_name,
  'prerequisites' as column_name,
  'certificate_details' as column_name,
  'status' as column_name;
