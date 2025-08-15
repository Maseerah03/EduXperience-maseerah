import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { getPendingTutorProfile, clearPendingTutorProfile } from "@/lib/profile-creation";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home as HomeIcon,
  Users,
  Calendar,
  MessageCircle,
  Wallet,
  User,
  HelpCircle,
  ChevronRight,
  BookOpen,
  CheckCircle,
  Edit,
  Send,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Filter,
  LogOut,
  Plus,
  Settings,
  BarChart3,
  Loader2,
  Globe,
  Check,
  X,
  Save,
  Play,
  FileText,
  Award,
  Eye,
  Shield,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";

type TutorProfile = Tables<"tutor_profiles">;
type Profile = Tables<"profiles">;

interface DashboardState {
  activeTab: string;
  showProfileDialog: boolean;
  showStudentManagement: boolean;
  showMessaging: boolean;
  selectedStudent: any | null;
}

export default function TutorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0); // number of unread messages for this tutor
  const [state, setState] = useState<DashboardState>({
    activeTab: "dashboard",
    showProfileDialog: false,
    showStudentManagement: false,
    showMessaging: false,
    selectedStudent: null,
  });

  // Debug state changes
  useEffect(() => {
    console.log('=== STATE DEBUG ===');
    console.log('Current state:', state);
    console.log('showProfileDialog:', state.showProfileDialog);
    console.log('userProfile:', userProfile);
    console.log('tutorProfile:', tutorProfile);
    console.log('=== END STATE DEBUG ===');
  }, [state, userProfile, tutorProfile]);

  // Debug profile dialog function
  const handleViewProfile = () => {
    try {
      console.log('=== VIEW PROFILE DEBUG ===');
      console.log('handleViewProfile called');
      console.log('Current state before:', state);
      console.log('Setting showProfileDialog to true');
      setState(prev => {
        const newState = { ...prev, showProfileDialog: true };
        console.log('New state:', newState);
        return newState;
      });
      console.log('=== END VIEW PROFILE DEBUG ===');
    } catch (error) {
      console.error('Error in handleViewProfile:', error);
      toast({
        title: "Error",
        description: "Failed to open profile dialog. Please check console for details.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadUserData(user.id);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      console.log('loadUserData called for userId:', userId);
      
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
      } else {
        console.log('Profile data loaded:', profileData);
        setUserProfile(profileData);
      }

      // Load tutor profile
      const { data: tutorData, error: tutorError } = await supabase
        .from("tutor_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (tutorError) {
        console.error("Error loading tutor profile:", tutorError);
      } else {
        console.log('Tutor profile data loaded:', tutorData);
        setTutorProfile(tutorData);
      }

      // Load students (tutor's students)
      await loadStudents();
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleLogout = async () => {
    // Don't clear saved credentials - let them persist for convenience
    // clearSavedCredentials(); // Commented out to keep credentials saved
    
    await supabase.auth.signOut();
    navigate("/");
  };

  const loadStudents = async () => {
    try {
      if (!user) return;

      console.log('Loading students for tutor:', user.id);

      // Load students who have shown interest in this tutor
      // This would typically come from notifications or a separate table
      // For now, let's load students from notifications where type is 'interest'
      const { data: interestNotifications, error: interestError } = await supabase
        .from('notifications')
        .select(`
          id,
          user_id,
          title,
          message,
          created_at,
          data
        `)
        .eq('type', 'interest')
        .order('created_at', { ascending: false });

      if (interestError) {
        console.error('Error loading interest notifications:', interestError);
        setStudents([]);
        return;
      }

      console.log('Interest notifications:', interestNotifications);

      // Get unique student IDs from interest notifications
      const studentIds = new Set();
      interestNotifications?.forEach(notification => {
        if (notification.data && notification.data.student_id) {
          studentIds.add(notification.data.student_id);
        }
      });

      console.log('Student IDs from interest:', Array.from(studentIds));

      // Load student profiles with photos
      const studentsList = [];
      for (const studentId of studentIds) {
        try {
          const { data: studentProfile, error: profileError } = await supabase
            .from('profiles')
            .select(`
              user_id,
              full_name,
              profile_photo_url,
              city,
              area,
              primary_language,
              education_level,
              learning_mode,
              subject_interests,
              budget_min,
              budget_max
            `)
            .eq('user_id', studentId)
            .single();

          if (profileError) {
            console.warn('Error fetching student profile for ID:', studentId, profileError);
            continue;
          }

          // Get student's learning preferences if available
          const { data: studentLearningData, error: learningError } = await supabase
            .from('student_profiles')
            .select(`
              education_level,
              learning_mode,
              subject_interests,
              budget_min,
              budget_max
            `)
            .eq('user_id', studentId)
            .single();

          // Find the most recent interest notification for this student
          const recentInterest = interestNotifications?.find(n => 
            n.data && n.data.student_id === studentId
          );

          studentsList.push({
            id: studentId,
            name: studentProfile.full_name || 'Student',
            profile_photo_url: studentProfile.profile_photo_url || '',
            city: studentProfile.city || '',
            area: studentProfile.area || '',
            primary_language: studentProfile.primary_language || '',
            education_level: studentLearningData?.education_level || '',
            learning_mode: studentLearningData?.learning_mode || '',
            subject_interests: studentLearningData?.subject_interests || [],
            budget_range: studentLearningData?.budget_min && studentLearningData?.budget_max 
              ? `₹${studentLearningData.budget_min}-${studentLearningData.budget_max}/hr`
              : 'Not specified',
            interest_date: recentInterest ? new Date(recentInterest.created_at).toLocaleDateString() : '',
            progress: Math.floor(Math.random() * 100), // Placeholder - would come from actual progress tracking
            lastClass: 'Not started yet' // Placeholder - would come from actual class history
          });
        } catch (error) {
          console.warn('Error processing student:', studentId, error);
          continue;
        }
      }

      console.log('Students list loaded:', studentsList);
      setStudents(studentsList);
    } catch (error) {
      console.error("Error loading students:", error);
      setStudents([]);
    }
  };

  const openChatWithStudent = async (studentUserId: string) => {
    try {
      // Fetch student name and profile photo for display
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, profile_photo_url')
        .eq('user_id', studentUserId)
        .single();

      setState(prev => ({
        ...prev,
        activeTab: 'messages',
        selectedStudent: {
          id: studentUserId,
          name: profile?.full_name || 'Student',
          profile_photo_url: profile?.profile_photo_url || ''
        }
      }));
    } catch (err) {
      console.error('Failed to open chat with student:', err);
      setState(prev => ({ ...prev, activeTab: 'messages' }));
    }
  };

  const updateProfile = async (formData: any) => {
    if (!user) return;

    try {
      console.log('updateProfile called with formData:', formData);
      console.log('Current userProfile:', userProfile);
      console.log('Current tutorProfile:', tutorProfile);
      
      // Debug specific fields
      console.log('=== FIELD DEBUG ===');
      console.log('currently_teaching:', formData.currently_teaching, 'type:', typeof formData.currently_teaching);
      console.log('demo_class:', formData.demo_class, 'type:', typeof formData.demo_class);
      console.log('demo_class_fee:', formData.demo_class_fee);
      console.log('current_teaching_place:', formData.current_teaching_place);
      console.log('=== END FIELD DEBUG ===');
      
      // Check if the database columns exist by querying the schema
      console.log('=== CHECKING DATABASE SCHEMA ===');
      try {
        const { data: columns, error: schemaError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_name', 'tutor_profiles')
          .eq('table_schema', 'public');
        
        if (schemaError) {
          console.error('Error checking schema:', schemaError);
        } else {
          console.log('Available columns in tutor_profiles:', columns);
          const hasCurrentlyTeaching = columns?.some(col => col.column_name === 'currently_teaching');
          const hasDemoClass = columns?.some(col => col.column_name === 'demo_class');
          const hasDemoClassFee = columns?.some(col => col.column_name === 'demo_class_fee');
          const hasCurrentTeachingPlace = columns?.some(col => col.column_name === 'current_teaching_place');
          
          console.log('Column existence check:');
          console.log('- currently_teaching exists:', hasCurrentlyTeaching);
          console.log('- demo_class exists:', hasDemoClass);
          console.log('- demo_class_fee exists:', hasDemoClassFee);
          console.log('- current_teaching_place exists:', hasCurrentTeachingPlace);
        }
      } catch (schemaCheckError) {
        console.error('Error checking schema:', schemaCheckError);
      }
      console.log('=== END SCHEMA CHECK ===');
      
      // Calculate profile completion percentage
      const profileFields = [
        // Basic Information (profiles table)
        formData.full_name || userProfile?.full_name,
        formData.city || userProfile?.city,
        formData.area || userProfile?.area,
        formData.primary_language || userProfile?.primary_language,
        
        // Professional Details (tutor_profiles table)
        formData.title || tutorProfile?.title,
        formData.mobile_number || tutorProfile?.mobile_number,
        formData.date_of_birth || tutorProfile?.date_of_birth,
        formData.gender || tutorProfile?.gender,
        formData.pin_code || tutorProfile?.pin_code,
        formData.bio || tutorProfile?.bio,
        formData.experience_years || tutorProfile?.experience_years,
        formData.response_time_hours || tutorProfile?.response_time_hours,
        formData.hourly_rate_min || tutorProfile?.hourly_rate_min,
        formData.hourly_rate_max || tutorProfile?.hourly_rate_max,
        formData.teaching_mode || tutorProfile?.teaching_mode,
        formData.qualifications || tutorProfile?.qualifications,
        formData.highest_qualification || tutorProfile?.highest_qualification,
        formData.university_name || tutorProfile?.university_name,
        formData.year_of_passing || tutorProfile?.year_of_passing,
        formData.percentage || tutorProfile?.percentage,
        formData.teaching_experience || tutorProfile?.teaching_experience,
        formData.currently_teaching !== null ? (formData.currently_teaching !== undefined) : (tutorProfile?.currently_teaching !== null),
        formData.current_teaching_place || tutorProfile?.current_teaching_place,
        formData.subjects || tutorProfile?.subjects,
        formData.student_levels || tutorProfile?.student_levels,
        formData.curriculum || tutorProfile?.curriculum,
        formData.class_type || tutorProfile?.class_type,
        formData.max_travel_distance || tutorProfile?.max_travel_distance,
        formData.class_size || tutorProfile?.class_size,
        formData.available_days || tutorProfile?.available_days,
        formData.individual_fee || tutorProfile?.individual_fee,
        formData.group_fee || tutorProfile?.group_fee,
        formData.home_tuition_fee || tutorProfile?.home_tuition_fee,
        formData.demo_class !== null ? (formData.demo_class !== undefined) : (tutorProfile?.demo_class !== null),
        formData.demo_class_fee || tutorProfile?.demo_class_fee,
        formData.assignment_help || tutorProfile?.assignment_help,
        formData.test_preparation || tutorProfile?.test_preparation,
        formData.homework_support || tutorProfile?.homework_support,
        formData.weekend_classes || tutorProfile?.weekend_classes,
        formData.profile_headline || tutorProfile?.profile_headline,
        formData.teaching_methodology || tutorProfile?.teaching_methodology,
        formData.why_choose_me || tutorProfile?.why_choose_me,
        formData.languages || tutorProfile?.languages,
      ];

      const filledFields = profileFields.filter(field => {
        if (field === null || field === undefined) return false;
        if (typeof field === 'boolean') return true; // Boolean values (true/false) count as filled
        if (Array.isArray(field)) return field.length > 0;
        if (typeof field === 'number') return field > 0;
        if (typeof field === 'string') return field.trim() !== '';
        return true; // Any other type counts as filled
      }).length;

      const totalFields = profileFields.length;
      const profileCompletionPercentage = Math.round((filledFields / totalFields) * 100);

      console.log('=== PROFILE COMPLETION DEBUG ===');
      console.log('Total fields:', totalFields);
      console.log('Filled fields:', filledFields);
      console.log('Profile completion percentage calculated:', profileCompletionPercentage);
      console.log('Field details:');
      profileFields.forEach((field, index) => {
        const fieldNames = [
          'full_name', 'city', 'area', 'primary_language', 'title', 'mobile_number', 
          'date_of_birth', 'gender', 'pin_code', 'bio', 'experience_years', 
          'response_time_hours', 'hourly_rate_min', 'hourly_rate_max', 'teaching_mode', 'qualifications',
          'highest_qualification', 'university_name', 'year_of_passing', 'percentage',
          'teaching_experience', 'currently_teaching', 'current_teaching_place',
          'subjects', 'student_levels', 'curriculum', 'class_type', 'max_travel_distance',
          'class_size', 'available_days', 'individual_fee', 'group_fee', 'home_tuition_fee',
          'demo_class', 'demo_class_fee', 'assignment_help', 'test_preparation',
          'homework_support', 'weekend_classes', 'profile_headline', 'teaching_methodology',
          'why_choose_me', 'languages'
        ];
        console.log(`  ${fieldNames[index]}: ${field} (${typeof field})`);
      });
      console.log('=== END PROFILE COMPLETION DEBUG ===');
      
      // Update both profiles and tutor_profiles tables
      const profileUpdateData = {
        user_id: user.id,
        full_name: formData.full_name || userProfile?.full_name,
        city: formData.city || userProfile?.city,
        area: formData.area || userProfile?.area,
        primary_language: formData.primary_language || userProfile?.primary_language,
        profile_photo_url: formData.profile_photo_url || userProfile?.profile_photo_url,
        updated_at: new Date().toISOString(),
      };

      console.log('Updating profiles table with:', profileUpdateData);

      const { error: profileErr } = await supabase
        .from("profiles")
        .upsert(profileUpdateData, { onConflict: "user_id" });

      if (profileErr) {
        console.error('Error updating profiles table:', profileErr);
        throw profileErr;
      }

      console.log('Profiles table updated successfully');

      const tutorUpdateData = {
        user_id: user.id,
        title: formData.title || tutorProfile?.title,
        mobile_number: formData.mobile_number || tutorProfile?.mobile_number,
        date_of_birth: formData.date_of_birth || tutorProfile?.date_of_birth,
        gender: formData.gender || tutorProfile?.gender,
        pin_code: formData.pin_code || tutorProfile?.pin_code,
        bio: formData.bio || tutorProfile?.bio,
        experience_years: formData.experience_years || tutorProfile?.experience_years,
        response_time_hours: formData.response_time_hours || tutorProfile?.response_time_hours || 24,
        hourly_rate_min: formData.hourly_rate_min || tutorProfile?.hourly_rate_min,
        hourly_rate_max: formData.hourly_rate_max || tutorProfile?.hourly_rate_max,
        teaching_mode: formData.teaching_mode || tutorProfile?.teaching_mode,
        qualifications: formData.qualifications || tutorProfile?.qualifications,
        highest_qualification: formData.highest_qualification || tutorProfile?.highest_qualification,
        university_name: formData.university_name || tutorProfile?.university_name,
        year_of_passing: formData.year_of_passing || tutorProfile?.year_of_passing,
        percentage: formData.percentage || tutorProfile?.percentage,
        teaching_experience: formData.teaching_experience || tutorProfile?.teaching_experience,
        currently_teaching: formData.currently_teaching || tutorProfile?.currently_teaching,
        current_teaching_place: formData.current_teaching_place || tutorProfile?.current_teaching_place,
        subjects: formData.subjects || tutorProfile?.subjects,
        student_levels: formData.student_levels || tutorProfile?.student_levels,
        curriculum: formData.curriculum || tutorProfile?.curriculum,
        class_type: formData.class_type || tutorProfile?.class_type,
        max_travel_distance: formData.max_travel_distance || tutorProfile?.max_travel_distance,
        class_size: formData.class_size || tutorProfile?.class_size,
        available_days: formData.available_days || tutorProfile?.available_days,
        individual_fee: formData.individual_fee || tutorProfile?.individual_fee,
        group_fee: formData.group_fee || tutorProfile?.group_fee,
        home_tuition_fee: formData.home_tuition_fee || tutorProfile?.home_tuition_fee,
        demo_class: formData.demo_class || tutorProfile?.demo_class,
        demo_class_fee: formData.demo_class_fee || tutorProfile?.demo_class_fee,
        assignment_help: formData.assignment_help || tutorProfile?.assignment_help,
        test_preparation: formData.test_preparation || tutorProfile?.test_preparation,
        homework_support: formData.homework_support || tutorProfile?.homework_support,
        weekend_classes: formData.weekend_classes || tutorProfile?.weekend_classes,
        profile_headline: formData.profile_headline || tutorProfile?.profile_headline,
        teaching_methodology: formData.teaching_methodology || tutorProfile?.teaching_methodology,
        why_choose_me: formData.why_choose_me || tutorProfile?.why_choose_me,
        languages: formData.languages || tutorProfile?.languages,
        profile_photo_url: formData.profile_photo_url || tutorProfile?.profile_photo_url,
        availability: formData.availability || tutorProfile?.availability,
        profile_completion_percentage: profileCompletionPercentage,
        updated_at: new Date().toISOString(),
      };

      console.log('=== TUTOR UPDATE DATA DEBUG ===');
      console.log('currently_teaching in update data:', tutorUpdateData.currently_teaching);
      console.log('demo_class in update data:', tutorUpdateData.demo_class);
      console.log('demo_class_fee in update data:', tutorUpdateData.demo_class_fee);
      console.log('current_teaching_place in update data:', tutorUpdateData.current_teaching_place);
      console.log('=== END TUTOR UPDATE DEBUG ===');

      console.log('Updating tutor_profiles table with:', tutorUpdateData);

      const { error: tutorErr, data: tutorResult } = await supabase
        .from("tutor_profiles")
        .upsert(tutorUpdateData, { onConflict: "user_id" });

      if (tutorErr) {
        console.error('Error updating tutor_profiles table:', tutorErr);
        console.error('Error details:', {
          message: tutorErr.message,
          details: tutorErr.details,
          hint: tutorErr.hint,
          code: tutorErr.code
        });
        throw tutorErr;
      }

      console.log('Tutor_profiles table updated successfully');
      console.log('Update result:', tutorResult);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      console.log('Reloading user data...');
      await loadUserData(user.id);
      console.log('User data reloaded');
      
      // Don't close the dialog here - let handleSubmit handle it
      // setState(prev => ({ ...prev, showProfileDialog: false }));
    } catch (error) {
      // Log the full error object for debugging
      console.error("Error updating profile:", error, JSON.stringify(error));
      let errorMsg = "Failed to update profile.";
      if (error && typeof error === 'object') {
        if ('message' in error && error.message) errorMsg = error.message;
        else errorMsg = JSON.stringify(error);
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'interest')
          .order('created_at', { ascending: false })
          .limit(5);

        if (notificationsData) {
          // Fetch student profile information for each notification
          const notificationsWithProfiles = await Promise.all(
            notificationsData.map(async (notification) => {
              try {
                // Extract student ID from notification data
                const studentId = notification.data?.student_id || notification.data?.sender_id;
                if (!studentId) return notification;

                // Fetch student profile information
                const { data: studentProfile } = await supabase
                  .from('profiles')
                  .select('user_id, full_name, profile_photo_url, city, area')
                  .eq('user_id', studentId)
                  .single();

                if (studentProfile) {
                  return {
                    ...notification,
                    studentProfile: {
                      id: studentProfile.user_id,
                      name: studentProfile.full_name || 'Student',
                      profile_photo_url: studentProfile.profile_photo_url || '',
                      city: studentProfile.city || '',
                      area: studentProfile.area || ''
                    }
                  };
                }
                return notification;
              } catch (error) {
                console.warn('Error fetching student profile for notification:', error);
                return notification;
              }
            })
          );

          setNotifications(notificationsWithProfiles);
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  // Load unread messages count for badge
  const loadUnreadMessagesCount = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false);
      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (err) {
      console.error('Error loading unread messages count:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadMessagesCount();
    }
  }, [user, loadNotifications, loadUnreadMessagesCount]);

  // Set up real-time subscription for notifications (interest and message)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tutor-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new.type === 'interest' || payload.new.type === 'message') {
            setNotifications(prev => [payload.new, ...prev.slice(0, 4)]);
            toast({
              title: payload.new.type === 'interest' ? 'New Student Interest!' : 'New Message',
              description: payload.new.message,
            });
            if (payload.new.type === 'message') {
              // Refresh unread messages count when new message notification arrives
              loadUnreadMessagesCount();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, loadUnreadMessagesCount]);

  // Subscribe to direct message table changes to keep unread count accurate
  useEffect(() => {
    if (!user) return;

    const messagesChannel = supabase
      .channel('tutor-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        () => {
          loadUnreadMessagesCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, loadUnreadMessagesCount]);



  // Call the test function when component mounts
  useEffect(() => {
    if (user) {
      // Removed testDatabaseSchema call since it's now in ProfileEditDialog
      console.log('User loaded, ready to use dashboard');
    }
  }, [user]);

  // Error boundary for the component
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Global error caught:', error);
      toast({
        title: "Error",
        description: "An error occurred. Please check console for details.",
        variant: "destructive",
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const navMenu = [
    { label: "Dashboard", icon: <HomeIcon />, id: "dashboard" },
    { label: "Students", icon: <Users />, id: "students" },
    { label: "Schedule", icon: <Calendar />, id: "schedule" },
    { label: "Messages", icon: <MessageCircle />, id: "messages", badge: unreadCount > 0 ? unreadCount : undefined },
    { label: "Earnings", icon: <Wallet />, id: "earnings" },
    { label: "Help", icon: <HelpCircle />, id: "help" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <SidebarProvider>
        <div className="flex flex-1">
          {/* Sidebar Navigation */}
          <Sidebar className="bg-sidebar border-r">
            <SidebarContent>
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-primary">EduXperience</h2>
                <p className="text-sm text-muted-foreground">Tutor Dashboard</p>
              </div>
              <SidebarMenu>
                {navMenu.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      isActive={state.activeTab === item.id}
                      onClick={() => setState(prev => ({ ...prev, activeTab: item.id }))}
                      className="flex items-center gap-3"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6 md:p-10 bg-background overflow-y-auto">
            {state.activeTab === "dashboard" && (
              <DashboardHome 
                userProfile={userProfile}
                tutorProfile={tutorProfile}
                students={students}
                onViewProfile={handleViewProfile}
                onViewStudents={() => setState(prev => ({ ...prev, activeTab: "students" }))}
                onViewMessages={() => setState(prev => ({ ...prev, activeTab: "messages" }))}
                onOpenChatWithStudent={openChatWithStudent}
              />
            )}

            {state.activeTab === "students" && (
              <StudentManagement 
                students={students}
                onSelectStudent={(student) => setState(prev => ({ ...prev, selectedStudent: student }))}
              />
            )}

            {state.activeTab === "messages" && (
              <MessagingDashboard 
                selectedStudent={state.selectedStudent}
                onBackToStudents={() => setState(prev => ({ ...prev, activeTab: "students" }))}
                onOpenChatWithStudent={openChatWithStudent}
              />
            )}



            {state.activeTab === "schedule" && (
              <ScheduleDashboard tutorProfile={tutorProfile} />
            )}

            {state.activeTab === "earnings" && (
              <EarningsDashboard />
            )}

            {state.activeTab === "help" && (
              <HelpSupport />
            )}
          </main>
        </div>
      </SidebarProvider>

      {/* Profile Edit Dialog */}
      {state.showProfileDialog && (
        <ProfileEditDialog
          userProfile={userProfile}
          tutorProfile={tutorProfile}
          onUpdate={updateProfile}
          onClose={() => setState(prev => ({ ...prev, showProfileDialog: false }))}
        />
      )}

      {/* Debug Test Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => {
            console.log('Debug button clicked');
            console.log('Current state:', state);
            setState(prev => ({ ...prev, showProfileDialog: !prev.showProfileDialog }));
          }}
          variant="outline"
          size="sm"
        >
          🐛 Debug: {state.showProfileDialog ? 'Close' : 'Open'} Dialog
        </Button>
      </div>
    </div>
  );
}

// Dashboard Home Component
function DashboardHome({ 
  userProfile, 
  tutorProfile, 
  students, 
  onViewProfile, 
  onViewStudents, 
  onViewMessages, 
  onOpenChatWithStudent
}: {
  userProfile: Profile | null;
  tutorProfile: TutorProfile | null;
  students: any[];
  onViewProfile: () => void;
  onViewStudents: () => void;
  onViewMessages: () => void;
  onOpenChatWithStudent: (studentUserId: string) => void;
}) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'interest')
          .order('created_at', { ascending: false })
          .limit(5);

        if (notificationsData) {
          // Fetch student profile information for each notification
          const notificationsWithProfiles = await Promise.all(
            notificationsData.map(async (notification) => {
              try {
                // Extract student ID from notification data
                const studentId = notification.data?.student_id || notification.data?.sender_id;
                if (!studentId) return notification;

                // Fetch student profile information
                const { data: studentProfile } = await supabase
                  .from('profiles')
                  .select('user_id, full_name, profile_photo_url, city, area')
                  .eq('user_id', studentId)
                  .single();

                if (studentProfile) {
                  return {
                    ...notification,
                    studentProfile: {
                      id: studentProfile.user_id,
                      name: studentProfile.full_name || 'Student',
                      profile_photo_url: studentProfile.profile_photo_url || '',
                      city: studentProfile.city || '',
                      area: studentProfile.area || ''
                    }
                  };
                }
                return notification;
              } catch (error) {
                console.warn('Error fetching student profile for notification:', error);
                return notification;
              }
            })
          );

          setNotifications(notificationsWithProfiles);
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [earnings, setEarnings] = useState({
    thisMonth: 0,
    lastMonth: 0,
    totalStudents: students.length,
    totalClasses: 0,
    successRate: '0%',
    averageRating: tutorProfile?.rating || 0,
  });

  useEffect(() => {
    // Load recent activity from database
    loadRecentActivity();
    loadEarnings();
    // Calculate response time based on actual message data
    calculateResponseTime();
  }, []);

  const loadRecentActivity = async () => {
    try {
      // This would fetch real activity data from the database
      // For now, we'll keep it empty until we have activity tracking implemented
      setRecentActivity([]);
    } catch (error) {
      console.error("Error loading recent activity:", error);
    }
  };

  const loadEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // TODO: Implement when earnings/classes tables are available
      // For now, we'll use the data we have available
      setEarnings({
        thisMonth: 0, // TODO: Fetch from earnings table
        lastMonth: 0, // TODO: Fetch from earnings table
        totalStudents: students.length,
        totalClasses: 0, // TODO: Fetch from classes table
        successRate: '0%', // TODO: Calculate from completed vs total classes
        averageRating: tutorProfile?.rating || 0,
      });
    } catch (error) {
      console.error("Error loading earnings:", error);
      // Set fallback values on error
      setEarnings({
        thisMonth: 0,
        lastMonth: 0,
        totalStudents: students.length,
        totalClasses: 0,
        successRate: '0%',
        averageRating: tutorProfile?.rating || 0,
      });
    }
  };

  // Function to calculate and update response time based on actual message data
  const calculateResponseTime = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get messages where this tutor is the receiver (students messaging the tutor)
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, created_at, content, sender_id, receiver_id')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100); // Get last 100 messages for calculation

      if (error) {
        console.error('Error fetching messages for response time calculation:', error);
        return;
      }

      if (!messages || messages.length === 0) {
        // No messages yet, set default response time
        await updateResponseTime(24); // Default 24 hours
        return;
      }

      // Group messages by conversation (sender_id) and calculate response times
      const conversationGroups = new Map();
      
      messages.forEach(message => {
        const senderId = message.sender_id;
        if (!conversationGroups.has(senderId)) {
          conversationGroups.set(senderId, []);
        }
        conversationGroups.get(senderId).push(message);
      });

      let totalResponseTime = 0;
      let responseCount = 0;

      // For each conversation, find response pairs
      for (const [senderId, conversationMessages] of conversationGroups) {
        // Sort messages by timestamp
        conversationMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        // Find pairs where student sends message and tutor responds
        for (let i = 0; i < conversationMessages.length - 1; i++) {
          const currentMessage = conversationMessages[i];
          const nextMessage = conversationMessages[i + 1];
          
          // If current message is from student and next is from tutor, calculate response time
          if (currentMessage.sender_id === senderId && nextMessage.receiver_id === senderId) {
            const responseTime = new Date(nextMessage.created_at).getTime() - new Date(currentMessage.created_at).getTime();
            const responseTimeHours = responseTime / (1000 * 60 * 60); // Convert to hours
            
            // Only count reasonable response times (less than 7 days to avoid outliers)
            if (responseTimeHours > 0 && responseTimeHours < 168) {
              totalResponseTime += responseTimeHours;
              responseCount++;
            }
          }
        }
      }

      if (responseCount > 0) {
        const averageResponseTime = Math.round(totalResponseTime / responseCount);
        await updateResponseTime(averageResponseTime);
      } else {
        // No response pairs found, set default
        await updateResponseTime(24);
      }

    } catch (error) {
      console.error('Error calculating response time:', error);
      // Set default response time on error
      await updateResponseTime(24);
    }
  };

  // Function to update response time in tutor profile
  const updateResponseTime = async (responseTimeHours: number) => {
    try {
      if (!tutorProfile?.id) return;

      const { error } = await supabase
        .from('tutor_profiles')
        .update({ response_time_hours: responseTimeHours })
        .eq('id', tutorProfile.id);

      if (error) {
        console.error('Error updating response time:', error);
      } else {
        // Update local state
        setTutorProfile(prev => prev ? { ...prev, response_time_hours: responseTimeHours } : null);
      }
    } catch (error) {
      console.error('Error updating response time:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={userProfile?.profile_photo_url || ""} 
              alt={`${userProfile?.full_name || "Tutor"}'s profile photo`}
            />
            <AvatarFallback className="text-xl font-semibold">
              {userProfile?.full_name?.split(" ").map(n => n[0]).join("") || "T"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, <span className="text-primary">{userProfile?.full_name || ""}</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold">{earnings.averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({tutorProfile?.total_reviews || 0} reviews)</span>
              </div>
              <Badge variant={tutorProfile?.verified ? "default" : "secondary"}>
                {tutorProfile?.verified ? "Verified" : "Pending Verification"}
              </Badge>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Profile: {(() => {
                  if (!userProfile && !tutorProfile) return 0;
                  
                  const profileFields = [
                    userProfile?.full_name,
                    userProfile?.city,
                    userProfile?.area,
                    userProfile?.primary_language,
                    tutorProfile?.title,
                    tutorProfile?.mobile_number,
                    tutorProfile?.date_of_birth,
                    tutorProfile?.gender,
                    tutorProfile?.pin_code,
                    tutorProfile?.bio,
                    tutorProfile?.experience_years,
                    tutorProfile?.hourly_rate_min,
                    tutorProfile?.hourly_rate_max,
                    tutorProfile?.teaching_mode,
                    tutorProfile?.qualifications,
                    tutorProfile?.highest_qualification,
                    tutorProfile?.university_name,
                    tutorProfile?.year_of_passing,
                    tutorProfile?.percentage,
                    tutorProfile?.teaching_experience,
                    tutorProfile?.currently_teaching !== null,
                    tutorProfile?.current_teaching_place,
                    tutorProfile?.subjects,
                    tutorProfile?.student_levels,
                    tutorProfile?.curriculum,
                    tutorProfile?.class_type,
                    tutorProfile?.max_travel_distance,
                    tutorProfile?.class_size,
                    tutorProfile?.available_days,
                    tutorProfile?.individual_fee,
                    tutorProfile?.group_fee,
                    tutorProfile?.home_tuition_fee,
                    tutorProfile?.demo_class !== null,
                    tutorProfile?.demo_class_fee,
                    tutorProfile?.assignment_help,
                    tutorProfile?.test_preparation,
                    tutorProfile?.homework_support,
                    tutorProfile?.weekend_classes,
                    tutorProfile?.profile_headline,
                    tutorProfile?.teaching_methodology,
                    tutorProfile?.why_choose_me,
                    tutorProfile?.languages,
                  ];

                  const filledFields = profileFields.filter(field => {
                    if (field === null || field === undefined) return false;
                    if (typeof field === 'boolean') return true;
                    if (Array.isArray(field)) return field.length > 0;
                    if (typeof field === 'number') return field > 0;
                    if (typeof field === 'string') return field.trim() !== '';
                    return true;
                  }).length;

                  const totalFields = profileFields.length;
                  return Math.round((filledFields / totalFields) * 100);
                })()}%</span>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={onViewProfile}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">₹{earnings.thisMonth.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{earnings.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classes This Week</p>
                <p className="text-2xl font-bold">{earnings.totalClasses || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{earnings.successRate || '0%'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Info Cards */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Your Profile Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Experience in Years */}
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 rounded-full p-3 mb-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {tutorProfile?.experience_years || 0}
                </h3>
                <p className="text-sm text-gray-600">Years Experience</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Students Taught */}
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-green-100 rounded-full p-3 mb-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {earnings.totalStudents || 0}
                </h3>
                <p className="text-sm text-gray-600">Students Taught</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Classes Completed */}
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-purple-100 rounded-full p-3 mb-3">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {earnings.totalClasses || 0}
                </h3>
                <p className="text-sm text-gray-600">Classes Completed</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Response Time */}
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-orange-100 rounded-full p-3 mb-3">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {tutorProfile?.response_time_hours || 0}
                </h3>
                <p className="text-sm text-gray-600">Response Time (hrs)</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Languages */}
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-indigo-100 rounded-full p-3 mb-3">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {Array.isArray(tutorProfile?.languages) ? tutorProfile.languages.length : 0}
                </h3>
                <p className="text-sm text-gray-600">Languages</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Languages List (if available) */}
        {Array.isArray(tutorProfile?.languages) && tutorProfile.languages.length > 0 && (
          <div className="mt-4">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-gray-900">Languages Spoken</h4>
                <div className="flex flex-wrap gap-2">
                  {tutorProfile.languages.map((language: string, index: number) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>



      {/* Subjects Taught - Detailed Cards */}
      <section>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Subjects Taught
        </h3>
        
        {(tutorProfile?.subjects && Array.isArray(tutorProfile.subjects) && tutorProfile.subjects.length > 0) || 
         (tutorProfile?.qualifications?.subjects && Array.isArray(tutorProfile.qualifications.subjects) && tutorProfile.qualifications.subjects.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Use subjects from either direct field or qualifications */}
            {(tutorProfile?.subjects || tutorProfile?.qualifications?.subjects || []).map((subject: string, index: number) => (
              <Card key={index} className="border-2 border-blue-200 hover:border-blue-300 transition-colors shadow-soft hover:shadow-medium">
                <CardContent className="p-4">
                  {/* Subject Name */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg text-blue-700">{subject}</h4>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  
                  {/* Levels Taught */}
                  {(tutorProfile?.student_levels && Array.isArray(tutorProfile.student_levels) && tutorProfile.student_levels.length > 0) ||
                   (tutorProfile?.qualifications?.student_levels && Array.isArray(tutorProfile.qualifications.student_levels) && tutorProfile.qualifications.student_levels.length > 0) ? (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Levels:</p>
                      <div className="flex flex-wrap gap-1">
                        {(tutorProfile?.student_levels || tutorProfile?.qualifications?.student_levels || []).map((level: string, levelIndex: number) => (
                          <Badge key={levelIndex} variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Curriculum/Boards */}
                  {(tutorProfile?.curriculum && Array.isArray(tutorProfile.curriculum) && tutorProfile.curriculum.length > 0) ||
                   (tutorProfile?.qualifications?.curriculum && Array.isArray(tutorProfile.qualifications.curriculum) && tutorProfile.qualifications.curriculum.length > 0) ? (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Curriculum:</p>
                      <div className="flex flex-wrap gap-1">
                        {(tutorProfile?.curriculum || tutorProfile?.qualifications?.curriculum || []).map((board: string, boardIndex: number) => (
                          <Badge key={boardIndex} variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200">
                            {board}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Pricing Information */}
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Pricing:</p>
                    <div className="space-y-1 text-sm">
                      {tutorProfile?.individual_fee && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Individual:</span>
                          <span className="font-medium text-green-600">₹{tutorProfile.individual_fee}/hr</span>
                        </div>
                      )}
                      {tutorProfile?.group_fee && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Group:</span>
                          <span className="font-medium text-green-600">₹{tutorProfile.group_fee}/hr</span>
                        </div>
                      )}
                      {tutorProfile?.home_tuition_fee && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Home:</span>
                          <span className="font-medium text-green-600">₹{tutorProfile.home_tuition_fee}/hr</span>
                        </div>
                      )}
                      {!tutorProfile?.individual_fee && !tutorProfile?.group_fee && !tutorProfile?.home_tuition_fee && (
                        <p className="text-xs text-gray-500 italic">Contact for pricing</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No subjects added yet</p>
            <p className="text-sm text-gray-400 mb-4">Add subjects to your profile to start receiving student requests</p>
            <Button onClick={onViewProfile} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Add Subjects
            </Button>
          </div>
        )}
      </section>

      {/* Availability & Schedule */}
      <section>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Availability & Schedule
        </h3>
        
        {tutorProfile?.weekly_schedule && Object.values(tutorProfile.weekly_schedule).some(day => day.available) ? (
          <div className="space-y-4">
            {/* Timezone Info */}
            {tutorProfile?.timezone && (
              <div className="mb-4">
                <Card className="shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-700">Your Timezone</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      {tutorProfile.timezone}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Weekly Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
              {Object.entries(tutorProfile.weekly_schedule).map(([day, schedule]) => (
                <Card key={day} className={`shadow-soft ${schedule.available ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <CardContent className="p-3">
                    <div className="text-center">
                      <h4 className="font-semibold text-sm capitalize mb-2 text-gray-700">
                        {day}
                      </h4>
                      
                      {schedule.available ? (
                        <div className="space-y-2">
                          {schedule.slots && schedule.slots.length > 0 ? (
                            schedule.slots.map((slot, slotIndex) => (
                              <div key={slotIndex} className="text-xs bg-white rounded px-2 py-1 border">
                                <div className="font-medium text-blue-700">
                                  {slot.start} - {slot.end}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500 italic">
                              Available
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          Not Available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Edit Button */}
            <div className="text-center">
              <Button onClick={onViewProfile} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Update Schedule
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No availability set yet</p>
            <p className="text-sm text-gray-400 mb-4">Set your weekly schedule to let students know when you're available</p>
            <Button onClick={onViewProfile} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Set Availability
            </Button>
          </div>
        )}
      </section>

      {/* Reviews & Ratings */}
      <section>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-600" />
          Reviews & Ratings
        </h3>
        
        {tutorProfile?.total_reviews && tutorProfile.total_reviews > 0 ? (
          <div className="space-y-4">
            {/* Overall Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {tutorProfile.rating || 0}
                  </div>
                  <div className="flex items-center justify-center mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-5 w-5 ${
                          star <= (tutorProfile.rating || 0) 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {tutorProfile.total_reviews} total reviews
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Rating Breakdown</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm font-medium text-gray-600">{rating}</span>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ 
                              width: `${Math.round((Math.random() * 100))}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {Math.round(Math.random() * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Recent Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="text-sm font-medium text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Month</span>
                      <span className="text-sm font-medium text-blue-600">4.2★</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <span className="text-sm font-medium text-green-600">98%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reviews Preview */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Reviews</span>
                  <Button variant="outline" size="sm">
                    View All Reviews
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample Review - Replace with real data */}
                  <div className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          AS
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">Anonymous Student</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= 5 
                                    ? "text-yellow-500 fill-yellow-500" 
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          Excellent tutor! Very patient and explains concepts clearly.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Subject: Mathematics</span>
                          <span>Class Type: Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-semibold mb-2">No Reviews Yet</h4>
            <p className="text-gray-500 mb-4">You haven't received any reviews yet.</p>
            <p className="text-sm text-gray-400">Start teaching to receive your first review!</p>
          </div>
        )}
      </section>

      {/* Sample Content & Teaching Materials */}
      <section>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-green-600" />
          Sample Content & Teaching Materials
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Teaching Videos Card */}
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                Teaching Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Upload Teaching Videos</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Share sample lessons to showcase your teaching style
                </p>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Study Materials Card */}
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Study Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Upload Study Materials</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Share notes, practice problems, and formula sheets
                </p>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Student Work Examples Card */}
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Student Work Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Showcase Student Success</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Display examples of excellent student work and projects
                </p>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Example
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Management Actions */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="mr-3">
            <Settings className="h-4 w-4 mr-2" />
            Manage Content
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Profile
          </Button>
        </div>
      </section>

      {/* Contact Information Management */}
      <section>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Contact Information Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Details Overview */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                Current Contact Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Response Time Status */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Response Time</p>
                    <p className="text-sm text-blue-700">
                      {tutorProfile?.response_time_hours 
                        ? `${tutorProfile.response_time_hours} hours`
                        : "Not set - Set your response time"
                      }
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  Active
                </Badge>
              </div>

              {/* Verification Status */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Verification Status</p>
                    <p className="text-sm text-green-700">Contact information verified</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verified Contact
                </Badge>
              </div>

              {/* Contact Preferences */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <MessageCircle className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">In-app messaging</span>
                  <Badge variant="secondary" className="ml-auto">Enabled</Badge>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Schedule consultation</span>
                  <Badge variant="outline">Available</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Settings */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-4 text-gray-600" />
                Contact Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="responseTime" className="text-sm font-medium text-gray-700">
                  Set Response Time (hours)
                </Label>
                <Input
                  id="responseTime"
                  type="number"
                  placeholder="e.g., 2"
                  min="1"
                  max="48"
                  className="mt-1"
                  value={tutorProfile?.response_time_hours || ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setTutorProfile(prev => prev ? { ...prev, response_time_hours: value } : null);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  How quickly you typically respond to student inquiries
                </p>
              </div>

              <div>
                <Label htmlFor="contactHours" className="text-sm font-medium text-gray-700">
                  Preferred Contact Hours
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="morning"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <Label htmlFor="morning" className="text-sm text-gray-700">Morning</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="afternoon"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <Label htmlFor="afternoon" className="text-sm text-gray-700">Afternoon</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="evening"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <Label htmlFor="evening" className="text-sm text-gray-700">Evening</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="weekend"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="weekend" className="text-sm text-gray-700">Weekend</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="autoReply" className="text-sm font-medium text-gray-700">
                  Auto-Reply Message
                </Label>
                <Textarea
                  id="autoReply"
                  placeholder="Set an automatic reply message for when you're unavailable..."
                  className="mt-1 min-h-[80px] resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be sent automatically when you're offline
                </p>
              </div>

              <Button variant="outline" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Contact Preferences
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Analytics */}
        <div className="mt-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                Contact Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-blue-700">Messages Today</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">2.1h</div>
                  <div className="text-sm text-green-700">Avg Response Time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">98%</div>
                  <div className="text-sm text-purple-700">Response Rate</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">156</div>
                  <div className="text-sm text-orange-700">Total Inquiries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Content Management Forms */}
      <section>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-green-600" />
          Content Management
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teaching Videos Form */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                Add Teaching Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="videoTitle">Video Title</Label>
                  <Input
                    id="videoTitle"
                    placeholder="e.g., Introduction to Calculus"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="videoDescription">Description</Label>
                  <Textarea
                    id="videoDescription"
                    placeholder="Brief description of the video content..."
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="videoDuration">Duration (HH:MM)</Label>
                    <Input
                      id="videoDuration"
                      placeholder="15:30"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="videoFile">Video File</Label>
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/*"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="videoThumbnail">Thumbnail Image</Label>
                  <Input
                    id="videoThumbnail"
                    type="file"
                    accept="image/*"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Study Materials Form */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Add Study Material
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="materialTitle">Material Title</Label>
                  <Input
                    id="materialTitle"
                    placeholder="e.g., Calculus Notes"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="materialDescription">Description</Label>
                  <Textarea
                    id="materialDescription"
                    placeholder="Brief description of the material..."
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="materialFile">File</Label>
                    <Input
                      id="materialFile"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="materialType">Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notes">Notes</SelectItem>
                        <SelectItem value="practice_problems">Practice Problems</SelectItem>
                        <SelectItem value="formula_sheet">Formula Sheet</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Material
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Student Work Examples Form */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Add Student Work Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="workTitle">Work Title</Label>
                  <Input
                    id="workTitle"
                    placeholder="e.g., Calculus Project - Optimization"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="workDescription">Description</Label>
                  <Textarea
                    id="workDescription"
                    placeholder="Description of the student's work and achievements..."
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="workSubject">Subject</Label>
                    <Input
                      id="workSubject"
                      placeholder="e.g., Calculus"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workGrade">Grade/Score</Label>
                    <Input
                      id="workGrade"
                      placeholder="e.g., A+"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="workFile">Work File/Image</Label>
                  <Input
                    id="workFile"
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Example
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Certificates & Achievements Form */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Add Certificate/Achievement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="certTitle">Title</Label>
                  <Input
                    id="certTitle"
                    placeholder="e.g., Teaching Certification"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="certDescription">Description</Label>
                  <Textarea
                    id="certDescription"
                    placeholder="Brief description..."
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="certType">Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teaching">Teaching</SelectItem>
                        <SelectItem value="subject_mastery">Subject Mastery</SelectItem>
                        <SelectItem value="professional_development">Professional Development</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="certOrganization">Issuing Organization</Label>
                    <Input
                      id="certOrganization"
                      placeholder="e.g., National Teaching Board"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="certIssueDate">Issue Date</Label>
                    <Input
                      id="certIssueDate"
                      type="date"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certFile">Certificate File</Label>
                    <Input
                      id="certFile"
                      type="file"
                      accept=".pdf,.jpg,.png"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certificate
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button size="lg" className="bg-gradient-primary shadow-soft flex flex-col items-center justify-center gap-2 h-28" onClick={onViewStudents}>
          <Users className="h-6 w-6" />
          My Students
        </Button>
        <Button size="lg" className="bg-secondary text-secondary-foreground flex flex-col items-center justify-center gap-2 h-28">
          <Calendar className="h-6 w-6" />
          Schedule
        </Button>
        <Button size="lg" className="bg-accent text-accent-foreground flex flex-col items-center justify-center gap-2 h-28" onClick={onViewMessages}>
          <MessageCircle className="h-6 w-6" />
          Messages
        </Button>
        <Button size="lg" className="bg-muted text-foreground flex flex-col items-center justify-center gap-2 h-28 relative">
          <Wallet className="h-6 w-6" />
          Earnings
        </Button>
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentActivity.map((item, idx) => (
              <Card key={idx} className="shadow-soft">
                <CardContent className="p-4 flex items-center gap-3">
                  {item.type === "class" && <BookOpen className="text-primary" />}
                  {item.type === "message" && <MessageCircle className="text-secondary" />}
                  {item.type === "payment" && <DollarSign className="text-accent" />}
                  {item.type === "schedule" && <Calendar className="text-success" />}
                  <div className="flex-1">
                    <span className="text-muted-foreground">{item.text}</span>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No recent activity. Your activity will appear here once you start teaching!</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Interest Notifications */}
      {notifications.length > 0 && (
      <section>
          <h3 className="text-xl font-semibold mb-4">Student Interest</h3>
          <div className="space-y-3">
            {notifications.map((notification, idx) => (
              <Card key={idx} className="shadow-soft border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Student Profile Photo */}
                    {notification.studentProfile && (
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage 
                          src={notification.studentProfile.profile_photo_url || ""} 
                          alt={`${notification.studentProfile.name}'s profile photo`}
                        />
                        <AvatarFallback>
                          {notification.studentProfile.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {/* Notification Icon */}
                    <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                      {notification.type === 'message' ? <MessageCircle className="h-4 w-4 text-primary" /> : <Users className="h-4 w-4 text-primary" />}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{notification.title}</h4>
                        {notification.studentProfile && (
                          <span className="text-sm text-muted-foreground">
                            from {notification.studentProfile.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      {notification.studentProfile && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 {notification.studentProfile.city && notification.studentProfile.area 
                            ? `${notification.studentProfile.city}, ${notification.studentProfile.area}` 
                            : 'Location not specified'}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewMessages()}
                      >
                        View Messages
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const studentId = notification.data?.student_id || notification.data?.sender_id;
                          if (studentId) onOpenChatWithStudent(studentId);
                          else onViewMessages();
                        }}
                      >
                        {notification.type === 'message' ? 'Open Chat' : 'Message Student'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Top Students */}
      {students.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">My Students</h3>
            <Button variant="link" className="text-primary flex items-center gap-1 p-0 h-auto" onClick={onViewStudents}>
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {students.slice(0, 3).map((student, idx) => (
              <Card key={idx} className="shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarImage 
                        src={student.profile_photo_url || ""} 
                        alt={`${student.name}'s profile photo`}
                      />
                      <AvatarFallback>{student.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {student.city && student.area ? `${student.city}, ${student.area}` : 'Location not specified'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.education_level} • {student.learning_mode} • {student.budget_range}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{student.progress}%</span>
                    </div>
                    <Progress value={student.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">Last class: {student.lastClass}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Student Management Component
function StudentManagement({ 
  students, 
  onSelectStudent 
}: {
  students: any[];
  onSelectStudent: (student: any) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <h2 className="text-2xl font-bold">My Students</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, idx) => (
            <Card key={idx} className="shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage 
                      src={student.profile_photo_url || ""} 
                      alt={`${student.name}'s profile photo`}
                    />
                    <AvatarFallback>{student.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {student.city && student.area ? `${student.city}, ${student.area}` : 'Location not specified'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.education_level} • {student.learning_mode} • {student.budget_range}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{student.progress}%</span>
                  </div>
                  <Progress value={student.progress} className="h-2" />
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last: {student.lastClass}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => onSelectStudent(student)}
                  >
                    View Details
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No students enrolled yet. Your students will appear here once they enroll in your classes.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Messaging Dashboard Component
function MessagingDashboard({ 
  selectedStudent, 
  onBackToStudents,
  onOpenChatWithStudent
}: {
  selectedStudent: any | null;
  onBackToStudents: () => void;
  onOpenChatWithStudent: (studentUserId: string) => void;
}) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    // Load conversations from database
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      console.log('Loading conversations...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, returning early');
        return;
      }

      console.log('User ID:', user.id);

      // Get all messages where the current user is either sender or receiver
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          read,
          created_at
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      console.log('Messages data:', messagesData);

      // Get unique conversation partners (students)
      const studentIds = new Set();
      messagesData?.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        studentIds.add(partnerId);
      });

      console.log('Student IDs found:', Array.from(studentIds));

      // Get student profiles for each conversation partner
      const conversationsList = [];
      for (const studentId of studentIds) {
        // Get student profile
        const { data: studentData, error: studentError } = await supabase
          .from('profiles')
          .select(`
            user_id,
            full_name,
            profile_photo_url
          `)
          .eq('user_id', studentId)
          .single();

        if (studentError) {
          console.warn('Error fetching student profile for ID:', studentId, studentError);
          continue;
        }

        // Get the last message in this conversation
        const lastMessage = messagesData?.find(msg => 
          (msg.sender_id === user.id && msg.receiver_id === studentId) ||
          (msg.sender_id === studentId && msg.receiver_id === user.id)
        );

        // Check for unread messages
        const unreadCount = messagesData?.filter(msg => 
          msg.sender_id === studentId && 
          msg.receiver_id === user.id && 
          !msg.read
        ).length;

        conversationsList.push({
          id: studentId,
          student: studentData?.full_name || "",
          profile_photo_url: studentData?.profile_photo_url || "",
          lastMessage: lastMessage?.content || "",
          time: lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          unread: unreadCount > 0
        });
      }

      console.log('Conversations list:', conversationsList);
      setConversations(conversationsList);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedStudent) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages.",
          variant: "destructive",
        });
        return;
      }

      // Insert the message into the database
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedStudent.id,
          content: message.trim()
        });

      if (error) throw error;

      // Clear the message input
      setMessage("");
      
      // Reload conversations to show the new message
      loadConversations();

      // Create a notification for the student with tutor name (best-effort)
      try {
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        await supabase.rpc('create_notification', {
          p_user_id: selectedStudent.id,
          p_title: 'New Message',
          p_message: `You have a new message from ${senderProfile?.full_name || 'a tutor'}.`,
          p_type: 'message',
          p_data: { sender_id: user.id } as any
        });
      } catch (notifyErr) {
        console.warn('Notification creation failed (message sent ok):', notifyErr);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBackToStudents}>
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Students
        </Button>
        <h2 className="text-2xl font-bold">Messages</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div 
                    key={conv.id} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => onOpenChatWithStudent(conv.id)}
                  >
                    <Avatar>
                      <AvatarImage 
                        src={conv.profile_photo_url || ""} 
                        alt={`${conv.student}'s profile photo`}
                      />
                      <AvatarFallback>{conv.student.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{conv.student}</span>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                  </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-sm">No conversations yet.</p>
              </div>
            )}
          </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>
                {selectedStudent ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={selectedStudent.profile_photo_url || ""} 
                        alt={`${selectedStudent.name}'s profile photo`}
                      />
                      <AvatarFallback>{selectedStudent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <span>Chat with {selectedStudent.name}</span>
                  </div>
                ) : (
                  "Select a conversation"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {selectedStudent ? (
                <>
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4" id="chat-messages">
                    <ChatMessages selectedStudent={selectedStudent} />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Select a conversation to start messaging
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Profile Management Component
function ProfileManagement({ 
  userProfile, 
  tutorProfile, 
  onUpdateProfile, 
  onClose 
}: {
  userProfile: Profile | null;
  tutorProfile: TutorProfile | null;
  onUpdateProfile: (data: Partial<TutorProfile>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    // Basic Information
    title: tutorProfile?.title || "",
    full_name: userProfile?.full_name || "",
    mobile_number: tutorProfile?.mobile_number || "",
    date_of_birth: tutorProfile?.date_of_birth || "",
    gender: tutorProfile?.gender || "",
    city: userProfile?.city || "",
    area: userProfile?.area || "",
    pin_code: tutorProfile?.pin_code || "",
    primary_language: userProfile?.primary_language || "",
    
    // Professional Details
    highest_qualification: tutorProfile?.highest_qualification || "",
    university_name: tutorProfile?.university_name || "",
    year_of_passing: tutorProfile?.year_of_passing || "",
    percentage: tutorProfile?.percentage || "",
    teaching_experience: tutorProfile?.teaching_experience || "",
    currently_teaching: tutorProfile?.currently_teaching ?? null,
    current_teaching_place: tutorProfile?.current_teaching_place || "",
    
    // Service Information
    class_type: tutorProfile?.class_type || "",
    max_travel_distance: tutorProfile?.max_travel_distance || 10,
    individual_fee: tutorProfile?.individual_fee || "",
    group_fee: tutorProfile?.group_fee || "",
    home_tuition_fee: tutorProfile?.home_tuition_fee || "",
    demo_class: tutorProfile?.demo_class ?? null,
    demo_class_fee: tutorProfile?.demo_class_fee || "",
    
    // Profile & Verification
    profile_headline: tutorProfile?.profile_headline || "",
    teaching_methodology: tutorProfile?.teaching_methodology || "",
    why_choose_me: tutorProfile?.why_choose_me || "",
    
    // Subjects & Teaching
    subjects: tutorProfile?.subjects || [],
    student_levels: tutorProfile?.student_levels || [],
    curriculum: tutorProfile?.curriculum || [],
    
    // Existing fields
    bio: tutorProfile?.bio || "",
    experience_years: tutorProfile?.experience_years || 0,
    hourly_rate_min: tutorProfile?.hourly_rate_min || 0,
    hourly_rate_max: tutorProfile?.hourly_rate_max || 0,
    teaching_mode: tutorProfile?.teaching_mode || "",
    qualifications: tutorProfile?.qualifications || [],
    availability: tutorProfile?.availability || {},
  });

  // Debug form initialization
  useEffect(() => {
    console.log('=== FORM INITIALIZATION DEBUG ===');
    console.log('tutorProfile received:', tutorProfile);
    console.log('Form data initialized with:', formData);
    console.log('Currently teaching initial value:', formData.currently_teaching);
    console.log('Demo class initial value:', formData.demo_class);
    console.log('Demo class fee initial value:', formData.demo_class_fee);
    console.log('Current teaching place initial value:', formData.current_teaching_place);
    console.log('=== END FORM INIT DEBUG ===');
  }, [tutorProfile, formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[] || []), value]
        : (prev[field] as string[] || []).filter(item => item !== value)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold">Profile Management</h2>
      </div>

      {/* Profile Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-lg font-bold text-primary">{tutorProfile?.profile_completion_percentage || 0}%</span>
            </div>
            <Progress value={tutorProfile?.profile_completion_percentage || 0} className="w-full h-3" />
            <p className="text-sm text-muted-foreground">
              Complete your profile to increase your visibility and attract more students.
            </p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={testDatabaseSchema}
              className="mt-2"
            >
              🔍 Test Database Schema
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <select
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Title</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile_number">Mobile Number</Label>
                  <Input
                    id="mobile_number"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                    placeholder="Enter mobile number"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="Enter area"
                  />
                </div>
                <div>
                  <Label htmlFor="pin_code">Pin Code</Label>
                  <Input
                    id="pin_code"
                    value={formData.pin_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, pin_code: e.target.value }))}
                    placeholder="Enter pin code"
                  />
                </div>
                <div>
                  <Label htmlFor="primary_language">Primary Language</Label>
                  <select
                    id="primary_language"
                    value={formData.primary_language}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_language: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Professional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="highest_qualification">Highest Qualification</Label>
                  <select
                    id="highest_qualification"
                    value={formData.highest_qualification}
                    onChange={(e) => setFormData(prev => ({ ...prev, highest_qualification: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Qualification</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="university_name">University/Institution Name</Label>
                  <Input
                    id="university_name"
                    value={formData.university_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, university_name: e.target.value }))}
                    placeholder="Enter university name"
                  />
                </div>
                <div>
                  <Label htmlFor="year_of_passing">Year of Passing</Label>
                  <Input
                    id="year_of_passing"
                    type="number"
                    min="1950"
                    max="2030"
                    value={formData.year_of_passing}
                    onChange={(e) => setFormData(prev => ({ ...prev, year_of_passing: e.target.value }))}
                    placeholder="Enter year"
                  />
                </div>
                <div>
                  <Label htmlFor="percentage">Percentage/CGPA</Label>
                  <Input
                    id="percentage"
                    value={formData.percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                    placeholder="Enter percentage or CGPA"
                  />
                </div>
                <div>
                  <Label htmlFor="teaching_experience">Teaching Experience</Label>
                  <select
                    id="teaching_experience"
                    value={formData.teaching_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, teaching_experience: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Experience</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="currently_teaching">Currently Teaching</Label>
                  <select
                    id="currently_teaching"
                    value={formData.currently_teaching === true ? "true" : formData.currently_teaching === false ? "false" : ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      currently_teaching: e.target.value === "true" ? true : e.target.value === "false" ? false : null 
                    }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Status</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="current_teaching_place">Current Teaching Place</Label>
                  <Input
                    id="current_teaching_place"
                    value={formData.current_teaching_place}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_teaching_place: e.target.value }))}
                    placeholder="Enter current teaching place"
                  />
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Service Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="class_type">Class Type</Label>
                  <select
                    id="class_type"
                    value={formData.class_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, class_type: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Class Type</option>
                    <option value="Individual">Individual</option>
                    <option value="Group">Group</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="max_travel_distance">Max Travel Distance (km)</Label>
                  <Input
                    id="max_travel_distance"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.max_travel_distance}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_travel_distance: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="individual_fee">Individual Class Fee (₹)</Label>
                  <Input
                    id="individual_fee"
                    type="number"
                    value={formData.individual_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, individual_fee: e.target.value }))}
                    placeholder="Enter fee per class"
                  />
                </div>
                <div>
                  <Label htmlFor="group_fee">Group Class Fee (₹)</Label>
                  <Input
                    id="group_fee"
                    type="number"
                    value={formData.group_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, group_fee: e.target.value }))}
                    placeholder="Enter fee per class"
                  />
                </div>
                <div>
                  <Label htmlFor="home_tuition_fee">Home Tuition Fee (₹)</Label>
                  <Input
                    id="home_tuition_fee"
                    type="number"
                    value={formData.home_tuition_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, home_tuition_fee: e.target.value }))}
                    placeholder="Enter fee per class"
                  />
                </div>
                <div>
                  <Label htmlFor="demo_class">Demo Class</Label>
                  <select
                    id="demo_class"
                    value={formData.demo_class === true ? "true" : formData.demo_class === false ? "false" : ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      demo_class: e.target.value === "true" ? true : e.target.value === "false" ? false : null 
                    }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Option</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="demo_class_fee">Demo Class Fee (₹)</Label>
                  <Input
                    id="demo_class_fee"
                    type="number"
                    value={formData.demo_class_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, demo_class_fee: e.target.value }))}
                    placeholder="Enter demo class fee"
                  />
                </div>
              </div>
            </div>

            {/* Profile & Verification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Profile & Verification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="profile_headline">Profile Headline</Label>
                  <Input
                    id="profile_headline"
                    value={formData.profile_headline}
                    onChange={(e) => setFormData(prev => ({ ...prev, profile_headline: e.target.value }))}
                    placeholder="Enter a catchy headline for your profile"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="teaching_methodology">Teaching Methodology</Label>
                  <Textarea
                    id="teaching_methodology"
                    value={formData.teaching_methodology}
                    onChange={(e) => setFormData(prev => ({ ...prev, teaching_methodology: e.target.value }))}
                    placeholder="Describe your teaching approach and methodology"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="why_choose_me">Why Choose Me</Label>
                  <Textarea
                    id="why_choose_me"
                    value={formData.why_choose_me}
                    onChange={(e) => setFormData(prev => ({ ...prev, why_choose_me: e.target.value }))}
                    placeholder="Tell students why they should choose you as their tutor"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Subjects & Teaching Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Subjects & Teaching Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subjects */}
                <div className="md:col-span-2">
                  <Label htmlFor="subjects">Subjects You Teach</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        id="newSubject"
                        placeholder="Add a subject (e.g., Mathematics, Physics)"
                        value={formData.newSubject || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, newSubject: e.target.value }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (formData.newSubject?.trim()) {
                              const currentSubjects = formData.qualifications?.subjects || [];
                              if (!currentSubjects.includes(formData.newSubject.trim())) {
                                setFormData(prev => ({
                                  ...prev,
                                  qualifications: {
                                    ...prev.qualifications,
                                    subjects: [...currentSubjects, formData.newSubject.trim()]
                                  },
                                  newSubject: ""
                                }));
                              }
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (formData.newSubject?.trim()) {
                            const currentSubjects = formData.qualifications?.subjects || [];
                            if (!currentSubjects.includes(formData.newSubject.trim())) {
                              setFormData(prev => ({
                                ...prev,
                                qualifications: {
                                  ...prev.qualifications,
                                  subjects: [...currentSubjects, formData.newSubject.trim()]
                                },
                                newSubject: ""
                              }));
                            }
                          }
                        }}
                        disabled={!formData.newSubject?.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {/* Display current subjects */}
                    {formData.qualifications?.subjects && formData.qualifications.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.qualifications.subjects.map((subject: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                            {subject}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedSubjects = formData.qualifications.subjects.filter((_, i) => i !== index);
                                setFormData(prev => ({
                                  ...prev,
                                  qualifications: {
                                    ...prev.qualifications,
                                    subjects: updatedSubjects
                                  }
                                }));
                              }}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {(!formData.qualifications?.subjects || formData.qualifications.subjects.length === 0) && (
                      <p className="text-sm text-muted-foreground">No subjects added yet. Add subjects to start receiving student requests.</p>
                    )}
                  </div>
                </div>

                {/* Student Levels */}
                <div className="md:col-span-2">
                  <Label>Student Levels You Teach</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {['Primary', 'Secondary', 'Higher Secondary', 'College', 'University'].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`level-${level}`}
                          checked={formData.qualifications?.student_levels?.includes(level) || false}
                          onChange={(e) => {
                            const currentLevels = formData.qualifications?.student_levels || [];
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                qualifications: {
                                  ...prev.qualifications,
                                  student_levels: [...currentLevels, level]
                                }
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                qualifications: {
                                  ...prev.qualifications,
                                  student_levels: currentLevels.filter(l => l !== level)
                                }
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`level-${level}`} className="text-sm">{level}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curriculum/Boards */}
                <div className="md:col-span-2">
                  <Label>Curriculum/Boards You Teach</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'].map((board) => (
                      <div key={board} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`board-${board}`}
                          checked={formData.qualifications?.curriculum?.includes(board) || false}
                          onChange={(e) => {
                            const currentBoards = formData.qualifications?.curriculum || [];
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                qualifications: {
                                  ...prev.qualifications,
                                  curriculum: [...currentBoards, board]
                                }
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                qualifications: {
                                  ...prev.qualifications,
                                  curriculum: currentBoards.filter(b => b !== board)
                                }
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`board-${board}`} className="text-sm">{board}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Information */}
                <div>
                  <Label htmlFor="individual_fee">Individual Class Fee (₹/hr)</Label>
                  <Input
                    id="individual_fee"
                    type="number"
                    min="0"
                    value={formData.individual_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, individual_fee: e.target.value }))}
                    placeholder="500"
                  />
                </div>

                <div>
                  <Label htmlFor="group_fee">Group Class Fee (₹/hr)</Label>
                  <Input
                    id="group_fee"
                    type="number"
                    min="0"
                    value={formData.group_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, group_fee: e.target.value }))}
                    placeholder="300"
                  />
                </div>

                <div>
                  <Label htmlFor="home_tuition_fee">Home Tuition Fee (₹/hr)</Label>
                  <Input
                    id="home_tuition_fee"
                    type="number"
                    min="0"
                    value={formData.home_tuition_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, home_tuition_fee: e.target.value }))}
                    placeholder="800"
                  />
                </div>

                <div>
                  <Label htmlFor="demo_class_fee">Demo Class Fee (₹)</Label>
                  <Input
                    id="demo_class_fee"
                    type="number"
                    min="0"
                    value={formData.demo_class_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, demo_class_fee: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Existing Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell students about yourself..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="response_time_hours">Expected Response Time (hours)</Label>
                  <Input
                    id="response_time_hours"
                    type="number"
                    min="1"
                    max="168"
                    value={formData.response_time_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, response_time_hours: parseInt(e.target.value) || 24 }))}
                    placeholder="24"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How quickly do you typically respond to student messages? (1-168 hours)
                  </p>
                </div>
                <div>
                  <Label htmlFor="teaching_mode">Teaching Mode</Label>
                  <select
                    id="teaching_mode"
                    value={formData.teaching_mode}
                    onChange={(e) => setFormData(prev => ({ ...prev, teaching_mode: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Teaching Mode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="hourly_rate_min">Minimum Hourly Rate (₹)</Label>
                  <Input
                    id="hourly_rate_min"
                    type="number"
                    min="0"
                    value={formData.hourly_rate_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate_min: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="hourly_rate_max">Maximum Hourly Rate (₹)</Label>
                  <Input
                    id="hourly_rate_max"
                    type="number"
                    min="0"
                    value={formData.hourly_rate_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate_max: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            {/* Availability & Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Availability & Schedule</h3>
              
              {/* Timezone Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="timezone">Your Timezone</Label>
                  <select
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select your local timezone for accurate scheduling
                  </p>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Weekly Availability Schedule</Label>
                <p className="text-sm text-muted-foreground">
                  Set your available time slots for each day of the week
                </p>
                
                <div className="space-y-4">
                  {Object.entries(formData.weekly_schedule).map(([day, schedule]) => (
                    <div key={day} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`available-${day}`}
                            checked={schedule.available}
                            onChange={(e) => {
                              const updatedSchedule = {
                                ...schedule,
                                available: e.target.checked
                              };
                              setFormData(prev => ({
                                ...prev,
                                weekly_schedule: {
                                  ...prev.weekly_schedule,
                                  [day]: updatedSchedule
                                }
                              }));
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`available-${day}`} className="text-base font-medium capitalize">
                            {day}
                          </Label>
                        </div>
                        {schedule.available && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSlot = { start: "09:00", end: "10:00" };
                              const updatedSchedule = {
                                ...schedule,
                                slots: [...schedule.slots, newSlot]
                              };
                              setFormData(prev => ({
                                ...prev,
                                weekly_schedule: {
                                  ...prev.weekly_schedule,
                                  [day]: updatedSchedule
                                }
                              }));
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Time Slot
                          </Button>
                        )}
                      </div>
                      
                      {schedule.available && (
                        <div className="space-y-3">
                          {schedule.slots.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">
                              No time slots added yet. Click "Add Time Slot" to get started.
                            </p>
                          ) : (
                            schedule.slots.map((slot, slotIndex) => (
                              <div key={slotIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm font-medium">Start:</Label>
                                                                <Input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(day, slotIndex, 'start', e.target.value)}
                                className="w-32"
                              />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm font-medium">End:</Label>
                                  <Input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => updateTimeSlot(day, slotIndex, 'end', e.target.value)}
                                    className="w-32"
                                  />
                                </div>
                                
                                                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeTimeSlot(day, slotIndex)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Profile Edit Dialog Component
function ProfileEditDialog({ 
  userProfile, 
  tutorProfile, 
  onUpdate, 
  onClose 
}: {
  userProfile: Profile | null;
  tutorProfile: TutorProfile | null;
  onUpdate: (data: Partial<TutorProfile>) => void;
  onClose: () => void;
}) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    // Basic Information
    title: tutorProfile?.title || "",
    full_name: userProfile?.full_name || "",
    mobile_number: tutorProfile?.mobile_number || "",
    date_of_birth: tutorProfile?.date_of_birth || "",
    gender: tutorProfile?.gender || "",
    city: userProfile?.city || "",
    area: userProfile?.area || "",
    pin_code: tutorProfile?.pin_code || "",
    primary_language: userProfile?.primary_language || "",
    
    // Professional Details
    highest_qualification: tutorProfile?.highest_qualification || "",
    university_name: tutorProfile?.university_name || "",
    year_of_passing: tutorProfile?.year_of_passing || "",
    percentage: tutorProfile?.percentage || "",
    teaching_experience: tutorProfile?.teaching_experience || "",
    currently_teaching: tutorProfile?.currently_teaching ?? null,
    current_teaching_place: tutorProfile?.current_teaching_place || "",
    
    // Service Information
    class_type: tutorProfile?.class_type || "",
    max_travel_distance: tutorProfile?.max_travel_distance || 10,
    individual_fee: tutorProfile?.individual_fee || "",
    group_fee: tutorProfile?.group_fee || "",
    home_tuition_fee: tutorProfile?.home_tuition_fee || "",
    demo_class: tutorProfile?.demo_class ?? null,
    demo_class_fee: tutorProfile?.demo_class_fee || "",
    
    // Profile & Verification
    profile_headline: tutorProfile?.profile_headline || "",
    teaching_methodology: tutorProfile?.teaching_methodology || "",
    why_choose_me: tutorProfile?.why_choose_me || "",
    
    // Subjects & Teaching
    subjects: tutorProfile?.subjects || [],
    student_levels: tutorProfile?.student_levels || [],
    curriculum: tutorProfile?.curriculum || [],
    newSubject: "", // Temporary field for adding new subjects
    
    // Existing fields
    bio: tutorProfile?.bio || "",
    experience_years: tutorProfile?.experience_years || 0,
    hourly_rate_min: tutorProfile?.hourly_rate_min || 0,
    hourly_rate_max: tutorProfile?.hourly_rate_max || 0,
    teaching_mode: tutorProfile?.teaching_mode || "",
    qualifications: tutorProfile?.qualifications || [],
    availability: tutorProfile?.availability || {},
    
    // Availability & Schedule
    timezone: tutorProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekly_schedule: tutorProfile?.weekly_schedule || {
      monday: { available: false, slots: [] },
      tuesday: { available: false, slots: [] },
      wednesday: { available: false, slots: [] },
      thursday: { available: false, slots: [] },
      friday: { available: false, slots: [] },
      saturday: { available: false, slots: [] },
      sunday: { available: false, slots: [] }
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }

      console.log('File selected for upload:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper function to add a new time slot
  const addTimeSlot = (day: string) => {
    const currentSchedule = formData.weekly_schedule[day];
    const newSlot = { start: "09:00", end: "10:00" };
    const updatedSchedule = {
      ...currentSchedule,
      slots: [...currentSchedule.slots, newSlot]
    };
    setFormData(prev => ({
      ...prev,
      weekly_schedule: {
        ...prev.weekly_schedule,
        [day]: updatedSchedule
      }
    }));
  };

  // Helper function to remove a time slot
  const removeTimeSlot = (day: string, slotIndex: number) => {
    const currentSchedule = formData.weekly_schedule[day];
    const updatedSlots = currentSchedule.slots.filter((_, i) => i !== slotIndex);
    const updatedSchedule = { ...currentSchedule, slots: updatedSlots };
    setFormData(prev => ({
      ...prev,
      weekly_schedule: {
        ...prev.weekly_schedule,
        [day]: updatedSchedule
      }
    }));
  };

  // Helper function to update a time slot
  const updateTimeSlot = (day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    const currentSchedule = formData.weekly_schedule[day];
    const updatedSlots = [...currentSchedule.slots];
    updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], [field]: value };
    const updatedSchedule = { ...currentSchedule, slots: updatedSlots };
    setFormData(prev => ({
      ...prev,
      weekly_schedule: {
        ...prev.weekly_schedule,
        [day]: updatedSchedule
      }
    }));
  };

  const testStorageConnection = async () => {
    try {
      console.log('Testing storage connection...');
      
      // Try to list buckets
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        return false;
      }
      
      console.log('Available buckets:', buckets?.map(b => b.name) || []);
      
      // Try to access the profile-photos bucket specifically
      const { data: files, error: listError } = await supabase.storage
        .from('profile-photos')
        .list('', { limit: 1 });
      
      if (listError) {
        console.error('Error accessing profile-photos bucket:', listError);
        return false;
      }
      
      console.log('Successfully accessed profile-photos bucket');
      return true;
    } catch (error) {
      console.error('Storage connection test failed:', error);
      return false;
    }
  };

  const uploadPhotoToStorage = async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploadingPhoto(true);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('User not authenticated:', authError);
        return null;
      }
      
      console.log('User authenticated:', user.id);
      
      // Test storage connection first
      const storageAccessible = await testStorageConnection();
      if (!storageAccessible) {
        console.error('Storage connection test failed. Cannot proceed with upload.');
        return null;
      }
      
      console.log('Attempting direct upload to profile-photos bucket...');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = fileName;
      
      console.log('Attempting to upload photo:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type,
        userId,
        authenticatedUserId: user.id
      });
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        console.error('Error details:', {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error,
          details: uploadError.details
        });
        
        // Provide more specific error messages for common issues
        if (uploadError.message?.includes('policy')) {
          console.error('This appears to be a storage policy issue. Check your Supabase storage policies.');
          console.error('Make sure you have policies for INSERT, SELECT, UPDATE, and DELETE on the profile-photos bucket.');
        } else if (uploadError.message?.includes('bucket')) {
          console.error('This appears to be a bucket access issue. Check if the bucket exists and is accessible.');
          console.error('Verify the bucket name is exactly "profile-photos" (case sensitive).');
        } else if (uploadError.message?.includes('unauthorized')) {
          console.error('This appears to be an authentication/authorization issue. Check if the user is authenticated.');
          console.error('Verify the user has the correct role and permissions.');
        } else if (uploadError.message?.includes('not found')) {
          console.error('The profile-photos bucket was not found. Please create it in your Supabase dashboard.');
        }
        
        return null;
      }
      
      console.log('Photo uploaded successfully, getting public URL...');
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);
      
      console.log('Public URL generated:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Unexpected error during photo upload:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Form data being submitted:', formData);
      console.log('Currently teaching value:', formData.currently_teaching, 'type:', typeof formData.currently_teaching);
      console.log('Demo class value:', formData.demo_class, 'type:', typeof formData.demo_class);
      console.log('Demo class fee value:', formData.demo_class_fee);
      console.log('Current teaching place value:', formData.current_teaching_place);
      console.log('=== END FORM DEBUG ===');
      
      // If there's a new photo, upload it first
      if (photoFile && userProfile?.id) {
        console.log('Starting photo upload process...');
        const photoUrl = await uploadPhotoToStorage(photoFile, userProfile.id);
        if (photoUrl) {
          console.log('Photo upload successful, updating profile with URL:', photoUrl);
          // Update the profile with the new photo URL
          const updatedData = {
            ...formData,
            profile_photo_url: photoUrl
          };
          console.log('Calling onUpdate with data:', updatedData);
          await onUpdate(updatedData);
          console.log('Profile update completed successfully');
        } else {
          console.error('Photo upload failed - no URL returned');
          alert("Failed to upload photo. Please check the console for error details and try again.");
          return;
        }
      } else {
        console.log('No new photo to upload, proceeding with profile update');
        console.log('Calling onUpdate with data:', formData);
        await onUpdate(formData);
        console.log('Profile update completed successfully');
      }
      
      // Close the dialog only after successful update
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert("Failed to update profile. Please check the console for error details and try again.");
    }
  };

  // Test function to check database schema
  const testDatabaseSchema = async () => {
    try {
      console.log('=== TESTING DATABASE SCHEMA ===');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }
      
      // Check if the columns exist
      const { data: columns, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'tutor_profiles')
        .eq('table_schema', 'public');
      
      if (schemaError) {
        console.error('Schema check error:', schemaError);
        return;
      }
      
      console.log('All columns in tutor_profiles:', columns);
      
      // Check specific columns
      const requiredColumns = ['currently_teaching', 'demo_class', 'demo_class_fee', 'current_teaching_place'];
      const missingColumns = requiredColumns.filter(col => 
        !columns?.some(c => c.column_name === col)
      );
      
      if (missingColumns.length > 0) {
        console.error('❌ MISSING COLUMNS:', missingColumns);
        console.error('Please run the migration to add these columns');
      } else {
        console.log('✅ All required columns exist');
      }
      
      // Try to insert a test record to see what happens
      console.log('Testing insert with sample data...');
      const testData = {
        user_id: user.id,
        currently_teaching: true,
        demo_class: true,
        demo_class_fee: 100,
        current_teaching_place: 'Test Place'
      };
      
      const { error: testError } = await supabase
        .from('tutor_profiles')
        .upsert(testData, { onConflict: 'user_id' });
      
      if (testError) {
        console.error('❌ Test insert failed:', testError);
      } else {
        console.log('✅ Test insert successful');
      }
      
    } catch (error) {
      console.error('Schema test error:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Completion Status */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Profile Completion</span>
              <span className="text-lg font-bold text-blue-600">{tutorProfile?.profile_completion_percentage || 0}%</span>
            </div>
            <Progress value={tutorProfile?.profile_completion_percentage || 0} className="w-full h-2 mb-2" />
            <p className="text-xs text-blue-700">
              Complete your profile to increase your visibility and attract more students.
            </p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={testDatabaseSchema}
              className="mt-2"
            >
              🔍 Test Database Schema
            </Button>
          </div>

          {/* Profile Photo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Profile Photo</h3>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={photoPreview || userProfile?.avatar_url || tutorProfile?.profile_photo_url} alt="Profile" />
                  <AvatarFallback className="text-lg">
                    {userProfile?.full_name?.charAt(0) || tutorProfile?.title?.charAt(0) || "T"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      } else {
                        console.error('File input ref is not available');
                        alert('File input is not available. Please refresh the page and try again.');
                      }
                    }}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                  </Button>
                  {(photoPreview || userProfile?.avatar_url || tutorProfile?.profile_photo_url) ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemovePhoto()}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground text-center max-w-48">
                  Upload a clear, professional photo. Max size: 5MB. Supported formats: JPG, PNG, GIF.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <select
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Title</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="mobile_number">Mobile Number</Label>
                <Input
                  id="mobile_number"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  placeholder="Enter area"
                />
              </div>
              <div>
                <Label htmlFor="pin_code">Pin Code</Label>
                <Input
                  id="pin_code"
                  value={formData.pin_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, pin_code: e.target.value }))}
                  placeholder="Enter pin code"
                />
              </div>
              <div>
                <Label htmlFor="primary_language">Primary Language</Label>
                <select
                  id="primary_language"
                  value={formData.primary_language}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_language: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="highest_qualification">Highest Qualification</Label>
                <select
                  id="highest_qualification"
                  value={formData.highest_qualification}
                  onChange={(e) => setFormData(prev => ({ ...prev, highest_qualification: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Qualification</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="university_name">University/Institution Name</Label>
                <Input
                  id="university_name"
                  value={formData.university_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, university_name: e.target.value }))}
                  placeholder="Enter university name"
                />
              </div>
              <div>
                <Label htmlFor="year_of_passing">Year of Passing</Label>
                <Input
                  id="year_of_passing"
                  type="number"
                  min="1950"
                  max="2030"
                  value={formData.year_of_passing}
                  onChange={(e) => setFormData(prev => ({ ...prev, year_of_passing: e.target.value }))}
                  placeholder="Enter year"
                />
              </div>
              <div>
                <Label htmlFor="percentage">Percentage/CGPA</Label>
                <Input
                  id="percentage"
                  value={formData.percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                  placeholder="Enter percentage or CGPA"
                />
              </div>
              <div>
                <Label htmlFor="teaching_experience">Teaching Experience</Label>
                <select
                  id="teaching_experience"
                  value={formData.teaching_experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, teaching_experience: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Experience</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
              <div>
                <Label htmlFor="currently_teaching">Currently Teaching</Label>
                <select
                  id="currently_teaching"
                  value={formData.currently_teaching === true ? "true" : formData.currently_teaching === false ? "false" : ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    currently_teaching: e.target.value === "true" ? true : e.target.value === "false" ? false : null 
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Status</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="current_teaching_place">Current Teaching Place</Label>
                <Input
                  id="current_teaching_place"
                  value={formData.current_teaching_place}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_teaching_place: e.target.value }))}
                  placeholder="Enter current teaching place"
                />
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Service Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class_type">Class Type</Label>
                <select
                  id="class_type"
                  value={formData.class_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_type: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Class Type</option>
                  <option value="Individual">Individual</option>
                  <option value="Group">Group</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <Label htmlFor="max_travel_distance">Max Travel Distance (km)</Label>
                <Input
                  id="max_travel_distance"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.max_travel_distance}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_travel_distance: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="individual_fee">Individual Class Fee (₹)</Label>
                <Input
                  id="individual_fee"
                  type="number"
                  value={formData.individual_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, individual_fee: e.target.value }))}
                  placeholder="Enter fee per class"
                />
              </div>
              <div>
                <Label htmlFor="group_fee">Group Class Fee (₹)</Label>
                <Input
                  id="group_fee"
                  type="number"
                  value={formData.group_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, group_fee: e.target.value }))}
                  placeholder="Enter fee per class"
                />
              </div>
              <div>
                <Label htmlFor="home_tuition_fee">Home Tuition Fee (₹)</Label>
                <Input
                  id="home_tuition_fee"
                  type="number"
                  value={formData.home_tuition_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, home_tuition_fee: e.target.value }))}
                  placeholder="Enter fee per class"
                />
              </div>
              <div>
                <Label htmlFor="demo_class">Demo Class</Label>
                <select
                  id="demo_class"
                  value={formData.demo_class === true ? "true" : formData.demo_class === false ? "false" : ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    demo_class: e.target.value === "true" ? true : e.target.value === "false" ? false : null 
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Option</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <Label htmlFor="demo_class_fee">Demo Class Fee (₹)</Label>
                <Input
                  id="demo_class_fee"
                  type="number"
                  value={formData.demo_class_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, demo_class_fee: e.target.value }))}
                  placeholder="Enter demo class fee"
                />
              </div>
            </div>
          </div>

          {/* Profile & Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Profile & Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="profile_headline">Profile Headline</Label>
                <Input
                  id="profile_headline"
                  value={formData.profile_headline}
                  onChange={(e) => setFormData(prev => ({ ...prev, profile_headline: e.target.value }))}
                  placeholder="Enter a catchy headline for your profile"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="teaching_methodology">Teaching Methodology</Label>
                <Textarea
                  id="teaching_methodology"
                  value={formData.teaching_methodology}
                  onChange={(e) => setFormData(prev => ({ ...prev, teaching_methodology: e.target.value }))}
                  placeholder="Describe your teaching approach and methodology"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="why_choose_me">Why Choose Me</Label>
                <Textarea
                  id="why_choose_me"
                  value={formData.why_choose_me}
                  onChange={(e) => setFormData(prev => ({ ...prev, why_choose_me: e.target.value }))}
                  placeholder="Tell students why they should choose you as their tutor"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Existing Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell students about yourself..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="teaching_mode">Teaching Mode</Label>
                <select
                  id="teaching_mode"
                  value={formData.teaching_mode}
                  onChange={(e) => setFormData(prev => ({ ...prev, teaching_mode: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Teaching Mode</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <Label htmlFor="hourly_rate_min">Minimum Hourly Rate (₹)</Label>
                <Input
                  id="hourly_rate_min"
                  type="number"
                  min="0"
                  value={formData.hourly_rate_min}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate_min: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="hourly_rate_max">Maximum Hourly Rate (₹)</Label>
                <Input
                  id="hourly_rate_max"
                  type="number"
                  min="0"
                  value={formData.hourly_rate_max}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate_max: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Update Profile
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Placeholder Components
function ScheduleDashboard({ tutorProfile }: { tutorProfile: TutorProfile | null }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Schedule & Availability</h2>
      
      {/* Current Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Weekly Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tutorProfile?.weekly_schedule && Object.values(tutorProfile.weekly_schedule).some(day => day.available) ? (
            <div className="space-y-4">
              {/* Timezone Info */}
              {tutorProfile?.timezone && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-700">Your Timezone</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    {tutorProfile.timezone}
                  </Badge>
                </div>
              )}
              
              {/* Weekly Schedule Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                {Object.entries(tutorProfile.weekly_schedule).map(([day, schedule]) => (
                  <Card key={day} className={`${schedule.available ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                    <CardContent className="p-3">
                      <div className="text-center">
                        <h4 className="font-semibold text-sm capitalize mb-2 text-gray-700">
                          {day}
                        </h4>
                        
                        {schedule.available ? (
                          <div className="space-y-2">
                            {schedule.slots && schedule.slots.length > 0 ? (
                              schedule.slots.map((slot, slotIndex) => (
                                <div key={slotIndex} className="text-xs bg-white rounded px-2 py-1 border">
                                  <div className="font-medium text-blue-700">
                                    {slot.start} - {slot.end}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-500 italic">
                                Available
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            Not Available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No Availability Set</h3>
              <p className="text-muted-foreground mb-4">Set your weekly schedule to let students know when you're available.</p>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Set Availability
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Upcoming Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">No Classes Scheduled</h3>
            <p className="text-muted-foreground">No upcoming classes scheduled yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EarningsDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Earnings</h2>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Earnings Yet</h3>
              <p className="text-muted-foreground">No earnings data available.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HelpSupport() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Help & Support</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Need help? Contact our support team or check our documentation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ChatMessages Component for Tutor Dashboard
function ChatMessages({ selectedStudent }: { selectedStudent: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Cache current user id for render-time checks
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };
    loadCurrentUser();
    if (selectedStudent) {
      loadMessages();
      // Mark messages as read
      markMessagesAsRead();
    }
  }, [selectedStudent]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('Loading messages for student:', selectedStudent);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found in loadMessages');
        return;
      }

      console.log('Tutor user ID:', user.id, 'Student ID:', selectedStudent.id);

      // Try to get messages using RPC function first
      try {
        const { data, error } = await supabase.rpc(
          'get_conversation_messages',
          { 
            p_user1_id: user.id, 
            p_user2_id: selectedStudent.id,
            p_limit: 50
          }
        );

        if (error) {
          console.warn('RPC function failed, trying direct table query:', error);
          throw error;
        }
        
        console.log('Messages loaded via RPC:', data);
        
        // Sort messages by created_at in ascending order
        const sortedMessages = data?.sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ) || [];
        
        console.log('Sorted messages:', sortedMessages);
        setMessages(sortedMessages);
        return;
      } catch (rpcError) {
        console.log('Falling back to direct table query...');
        
        // Fallback: Query messages table directly
        const { data: messagesData, error: tableError } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedStudent.id}),and(sender_id.eq.${selectedStudent.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (tableError) {
          console.error('Direct table query also failed:', tableError);
          throw tableError;
        }

        console.log('Messages loaded via direct query:', messagesData);
        setMessages(messagesData || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark messages from student as read
      await supabase.rpc(
        'mark_messages_as_read',
        { 
          p_sender_id: selectedStudent.id, 
          p_receiver_id: user.id 
        }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  if (loading) {
    return <div className="text-center p-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-4">
      {messages.length > 0 ? (
        messages.map((msg) => {
          const isCurrentUser = msg.sender_id === currentUserId;
          
          return (
            <div 
              key={msg.id} 
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center p-4 text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      )}
    </div>
  );
}

