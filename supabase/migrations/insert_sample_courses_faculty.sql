-- Insert Sample Courses and Faculty Data
-- This adds sample courses and faculty members for the MVP institution

-- Insert sample courses
INSERT INTO courses (
  institution_profile_id,
  name,
  category,
  description,
  duration,
  fee,
  prerequisites,
  certificate_details,
  status,
  batch_count,
  student_count
) VALUES 
  (
    'b6a7af68-8d31-4340-9844-3b12d01b0233', -- MVP institution ID
    'CBSE Class 10 Mathematics',
    'Academic',
    'Comprehensive mathematics course covering Algebra, Geometry, Trigonometry, Statistics, and Probability. Designed to help students excel in CBSE board exams.',
    '6 months',
    '₹15,000',
    'Basic understanding of Class 9 mathematics',
    'Course completion certificate with detailed performance report',
    'active',
    3,
    45
  ),
  (
    'b6a7af68-8d31-4340-9844-3b12d01b0233', -- MVP institution ID
    'Computer Basics & MS Office',
    'Technology',
    'Essential computer literacy skills with hands-on training in Microsoft Office applications including Word, Excel, PowerPoint, and basic computer operations.',
    '4 months',
    '₹8,000',
    'No prerequisites required',
    'Microsoft Office Specialist certification preparation',
    'active',
    2,
    28
  ),
  (
    'b6a7af68-8d31-4340-9844-3b12d01b0233', -- MVP institution ID
    'English Communication Skills',
    'Language',
    'Advanced English speaking, writing, and communication skills for professional and academic success. Includes grammar, vocabulary, and presentation skills.',
    '5 months',
    '₹12,000',
    'Basic English knowledge',
    'English proficiency certificate',
    'active',
    2,
    32
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample faculty members
INSERT INTO faculty (
  institution_profile_id,
  full_name,
  gender,
  contact_number,
  email,
  employee_id,
  department,
  designation,
  specialization,
  date_of_joining,
  work_type,
  experience,
  highest_qualification,
  university,
  year_of_completion,
  faculty_role,
  system_access,
  courses_assigned,
  weekly_lecture_hours,
  status
) VALUES 
  (
    'b6a7af68-8d31-4340-9844-3b12d01b0233', -- MVP institution ID
    'Dr. Rajesh Kumar',
    'male',
    '+91 98765 43210',
    'rajesh.kumar@mvp.edu',
    'EMP001',
    'Mathematics',
    'Principal & Mathematics Head',
    'Mathematics, Physics',
    '2020-06-01',
    'full-time',
    15,
    'PhD in Mathematics',
    'IIT Delhi',
    2010,
    'Department Head',
    'admin',
    ARRAY['CBSE Class 10 Mathematics'],
    25,
    'active'
  ),
  (
    'b6a7af68-8d31-4340-9844-3b12d01b0233', -- MVP institution ID
    'Ms. Anjali Mehta',
    'female',
    '+91 98765 43211',
    'anjali.mehta@mvp.edu',
    'EMP002',
    'Computer Science',
    'Computer Science Head',
    'Computer Science, Programming',
    '2021-03-15',
    'full-time',
    8,
    'M.Tech in Computer Science',
    'BITS Pilani',
    2015,
    'Senior Faculty',
    'limited',
    ARRAY['Computer Basics & MS Office'],
    20,
    'active'
  ),
  (
    'b6a7af68-8d31-4340-9844-3b12d01b0233', -- MVP institution ID
    'Mr. Amit Singh',
    'male',
    '+91 98765 43212',
    'amit.singh@mvp.edu',
    'EMP003',
    'English',
    'English Department Head',
    'English Literature, Communication',
    '2019-08-01',
    'full-time',
    12,
    'MA in English Literature',
    'Delhi University',
    2012,
    'Department Head',
    'limited',
    ARRAY['English Communication Skills'],
    22,
    'active'
  )
ON CONFLICT (id) DO NOTHING;
