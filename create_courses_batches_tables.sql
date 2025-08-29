-- Create courses table for institution management
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES institution_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  fee TEXT NOT NULL,
  prerequisites TEXT,
  certificate_details TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  batch_count INTEGER DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create batches table for institution management
CREATE TABLE IF NOT EXISTS batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES institution_profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timings TEXT NOT NULL,
  days_of_week TEXT NOT NULL,
  max_capacity INTEGER NOT NULL,
  student_count INTEGER DEFAULT 0,
  faculty_name TEXT NOT NULL,
  classroom TEXT NOT NULL,
  fee_schedule TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_institution_id ON courses(institution_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_batches_institution_id ON batches(institution_id);
CREATE INDEX IF NOT EXISTS idx_batches_course_id ON batches(course_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses table
CREATE POLICY "Institutions can view their own courses" ON courses
  FOR SELECT USING (
    institution_id IN (
      SELECT id FROM institution_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can insert their own courses" ON courses
  FOR INSERT WITH CHECK (
    institution_id IN (
      SELECT id FROM institution_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can update their own courses" ON courses
  FOR UPDATE USING (
    institution_id IN (
      SELECT id FROM institution_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can delete their own courses" ON courses
  FOR DELETE USING (
    institution_id IN (
      SELECT id FROM institution_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for batches table
CREATE POLICY "Institutions can view their own batches" ON batches
  FOR SELECT USING (
    institution_id IN (
      SELECT id FROM institution_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can insert their own batches" ON batches
  FOR INSERT WITH CHECK (
    institution_id IN (
      SELECT id FROM institution_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can update their own batches" ON batches
  FOR UPDATE USING (
    institution_id IN (
      SELECT id FROM institution_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can delete their own batches" ON batches
  FOR DELETE USING (
    institution_id IN (
      SELECT id FROM institution_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Grant permissions to authenticated users
GRANT ALL ON courses TO authenticated;
GRANT ALL ON batches TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at 
  BEFORE UPDATE ON batches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
