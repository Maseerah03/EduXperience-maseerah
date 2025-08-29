-- Create Institution Reviews Table
-- This table stores reviews and ratings for institutions from students/parents

CREATE TABLE IF NOT EXISTS institution_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_profile_id UUID NOT NULL REFERENCES institution_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Review Details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  student_name TEXT,
  student_avatar TEXT,
  
  -- Review Metadata
  anonymous BOOLEAN DEFAULT false,
  verified_student BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institution_reviews_institution_id ON institution_reviews(institution_profile_id);
CREATE INDEX IF NOT EXISTS idx_institution_reviews_reviewer_id ON institution_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_institution_reviews_rating ON institution_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_institution_reviews_created_at ON institution_reviews(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE institution_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view institution reviews" ON institution_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create institution reviews" ON institution_reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews" ON institution_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON institution_reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- Function to calculate average rating and total reviews for an institution
CREATE OR REPLACE FUNCTION update_institution_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update institution_profiles table with new rating stats
  UPDATE institution_profiles 
  SET 
    overall_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM institution_reviews 
      WHERE institution_profile_id = NEW.institution_profile_id
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM institution_reviews 
      WHERE institution_profile_id = NEW.institution_profile_id
    ),
    updated_at = NOW()
  WHERE id = NEW.institution_profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update institution rating stats
CREATE TRIGGER trigger_update_institution_rating_stats
  AFTER INSERT OR UPDATE OR DELETE ON institution_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_institution_rating_stats();

-- Grant necessary permissions
GRANT ALL ON institution_reviews TO authenticated;
GRANT EXECUTE ON FUNCTION update_institution_rating_stats TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE institution_reviews IS 'Reviews and ratings for institutions from students/parents';
COMMENT ON COLUMN institution_reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN institution_reviews.review_text IS 'Detailed review text from student/parent';
COMMENT ON COLUMN institution_reviews.student_name IS 'Name of the student (can be anonymous)';
COMMENT ON COLUMN institution_reviews.anonymous IS 'Whether the reviewer wants to remain anonymous';
COMMENT ON COLUMN institution_reviews.verified_student IS 'Whether the student has actually studied at the institution';
