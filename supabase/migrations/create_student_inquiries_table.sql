-- Create Student Inquiries Table
-- This table stores student inquiry information for institutions

CREATE TABLE IF NOT EXISTS student_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_profile_id UUID NOT NULL REFERENCES institution_profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  course_interest TEXT NOT NULL,
  preferred_batch TEXT,
  budget_range TEXT NOT NULL,
  source TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'admitted', 'closed')),
  inquiry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inquiry_time TEXT NOT NULL,
  last_follow_up DATE NOT NULL DEFAULT CURRENT_DATE,
  communication_history JSONB DEFAULT '[]'::jsonb,
  follow_up_reminders JSONB DEFAULT '[]'::jsonb,
  conversion_probability INTEGER DEFAULT 50 CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_inquiries_institution_profile_id ON student_inquiries(institution_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_inquiries_status ON student_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_student_inquiries_priority ON student_inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_student_inquiries_inquiry_date ON student_inquiries(inquiry_date);
CREATE INDEX IF NOT EXISTS idx_student_inquiries_source ON student_inquiries(source);

-- Enable Row Level Security (RLS)
ALTER TABLE student_inquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own institution's inquiries
CREATE POLICY "Users can view own institution inquiries" ON student_inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM institution_profiles 
      WHERE institution_profiles.id = student_inquiries.institution_profile_id 
      AND institution_profiles.user_id = auth.uid()
    )
  );

-- Users can insert inquiries for their own institution
CREATE POLICY "Users can insert own institution inquiries" ON student_inquiries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM institution_profiles 
      WHERE institution_profiles.id = student_inquiries.institution_profile_id 
      AND institution_profiles.user_id = auth.uid()
    )
  );

-- Users can update inquiries for their own institution
CREATE POLICY "Users can update own institution inquiries" ON student_inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM institution_profiles 
      WHERE institution_profiles.id = student_inquiries.institution_profile_id 
      AND institution_profiles.user_id = auth.uid()
    )
  );

-- Users can delete inquiries for their own institution
CREATE POLICY "Users can delete own institution inquiries" ON student_inquiries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM institution_profiles 
      WHERE institution_profiles.id = student_inquiries.institution_profile_id 
      AND institution_profiles.user_id = auth.uid()
    )
  );

-- Admins can manage all inquiries
CREATE POLICY "Admins can manage all inquiries" ON student_inquiries
  FOR ALL USING (auth.role() = 'admin');

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_inquiries_updated_at
  BEFORE UPDATE ON student_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_student_inquiries_updated_at();

-- Grant permissions
GRANT ALL ON student_inquiries TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully created student_inquiries table!';
  RAISE NOTICE 'You can now store and manage student inquiries in the database.';
END $$;
