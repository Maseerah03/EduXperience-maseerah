-- Get the complete level constraint definition without truncation
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition,
  pg_get_expr(conbin, conrelid) as constraint_expression
FROM pg_constraint 
WHERE conrelid = 'courses'::regclass 
  AND contype = 'c'
  AND conname = 'courses_level_check';

-- Alternative: Check what values are currently in the level column
SELECT DISTINCT level 
FROM courses 
WHERE level IS NOT NULL
ORDER BY level;

-- Alternative: Try to see the constraint in a different way
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'courses' 
  AND tc.constraint_type = 'CHECK'
  AND tc.constraint_name = 'courses_level_check';
