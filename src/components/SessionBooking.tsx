import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, User, BookOpen, Search, Filter, Globe, Loader2, CheckCircle, X } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type TutorProfile = Tables<"tutor_profiles">;
type Profile = Tables<"profiles">;
type Course = Tables<"courses">;

interface AvailableSlot {
  day: string;
  startTime: string;
  endTime: string;
  formattedStartTime: string;
  formattedEndTime: string;
}

interface TutorWithAvailability extends TutorProfile {
  profile: Profile;
  courses: Course[];
  availableSlots: AvailableSlot[];
}

interface BookingFormData {
  courseId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

export default function SessionBooking() {
  const { toast } = useToast();
  const [tutors, setTutors] = useState<TutorWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState<TutorWithAvailability | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    courseId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);

  // Helper functions
  const formatTime12Hour = (time: string): string => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Load tutors with availability
  useEffect(() => {
    loadTutorsWithAvailability();
  }, []);

  const loadTutorsWithAvailability = async () => {
    try {
      setLoading(true);
      
      // Fetch tutors with profiles and courses
      const { data: tutorsData, error: tutorsError } = await supabase
        .from('tutor_profiles')
        .select('*')
        .not('user_id', 'is', null);

      console.log('🔍 Raw tutors data from database:', tutorsData);
      console.log('🔍 Tutors error:', tutorsError);

      if (tutorsError) {
        console.error('Error loading tutors:', tutorsError);
        toast({
          title: "Error",
          description: "Failed to load tutors. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Fetch profiles and courses separately for each tutor
      const tutorsWithDetails = await Promise.all(
        (tutorsData || []).map(async (tutor) => {
          let profileData = null;
          let coursesData = [];

          try {
            // Get profile information
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, profile_photo_url, city, area')
              .eq('user_id', tutor.user_id)
              .single();

            if (!profileError && profile) {
              profileData = profile;
            } else {
              console.warn(`Could not fetch profile for tutor ${tutor.user_id}:`, profileError);
            }
          } catch (error) {
            console.warn(`Error fetching profile for tutor ${tutor.user_id}:`, error);
          }

          try {
            // Get courses for this tutor
            const { data: courses, error: coursesError } = await supabase
              .from('courses')
              .select('*')
              .eq('tutor_id', tutor.user_id)
              .eq('is_active', true);

            if (!coursesError && courses) {
              coursesData = courses;
            } else {
              console.warn(`Could not fetch courses for tutor ${tutor.user_id}:`, coursesError);
            }
          } catch (error) {
            console.warn(`Error fetching courses for tutor ${tutor.user_id}:`, error);
          }

          return {
            ...tutor,
            profile: profileData || {
              full_name: 'Unknown Tutor',
              profile_photo_url: '',
              city: '',
              area: ''
            },
            courses: coursesData || []
          };
        })
      );

      if (tutorsError) {
        console.error('Error loading tutors:', tutorsError);
        toast({
          title: "Error",
          description: "Failed to load tutors. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Process tutors and add available slots
      const processedTutors = (tutorsWithDetails || []).map(tutor => {
        console.log('🔍 Processing tutor:', tutor.user_id, 'Profile:', tutor.profile?.full_name);
        
        const weeklySchedule = tutor.weekly_schedule || {};
        const availableSlots: AvailableSlot[] = [];
        
        // Generate available slots for the next occurrence of each available day
        const today = new Date();
        const processedDays = new Set<string>(); // Track which days we've already processed
        
        // Look ahead up to 14 days to find the next occurrence of each available day
        for (let i = 0; i < 14; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          
                      // Only process this day if we haven't processed it before and it's available
            if (!processedDays.has(dayName) && weeklySchedule[dayName]?.available && weeklySchedule[dayName].slots) {
              // Mark this day as processed
              processedDays.add(dayName);
              
              weeklySchedule[dayName].slots.forEach((slot: any) => {
                availableSlots.push({
                  day: date.toISOString().split('T')[0],
                  startTime: slot.start,
                  endTime: slot.end,
                  formattedStartTime: formatTime12Hour(slot.start),
                  formattedEndTime: formatTime12Hour(slot.end)
                });
              });
            }
        }

        console.log(`🔍 Total available slots for ${tutor.profile?.full_name}:`, availableSlots.length);
        
        return {
          ...tutor,
          availableSlots
        };
      });

      setTutors(processedTutors);
      
      // Extract unique subjects for filter
      const uniqueSubjects = new Set<string>();
      processedTutors.forEach(tutor => {
        if (tutor.courses) {
          tutor.courses.forEach(course => {
            if (course.subject) {
              uniqueSubjects.add(course.subject);
            }
          });
        }
      });
      setSubjects(Array.from(uniqueSubjects).filter(Boolean).sort());
      
    } catch (error) {
      console.error('Error in loadTutorsWithAvailability:', error);
      toast({
        title: "Error",
        description: "Failed to load tutors. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = (tutor: TutorWithAvailability, slot: AvailableSlot) => {
    setSelectedTutor(tutor);
    setBookingForm({
      courseId: '',
      date: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      notes: ''
    });
    setShowBookingDialog(true);
  };

  const handleSubmitBooking = async () => {
    if (!selectedTutor || !bookingForm.courseId) {
      toast({
        title: "Error",
        description: "Please select a course and fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Create a new class/session record
      const { data: newClass, error: classError } = await supabase
        .from('classes')
        .insert({
          course_id: bookingForm.courseId,
          tutor_id: selectedTutor.user_id,
          student_id: (await supabase.auth.getUser()).data.user?.id,
          title: `Session with ${selectedTutor.profile?.full_name}`,
          description: bookingForm.notes || 'Booked session',
          start_time: `${bookingForm.date}T${bookingForm.startTime}:00`,
          end_time: `${bookingForm.date}T${bookingForm.endTime}:00`,
          duration_minutes: calculateDuration(bookingForm.startTime, bookingForm.endTime),
          status: 'scheduled',
          notes: bookingForm.notes
        })
        .select()
        .single();

      if (classError) {
        throw classError;
      }

      toast({
        title: "Success!",
        description: "Your session has been booked successfully. Check your My Classes tab for details.",
      });

      setShowBookingDialog(false);
      setSelectedTutor(null);
      setBookingForm({
        courseId: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: ''
      });

      // Refresh the tutors list to update availability
      loadTutorsWithAvailability();

    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading available tutors...</span>
      </div>
    );
  }

  // Filter tutors based on search, subject, and availability
  const filteredTutors = tutors.filter(tutor => {
    console.log(`🔍 Filtering tutor: ${tutor.profile?.full_name}`);
    console.log(`🔍 Available slots: ${tutor.availableSlots.length}`);
    console.log(`🔍 Has profile: ${tutor.profile && tutor.profile.full_name !== 'Unknown Tutor'}`);
    
    const matchesSearch = tutor.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = subjectFilter === 'all' || 
                          tutor.courses?.some(course => course.subject === subjectFilter);
    
    console.log(`🔍 Subject filter: ${subjectFilter}, Tutor courses:`, tutor.courses?.map(c => c.subject));
    console.log(`🔍 Matches subject: ${matchesSubject}`);
    
    const hasAvailability = tutor.availableSlots.length > 0;
    const hasProfile = tutor.profile && tutor.profile.full_name !== 'Unknown Tutor';
    
    const shouldInclude = matchesSearch && matchesSubject && hasAvailability && hasProfile;
    console.log(`🔍 Should include: ${shouldInclude} (search: ${matchesSearch}, subject: ${matchesSubject}, availability: ${hasAvailability}, profile: ${hasProfile})`);
    
    return shouldInclude;
  });

  console.log(`🔍 Final filtered tutors count: ${filteredTutors.length}`);
  filteredTutors.forEach(tutor => {
    console.log(`🔍 Filtered tutor: ${tutor.profile?.full_name} with ${tutor.availableSlots.length} slots`);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Sessions</h1>
          <p className="text-gray-600 mt-2">
            Browse available tutors and book sessions within their available time slots
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tutors by name or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filteredTutors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors available</h3>
            <p className="text-gray-600 text-center">
              {searchTerm || subjectFilter !== 'all' 
                ? "Try adjusting your search or filters to find available tutors."
                : "No tutors have set their availability yet. Check back later!"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredTutors.map((tutor) => (
            <Card key={tutor.user_id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tutor.profile?.avatar_url} />
                      <AvatarFallback>
                        {tutor.profile?.full_name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{tutor.profile?.full_name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{tutor.teaching_mode || 'Online'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{tutor.experience_years || 0} years experience</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <span>{tutor.timezone || 'Asia/Kolkata'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-2">
                      {tutor.availableSlots.length} slots available
                    </Badge>
                    <div className="text-sm text-gray-600">
                      ₹{tutor.hourly_rate_min || 0} - ₹{tutor.hourly_rate_max || 0}/hr
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Bio */}
                {tutor.bio && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">About</h4>
                    <p className="text-gray-600">{tutor.bio}</p>
                  </div>
                )}

                {/* Available Slots */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Available Time Slots</h4>
                  <div className="grid gap-3">
                    {tutor.availableSlots.slice(0, 6).map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{formatDate(slot.day)}</span>
                          <Clock className="h-4 w-4 text-green-600" />
                          <span>{slot.formattedStartTime} - {slot.formattedEndTime}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleBookSession(tutor, slot)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Book Session
                        </Button>
                      </div>
                    ))}
                    {tutor.availableSlots.length > 6 && (
                      <div className="text-center text-sm text-gray-600">
                        +{tutor.availableSlots.length - 6} more slots available
                      </div>
                    )}
                  </div>
                </div>

                {/* Courses */}
                {tutor.courses && tutor.courses.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Available Courses</h4>
                    <div className="flex flex-wrap gap-2">
                      {tutor.courses.map((course) => (
                        <Badge key={course.id} variant="outline" className="text-sm">
                          {course.subject} - {course.level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      {showBookingDialog && selectedTutor && (
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book Session with {selectedTutor.profile?.full_name}</DialogTitle>
              <DialogDescription>
                Confirm your session details and add any special requirements.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Session Details */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Session Details</div>
                <div className="space-y-1 text-sm">
                  <div><strong>Date:</strong> {formatDate(bookingForm.date)}</div>
                  <div><strong>Time:</strong> {formatTime12Hour(bookingForm.startTime)} - {formatTime12Hour(bookingForm.endTime)}</div>
                  <div><strong>Duration:</strong> {calculateDuration(bookingForm.startTime, bookingForm.endTime)} minutes</div>
                </div>
              </div>

              {/* Course Selection */}
              <div className="space-y-2">
                <Label htmlFor="course">Select Course *</Label>
                <Select value={bookingForm.courseId} onValueChange={(value) => setBookingForm(prev => ({ ...prev, courseId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTutor.courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.subject} - {course.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Special Requirements (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific topics you'd like to cover or special requirements..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitBooking}
                  disabled={submitting || !bookingForm.courseId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
