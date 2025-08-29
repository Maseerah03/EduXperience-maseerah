-- Create Faculty Table
-- This table stores comprehensive faculty information for institutions

CREATE TABLE IF NOT EXISTS faculty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_profile_id UUID NOT NULL REFERENCES institution_profiles(id) ON DELETE CASCADE,
  
  -- Personal Information (Basic Identity)
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  profile_photo TEXT,
  
  -- Professional Details (Core Employment Info)
  employee_id TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  specialization TEXT NOT NULL,
  date_of_joining DATE NOT NULL,
  work_type TEXT NOT NULL DEFAULT 'full-time' CHECK (work_type IN ('full-time', 'part-time', 'visiting')),
  experience INTEGER NOT NULL DEFAULT 0 CHECK (experience >= 0),
  
  -- Academic Qualifications
  highest_qualification TEXT NOT NULL,
  university TEXT,
  year_of_completion INTEGER CHECK (year_of_completion >= 1950 AND year_of_completion <= EXTRACT(YEAR FROM CURRENT_DATE)),
  
  -- Institutional Role & Access
  faculty_role TEXT NOT NULL,
  system_access TEXT NOT NULL DEFAULT 'teaching-only' CHECK (system_access IN ('admin', 'limited', 'teaching-only')),
  
  -- Workload & Classes
  courses_assigned TEXT[] DEFAULT '{}',
  class_section_allotted TEXT,
  weekly_lecture_hours INTEGER CHECK (weekly_lecture_hours >= 0 AND weekly_lecture_hours <= 40),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_institution_profile_id ON faculty(institution_profile_id);
CREATE INDEX IF NOT EXISTS idx_faculty_employee_id ON faculty(employee_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department);
CREATE INDEX IF NOT EXISTS idx_faculty_designation ON faculty(designation);
CREATE INDEX IF NOT EXISTS idx_faculty_status ON faculty(status);
CREATE INDEX IF NOT EXISTS idx_faculty_work_type ON faculty(work_type);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(email);

-- Enable Row Level Security (RLS)
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own institution's faculty
CREATE POLICY "Users can view own institution faculty" ON faculty
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM institution_profiles 
      WHERE institution_profiles.id = faculty.institution_profile_id 
      AND institution_profiles.user_id = auth.uid()
    )
  );

-- Users can insert faculty for their own institution
CREATE POLICY "Users can insert own institution faculty" ON faculty
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM institution_profiles 
      WHERE institution_profiles.id = faculty.institution_profile_id 
      AND institution_profiles.user_id = auth.uid()
    )
  );

-- Users can update faculty for their own institution
CREATE POLICY "Users can update own institution faculty" ON faculty
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM institution_profiles 
      WHERE institution_profiles.id = faculty.institution_profile_id 
      AND institution_profiles.user_id = auth.uid()
    )
  );

-- Users can delete faculty for their own institution
CREATE POLICY "Users can delete own institution faculty" ON faculty
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM institution_profiles 
      WHERE institution_profiles.id = faculty.institution_profile_id 
      AND institution_profiles.user_id = auth.uid()
    )
  );

-- Admins can manage all faculty
CREATE POLICY "Admins can manage all faculty" ON faculty
  FOR ALL USING (auth.role() = 'admin');

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_faculty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER faculty_updated_at
  BEFORE UPDATE ON faculty
  FOR EACH ROW
  EXECUTE FUNCTION update_faculty_updated_at();

-- Grant permissions
GRANT ALL ON faculty TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully created faculty table!';
  RAISE NOTICE 'You can now store and manage comprehensive faculty information in the database.';
END $$;
