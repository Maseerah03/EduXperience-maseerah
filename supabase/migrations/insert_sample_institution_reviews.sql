-- Insert Sample Institution Reviews
-- This adds some sample reviews to demonstrate the institution reviews functionality

-- Insert sample reviews for the MVP institution
INSERT INTO institution_reviews (
  institution_profile_id,
  reviewer_id,
  rating,
  review_text,
  student_name,
  student_avatar,
  anonymous,
  verified_student
) VALUES 
  (
    'b6a7af68-8d31-4340-9844-3b12d01b0233', -- MVP institution ID
    NULL, -- No specific reviewer for demo
    5,
    'Excellent teaching methodology and supportive faculty. My child has improved significantly in mathematics.',
    'Priya Sharma',
    '/placeholder.svg',
    false,
    true
  ),
  (
    'b6a7af68-8d31-4340-9844-3b12d01b0233', -- MVP institution ID
    NULL, -- No specific reviewer for demo
    5,
    'Great infrastructure and quality education. Highly recommended for academic excellence.',
    'Rahul Verma',
    '/placeholder.svg',
    false,
    true
  ),
  (
    'b6a7af68-8d31-4340-9844-3b12d01b0233', -- MVP institution ID
    NULL, -- No specific reviewer for demo
    4,
    'Good facilities and dedicated teachers. The computer lab is well-equipped.',
    'Anjali Patel',
    '/placeholder.svg',
    false,
    true
  ),
  (
    'b6a7af68-8d31-4340-9844-3b12d01b0233', -- MVP institution ID
    NULL, -- No specific reviewer for demo
    5,
    'Outstanding results in board exams. My daughter scored 95% in CBSE Class 10.',
    'Rajesh Kumar',
    '/placeholder.svg',
    false,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Update the institution profile with the calculated rating and review count
UPDATE institution_profiles 
SET 
  overall_rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM institution_reviews 
    WHERE institution_profile_id = 'b6a7af68-8d31-4340-9844-3b12d01b0233'
  ),
  reviews_count = (
    SELECT COUNT(*)
    FROM institution_reviews 
    WHERE institution_profile_id = 'b6a7af68-8d31-4340-9844-3b12d01b0233'
  ),
  updated_at = NOW()
WHERE id = 'b6a7af68-8d31-4340-9844-3b12d01b0233';
