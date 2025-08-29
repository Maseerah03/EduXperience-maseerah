import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Home, 
  Users, 
  BookOpen, 
  Users as Team, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Megaphone,
  Star,
  TrendingUp,
  Eye,
  MessageCircle,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  CreditCard,
  Award,
  Edit,
  Download,
  Phone,
  Mail,
  X,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InstitutionData {
  id: string;
  institution_name: string;
  verified: boolean;
  total_students: number;
  active_courses: number;
  profile_completion: number;
  overall_rating: number;
  reviews_count: number;
  // Add more fields for editing
  institution_type?: string;
  established_year?: number;
  description?: string;
  contact_person_name?: string;
  contact_person_title?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  website?: string;
  social_media?: string;
  student_capacity?: number;
  accreditation?: string;
  services_offered?: string[];
  subjects_taught?: string[];
  age_groups?: string[];
}

interface QuickStats {
  newInquiries: number;
  studentsThisMonth: number;
  revenueThisMonth: number;
  profileViews: number;
  contactRequests: number;
}

interface RecentActivity {
  id: string;
  type: 'inquiry' | 'admission' | 'payment' | 'review' | 'course_update';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'cancelled';
  studentName?: string;
  amount?: number;
  rating?: number;
}

interface StudentInquiry {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  courseInterest: string;
  preferredBatch: string;
  budgetRange: string;
  inquiryDate: string;
  inquiryTime: string;
  lastFollowUp: string;
  source: string;
  status: 'new' | 'contacted' | 'interested' | 'admitted' | 'closed';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  tags?: string[];
  conversionProbability?: number;
  communicationHistory?: Array<{
    id: string;
    type: 'call' | 'email' | 'sms' | 'visit';
    date: string;
    notes: string;
    outcome: string;
  }>;
  followUpReminders?: Array<{
    id: string;
    date: string;
    type: string;
    notes: string;
    completed: boolean;
  }>;
}

interface InquiryFilters {
  courseInterest: string;
  dateRange: string;
  source: string;
  status: string;
  priority: string;
}

interface Course {
  id: string;
  institution_profile_id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  fee: string;
  prerequisites?: string;
  certificateDetails?: string;
  status: 'active' | 'inactive';
  batchCount: number;
  studentCount: number;
  created_at: string;
  updated_at: string;
}

interface Batch {
  id: string;
  institution_profile_id: string;
  course_id: string;
  name: string;
  courseName: string;
  startDate: string;
  endDate: string;
  timings: string;
  daysOfWeek: string;
  maxCapacity: number;
  studentCount: number;
  facultyName: string;
  classroom: string;
  feeSchedule: string;
  status: 'active' | 'inactive';
  revenue: number;
  created_at: string;
  updated_at: string;
}

interface NewCourse {
  name: string;
  category: string;
  description: string;
  duration: string;
  fee: string;
  prerequisites: string;
  certificateDetails: string;
}

interface NewBatch {
  name: string;
  courseId: string;
  startDate: string;
  endDate: string;
  timings: string;
  daysOfWeek: string;
  maxCapacity: number;
  facultyName: string;
  classroom: string;
  feeSchedule: string;
}

interface Faculty {
  id: string;
  // Personal Information
  fullName: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  contactNumber: string;
  email: string;
  address?: string;
  profilePhoto?: string;
  
  // Professional Details
  employeeId: string;
  department: string;
  designation: string;
  specialization: string;
  dateOfJoining: string;
  workType: 'full-time' | 'part-time' | 'visiting';
  experience: number;
  
  // Academic Qualifications
  highestQualification: string;
  university?: string;
  yearOfCompletion?: number;
  
  // Institutional Role & Access
  facultyRole: string;
  systemAccess: 'admin' | 'limited' | 'teaching-only';
  
  // Workload & Classes
  coursesAssigned?: string[];
  classSectionAllotted?: string;
  weeklyLectureHours?: number;
  
  // Status
  status: 'active' | 'inactive';
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    newInquiries: 0,
    studentsThisMonth: 0,
    revenueThisMonth: 0,
    profileViews: 0,
    contactRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile editing state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<InstitutionData>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Inquiry Management State
  const [inquiries, setInquiries] = useState<StudentInquiry[]>([]);
  
  const [inquiryFilters, setInquiryFilters] = useState<InquiryFilters>({
    courseInterest: 'all',
    dateRange: 'all-time',
    source: 'all-sources',
    status: 'all-status',
    priority: 'all-priorities'
  });
  
  // Enhanced inquiry management state
  const [selectedInquiry, setSelectedInquiry] = useState<StudentInquiry | null>(null);
  const [showInquiryDetail, setShowInquiryDetail] = useState(false);
  const [showAddInquiry, setShowAddInquiry] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    type: 'call',
    notes: '',
    outcome: ''
  });
  const [newInquiry, setNewInquiry] = useState({
    studentName: '',
    parentName: '',
    phone: '',
    email: '',
    courseInterest: '',
    preferredBatch: '',
    budgetRange: '',
    source: 'website',
    priority: 'medium',
    notes: ''
  });
  
  // Faculty Management State
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [showEditFaculty, setShowEditFaculty] = useState(false);
  const [showFacultyDetail, setShowFacultyDetail] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [isSavingFaculty, setIsSavingFaculty] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    fullName: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dateOfBirth: '',
    contactNumber: '',
    email: '',
    address: '',
    profilePhoto: '',
    employeeId: '',
    department: '',
    designation: '',
    specialization: '',
    dateOfJoining: '',
    workType: 'full-time' as 'full-time' | 'part-time' | 'visiting',
    experience: 0,
    highestQualification: '',
    university: '',
    yearOfCompletion: '',
    facultyRole: '',
    systemAccess: 'teaching-only' as 'admin' | 'limited' | 'teaching-only',
    coursesAssigned: [] as string[],
    classSectionAllotted: '',
    weeklyLectureHours: 0,
    status: 'active' as 'active' | 'inactive'
  });
  
  // Filtered inquiries based on current filters
  const filteredInquiries = inquiries.filter(inquiry => {
    if (inquiryFilters.courseInterest !== 'all' && !inquiry.courseInterest.toLowerCase().includes(inquiryFilters.courseInterest.toLowerCase())) return false;
    if (inquiryFilters.source !== 'all-sources' && inquiry.source !== inquiryFilters.source) return false;
    if (inquiryFilters.status !== 'all-status' && inquiry.status !== inquiryFilters.status) return false;
    if (inquiryFilters.priority !== 'all-priorities' && inquiry.priority !== inquiryFilters.priority) return false;
    return true;
  });

  // Course & Batch Management State
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [showAddBatchForm, setShowAddBatchForm] = useState(false);
  const [showViewBatchDetails, setShowViewBatchDetails] = useState(false);
  const [showEditBatch, setShowEditBatch] = useState(false);
  const [showAttendanceTracking, setShowAttendanceTracking] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  const [selectedCourseForBatch, setSelectedCourseForBatch] = useState<Course | null>(null);

  const [newCourse, setNewCourse] = useState<NewCourse>({
    name: '',
    category: '',
    description: '',
    duration: '',
    fee: '',
    prerequisites: '',
    certificateDetails: ''
  });

  const [newBatch, setNewBatch] = useState<NewBatch>({
    name: '',
    courseId: '',
    startDate: '',
    endDate: '',
    timings: '',
    daysOfWeek: '',
    maxCapacity: 25,
    facultyName: '',
    classroom: '',
    feeSchedule: ''
  });

  const [showAddBatchToCourse, setShowAddBatchToCourse] = useState(false);

  useEffect(() => {
    fetchInstitutionData();
    fetchCourses();
    fetchBatches();
    fetchInquiries();
    fetchFaculty();
  }, []);

  const fetchInstitutionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('institution_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setInstitutionData({
        id: data.id,
        institution_name: data.institution_name || data.organization_name || 'Institution Name',
        verified: data.verified || false,
        total_students: 0, // Will be populated from real data when available
        active_courses: 0, // Will be populated from real data when available
        profile_completion: calculateProfileCompletion(data),
        overall_rating: data.rating || 0, // Use actual rating if available
        reviews_count: data.total_reviews || 0, // Use actual reviews count if available
        // Only include fields that exist in the database
        institution_type: data.institution_type,
        established_year: data.established_year,
        description: data.description
      });
    } catch (error) {
      console.error('Error fetching institution data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Profile editing functions
  const handleEditProfile = () => {
    if (institutionData) {
      setEditingProfile({
        institution_name: institutionData.institution_name,
        institution_type: institutionData.institution_type,
        established_year: institutionData.established_year,
        description: institutionData.description
      });
      setShowEditProfileModal(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!institutionData?.id) return;
    
    setIsSavingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Prepare the update data - only include fields that exist in the database
      const updateData: any = {};
      
      // Only update fields that actually exist in the institution_profiles table
      if (editingProfile.institution_name) updateData.institution_name = editingProfile.institution_name;
      if (editingProfile.institution_type) updateData.institution_type = editingProfile.institution_type;
      if (editingProfile.established_year) updateData.established_year = editingProfile.established_year;
      if (editingProfile.description) updateData.description = editingProfile.description;

      // Update in Supabase
      const { error } = await supabase
        .from('institution_profiles')
        .update(updateData)
        .eq('id', institutionData.id);

      if (error) throw error;

      // Update local state with only the fields that were actually updated
      setInstitutionData(prev => prev ? {
        ...prev,
        ...updateData
      } : null);

      // Close modal and reset
      setShowEditProfileModal(false);
      setEditingProfile({});
      
      // Refresh data to get updated profile completion
      await fetchInstitutionData();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditProfileModal(false);
    setEditingProfile({});
  };

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('institution_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Try to fetch from Supabase first
      try {
        const { data: courses, error } = await supabase
          .from('courses')
          .select('*')
          .eq('institution_profile_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.log('Supabase courses table not available yet, using localStorage');
          // Fallback to localStorage
          const storedCourses = localStorage.getItem('institution_courses');
          if (storedCourses) {
            setCourses(JSON.parse(storedCourses));
          }
        } else if (courses) {
          setCourses(courses);
        }
      } catch (error) {
        // Fallback to localStorage
        const storedCourses = localStorage.getItem('institution_courses');
        if (storedCourses) {
          setCourses(JSON.parse(storedCourses));
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('institution_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Try to fetch from Supabase first
      try {
        const { data: batches, error } = await supabase
          .from('batches')
          .select(`
            *,
            courses!inner(name)
          `)
          .eq('institution_profile_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.log('Supabase batches table not available yet, using localStorage');
          // Fallback to localStorage
          const storedBatches = localStorage.getItem('institution_batches');
          if (storedBatches) {
            setBatches(JSON.parse(storedBatches));
          }
        } else if (batches) {
          const formattedBatches = batches.map(batch => ({
            ...batch,
            courseName: batch.courses?.name || 'Unknown Course'
          }));
          setBatches(formattedBatches);
        }
      } catch (error) {
        // Fallback to localStorage
        const storedBatches = localStorage.getItem('institution_batches');
        if (storedBatches) {
          setBatches(JSON.parse(storedBatches));
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const calculateProfileCompletion = (data: any): number => {
    // Only check fields that actually exist in the institution_profiles table
    const requiredFields = [
      'institution_name', 'institution_type', 'established_year',
      'description'
    ];
    
    const filledRequiredFields = requiredFields.filter(field => 
      data[field] && data[field] !== '' && data[field] !== 0
    );
    
    // Calculate percentage based on required fields only
    return Math.round((filledRequiredFields.length / requiredFields.length) * 100);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'inquiry': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'admission': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'review': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'course_update': return <Edit className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Helper functions for inquiry status and priority badges
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'interested': return 'default';
      case 'admitted': return 'default';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'interested': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'admitted': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'closed': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default: return '';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-red-100';
      default: return '';
    }
  };

  // Course & Batch Management Handlers
  const handleEditCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setEditingCourse({ ...course });
      setShowEditCourse(true);
    }
  };

  const handleSaveCourseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setIsSavingCourse(true);
    try {
      // Update in database if available
      try {
        const { error } = await supabase
          .from('courses')
          .update({
            title: editingCourse.name,
            description: editingCourse.description,
            duration_hours: parseInt(editingCourse.duration.replace(' hours', '')) || 0,
            price: parseFloat(editingCourse.fee.replace('₹', '')) || 0,
            is_active: editingCourse.status === 'active'
          })
          .eq('id', editingCourse.id);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error updating course in database:', error);
        // Continue with local update
      }

      // Update local state
      setCourses(prev => prev.map(c => 
        c.id === editingCourse.id 
          ? { ...editingCourse, updated_at: new Date().toISOString() }
          : c
      ));

      // Update localStorage
      const updatedCourses = courses.map(c => 
        c.id === editingCourse.id 
          ? { ...editingCourse, updated_at: new Date().toISOString() }
          : c
      );
      localStorage.setItem('institution_courses', JSON.stringify(updatedCourses));

      alert('Course updated successfully!');
      setShowEditCourse(false);
      setEditingCourse(null);

    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course. Please try again.');
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleCancelCourseEdit = () => {
    setShowEditCourse(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      // Try to delete from database
      try {
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', courseId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error deleting course from database:', error);
        // Continue with local deletion
      }

      // Remove from local state
      setCourses(prev => prev.filter(c => c.id !== courseId));

      // Update localStorage
      const updatedCourses = courses.filter(c => c.id !== courseId);
      localStorage.setItem('institution_courses', JSON.stringify(updatedCourses));

      alert('Course deleted successfully!');

    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  const handleViewBatchDetails = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      setSelectedBatch(batch);
      setShowViewBatchDetails(true);
    }
  };

  const handleEditBatch = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      setEditingBatch({ ...batch });
      setShowEditBatch(true);
    }
  };

  const handleTrackAttendance = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      setSelectedBatch(batch);
      setShowAttendanceTracking(true);
    }
  };

  const handleSaveBatchEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    setIsSavingBatch(true);
    try {
      // Update in database if available
      try {
        const { error } = await supabase
          .from('batches')
          .update({
            name: editingBatch.name,
            course_name: editingBatch.courseName,
            timings: editingBatch.timings,
            days_of_week: editingBatch.daysOfWeek,
            start_date: editingBatch.startDate,
            end_date: editingBatch.endDate,
            faculty_name: editingBatch.facultyName,
            max_capacity: editingBatch.maxCapacity,
            status: editingBatch.status
          })
          .eq('id', editingBatch.id);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error updating batch in database:', error);
        // Continue with local update
      }

      // Update local state
      setBatches(prev => prev.map(b => 
        b.id === editingBatch.id 
          ? { ...editingBatch, updated_at: new Date().toISOString() }
          : b
      ));

      // Update localStorage
      const updatedBatches = batches.map(b => 
        b.id === editingBatch.id 
          ? { ...editingBatch, updated_at: new Date().toISOString() }
          : b
      );
      localStorage.setItem('institution_batches', JSON.stringify(updatedBatches));

      alert('Batch updated successfully!');
      setShowEditBatch(false);
      setEditingBatch(null);

    } catch (error) {
      console.error('Error updating batch:', error);
      alert('Failed to update batch. Please try again.');
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleCancelBatchEdit = () => {
    setShowEditBatch(false);
    setEditingBatch(null);
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      return;
    }

    try {
      // Try to delete from database
      try {
        const { error } = await supabase
          .from('batches')
          .delete()
          .eq('id', batchId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error deleting batch from database:', error);
        // Continue with local deletion
      }

      // Remove from local state
      setBatches(prev => prev.filter(b => b.id !== batchId));

      // Update localStorage
      const updatedBatches = batches.filter(b => b.id !== batchId);
      localStorage.setItem('institution_batches', JSON.stringify(updatedBatches));

      alert('Batch deleted successfully!');

    } catch (error) {
      console.error('Error deleting batch:', error);
      alert('Failed to delete batch. Please try again.');
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!institutionData?.id) {
      console.error('No institution profile ID found');
      return;
    }

    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    try {
      // Create course object for Supabase (using correct column names that exist)
      const courseData = {
        institution_profile_id: institutionData.id,
        tutor_id: user.id, // Add tutor_id (required field) - use the authenticated user's ID
        title: newCourse.name, // Use 'title' instead of 'name'
        description: newCourse.description,
        duration_hours: parseInt(newCourse.duration) || 0, // Use 'duration_hours' instead of 'duration'
        price: parseFloat(newCourse.fee.replace('₹', '')) || 0, // Use 'price' instead of 'fee'
        currency: 'INR', // Add currency since it's required
        subject: 'General', // Add subject since it's required
        level: 'intermediate', // Add level since it's required (try 'intermediate' - common value)
        max_students: 25, // Add max_students since it's required
        is_active: true, // Use 'is_active' instead of 'status'
        start_time: new Date().toISOString(), // Add start_time (required field) - use current timestamp
        // Removed prerequisites, certificate_details as they don't exist in this schema
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();

      if (error) {
        console.error('Error saving course to Supabase:', error);
        // Fallback to localStorage
        const course: Course = {
          id: Date.now().toString(),
          institution_profile_id: institutionData.id,
          ...newCourse,
          status: 'active',
          batchCount: 0,
          studentCount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedCourses = [...courses, course];
        setCourses(updatedCourses);
        localStorage.setItem('institution_courses', JSON.stringify(updatedCourses));
      } else {
        // Successfully saved to Supabase
        const course: Course = {
          id: data.id,
          institution_profile_id: data.institution_profile_id,
          name: data.title, // Map 'title' back to 'name' for frontend
          category: '', // Default value since column doesn't exist in DB
          description: data.description,
          duration: data.duration_hours ? `${data.duration_hours} hours` : '0 hours', // Map 'duration_hours' back to 'duration'
          fee: `₹${data.price}`, // Map 'price' back to 'fee' for frontend
          prerequisites: '', // Default value since column doesn't exist in DB
          certificateDetails: '', // Default value since column doesn't exist in DB
          status: data.is_active ? 'active' : 'inactive', // Map 'is_active' back to 'status'
          batchCount: 0, // Default value since column doesn't exist in DB
          studentCount: 0, // Default value since column doesn't exist in DB
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        const updatedCourses = [...courses, course];
        setCourses(updatedCourses);
        
        // Also save to localStorage as backup
        localStorage.setItem('institution_courses', JSON.stringify(updatedCourses));
      }
      
      // Reset form
      setNewCourse({
        name: '',
        category: '',
        description: '',
        duration: '',
        fee: '',
        prerequisites: '',
        certificateDetails: ''
      });
      setShowAddCourseForm(false);
      
    } catch (error) {
      console.error('Error in handleAddCourse:', error);
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!institutionData?.id) {
      console.error('No institution profile ID found');
      return;
    }

    // If adding batch from course context, use the selected course
    let courseId = newBatch.courseId;
    let selectedCourse = courses.find(c => c.id === courseId);
    
    if (!selectedCourse && selectedCourseForBatch) {
      courseId = selectedCourseForBatch.id;
      selectedCourse = selectedCourseForBatch;
    }
    
    if (!selectedCourse) {
      console.error('Selected course not found');
      return;
    }

    try {
      // Create batch object for Supabase
      const batchData = {
        institution_profile_id: institutionData.id,
        course_id: courseId,
        name: newBatch.name,
        start_date: newBatch.startDate,
        end_date: newBatch.endDate,
        timings: newBatch.timings,
        days_of_week: newBatch.daysOfWeek,
        max_capacity: newBatch.maxCapacity,
        student_count: 0,
        faculty_name: newBatch.facultyName,
        classroom: newBatch.classroom,
        fee_schedule: newBatch.feeSchedule,
        status: 'active',
        revenue: 0
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('batches')
        .insert(batchData)
        .select()
        .single();

      if (error) {
        console.error('Error saving batch to Supabase:', error);
        // Fallback to localStorage
        const batch: Batch = {
          id: Date.now().toString(),
          institution_profile_id: institutionData.id,
          course_id: newBatch.courseId,
          ...newBatch,
          courseName: selectedCourse.name,
          studentCount: 0,
          status: 'active',
          revenue: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedBatches = [...batches, batch];
        setBatches(updatedBatches);
        localStorage.setItem('institution_batches', JSON.stringify(updatedBatches));
      } else {
        // Successfully saved to Supabase
        const batch: Batch = {
          id: data.id,
          institution_profile_id: data.institution_profile_id,
          course_id: data.course_id,
          name: data.name,
          courseName: selectedCourse.name,
          startDate: data.start_date,
          endDate: data.end_date,
          timings: data.timings,
          daysOfWeek: data.days_of_week,
          maxCapacity: data.max_capacity,
          studentCount: data.student_count,
          facultyName: data.faculty_name,
          classroom: data.classroom,
          feeSchedule: data.fee_schedule,
          status: data.status,
          revenue: data.revenue,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        const updatedBatches = [...batches, batch];
        setBatches(updatedBatches);
        
        // Also save to localStorage as backup
        localStorage.setItem('institution_batches', JSON.stringify(updatedBatches));
        
        // Update course batch count
        const updatedCourses = courses.map(c => 
          c.id === newBatch.courseId 
            ? { ...c, batchCount: c.batchCount + 1 }
            : c
        );
        setCourses(updatedCourses);
        
        // Save updated courses to localStorage
        localStorage.setItem('institution_courses', JSON.stringify(updatedCourses));
      }
      
      // Reset form
      setNewBatch({
        name: '',
        courseId: '',
        startDate: '',
        endDate: '',
        timings: '',
        daysOfWeek: '',
        maxCapacity: 25,
        facultyName: '',
        classroom: '',
        feeSchedule: ''
      });
      setShowAddBatchForm(false);
      
    } catch (error) {
      console.error('Error in handleAddBatch:', error);
    }
  };

  const handleCourseImageUpload = (files: FileList | null) => {
    if (files) {
      console.log('Course images uploaded:', files);
      // TODO: Implement image upload to storage
    }
  };

  // Enhanced inquiry management functions
  const handleAddInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to add inquiries');
        return;
      }

      // Get the institution profile ID
      const { data: profile } = await supabase
        .from('institution_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        alert('Institution profile not found. Please complete your profile first.');
        return;
      }

      // Prepare inquiry data for database
      const inquiryData = {
        institution_profile_id: profile.id,
        student_name: newInquiry.studentName,
        parent_name: newInquiry.parentName,
        phone: newInquiry.phone,
        email: newInquiry.email || null,
        course_interest: newInquiry.courseInterest,
        preferred_batch: newInquiry.preferredBatch || null,
        budget_range: newInquiry.budgetRange,
        source: newInquiry.source,
        priority: newInquiry.priority,
        notes: newInquiry.notes || null,
        status: 'new',
        inquiry_date: new Date().toISOString().split('T')[0],
        inquiry_time: new Date().toLocaleTimeString(),
        last_follow_up: new Date().toISOString().split('T')[0],
        communication_history: [],
        follow_up_reminders: [],
        conversion_probability: 50
      };

      // Try to insert into Supabase first
      let { data, error } = await supabase
        .from('student_inquiries')
        .insert(inquiryData)
        .select()
        .single();

      if (error) {
        // If the table doesn't exist, create it first
        if (error.code === '42P01') { // Table doesn't exist
          console.log('Creating student_inquiries table...');
          
          // Create the table
          const { error: createError } = await supabase.rpc('create_student_inquiries_table');
          
          if (createError) {
            console.log('Could not create table, using localStorage fallback');
            // Fallback to localStorage
            const inquiry: StudentInquiry = {
              id: Date.now().toString(),
              ...newInquiry,
              inquiryDate: new Date().toISOString().split('T')[0],
              inquiryTime: new Date().toLocaleTimeString(),
              lastFollowUp: new Date().toISOString().split('T')[0],
              status: 'new',
              communicationHistory: [],
              followUpReminders: [],
              conversionProbability: 50
            };
            
            setInquiries(prev => [inquiry, ...prev]);
            localStorage.setItem('institution_inquiries', JSON.stringify([inquiry, ...inquiries]));
          } else {
            // Retry insert after table creation
            const { data: retryData, error: retryError } = await supabase
              .from('student_inquiries')
              .insert(inquiryData)
              .select()
              .single();
              
            if (retryError) {
              throw retryError;
            }
            data = retryData;
          }
        } else {
          throw error;
        }
      }

      if (data) {
        // Successfully saved to database
        const inquiry: StudentInquiry = {
          id: data.id,
          studentName: data.student_name,
          parentName: data.parent_name,
          phone: data.phone,
          email: data.email,
          courseInterest: data.course_interest,
          preferredBatch: data.preferred_batch,
          budgetRange: data.budget_range,
          source: data.source,
          priority: data.priority,
          notes: data.notes,
          inquiryDate: data.inquiry_date,
          inquiryTime: data.inquiry_time,
          lastFollowUp: data.last_follow_up,
          status: data.status,
          communicationHistory: data.communication_history || [],
          followUpReminders: data.follow_up_reminders || [],
          conversionProbability: data.conversion_probability
        };
        
        setInquiries(prev => [inquiry, ...prev]);
        
        // Also save to localStorage as backup
        localStorage.setItem('institution_inquiries', JSON.stringify([inquiry, ...inquiries]));
      }
      
      // Reset form and close modal
      setShowAddInquiry(false);
      setNewInquiry({
        studentName: '',
        parentName: '',
        phone: '',
        email: '',
        courseInterest: '',
        preferredBatch: '',
        budgetRange: '',
        source: 'website',
        priority: 'medium',
        notes: ''
      });
      
      alert('Inquiry added successfully!');
      
    } catch (error) {
      console.error('Error adding inquiry:', error);
      alert('Failed to add inquiry. Please try again.');
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, newStatus: StudentInquiry['status']) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('student_inquiries')
        .update({ status: newStatus })
        .eq('id', inquiryId);

      if (error) {
        console.error('Error updating inquiry status:', error);
        alert('Failed to update status. Please try again.');
        return;
      }

      // Update local state
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status: newStatus }
          : inquiry
      ));

      // Update localStorage
      const updatedInquiries = inquiries.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status: newStatus }
          : inquiry
      );
      localStorage.setItem('institution_inquiries', JSON.stringify(updatedInquiries));

    } catch (error) {
      console.error('Error updating inquiry status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleAddFollowUp = async (inquiryId: string) => {
    if (!newFollowUp.notes.trim()) return;
    
    try {
      const followUp = {
        id: Date.now().toString(),
        type: newFollowUp.type as 'call' | 'email' | 'sms' | 'visit',
        date: new Date().toISOString().split('T')[0],
        notes: newFollowUp.notes,
        outcome: newFollowUp.outcome
      };
      
      // Update communication history in database
      const inquiry = inquiries.find(i => i.id === inquiryId);
      if (!inquiry) return;
      
      const updatedCommunicationHistory = [...(inquiry.communicationHistory || []), followUp];
      
      const { error } = await supabase
        .from('student_inquiries')
        .update({ 
          communication_history: updatedCommunicationHistory,
          last_follow_up: new Date().toISOString().split('T')[0]
        })
        .eq('id', inquiryId);

      if (error) {
        console.error('Error adding follow-up:', error);
        alert('Failed to add follow-up. Please try again.');
        return;
      }
      
      // Update local state
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === inquiryId 
          ? { 
              ...inquiry, 
              communicationHistory: updatedCommunicationHistory,
              lastFollowUp: new Date().toISOString().split('T')[0]
            }
          : inquiry
      ));
      
      // Update localStorage
      const updatedInquiries = inquiries.map(inquiry => 
        inquiry.id === inquiryId 
          ? { 
              ...inquiry, 
              communicationHistory: updatedCommunicationHistory,
              lastFollowUp: new Date().toISOString().split('T')[0]
            }
          : inquiry
      );
      localStorage.setItem('institution_inquiries', JSON.stringify(updatedInquiries));
      
      setNewFollowUp({ type: 'call', notes: '', outcome: '' });
      setShowFollowUpModal(false);
      
    } catch (error) {
      console.error('Error adding follow-up:', error);
      alert('Failed to add follow-up. Please try again.');
    }
  };

  const handleScheduleCallback = (inquiryId: string, date: string, notes: string) => {
    const reminder = {
      id: Date.now().toString(),
      date,
      type: 'callback',
      notes,
      completed: false
    };
    
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId 
        ? { 
            ...inquiry, 
            followUpReminders: [...(inquiry.followUpReminders || []), reminder]
          }
        : inquiry
    ));
  };

  const calculateConversionProbability = (inquiry: StudentInquiry): number => {
    let score = 50; // Base score
    
    // Status bonus
    switch (inquiry.status) {
      case 'interested': score += 20; break;
      case 'admitted': score += 40; break;
      case 'closed': score -= 30; break;
    }
    
    // Priority bonus
    switch (inquiry.priority) {
      case 'high': score += 15; break;
      case 'medium': score += 5; break;
    }
    
    // Follow-up activity bonus
    if (inquiry.communicationHistory && inquiry.communicationHistory.length > 0) {
      score += Math.min(inquiry.communicationHistory.length * 5, 20);
    }
    
    // Recent inquiry bonus
    const daysSinceInquiry = Math.floor((Date.now() - new Date(inquiry.inquiryDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceInquiry <= 7) score += 10;
    else if (daysSinceInquiry <= 30) score += 5;
    
    return Math.min(Math.max(score, 0), 100);
  };

  const fetchInquiries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('institution_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Try to fetch from Supabase first
      try {
        const { data: inquiries, error } = await supabase
          .from('student_inquiries')
          .select('*')
          .eq('institution_profile_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.log('Supabase student_inquiries table not available yet, using localStorage');
          // Fallback to localStorage
          const storedInquiries = localStorage.getItem('institution_inquiries');
          if (storedInquiries) {
            setInquiries(JSON.parse(storedInquiries));
          }
        } else if (inquiries) {
          // Transform database data to frontend format
          const transformedInquiries: StudentInquiry[] = inquiries.map(inquiry => ({
            id: inquiry.id,
            studentName: inquiry.student_name,
            parentName: inquiry.parent_name,
            phone: inquiry.phone,
            email: inquiry.email,
            courseInterest: inquiry.course_interest,
            preferredBatch: inquiry.preferred_batch,
            budgetRange: inquiry.budget_range,
            source: inquiry.source,
            priority: inquiry.priority,
            notes: inquiry.notes,
            inquiryDate: inquiry.inquiry_date,
            inquiryTime: inquiry.inquiry_time,
            lastFollowUp: inquiry.last_follow_up,
            status: inquiry.status,
            communicationHistory: inquiry.communication_history || [],
            followUpReminders: inquiry.follow_up_reminders || [],
            conversionProbability: inquiry.conversion_probability
          }));
          
          setInquiries(transformedInquiries);
          
          // Also save to localStorage as backup
          localStorage.setItem('institution_inquiries', JSON.stringify(transformedInquiries));
        }
      } catch (error) {
        // Fallback to localStorage
        const storedInquiries = localStorage.getItem('institution_inquiries');
        if (storedInquiries) {
          setInquiries(JSON.parse(storedInquiries));
        }
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  // Faculty Management Functions
  const fetchFaculty = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('institution_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Try to fetch from Supabase first
      try {
        const { data: facultyData, error } = await supabase
          .from('faculty')
          .select('*')
          .eq('institution_profile_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.log('Supabase faculty table not available yet, using localStorage');
          // Fallback to localStorage
          const storedFaculty = localStorage.getItem('institution_faculty');
          if (storedFaculty) {
            setFaculty(JSON.parse(storedFaculty));
          }
        } else if (facultyData) {
          // Transform database data to frontend format
          const transformedFaculty: Faculty[] = facultyData.map(f => ({
            id: f.id,
            fullName: f.full_name,
            gender: f.gender,
            dateOfBirth: f.date_of_birth,
            contactNumber: f.contact_number,
            email: f.email,
            address: f.address,
            profilePhoto: f.profile_photo,
            employeeId: f.employee_id,
            department: f.department,
            designation: f.designation,
            specialization: f.specialization,
            dateOfJoining: f.date_of_joining,
            workType: f.work_type,
            experience: f.experience,
            highestQualification: f.highest_qualification,
            university: f.university,
            yearOfCompletion: f.year_of_completion,
            facultyRole: f.faculty_role,
            systemAccess: f.system_access,
            coursesAssigned: f.courses_assigned || [],
            classSectionAllotted: f.class_section_allotted,
            weeklyLectureHours: f.weekly_lecture_hours,
            status: f.status,
            created_at: f.created_at,
            updated_at: f.updated_at
          }));
          
          setFaculty(transformedFaculty);
          
          // Also save to localStorage as backup
          localStorage.setItem('institution_faculty', JSON.stringify(transformedFaculty));
        }
      } catch (error) {
        // Fallback to localStorage
        const storedFaculty = localStorage.getItem('institution_faculty');
        if (storedFaculty) {
          setFaculty(JSON.parse(storedFaculty));
        }
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to add faculty');
        return;
      }

      // Get the institution profile ID
      const { data: profile } = await supabase
        .from('institution_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        alert('Institution profile not found. Please complete your profile first.');
        return;
      }

      // Prepare faculty data for database
      const facultyData = {
        institution_profile_id: profile.id,
        full_name: newFaculty.fullName,
        gender: newFaculty.gender,
        date_of_birth: newFaculty.dateOfBirth || null,
        contact_number: newFaculty.contactNumber,
        email: newFaculty.email,
        address: newFaculty.address || null,
        profile_photo: newFaculty.profilePhoto || null,
        employee_id: newFaculty.employeeId,
        department: newFaculty.department,
        designation: newFaculty.designation,
        specialization: newFaculty.specialization,
        date_of_joining: newFaculty.dateOfJoining,
        work_type: newFaculty.workType,
        experience: newFaculty.experience,
        highest_qualification: newFaculty.highestQualification,
        university: newFaculty.university || null,
        year_of_completion: newFaculty.yearOfCompletion ? parseInt(newFaculty.yearOfCompletion) : null,
        faculty_role: newFaculty.facultyRole,
        system_access: newFaculty.systemAccess,
        courses_assigned: newFaculty.coursesAssigned,
        class_section_allotted: newFaculty.classSectionAllotted || null,
        weekly_lecture_hours: newFaculty.weeklyLectureHours || null,
        status: newFaculty.status
      };

      // Try to insert into Supabase first
      let { data, error } = await supabase
        .from('faculty')
        .insert(facultyData)
        .select()
        .single();

      if (error) {
        // If the table doesn't exist, create it first
        if (error.code === '42P01') { // Table doesn't exist
          console.log('Creating faculty table...');
          
          // Create the table
          const { error: createError } = await supabase.rpc('create_faculty_table');
          
          if (createError) {
            console.log('Could not create table, using localStorage fallback');
            // Fallback to localStorage
            const facultyMember: Faculty = {
              id: Date.now().toString(),
              ...newFaculty,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setFaculty(prev => [facultyMember, ...prev]);
            localStorage.setItem('institution_faculty', JSON.stringify([facultyMember, ...faculty]));
          } else {
            // Retry insert after table creation
            const { data: retryData, error: retryError } = await supabase
              .from('faculty')
              .insert(facultyData)
              .select()
              .single();
              
            if (retryError) {
              throw retryError;
            }
            data = retryData;
          }
        } else {
          throw error;
        }
      }

      if (data) {
        // Successfully saved to database
        const facultyMember: Faculty = {
          id: data.id,
          fullName: data.full_name,
          gender: data.gender,
          dateOfBirth: data.date_of_birth,
          contactNumber: data.contact_number,
          email: data.email,
          address: data.address,
          profilePhoto: data.profile_photo,
          employeeId: data.employee_id,
          department: data.department,
          designation: data.designation,
          specialization: data.specialization,
          dateOfJoining: data.date_of_joining,
          workType: data.work_type,
          experience: data.experience,
          highestQualification: data.highest_qualification,
          university: data.university,
          yearOfCompletion: data.year_of_completion,
          facultyRole: data.faculty_role,
          systemAccess: data.system_access,
          coursesAssigned: data.courses_assigned || [],
          classSectionAllotted: data.class_section_allotted,
          weeklyLectureHours: data.weekly_lecture_hours,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setFaculty(prev => [facultyMember, ...prev]);
        
        // Also save to localStorage as backup
        localStorage.setItem('institution_faculty', JSON.stringify([facultyMember, ...faculty]));
      }
      
      // Reset form and close modal
      setShowAddFaculty(false);
      setNewFaculty({
        fullName: '',
        gender: 'male',
        dateOfBirth: '',
        contactNumber: '',
        email: '',
        address: '',
        profilePhoto: '',
        employeeId: '',
        department: '',
        designation: '',
        specialization: '',
        dateOfJoining: '',
        workType: 'full-time',
        experience: 0,
        highestQualification: '',
        university: '',
        yearOfCompletion: '',
        facultyRole: '',
        systemAccess: 'teaching-only',
        coursesAssigned: [],
        classSectionAllotted: '',
        weeklyLectureHours: 0,
        status: 'active'
      });
      
      alert('Faculty member added successfully!');
      
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert('Failed to add faculty member. Please try again.');
    }
  };

  const handleUpdateFacultyStatus = async (facultyId: string, newStatus: 'active' | 'inactive') => {
    try {
      // Update in database
      const { error } = await supabase
        .from('faculty')
        .update({ status: newStatus })
        .eq('id', facultyId);

      if (error) {
        console.error('Error updating faculty status:', error);
        alert('Failed to update status. Please try again.');
        return;
      }

      // Update local state
      setFaculty(prev => prev.map(f => 
        f.id === facultyId 
          ? { ...f, status: newStatus }
          : f
      ));

      // Update localStorage
      const updatedFaculty = faculty.map(f => 
        f.id === facultyId 
          ? { ...f, status: newStatus }
          : f
      );
      localStorage.setItem('institution_faculty', JSON.stringify(updatedFaculty));

    } catch (error) {
      console.error('Error updating faculty status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // Faculty Management Functions - Edit, View, Update
  const handleEditFaculty = (facultyMember: Faculty) => {
    setEditingFaculty({ ...facultyMember });
    setShowEditFaculty(true);
  };

  const handleViewFacultyDetails = (facultyMember: Faculty) => {
    setSelectedFaculty(facultyMember);
    setShowFacultyDetail(true);
  };

  const handleSaveFacultyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;

    setIsSavingFaculty(true);
    try {
      // Prepare updated faculty data for database
      const updatedFacultyData = {
        full_name: editingFaculty.fullName,
        gender: editingFaculty.gender,
        date_of_birth: editingFaculty.dateOfBirth || null,
        contact_number: editingFaculty.contactNumber,
        email: editingFaculty.email,
        address: editingFaculty.address || null,
        profile_photo: editingFaculty.profilePhoto || null,
        employee_id: editingFaculty.employeeId,
        department: editingFaculty.department,
        designation: editingFaculty.designation,
        specialization: editingFaculty.specialization,
        date_of_joining: editingFaculty.dateOfJoining,
        work_type: editingFaculty.workType,
        experience: editingFaculty.experience,
        highest_qualification: editingFaculty.highestQualification,
        university: editingFaculty.university || null,
        year_of_completion: editingFaculty.yearOfCompletion ? parseInt(editingFaculty.yearOfCompletion) : null,
        faculty_role: editingFaculty.facultyRole,
        system_access: editingFaculty.systemAccess,
        courses_assigned: editingFaculty.coursesAssigned,
        class_section_allotted: editingFaculty.classSectionAllotted || null,
        weekly_lecture_hours: editingFaculty.weeklyLectureHours || null,
        status: editingFaculty.status
      };

      // Try to update in Supabase first
      try {
        const { error } = await supabase
          .from('faculty')
          .update(updatedFacultyData)
          .eq('id', editingFaculty.id);

        if (error) {
          throw error;
        }

        // Update local state
        setFaculty(prev => prev.map(f => 
          f.id === editingFaculty.id 
            ? { ...editingFaculty, updated_at: new Date().toISOString() }
            : f
        ));

        // Update localStorage
        const updatedFaculty = faculty.map(f => 
          f.id === editingFaculty.id 
            ? { ...editingFaculty, updated_at: new Date().toISOString() }
            : f
        );
        localStorage.setItem('institution_faculty', JSON.stringify(updatedFaculty));

        alert('Faculty member updated successfully!');
        setShowEditFaculty(false);
        setEditingFaculty(null);

      } catch (error) {
        console.error('Error updating faculty in database:', error);
        // Fallback to localStorage only
        const updatedFaculty = faculty.map(f => 
          f.id === editingFaculty.id 
            ? { ...editingFaculty, updated_at: new Date().toISOString() }
            : f
        );
        setFaculty(updatedFaculty);
        localStorage.setItem('institution_faculty', JSON.stringify(updatedFaculty));
        
        alert('Faculty member updated locally. Database update failed.');
        setShowEditFaculty(false);
        setEditingFaculty(null);
      }

    } catch (error) {
      console.error('Error updating faculty:', error);
      alert('Failed to update faculty member. Please try again.');
    } finally {
      setIsSavingFaculty(false);
    }
  };

  const handleCancelFacultyEdit = () => {
    setShowEditFaculty(false);
    setEditingFaculty(null);
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    if (!confirm('Are you sure you want to delete this faculty member? This action cannot be undone.')) {
      return;
    }

    try {
      // Try to delete from database
      try {
        const { error } = await supabase
          .from('faculty')
          .delete()
          .eq('id', facultyId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error deleting faculty from database:', error);
        // Continue with local deletion
      }

      // Remove from local state
      setFaculty(prev => prev.filter(f => f.id !== facultyId));

      // Update localStorage
      const updatedFaculty = faculty.filter(f => f.id !== facultyId);
      localStorage.setItem('institution_faculty', JSON.stringify(updatedFaculty));

      alert('Faculty member deleted successfully!');

    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert('Failed to delete faculty member. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-primary text-white text-lg font-semibold">
                  {institutionData?.institution_name?.charAt(0) || 'I'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {institutionData?.institution_name || 'Institution Dashboard'}
                </h1>
                <p className="text-gray-600">Welcome back!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge 
                variant={institutionData?.verified ? "default" : "secondary"}
                className={institutionData?.verified ? "bg-green-100 text-green-800" : ""}
              >
                {institutionData?.verified ? "Verified" : "Pending Verification"}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab("profile")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Inquiries</span>
              {quickStats.newInquiries > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {quickStats.newInquiries}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="faculty" className="flex items-center space-x-2">
              <Team className="w-4 h-4" />
              <span className="hidden sm:inline">Faculty</span>
            </TabsTrigger>
            <TabsTrigger value="admissions" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Admissions</span>
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Fees</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center space-x-2">
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Marketing</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Content */}
          <TabsContent value="dashboard" className="space-y-6">
          {/* Institution Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="w-5 h-5" />
                <span>Institution Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {institutionData?.total_students || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {institutionData?.active_courses || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {institutionData?.overall_rating || 0}
                  </div>
                  <div className="text-sm text-gray-600">Overall Rating</div>
                  <div className="flex justify-center mt-1">
                    {renderStars(institutionData?.overall_rating || 0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ({institutionData?.reviews_count || 0} reviews)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {institutionData?.profile_completion || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Profile Complete</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${institutionData?.profile_completion || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {quickStats.newInquiries}
                  </div>
                  <div className="text-sm text-blue-800">New Inquiries</div>
                  {quickStats.newInquiries > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      New
                    </Badge>
                  )}
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {quickStats.studentsThisMonth}
                  </div>
                  <div className="text-sm text-green-800">Students This Month</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{quickStats.revenueThisMonth.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-800">Revenue This Month</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {quickStats.profileViews}
                  </div>
                  <div className="text-sm text-orange-800">Profile Views</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {quickStats.contactRequests}
                  </div>
                  <div className="text-sm text-red-800">Contact Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab("courses")}
                >
                  <Plus className="w-6 h-6" />
                  <span>Add New Course</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab("courses")}
                >
                  <Calendar className="w-6 h-6" />
                  <span>Update Availability</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab("inquiries")}
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>View All Inquiries</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab("students")}
                >
                  <Users className="w-6 h-6" />
                  <span>Manage Students</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab("profile")}
                >
                  <Edit className="w-6 h-6" />
                  <span>Update Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tab Contents - Placeholder */}
        <TabsContent value="inquiries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Student Inquiry Management</span>
                </div>
                <Button onClick={() => setShowAddInquiry(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Inquiry
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Inquiry Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{inquiries.filter(i => i.status === 'new').length}</div>
                  <div className="text-sm text-blue-800">New Inquiries</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{inquiries.filter(i => i.status === 'contacted').length}</div>
                  <div className="text-sm text-yellow-800">Contacted</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{inquiries.filter(i => i.status === 'interested').length}</div>
                  <div className="text-sm text-green-800">Interested</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{inquiries.filter(i => i.status === 'admitted').length}</div>
                  <div className="text-sm text-purple-800">Admitted</div>
                </div>
              </div>

              {/* Filter Options */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Filter Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Course Interest</Label>
                    <Select value={inquiryFilters.courseInterest} onValueChange={(value) => setInquiryFilters(prev => ({ ...prev, courseInterest: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        <SelectItem value="cbse">CBSE</SelectItem>
                        <SelectItem value="icse">ICSE</SelectItem>
                        <SelectItem value="state-board">State Board</SelectItem>
                        <SelectItem value="competitive">Competitive Exams</SelectItem>
                        <SelectItem value="professional">Professional Courses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Date Range</Label>
                    <Select value={inquiryFilters.dateRange} onValueChange={(value) => setInquiryFilters(prev => ({ ...prev, dateRange: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-time">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Inquiry Source</Label>
                    <Select value={inquiryFilters.source} onValueChange={(value) => setInquiryFilters(prev => ({ ...prev, source: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-sources">All Sources</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="advertisement">Advertisement</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="walk-in">Walk-in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Select value={inquiryFilters.status} onValueChange={(value) => setInquiryFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-status">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="admitted">Admitted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Priority Level</Label>
                    <Select value={inquiryFilters.priority} onValueChange={(value) => setInquiryFilters(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-priorities">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setInquiryFilters({
                      courseInterest: 'all',
                      dateRange: 'all-time',
                      source: 'all-sources',
                      status: 'all-status',
                      priority: 'all-priorities'
                    })}
                  >
                    Clear Filters
                  </Button>
                  <div className="text-sm text-gray-600">
                    Showing {filteredInquiries.length} of {inquiries.length} inquiries
                  </div>
                </div>
              </div>

              {/* Inquiry Cards Display */}
              <div className="space-y-4">
                {filteredInquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                    <p className="text-gray-500 mb-4">Start managing student inquiries by adding your first inquiry.</p>
                    <Button onClick={() => setShowAddInquiry(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Inquiry
                    </Button>
                  </div>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {inquiry.studentName}
                            </h3>
                            <p className="text-sm text-gray-600">{inquiry.parentName}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={getStatusVariant(inquiry.status)}
                              className={getStatusBadgeClass(inquiry.status)}
                            >
                              {inquiry.status}
                            </Badge>
                            <Badge 
                              variant={getPriorityVariant(inquiry.priority)}
                              className={getPriorityBadgeClass(inquiry.priority)}
                            >
                              {inquiry.priority}
                            </Badge>
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {calculateConversionProbability(inquiry)}% Convert
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Contact Details</Label>
                            <p className="text-sm text-gray-900">{inquiry.phone}</p>
                            <p className="text-sm text-gray-900">{inquiry.email}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Course Interest</Label>
                            <p className="text-sm text-gray-900">{inquiry.courseInterest}</p>
                            <p className="text-sm text-gray-600">Batch: {inquiry.preferredBatch}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Budget & Source</Label>
                            <p className="text-sm text-gray-900">₹{inquiry.budgetRange}</p>
                            <p className="text-sm text-gray-600">{inquiry.source}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <span>Inquiry Date: {inquiry.inquiryDate} at {inquiry.inquiryTime}</span>
                          <span>Last Follow-up: {inquiry.lastFollowUp}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Phone className="w-4 h-4 mr-2" />
                            Call Now
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Visit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-blue-600 border-blue-600"
                            onClick={() => handleUpdateInquiryStatus(inquiry.id, 'interested')}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Mark as Interested
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 border-green-600"
                            onClick={() => handleUpdateInquiryStatus(inquiry.id, 'admitted')}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Convert to Admission
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-600"
                            onClick={() => handleUpdateInquiryStatus(inquiry.id, 'closed')}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Not Suitable
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setShowInquiryDetail(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Student management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {/* Course Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Course Management</span>
                </div>
                <Button onClick={() => setShowAddCourseForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Course
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first course to begin managing your educational programs.</p>
                  <Button onClick={() => setShowAddCourseForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Course
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900">{course.name || course.title || 'Untitled Course'}</h4>
                          <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <p>Category: {course.category || 'Not specified'}</p>
                          <p>Duration: {course.duration || course.duration_hours ? `${course.duration_hours} hours` : 'Not specified'}</p>
                          <p>Fee: {course.fee ? `₹${course.fee}` : course.price ? `₹${course.price}` : 'Not specified'}</p>
                          <p>Batches: {course.batchCount || 0}</p>
                          <p>Students: {course.studentCount || 0}</p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => handleEditCourse(course.id)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedCourseForBatch(course);
                            setShowAddBatchToCourse(true);
                          }}>
                            <Plus className="w-3 h-3 mr-1" />
                            Add Batch
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Batch Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Batch Management</span>
                </div>
                <Button onClick={() => setShowAddBatchForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Batch
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {batches.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h3>
                  <p className="text-gray-500 mb-4">Create your first batch to start organizing students and scheduling classes.</p>
                  <Button onClick={() => setShowAddBatchForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Batch
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <Card key={batch.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{batch.name}</h4>
                            <p className="text-sm text-gray-600">{batch.courseName}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={batch.status === 'active' ? 'default' : 'secondary'}>
                              {batch.status}
                            </Badge>
                            <Badge variant={batch.studentCount >= batch.maxCapacity ? 'destructive' : 'outline'}>
                              {batch.studentCount}/{batch.maxCapacity}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Schedule</Label>
                            <p className="text-sm text-gray-900">{batch.timings}</p>
                            <p className="text-xs text-gray-600">{batch.daysOfWeek}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Duration</Label>
                            <p className="text-sm text-gray-900">{batch.startDate} - {batch.endDate}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Faculty</Label>
                            <p className="text-sm text-gray-900">{batch.facultyName}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Revenue</Label>
                            <p className="text-sm text-gray-900">₹{batch.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewBatchDetails(batch.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditBatch(batch.id)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleTrackAttendance(batch.id)}>
                            <Calendar className="w-3 h-3 mr-1" />
                            Attendance
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteBatch(batch.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Course Modal */}
          {showAddCourseForm && (
            <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <CardContent className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Add New Course</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddCourseForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="courseName">Course Name *</Label>
                      <Input
                        id="courseName"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., CBSE Class 10 Mathematics"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="courseCategory">Course Category *</Label>
                      <Select value={newCourse.category} onValueChange={(value) => setNewCourse(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cbse">CBSE</SelectItem>
                          <SelectItem value="icse">ICSE</SelectItem>
                          <SelectItem value="state-board">State Board</SelectItem>
                          <SelectItem value="competitive">Competitive Exams</SelectItem>
                          <SelectItem value="professional">Professional Courses</SelectItem>
                          <SelectItem value="language">Language Courses</SelectItem>
                          <SelectItem value="computer">Computer Courses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="courseDescription">Course Description *</Label>
                    <Textarea
                      id="courseDescription"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the course content, objectives, and benefits..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration *</Label>
                      <Input
                        id="duration"
                        value={newCourse.duration}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 6 months"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fee">Fee Structure *</Label>
                      <Input
                        id="fee"
                        value={newCourse.fee}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, fee: e.target.value }))}
                        placeholder="e.g., ₹15,000"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="prerequisites">Prerequisites</Label>
                      <Input
                        id="prerequisites"
                        value={newCourse.prerequisites}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, prerequisites: e.target.value }))}
                        placeholder="e.g., Basic Mathematics"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="certificateDetails">Certificate Details</Label>
                      <Input
                        id="certificateDetails"
                        value={newCourse.certificateDetails}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, certificateDetails: e.target.value }))}
                        placeholder="e.g., Completion Certificate"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="courseImages">Course Images</Label>
                      <Input
                        type="file"
                        id="courseImages"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleCourseImageUpload(e.target.files)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddCourseForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add Course
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Add New Batch Modal */}
          {showAddBatchForm && (
            <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <CardContent className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Create New Batch</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddBatchForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleAddBatch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="batchName">Batch Name/ID *</Label>
                      <Input
                        id="batchName"
                        value={newBatch.name}
                        onChange={(e) => setNewBatch(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., CBSE-Math-10A"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="courseSelection">Course Selection *</Label>
                      <Select value={newBatch.courseId} onValueChange={(value) => setNewBatch(prev => ({ ...prev, courseId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.length > 0 ? (
                            courses.map(course => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name || course.title || 'Untitled Course'}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No courses available. Please add a course first.
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        type="date"
                        id="startDate"
                        value={newBatch.startDate}
                        onChange={(e) => setNewBatch(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        type="date"
                        id="endDate"
                        value={newBatch.endDate}
                        onChange={(e) => setNewBatch(prev => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="classTimings">Class Timings *</Label>
                      <Input
                        id="classTimings"
                        value={newBatch.timings}
                        onChange={(e) => setNewBatch(prev => ({ ...prev, timings: e.target.value }))}
                        placeholder="e.g., 8:00 AM - 10:00 AM"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="daysOfWeek">Days of Week *</Label>
                      <Input
                        id="daysOfWeek"
                        value={newBatch.daysOfWeek}
                        onChange={(e) => setNewBatch(prev => ({ ...prev, daysOfWeek: e.target.value }))}
                        placeholder="e.g., Monday, Wednesday, Friday"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxCapacity">Maximum Capacity *</Label>
                      <Input
                        type="number"
                        id="maxCapacity"
                        value={newBatch.maxCapacity}
                        onChange={(e) => setNewBatch(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                        placeholder="e.g., 25"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="assignedFaculty">Assigned Faculty *</Label>
                      <Input
                        id="assignedFaculty"
                        value={newBatch.facultyName}
                        onChange={(e) => setNewBatch(prev => ({ ...prev, facultyName: e.target.value }))}
                        placeholder="e.g., Dr. Rajesh Kumar"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="classroomAssignment">Classroom Assignment *</Label>
                      <Input
                        id="classroomAssignment"
                        value={newBatch.classroom}
                        onChange={(e) => setNewBatch(prev => ({ ...prev, classroom: e.target.value }))}
                        placeholder="e.g., Room 101"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="feeSchedule">Fee Schedule *</Label>
                      <Input
                        id="feeSchedule"
                        value={newBatch.feeSchedule}
                        onChange={(e) => setNewBatch(prev => ({ ...prev, feeSchedule: e.target.value }))}
                        placeholder="e.g., ₹5,000/month"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddBatchForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Batch
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="faculty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Team className="w-5 h-5" />
                  <span>Faculty Management</span>
                </div>
                <Button onClick={() => setShowAddFaculty(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Faculty Member
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Faculty Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{faculty.filter(f => f.status === 'active').length}</div>
                  <div className="text-sm text-blue-800">Active Faculty</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{faculty.filter(f => f.workType === 'full-time').length}</div>
                  <div className="text-sm text-green-800">Full-time</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{faculty.filter(f => f.workType === 'part-time').length}</div>
                  <div className="text-sm text-yellow-800">Part-time</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{faculty.filter(f => f.workType === 'visiting').length}</div>
                  <div className="text-sm text-purple-800">Visiting</div>
                </div>
              </div>

              {/* Faculty List */}
              <div className="space-y-4">
                {faculty.length === 0 ? (
                  <div className="text-center py-12">
                    <Team className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No faculty members yet</h3>
                    <p className="text-gray-500 mb-4">Start building your faculty team by adding your first faculty member.</p>
                    <Button onClick={() => setShowAddFaculty(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Faculty Member
                    </Button>
                  </div>
                ) : (
                  faculty.map((facultyMember) => (
                    <Card key={facultyMember.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={facultyMember.profilePhoto} />
                              <AvatarFallback className="bg-primary text-white text-lg font-semibold">
                                {facultyMember.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {facultyMember.fullName}
                              </h3>
                              <p className="text-sm text-gray-600">{facultyMember.designation}</p>
                              <p className="text-sm text-gray-600">{facultyMember.department}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={facultyMember.status === 'active' ? 'default' : 'secondary'}>
                              {facultyMember.status}
                            </Badge>
                            <Badge variant="outline">{facultyMember.workType}</Badge>
                            <Badge variant="outline">{facultyMember.experience} years exp.</Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Contact Information</Label>
                            <p className="text-sm text-gray-900">{facultyMember.contactNumber}</p>
                            <p className="text-sm text-gray-900">{facultyMember.email}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Academic Details</Label>
                            <p className="text-sm text-gray-900">{facultyMember.highestQualification}</p>
                            <p className="text-sm text-gray-600">{facultyMember.university}</p>
                            <p className="text-sm text-gray-600">{facultyMember.yearOfCompletion}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Workload</Label>
                            <p className="text-sm text-gray-900">{facultyMember.weeklyLectureHours || 0} hrs/week</p>
                            <p className="text-sm text-gray-600">{facultyMember.classSectionAllotted || 'Not assigned'}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditFaculty(facultyMember)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewFacultyDetails(facultyMember)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant={facultyMember.status === 'active' ? 'outline' : 'default'}
                            onClick={() => handleUpdateFacultyStatus(
                              facultyMember.id, 
                              facultyMember.status === 'active' ? 'inactive' : 'active'
                            )}
                          >
                            {facultyMember.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteFaculty(facultyMember.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Admissions management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fee Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Fee management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Reports and analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Marketing tools coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Account Information</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Institution Name</Label>
                        <p className="text-sm text-gray-900 mt-1">{institutionData?.institution_name || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Institution Type</Label>
                        <p className="text-sm text-gray-900 mt-1">{institutionData?.institution_type || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Established Year</Label>
                        <p className="text-sm text-gray-900 mt-1">{institutionData?.established_year || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <p className="text-sm text-gray-900 mt-1">{institutionData?.description || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Verification Status</Label>
                        <div className="mt-1">
                          <Badge 
                            variant={institutionData?.verified ? "default" : "secondary"}
                            className={institutionData?.verified ? "bg-green-100 text-green-800" : ""}
                          >
                            {institutionData?.verified ? "Verified" : "Pending Verification"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Profile Completion</Label>
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${institutionData?.profile_completion || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{institutionData?.profile_completion || 0}% Complete</p>
                        </div>
                      </div>
                    </div>
                  </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={handleEditProfile}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile Information
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-10 hover:bg-purple-50 hover:border-purple-200 transition-colors" 
                      onClick={() => alert('Public Profile feature is currently not available. You can still edit your profile information using the "Edit Profile Information" button above.')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Public Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Profile Information</h3>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="institutionName">Institution Name *</Label>
                    <Input
                      id="institutionName"
                      value={editingProfile.institution_name || ''}
                      onChange={(e) => setEditingProfile(prev => ({ ...prev, institution_name: e.target.value }))}
                      placeholder="Enter institution name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="institutionType">Institution Type *</Label>
                    <Select 
                      value={editingProfile.institution_type || ''} 
                      onValueChange={(value) => setEditingProfile(prev => ({ ...prev, institution_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select institution type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="training-center">Training Center</SelectItem>
                        <SelectItem value="coaching-institute">Coaching Institute</SelectItem>
                        <SelectItem value="online-platform">Online Platform</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="establishedYear">Established Year *</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={editingProfile.established_year || ''}
                      onChange={(e) => setEditingProfile(prev => ({ ...prev, established_year: parseInt(e.target.value) }))}
                      placeholder="e.g., 2020"
                      min="1900"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                  

                </div>
                
                <div className="mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingProfile.description || ''}
                    onChange={(e) => setEditingProfile(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your institution, its mission, and what makes it unique..."
                    rows={3}
                  />
                </div>
              </div>



            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Inquiry Modal */}
      {showAddInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Student Inquiry</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddInquiry(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddInquiry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    value={newInquiry.studentName}
                    onChange={(e) => setNewInquiry(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="Enter student name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="parentName">Parent Name *</Label>
                  <Input
                    id="parentName"
                    value={newInquiry.parentName}
                    onChange={(e) => setNewInquiry(prev => ({ ...prev, parentName: e.target.value }))}
                    placeholder="Enter parent name"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newInquiry.phone}
                    onChange={(e) => setNewInquiry(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newInquiry.email}
                    onChange={(e) => setNewInquiry(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="student@email.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseInterest">Course Interest *</Label>
                  <Input
                    id="courseInterest"
                    value={newInquiry.courseInterest}
                    onChange={(e) => setNewInquiry(prev => ({ ...prev, courseInterest: e.target.value }))}
                    placeholder="e.g., CBSE Class 10 Mathematics"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="preferredBatch">Preferred Batch</Label>
                  <Input
                    id="preferredBatch"
                    value={newInquiry.preferredBatch}
                    onChange={(e) => setNewInquiry(prev => ({ ...prev, preferredBatch: e.target.value }))}
                    placeholder="e.g., Morning, Evening"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetRange">Budget Range *</Label>
                  <Select value={newInquiry.budgetRange} onValueChange={(value) => setNewInquiry(prev => ({ ...prev, budgetRange: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                      <SelectItem value="1000-2000">₹1,000 - ₹2,000</SelectItem>
                      <SelectItem value="2000-3000">₹2,000 - ₹3,000</SelectItem>
                      <SelectItem value="3000+">₹3,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="source">Inquiry Source *</Label>
                  <Select value={newInquiry.source} onValueChange={(value) => setNewInquiry(prev => ({ ...prev, source: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="walk-in">Walk-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority Level *</Label>
                  <Select value={newInquiry.priority} onValueChange={(value) => setNewInquiry(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newInquiry.notes}
                  onChange={(e) => setNewInquiry(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about the inquiry..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowAddInquiry(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Inquiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {showInquiryDetail && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Inquiry Details - {selectedInquiry.studentName}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowInquiryDetail(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Student Name</Label>
                    <p className="text-sm text-gray-900">{selectedInquiry.studentName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Parent Name</Label>
                    <p className="text-sm text-gray-900">{selectedInquiry.parentName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Phone</Label>
                    <p className="text-sm text-gray-900">{selectedInquiry.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-sm text-gray-900">{selectedInquiry.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Course & Budget Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Course & Budget Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Course Interest</Label>
                    <p className="text-sm text-gray-900">{selectedInquiry.courseInterest}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Preferred Batch</Label>
                    <p className="text-sm text-gray-900">{selectedInquiry.preferredBatch || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Budget Range</Label>
                    <p className="text-sm text-gray-900">₹{selectedInquiry.budgetRange}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Inquiry Source</Label>
                    <p className="text-sm text-gray-900">{selectedInquiry.source}</p>
                  </div>
                </div>
              </div>

              {/* Status & Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Status & Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Current Status</Label>
                    <Badge 
                      variant={getStatusVariant(selectedInquiry.status)}
                      className={getStatusBadgeClass(selectedInquiry.status)}
                    >
                      {selectedInquiry.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Priority Level</Label>
                    <Badge 
                      variant={getPriorityVariant(selectedInquiry.priority)}
                      className={getPriorityBadgeClass(selectedInquiry.priority)}
                    >
                      {selectedInquiry.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Inquiry Date</Label>
                    <p className="text-sm text-gray-900">{selectedInquiry.inquiryDate} at {selectedInquiry.inquiryTime}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Last Follow-up</Label>
                    <p className="text-sm text-gray-900">{selectedInquiry.lastFollowUp}</p>
                  </div>
                </div>
              </div>

              {/* Conversion Probability */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Conversion Analysis</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-blue-800">Conversion Probability</Label>
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateConversionProbability(selectedInquiry)}%
                      </div>
                    </div>
                    <div className="w-32 h-32 relative">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          strokeWidth="2"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                        />
                        <path
                          className="text-blue-600"
                          strokeWidth="2"
                          strokeDasharray={`${calculateConversionProbability(selectedInquiry)}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication History */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Communication History</h4>
                {selectedInquiry.communicationHistory && selectedInquiry.communicationHistory.length > 0 ? (
                  <div className="space-y-3">
                    {selectedInquiry.communicationHistory.map((comm) => (
                      <div key={comm.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{comm.type}</Badge>
                              <span className="text-sm text-gray-600">{comm.date}</span>
                            </div>
                            <p className="text-sm text-gray-900 mt-1">{comm.notes}</p>
                            {comm.outcome && (
                              <p className="text-xs text-gray-600 mt-1">Outcome: {comm.outcome}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No communication history yet</p>
                )}
                
                <Button 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => setShowFollowUpModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Follow-up
                </Button>
              </div>

              {/* Follow-up Reminders */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Follow-up Reminders</h4>
                {selectedInquiry.followUpReminders && selectedInquiry.followUpReminders.length > 0 ? (
                  <div className="space-y-3">
                    {selectedInquiry.followUpReminders.map((reminder) => (
                      <div key={reminder.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={reminder.completed ? "default" : "secondary"}>
                                {reminder.completed ? "Completed" : "Pending"}
                              </Badge>
                              <span className="text-sm text-gray-600">{reminder.date}</span>
                            </div>
                            <p className="text-sm text-gray-900 mt-1">{reminder.notes}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No follow-up reminders set</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Details
                </Button>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Visit
                </Button>
                <Button 
                  variant="outline" 
                  className="text-blue-600 border-blue-600"
                  onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, 'interested')}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Mark as Interested
                </Button>
                <Button 
                  variant="outline" 
                  className="text-green-600 border-green-600"
                  onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, 'admitted')}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convert to Admission
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-600"
                  onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, 'closed')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Not Suitable
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Follow-up Modal */}
      {showFollowUpModal && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Follow-up</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFollowUpModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="followUpType">Follow-up Type</Label>
                <Select value={newFollowUp.type} onValueChange={(value) => setNewFollowUp(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="visit">Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="followUpNotes">Notes</Label>
                <Textarea
                  id="followUpNotes"
                  value={newFollowUp.notes}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter follow-up details..."
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="followUpOutcome">Outcome</Label>
                <Input
                  id="followUpOutcome"
                  value={newFollowUp.outcome}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, outcome: e.target.value }))}
                  placeholder="e.g., Student interested, Will call back..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowFollowUpModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleAddFollowUp(selectedInquiry.id)}>
                  Add Follow-up
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Faculty Member Modal */}
      {showAddFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Faculty Member</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddFaculty(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddFaculty} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Personal Information (Basic Identity)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newFaculty.fullName}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={newFaculty.gender} onValueChange={(value) => setNewFaculty(prev => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newFaculty.dateOfBirth}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactNumber">Contact Number (Mobile) *</Label>
                    <Input
                      id="contactNumber"
                      value={newFaculty.contactNumber}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, contactNumber: e.target.value }))}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newFaculty.email}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="faculty@institution.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address (Permanent/Current)</Label>
                    <Textarea
                      id="address"
                      value={newFaculty.address}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter complete address"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="profilePhoto">Profile Photo (optional)</Label>
                    <Input
                      id="profilePhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle file upload logic here
                          setNewFaculty(prev => ({ ...prev, profilePhoto: URL.createObjectURL(file) }));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Professional Details (Core Employment Info)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeId">Employee ID / Faculty Code *</Label>
                    <Input
                      id="employeeId"
                      value={newFaculty.employeeId}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, employeeId: e.target.value }))}
                      placeholder="e.g., FAC001"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={newFaculty.department}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="designation">Designation *</Label>
                    <Select value={newFaculty.designation} onValueChange={(value) => setNewFaculty(prev => ({ ...prev, designation: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                        <SelectItem value="Lecturer">Lecturer</SelectItem>
                        <SelectItem value="HOD">HOD</SelectItem>
                        <SelectItem value="Coordinator">Coordinator</SelectItem>
                        <SelectItem value="Guest Faculty">Guest Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="specialization">Specialization / Subjects taught *</Label>
                    <Input
                      id="specialization"
                      value={newFaculty.specialization}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, specialization: e.target.value }))}
                      placeholder="e.g., Mathematics, Physics, English"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dateOfJoining">Date of Joining *</Label>
                    <Input
                      id="dateOfJoining"
                      type="date"
                      value={newFaculty.dateOfJoining}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, dateOfJoining: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="workType">Work Type *</Label>
                    <Select value={newFaculty.workType} onValueChange={(value) => setNewFaculty(prev => ({ ...prev, workType: value as 'full-time' | 'part-time' | 'visiting' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="visiting">Visiting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="experience">Experience (Years) *</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={newFaculty.experience}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Academic Qualifications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Academic Qualifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="highestQualification">Highest Qualification *</Label>
                    <Select value={newFaculty.highestQualification} onValueChange={(value) => setNewFaculty(prev => ({ ...prev, highestQualification: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Masters">Masters</SelectItem>
                        <SelectItem value="Bachelors">Bachelors</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="university">University/Institution</Label>
                    <Input
                      id="university"
                      value={newFaculty.university}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, university: e.target.value }))}
                      placeholder="e.g., IIT, Delhi University"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="yearOfCompletion">Year of Completion</Label>
                    <Input
                      id="yearOfCompletion"
                      type="number"
                      value={newFaculty.yearOfCompletion}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, yearOfCompletion: e.target.value }))}
                      placeholder="e.g., 2020"
                      min="1950"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>

              {/* Institutional Role & Access */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Institutional Role & Access</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facultyRole">Faculty Role *</Label>
                    <Select value={newFaculty.facultyRole} onValueChange={(value) => setNewFaculty(prev => ({ ...prev, facultyRole: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="HOD">HOD</SelectItem>
                        <SelectItem value="Coordinator">Coordinator</SelectItem>
                        <SelectItem value="Examiner">Examiner</SelectItem>
                        <SelectItem value="Mentor">Mentor</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="systemAccess">System Access *</Label>
                    <Select value={newFaculty.systemAccess} onValueChange={(value) => setNewFaculty(prev => ({ ...prev, systemAccess: value as 'admin' | 'limited' | 'teaching-only' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                        <SelectItem value="teaching-only">Teaching-only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Workload & Classes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Workload & Classes</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="coursesAssigned">Courses Assigned</Label>
                    <Textarea
                      id="coursesAssigned"
                      value={newFaculty.coursesAssigned.join(', ')}
                      onChange={(e) => setNewFaculty(prev => ({ 
                        ...prev, 
                        coursesAssigned: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      }))}
                      placeholder="e.g., Mathematics 101, Calculus, Algebra"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple courses with commas</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="classSectionAllotted">Class/Section Allotted</Label>
                    <Input
                      id="classSectionAllotted"
                      value={newFaculty.classSectionAllotted}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, classSectionAllotted: e.target.value }))}
                      placeholder="e.g., Class 10A, Section B"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weeklyLectureHours">Weekly Lecture Hours</Label>
                    <Input
                      id="weeklyLectureHours"
                      type="number"
                      value={newFaculty.weeklyLectureHours}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, weeklyLectureHours: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      min="0"
                      max="40"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Status</h4>
                <div>
                  <Label htmlFor="status">Active / Inactive *</Label>
                  <Select value={newFaculty.status} onValueChange={(value) => setNewFaculty(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddFaculty(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Faculty Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Faculty Member Modal */}
      {showEditFaculty && editingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Edit Faculty Member</h3>
          <Button variant="ghost" size="sm" onClick={handleCancelFacultyEdit}>
            <X className="w-4 h-4" />
          </Button>
        </div>
            
            <form onSubmit={handleSaveFacultyEdit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Personal Information (Basic Identity)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-fullName">Full Name *</Label>
                    <Input
                      id="edit-fullName"
                      value={editingFaculty.fullName}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, fullName: e.target.value } : null)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select value={editingFaculty.gender} onValueChange={(value) => setEditingFaculty(prev => prev ? { ...prev, gender: value as 'male' | 'female' | 'other' } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                    <Input
                      id="edit-dateOfBirth"
                      type="date"
                      value={editingFaculty.dateOfBirth}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, dateOfBirth: e.target.value } : null)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-contactNumber">Contact Number (Mobile) *</Label>
                    <Input
                      id="edit-contactNumber"
                      value={editingFaculty.contactNumber}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, contactNumber: e.target.value } : null)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-email">Email Address *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingFaculty.email}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, email: e.target.value } : null)}
                      placeholder="faculty@institution.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-address">Address (Permanent/Current)</Label>
                    <Textarea
                      id="edit-address"
                      value={editingFaculty.address}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, address: e.target.value } : null)}
                      placeholder="Enter complete address"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-profilePhoto">Profile Photo (optional)</Label>
                    <Input
                      id="edit-profilePhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && editingFaculty) {
                          setEditingFaculty({ ...editingFaculty, profilePhoto: URL.createObjectURL(file) });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Professional Details (Core Employment Info)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-employeeId">Employee ID / Faculty Code *</Label>
                    <Input
                      id="edit-employeeId"
                      value={editingFaculty.employeeId}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, employeeId: e.target.value } : null)}
                      placeholder="e.g., FAC001"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-department">Department *</Label>
                    <Input
                      id="edit-department"
                      value={editingFaculty.department}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, department: e.target.value } : null)}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-designation">Designation *</Label>
                    <Select value={editingFaculty.designation} onValueChange={(value) => setEditingFaculty(prev => prev ? { ...prev, designation: value } : null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                        <SelectItem value="Lecturer">Lecturer</SelectItem>
                        <SelectItem value="HOD">HOD</SelectItem>
                        <SelectItem value="Coordinator">Coordinator</SelectItem>
                        <SelectItem value="Guest Faculty">Guest Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-specialization">Specialization / Subjects taught *</Label>
                    <Input
                      id="edit-specialization"
                      value={editingFaculty.specialization}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, specialization: e.target.value } : null)}
                      placeholder="e.g., Mathematics, Physics, English"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-dateOfJoining">Date of Joining *</Label>
                    <Input
                      id="edit-dateOfJoining"
                      type="date"
                      value={editingFaculty.dateOfJoining}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, dateOfJoining: e.target.value } : null)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-workType">Work Type *</Label>
                    <Select value={editingFaculty.workType} onValueChange={(value) => setEditingFaculty(prev => prev ? { ...prev, workType: value as 'full-time' | 'part-time' | 'visiting' } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="visiting">Visiting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-experience">Experience (Years) *</Label>
                    <Input
                      id="edit-experience"
                      type="number"
                      value={editingFaculty.experience}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, experience: parseInt(e.target.value) || 0 } : null)}
                      placeholder="0"
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Academic Qualifications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Academic Qualifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-highestQualification">Highest Qualification *</Label>
                    <Select value={editingFaculty.highestQualification} onValueChange={(value) => setEditingFaculty(prev => prev ? { ...prev, highestQualification: value } : null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Masters">Masters</SelectItem>
                        <SelectItem value="Bachelors">Bachelors</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-university">University/Institution</Label>
                    <Input
                      id="edit-university"
                      value={editingFaculty.university}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, university: e.target.value } : null)}
                      placeholder="e.g., IIT, Delhi University"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-yearOfCompletion">Year of Completion</Label>
                    <Input
                      id="edit-yearOfCompletion"
                      type="number"
                      value={editingFaculty.yearOfCompletion}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, yearOfCompletion: e.target.value } : null)}
                      placeholder="e.g., 2020"
                      min="1950"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>

              {/* Institutional Role & Access */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Institutional Role & Access</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-facultyRole">Faculty Role *</Label>
                    <Select value={editingFaculty.facultyRole} onValueChange={(value) => setEditingFaculty(prev => prev ? { ...prev, facultyRole: value } : null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="HOD">HOD</SelectItem>
                        <SelectItem value="Coordinator">Coordinator</SelectItem>
                        <SelectItem value="Examiner">Examiner</SelectItem>
                        <SelectItem value="Mentor">Mentor</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-systemAccess">System Access *</Label>
                    <Select value={editingFaculty.systemAccess} onValueChange={(value) => setEditingFaculty(prev => prev ? { ...prev, systemAccess: value as 'admin' | 'limited' | 'teaching-only' } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                        <SelectItem value="teaching-only">Teaching-only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Workload & Classes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Workload & Classes</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-coursesAssigned">Courses Assigned</Label>
                    <Textarea
                      id="edit-coursesAssigned"
                      value={editingFaculty.coursesAssigned.join(', ')}
                      onChange={(e) => setEditingFaculty(prev => prev ? { 
                        ...prev, 
                        coursesAssigned: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      } : null)}
                      placeholder="e.g., Mathematics 101, Calculus, Algebra"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple courses with commas</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-classSectionAllotted">Class/Section Allotted</Label>
                    <Input
                      id="edit-classSectionAllotted"
                      value={editingFaculty.classSectionAllotted}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, classSectionAllotted: e.target.value } : null)}
                      placeholder="e.g., Class 10A, Section B"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-weeklyLectureHours">Weekly Lecture Hours</Label>
                    <Input
                      id="edit-weeklyLectureHours"
                      type="number"
                      value={editingFaculty.weeklyLectureHours}
                      onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, weeklyLectureHours: parseInt(e.target.value) || 0 } : null)}
                      placeholder="0"
                      min="0"
                      max="40"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Status</h4>
                <div>
                  <Label htmlFor="edit-status">Active / Inactive *</Label>
                  <Select value={editingFaculty.status} onValueChange={(value) => setEditingFaculty(prev => prev ? { ...prev, status: value as 'active' | 'inactive' } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCancelFacultyEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingFaculty}>
                  {isSavingFaculty ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Detail View Modal */}
      {showFacultyDetail && selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Faculty Member Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFacultyDetail(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Header with Avatar and Basic Info */}
              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={selectedFaculty.profilePhoto} />
                  <AvatarFallback className="bg-primary text-white text-2xl font-semibold">
                    {selectedFaculty.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedFaculty.fullName}</h2>
                  <p className="text-lg text-gray-600">{selectedFaculty.designation}</p>
                  <p className="text-gray-600">{selectedFaculty.department}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={selectedFaculty.status === 'active' ? 'default' : 'secondary'}>
                      {selectedFaculty.status}
                    </Badge>
                    <Badge variant="outline">{selectedFaculty.workType}</Badge>
                    <Badge variant="outline">{selectedFaculty.experience} years exp.</Badge>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <p className="text-gray-900">{selectedFaculty.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Gender</Label>
                    <p className="text-gray-900">{selectedFaculty.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                    <p className="text-gray-900">{selectedFaculty.dateOfBirth || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Contact Number</Label>
                    <p className="text-gray-900">{selectedFaculty.contactNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                    <p className="text-gray-900">{selectedFaculty.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Address</Label>
                    <p className="text-gray-900">{selectedFaculty.address || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Professional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Employee ID</Label>
                    <p className="text-gray-900">{selectedFaculty.employeeId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Department</Label>
                    <p className="text-gray-900">{selectedFaculty.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Designation</Label>
                    <p className="text-gray-900">{selectedFaculty.designation}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Specialization</Label>
                    <p className="text-gray-900">{selectedFaculty.specialization}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Date of Joining</Label>
                    <p className="text-gray-900">{selectedFaculty.dateOfJoining}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Work Type</Label>
                    <p className="text-gray-900">{selectedFaculty.workType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Experience</Label>
                    <p className="text-gray-900">{selectedFaculty.experience} years</p>
                  </div>
                </div>
              </div>

              {/* Academic Qualifications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Academic Qualifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Highest Qualification</Label>
                    <p className="text-gray-900">{selectedFaculty.highestQualification}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">University/Institution</Label>
                    <p className="text-gray-900">{selectedFaculty.university || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Year of Completion</Label>
                    <p className="text-gray-900">{selectedFaculty.yearOfCompletion || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Institutional Role & Access */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Institutional Role & Access</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Faculty Role</Label>
                    <p className="text-gray-900">{selectedFaculty.facultyRole}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">System Access</Label>
                    <p className="text-gray-900">{selectedFaculty.systemAccess}</p>
                  </div>
                </div>
              </div>

              {/* Workload & Classes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Workload & Classes</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Courses Assigned</Label>
                    <p className="text-gray-900">
                      {selectedFaculty.coursesAssigned && selectedFaculty.coursesAssigned.length > 0 
                        ? selectedFaculty.coursesAssigned.join(', ')
                        : 'No courses assigned'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Class/Section Allotted</Label>
                    <p className="text-gray-900">{selectedFaculty.classSectionAllotted || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Weekly Lecture Hours</Label>
                    <p className="text-gray-900">{selectedFaculty.weeklyLectureHours || 0} hours/week</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowFacultyDetail(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowFacultyDetail(false);
                    handleEditFaculty(selectedFaculty);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Faculty Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Batch Details Modal */}
      {showViewBatchDetails && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Batch Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowViewBatchDetails(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Header with Batch Info */}
              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBatch.name}</h2>
                  <p className="text-lg text-gray-600">{selectedBatch.courseName}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={selectedBatch.status === 'active' ? 'default' : 'secondary'}>
                      {selectedBatch.status}
                    </Badge>
                    <Badge variant="outline">{selectedBatch.studentCount}/{selectedBatch.maxCapacity} students</Badge>
                  </div>
                </div>
              </div>

              {/* Batch Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Batch Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Batch Name</Label>
                    <p className="text-gray-900">{selectedBatch.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Course</Label>
                    <p className="text-gray-900">{selectedBatch.courseName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Schedule</Label>
                    <p className="text-gray-900">{selectedBatch.timings}</p>
                    <p className="text-sm text-gray-600">{selectedBatch.daysOfWeek}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Duration</Label>
                    <p className="text-gray-900">{selectedBatch.startDate} - {selectedBatch.endDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Faculty</Label>
                    <p className="text-gray-900">{selectedBatch.facultyName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Capacity</Label>
                    <p className="text-gray-900">{selectedBatch.studentCount} / {selectedBatch.maxCapacity} students</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Revenue</Label>
                    <p className="text-gray-900">₹{selectedBatch.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <p className="text-gray-900">{selectedBatch.status}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowViewBatchDetails(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowViewBatchDetails(false);
                    handleEditBatch(selectedBatch.id);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Batch
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {showEditBatch && editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Batch</h3>
              <Button variant="ghost" size="sm" onClick={handleCancelBatchEdit}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSaveBatchEdit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-batch-name">Batch Name *</Label>
                    <Input
                      id="edit-batch-name"
                      value={editingBatch.name}
                      onChange={(e) => setEditingBatch(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="Enter batch name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-batch-course">Course *</Label>
                    <Input
                      id="edit-batch-course"
                      value={editingBatch.courseName}
                      onChange={(e) => setEditingBatch(prev => prev ? { ...prev, courseName: e.target.value } : null)}
                      placeholder="Enter course name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-batch-timings">Schedule *</Label>
                    <Input
                      id="edit-batch-timings"
                      value={editingBatch.timings}
                      onChange={(e) => setEditingBatch(prev => prev ? { ...prev, timings: e.target.value } : null)}
                      placeholder="e.g., 8:00 AM - 10:00 AM"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-batch-days">Days of Week *</Label>
                    <Input
                      id="edit-batch-days"
                      value={editingBatch.daysOfWeek}
                      onChange={(e) => setEditingBatch(prev => prev ? { ...prev, daysOfWeek: e.target.value } : null)}
                      placeholder="e.g., Monday, Wednesday, Friday"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-batch-start">Start Date *</Label>
                    <Input
                      id="edit-batch-start"
                      type="date"
                      value={editingBatch.startDate}
                      onChange={(e) => setEditingBatch(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-batch-end">End Date *</Label>
                    <Input
                      id="edit-batch-end"
                      type="date"
                      value={editingBatch.endDate}
                      onChange={(e) => setEditingBatch(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-batch-faculty">Faculty Name *</Label>
                    <Input
                      id="edit-batch-faculty"
                      value={editingBatch.facultyName}
                      onChange={(e) => setEditingBatch(prev => prev ? { ...prev, facultyName: e.target.value } : null)}
                      placeholder="Enter faculty name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-batch-capacity">Max Capacity *</Label>
                    <Input
                      id="edit-batch-capacity"
                      type="number"
                      value={editingBatch.maxCapacity}
                      onChange={(e) => setEditingBatch(prev => prev ? { ...prev, maxCapacity: parseInt(e.target.value) || 0 } : null)}
                      placeholder="25"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-batch-status">Status *</Label>
                    <Select value={editingBatch.status} onValueChange={(value) => setEditingBatch(prev => prev ? { ...prev, status: value as 'active' | 'inactive' } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCancelBatchEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingBatch}>
                  {isSavingBatch ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Tracking Modal */}
      {showAttendanceTracking && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Attendance Tracking - {selectedBatch.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAttendanceTracking(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Batch Info Header */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Course</Label>
                    <p className="text-gray-900">{selectedBatch.courseName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Schedule</Label>
                    <p className="text-gray-900">{selectedBatch.timings}</p>
                    <p className="text-sm text-gray-600">{selectedBatch.daysOfWeek}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Faculty</Label>
                    <p className="text-gray-900">{selectedBatch.facultyName}</p>
                  </div>
                </div>
              </div>

              {/* Attendance Management */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Attendance Management</h4>
                
                {/* Date Selection */}
                <div className="mb-4">
                  <Label htmlFor="attendance-date">Select Date</Label>
                  <Input
                    id="attendance-date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Student List */}
                <div className="border rounded-lg">
                  <div className="p-4 bg-gray-50 border-b">
                    <h5 className="font-medium">Student Attendance</h5>
                    <p className="text-sm text-gray-600">Mark attendance for {selectedBatch.studentCount} students</p>
                  </div>
                  
                  {selectedBatch.studentCount === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
                      <p className="text-gray-500">Students need to be enrolled in this batch before tracking attendance.</p>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="space-y-3">
                        {/* Sample student attendance rows - in real implementation, this would come from enrolled students */}
                        {Array.from({ length: Math.min(selectedBatch.studentCount, 5) }, (_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gray-200 text-gray-700">
                                  S{i + 1}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">Student {i + 1}</p>
                                <p className="text-sm text-gray-600">Roll No: {1000 + i}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Present
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <X className="w-4 h-4 mr-1" />
                                Absent
                              </Button>
                              <Button size="sm" variant="outline" className="text-yellow-600 hover:text-yellow-700">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Late
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAttendanceTracking(false)}>
                  Close
                </Button>
                <Button disabled={selectedBatch.studentCount === 0}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Attendance
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditCourse && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Course</h3>
              <Button variant="ghost" size="sm" onClick={handleCancelCourseEdit}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSaveCourseEdit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Course Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-course-name">Course Name *</Label>
                    <Input
                      id="edit-course-name"
                      value={editingCourse.name}
                      onChange={(e) => setEditingCourse(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="Enter course name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-course-category">Category</Label>
                    <Input
                      id="edit-course-category"
                      value={editingCourse.category}
                      onChange={(e) => setEditingCourse(prev => prev ? { ...prev, category: e.target.value } : null)}
                      placeholder="e.g., Mathematics, Science, Computer"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-course-duration">Duration (Hours) *</Label>
                    <Input
                      id="edit-course-duration"
                      type="number"
                      value={editingCourse.duration ? parseInt(editingCourse.duration.replace(' hours', '')) : ''}
                      onChange={(e) => setEditingCourse(prev => prev ? { ...prev, duration: `${e.target.value} hours` } : null)}
                      placeholder="e.g., 6"
                      min="1"
                      max="200"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-course-fee">Fee (₹) *</Label>
                    <Input
                      id="edit-course-fee"
                      type="number"
                      value={editingCourse.fee ? parseFloat(editingCourse.fee.replace('₹', '')) : ''}
                      onChange={(e) => setEditingCourse(prev => prev ? { ...prev, fee: `₹${e.target.value}` } : null)}
                      placeholder="e.g., 15000"
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="edit-course-description">Description *</Label>
                  <Textarea
                    id="edit-course-description"
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Describe your course, its objectives, and what students will learn..."
                    rows={4}
                    required
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-course-prerequisites">Prerequisites</Label>
                    <Textarea
                      id="edit-course-prerequisites"
                      value={editingCourse.prerequisites}
                      onChange={(e) => setEditingCourse(prev => prev ? { ...prev, prerequisites: e.target.value } : null)}
                      placeholder="Any prerequisites or requirements for this course..."
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-course-certificate">Certificate Details</Label>
                    <Textarea
                      id="edit-course-certificate"
                      value={editingCourse.certificateDetails}
                      onChange={(e) => setEditingCourse(prev => prev ? { ...prev, certificateDetails: e.target.value } : null)}
                      placeholder="Information about certificates or completion awards..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="edit-course-status">Status *</Label>
                  <Select value={editingCourse.status} onValueChange={(value) => setEditingCourse(prev => prev ? { ...prev, status: value as 'active' | 'inactive' | 'scheduled' } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCancelCourseEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingCourse}>
                  {isSavingCourse ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Batch to Course Modal */}
      {showAddBatchToCourse && selectedCourseForBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Batch - {selectedCourseForBatch.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowAddBatchToCourse(false);
                setSelectedCourseForBatch(null);
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddBatch} className="space-y-6">
              {/* Course Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Course Details</h4>
                <p className="text-sm text-gray-600">{selectedCourseForBatch.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <span><strong>Duration:</strong> {selectedCourseForBatch.duration}</span>
                  <span><strong>Fee:</strong> {selectedCourseForBatch.fee}</span>
                </div>
              </div>

              {/* Batch Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Batch Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch-name">Batch Name *</Label>
                    <Input
                      id="batch-name"
                      value={newBatch.name}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={`${selectedCourseForBatch.name} - Batch A`}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-faculty">Faculty Name *</Label>
                    <Input
                      id="batch-faculty"
                      value={newBatch.facultyName}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, facultyName: e.target.value }))}
                      placeholder="Enter faculty name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-start">Start Date *</Label>
                    <Input
                      id="batch-start"
                      type="date"
                      value={newBatch.startDate}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-end">End Date *</Label>
                    <Input
                      id="batch-end"
                      type="date"
                      value={newBatch.endDate}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-timings">Schedule *</Label>
                    <Input
                      id="batch-timings"
                      value={newBatch.timings}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, timings: e.target.value }))}
                      placeholder="e.g., 8:00 AM - 10:00 AM"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-days">Days of Week *</Label>
                    <Input
                      id="batch-days"
                      value={newBatch.daysOfWeek}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, daysOfWeek: e.target.value }))}
                      placeholder="e.g., Monday, Wednesday, Friday"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-capacity">Max Capacity *</Label>
                    <Input
                      id="batch-capacity"
                      type="number"
                      value={newBatch.maxCapacity}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) || 0 }))}
                      placeholder="25"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-classroom">Classroom</Label>
                    <Input
                      id="batch-classroom"
                      value={newBatch.classroom}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, classroom: e.target.value }))}
                      placeholder="e.g., Room 101, Lab A"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-fee">Fee Schedule</Label>
                    <Input
                      id="batch-fee"
                      value={newBatch.feeSchedule}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, feeSchedule: e.target.value }))}
                      placeholder="e.g., Monthly, Quarterly, Full Payment"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setShowAddBatchToCourse(false);
                  setSelectedCourseForBatch(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Batch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
