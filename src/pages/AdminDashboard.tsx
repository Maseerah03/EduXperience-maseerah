import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminAuthenticated, adminLogout, getAdminSession } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle, 
  LogOut,
  FileText,
  MessageSquare,
  Star,
  Image,
  AlertTriangle,
  Eye,
  Trash2,
  Flag,
  BarChart3,
  RefreshCw,
  Activity,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  verification_status: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  status: string;
  created_at: string;
  user_email: string;
}

interface Review {
  id: string;
  reviewer_id: string;
  tutor_id: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  reviewer_email: string;
  tutor_email: string;
}

interface Content {
  id: string;
  user_id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  status: string;
  created_at: string;
  user_email: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'payment' | 'payout' | 'refund' | 'fee';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  payment_method?: string;
  transaction_id?: string;
}

interface Payout {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'stripe';
  account_details: string;
  created_at: string;
  processed_at?: string;
  user_email: string;
  notes?: string;
}

interface Refund {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  created_at: string;
  processed_at?: string;
  admin_notes?: string;
  original_transaction: Transaction;
}

interface Fee {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  currency: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AnalyticsData {
  userGrowth: {
    totalUsers: number;
    newUsersThisMonth: number;
    newUsersThisWeek: number;
    activeUsers: number;
    userGrowthRate: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    weeklyRevenue: number;
    revenueGrowthRate: number;
    averageTransactionValue: number;
  };
  engagementMetrics: {
    totalSessions: number;
    activeTutors: number;
    activeStudents: number;
    contentUploads: number;
    reviewSubmissions: number;
  };
  platformPerformance: {
    totalProfiles: number;
    verificationRate: number;
    contentApprovalRate: number;
    averageRating: number;
    responseTime: number;
  };
  timeSeriesData: {
    dates: string[];
    userCounts: number[];
    revenueData: number[];
    sessionCounts: number[];
  };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("verification");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadAllData();
    
    // Set up real-time subscriptions
    const setupRealtimeSubscriptions = () => {
      // Users subscription
      const usersSubscription = supabase
        .channel('admin-users-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'public_users' }, () => {
          loadUsers();
        })
        .subscribe();

      // Profiles subscription
      const profilesSubscription = supabase
        .channel('admin-profiles-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tutor_profiles' }, () => {
          loadProfiles();
        })
        .subscribe();

      // Reviews subscription
      const reviewsSubscription = supabase
        .channel('admin-reviews-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
          loadReviews();
        })
        .subscribe();

      // Content subscription
      const contentSubscription = supabase
        .channel('admin-content-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tutor_content' }, () => {
          loadContent();
        })
        .subscribe();

      // Transactions subscription
      const transactionsSubscription = supabase
        .channel('admin-transactions-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
          loadTransactions();
        })
        .subscribe();

      // Payouts subscription
      const payoutsSubscription = supabase
        .channel('admin-payouts-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payouts' }, () => {
          loadPayouts();
        })
        .subscribe();

      // Refunds subscription
      const refundsSubscription = supabase
        .channel('admin-refunds-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'refunds' }, () => {
          loadRefunds();
        })
        .subscribe();

      // Return cleanup function
      return () => {
        usersSubscription.unsubscribe();
        profilesSubscription.unsubscribe();
        reviewsSubscription.unsubscribe();
        contentSubscription.unsubscribe();
        transactionsSubscription.unsubscribe();
        payoutsSubscription.unsubscribe();
        refundsSubscription.unsubscribe();
      };
    };

    const cleanup = setupRealtimeSubscriptions();
    
    return cleanup;
  }, [navigate]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      
      // Load data with error handling for each function
      const loadPromises = [
        loadUsers().catch(error => {
          console.warn('Failed to load users:', error);
          return null;
        }),
        loadProfiles().catch(error => {
          console.warn('Failed to load profiles:', error);
          return null;
        }),
        loadReviews().catch(error => {
          console.warn('Failed to load reviews:', error);
          return null;
        }),
        loadContent().catch(error => {
          console.warn('Failed to load content:', error);
          return null;
        }),
        loadTransactions().catch(error => {
          console.warn('Failed to load transactions:', error);
          return null;
        }),
        loadPayouts().catch(error => {
          console.warn('Failed to load payouts:', error);
          return null;
        }),
        loadRefunds().catch(error => {
          console.warn('Failed to load refunds:', error);
          return null;
        }),
        loadFees().catch(error => {
          console.warn('Failed to load fees:', error);
          return null;
        }),
        loadAnalytics().catch(error => {
          console.warn('Failed to load analytics:', error);
          return null;
        })
      ];

      await Promise.allSettled(loadPromises);
      
      // Show success message if at least some data loaded
      const hasAnyData = users.length > 0 || profiles.length > 0 || reviews.length > 0 || 
                         content.length > 0 || transactions.length > 0 || payouts.length > 0 || 
                         refunds.length > 0 || fees.length > 0;
      
      if (hasAnyData) {
        toast({
          title: "Success",
          description: "Admin dashboard loaded successfully",
        });
      } else {
        toast({
          title: "Info",
          description: "Dashboard loaded. Some tables may not exist yet. Check the database setup guide.",
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please check database setup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Try to get users from public_users table first
      const { data, error } = await supabase
        .from('public_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to users table if it exists
        const { data: fallbackData, error: fallbackError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

        if (fallbackError) {
          // If no users table exists, create a mock user for testing
          console.warn('No users table found, using mock data');
          setUsers([{
            id: 'mock-user-1',
            email: 'admin@example.com',
            role: 'admin',
            created_at: new Date().toISOString(),
            verification_status: 'approved'
          }]);
        } else {
          setUsers(fallbackData || []);
        }
      } else {
      setUsers(data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Create mock data on error
      setUsers([{
        id: 'mock-user-1',
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        verification_status: 'approved'
      }]);
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_profiles')
        .select(`
          *,
          public_users!tutor_profiles_user_id_fkey(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const profilesData = data?.map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name || 'N/A',
        bio: profile.bio || 'N/A',
        avatar_url: profile.avatar_url || '',
        status: profile.status || 'pending',
        created_at: profile.created_at,
        user_email: profile.public_users?.email || profile.user_id || 'N/A'
      })) || [];

      setProfiles(profilesData);
    } catch (error) {
      console.error('Error loading profiles:', error);
      throw error;
    }
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:public_users!reviews_reviewer_id_fkey(email),
          tutor:public_users!reviews_tutor_id_fkey(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const reviewsData = data?.map(review => ({
        id: review.id,
        reviewer_id: review.reviewer_id,
        tutor_id: review.tutor_id,
        rating: review.rating,
        comment: review.review_text,
        status: review.status || 'pending',
        created_at: review.created_at,
        reviewer_email: review.reviewer?.email || review.reviewer_id || 'N/A',
        tutor_email: review.tutor?.email || review.tutor_id || 'N/A'
      })) || [];

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      throw error;
    }
  };

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_content')
        .select(`
          *,
          public_users!tutor_content_user_id_fkey(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const contentData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title || 'N/A',
        description: item.description || 'N/A',
        file_url: item.file_url || '',
        file_type: item.file_type || 'unknown',
        status: item.status || 'pending',
        created_at: item.created_at,
        user_email: item.public_users?.email || item.user_id || 'N/A'
      })) || [];

      setContent(contentData);
    } catch (error) {
      console.error('Error loading content:', error);
      // Don't throw error for content as it might not exist yet
      setContent([]);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          public_users!transactions_user_id_fkey(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transactionsData = data?.map(transaction => ({
        ...transaction,
        user_email: transaction.public_users?.email || transaction.user_id || 'N/A'
      })) || [];
      
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
      throw error;
    }
  };

  const loadPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          public_users!payouts_user_id_fkey(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const payoutsData = data?.map(payout => ({
        ...payout,
        user_email: payout.public_users?.email || payout.user_id || 'N/A'
      })) || [];
      
      setPayouts(payoutsData);
    } catch (error) {
      console.error('Error loading payouts:', error);
      throw error;
    }
  };

  const loadRefunds = async () => {
    try {
      const { data, error } = await supabase
        .from('refunds')
        .select(`
          *,
          original_transaction:transactions!refunds_transaction_id_fkey(id, amount, currency, type, status, description, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const refundsData = data?.map(refund => ({
        id: refund.id,
        transaction_id: refund.transaction_id,
        amount: refund.amount,
        currency: refund.currency,
        reason: refund.reason,
        status: refund.status || 'pending',
        created_at: refund.created_at,
        processed_at: refund.processed_at,
        admin_notes: refund.admin_notes,
        original_transaction: refund.original_transaction
      })) || [];

      setRefunds(refundsData);
    } catch (error) {
      console.error('Error loading refunds:', error);
      throw error;
    }
  };

  const loadFees = async () => {
    try {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFees(data || []);
    } catch (error) {
      console.error('Error loading fees:', error);
      throw error;
    }
  };

  const loadAnalytics = async () => {
    try {
      // Since we don't have a dedicated analytics table, we'll calculate metrics from existing data
      const analyticsData = calculateAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error calculating analytics:', error);
      setAnalytics(null);
    }
  };

  const calculateAnalytics = (): AnalyticsData => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User Growth Metrics
    const totalUsers = users.length;
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalVerificationRequired = users.filter(u => u.role !== 'student').length;
    const verifiedUsers = users.filter(u => u.role !== 'student' && u.verification_status === 'approved').length;
    
    const newUsersThisMonth = users.filter(user => 
      new Date(user.created_at) >= oneMonthAgo
    ).length;
    const newUsersThisWeek = users.filter(user => 
      new Date(user.created_at) >= oneWeekAgo
    ).length;
    const activeUsers = totalStudents + verifiedUsers; // Students + verified tutors/institutions
    const userGrowthRate = totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100) : 0;

    // Revenue Metrics
    const totalRevenue = transactions
      .filter(t => t.type === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyRevenue = transactions
      .filter(t => t.type === 'payment' && t.status === 'completed' && new Date(t.created_at) >= oneMonthAgo)
      .reduce((sum, t) => sum + t.amount, 0);
    const weeklyRevenue = transactions
      .filter(t => t.type === 'payment' && t.status === 'completed' && new Date(t.created_at) >= oneWeekAgo)
      .reduce((sum, t) => sum + t.amount, 0);
    const completedPayments = transactions.filter(t => t.type === 'payment' && t.status === 'completed');
    const revenueGrowthRate = totalRevenue > 0 ? ((monthlyRevenue / totalRevenue) * 100) : 0;
    const averageTransactionValue = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0;

    // Engagement Metrics
    const totalSessions = reviews.length; // Assuming each review represents a session
    const activeTutors = profiles.filter(p => p.status === 'approved').length;
    const activeStudents = users.filter(u => u.role === 'student').length; // Students don't need verification
    const contentUploads = content.length;
    const reviewSubmissions = reviews.length;

    // Platform Performance Metrics
    const totalProfiles = profiles.length;
    const verificationRate = (users.filter(u => u.role !== 'student').length) > 0 ? 
      ((users.filter(u => u.role !== 'student' && u.verification_status === 'approved').length) / (users.filter(u => u.role !== 'student').length)) * 100 : 0;
    const contentApprovalRate = content.length > 0 ? 
      (content.filter(c => c.status === 'approved').length / content.length) * 100 : 0;
    const averageRating = reviews.length > 0 ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    const responseTime = 0; // Will be calculated from actual response time data when available

    // Time Series Data (last 7 days)
    const timeSeriesData = generateTimeSeriesData();

    return {
      userGrowth: {
        totalUsers,
        totalStudents,
        totalVerificationRequired,
        verifiedUsers,
        newUsersThisMonth,
        newUsersThisWeek,
        activeUsers,
        userGrowthRate
      },
      revenueMetrics: {
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        revenueGrowthRate,
        averageTransactionValue
      },
      engagementMetrics: {
        totalSessions,
        activeTutors,
        activeStudents,
        contentUploads,
        reviewSubmissions
      },
      platformPerformance: {
        totalProfiles,
        verificationRate,
        contentApprovalRate,
        averageRating,
        responseTime
      },
      timeSeriesData
    };
  };

  const generateTimeSeriesData = () => {
    const dates = [];
    const userCounts = [];
    const revenueData = [];
    const sessionCounts = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Calculate real data for each day from existing data
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Count users created on this day
      const dayUsers = users.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= dayStart && userDate <= dayEnd;
      }).length;
      
      // Calculate revenue for this day
      const dayRevenue = transactions
        .filter(t => t.type === 'payment' && t.status === 'completed')
        .filter(t => {
          const transactionDate = new Date(t.created_at);
          return transactionDate >= dayStart && transactionDate <= dayEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Count sessions (reviews) for this day
      const daySessions = reviews.filter(review => {
        const reviewDate = new Date(review.created_at);
        return reviewDate >= dayStart && reviewDate <= dayEnd;
      }).length;
      
      userCounts.push(dayUsers);
      revenueData.push(dayRevenue);
      sessionCounts.push(daySessions);
    }

    return { dates, userCounts, revenueData, sessionCounts };
  };

  const handleVerification = async (userId: string, status: string) => {
    try {
      // Try to update public_users table first
      let { error } = await supabase
        .from('public_users')
        .update({ verification_status: status })
        .eq('id', userId);

      if (error) {
        // Fallback to users table if it exists
        const { error: fallbackError } = await supabase
        .from('users')
        .update({ verification_status: status })
        .eq('id', userId);

        if (fallbackError) throw fallbackError;
      }

      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, verification_status: status }
            : user
        )
      );

      toast({
        title: "Success",
        description: `User ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleProfileModeration = async (profileId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tutor_profiles')
        .update({ status: status })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => 
        prev.map(profile => 
          profile.id === profileId 
            ? { ...profile, status: status }
            : profile
        )
      );

      toast({
        title: "Success",
        description: `Profile ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile status",
        variant: "destructive",
      });
    }
  };

  const handleReviewModeration = async (reviewId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: status })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, status: status }
            : review
        )
      );

      toast({
        title: "Success",
        description: `Review ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    }
  };

  const handleContentModeration = async (contentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tutor_content')
        .update({ status: status })
        .eq('id', contentId);

      if (error) throw error;

      setContent(prev => 
        prev.map(item => 
          item.id === contentId 
            ? { ...item, status: status }
            : item
        )
      );

      toast({
        title: "Success",
        description: `Content ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive",
      });
    }
  };

  // Payment Management Functions
  const handlePayoutApproval = async (payoutId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('payouts')
        .update({ 
          status: status,
          processed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', payoutId);

      if (error) throw error;

      setPayouts(prev => 
        prev.map(payout => 
          payout.id === payoutId 
            ? { 
                ...payout, 
                status: status,
                processed_at: status === 'completed' ? new Date().toISOString() : payout.processed_at
              }
            : payout
        )
      );

      toast({
        title: "Success",
        description: `Payout ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating payout:', error);
      toast({
        title: "Error",
        description: "Failed to update payout status",
        variant: "destructive",
      });
    }
  };

  const handleRefundApproval = async (refundId: string, status: string, adminNotes?: string) => {
    try {
      const { error } = await supabase
        .from('refunds')
        .update({ 
          status: status,
          admin_notes: adminNotes,
          processed_at: status === 'processed' ? new Date().toISOString() : null
        })
        .eq('id', refundId);

      if (error) throw error;

      setRefunds(prev => 
        prev.map(refund => 
          refund.id === refundId 
            ? { 
                ...refund, 
                status: status,
                admin_notes: adminNotes,
                processed_at: status === 'processed' ? new Date().toISOString() : refund.processed_at
              }
            : refund
        )
      );

      toast({
        title: "Success",
        description: `Refund ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating refund:', error);
      toast({
        title: "Error",
        description: "Failed to update refund status",
        variant: "destructive",
      });
    }
  };

  const handleFeeUpdate = async (feeId: string, updates: Partial<Fee>) => {
    try {
      const { error } = await supabase
        .from('fees')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', feeId);

      if (error) throw error;

      setFees(prev => 
        prev.map(fee => 
          fee.id === feeId 
            ? { ...fee, ...updates, updated_at: new Date().toISOString() }
            : fee
        )
      );

      toast({
        title: "Success",
        description: "Fee updated successfully",
      });
    } catch (error) {
      console.error('Error updating fee:', error);
      toast({
        title: "Error",
        description: "Failed to update fee",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const getStats = () => {
    const total = users.length;
            const pending = users.filter(u => u.role !== 'student' && u.verification_status === 'pending').length;
        const approved = users.filter(u => u.role !== 'student' && u.verification_status === 'approved').length;
        const rejected = users.filter(u => u.role !== 'student' && u.verification_status === 'rejected').length;
    return { total, pending, approved, rejected };
  };

  const getContentStats = () => {
    const totalProfiles = profiles.length;
    const pendingProfiles = profiles.filter(p => p.status === 'pending').length;
    const totalReviews = reviews.length;
    const pendingReviews = reviews.filter(r => r.status === 'pending').length;
    const totalContent = content.length;
    const pendingContent = content.filter(c => c.status === 'pending').length;
    
    return { totalProfiles, pendingProfiles, totalReviews, pendingReviews, totalContent, pendingContent };
  };

  const getPaymentStats = () => {
    const totalTransactions = transactions.length;
    const totalRevenue = transactions
      .filter(t => t.type === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingPayouts = payouts.filter(p => p.status === 'pending').length;
    const pendingRefunds = refunds.filter(r => r.status === 'pending').length;
    const totalFees = fees.filter(f => f.is_active).length;
    
    return { totalTransactions, totalRevenue, pendingPayouts, pendingRefunds, totalFees };
  };

  const stats = getStats();
  const contentStats = getContentStats();
  const paymentStats = getPaymentStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Platform Management & Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">Admin</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    loadAllData();
                    toast({
                      title: "Data Refreshed",
                      description: "All dashboard data has been updated",
                    });
                  }}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Summary */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Admin Dashboard</h2>
                    <p className="text-blue-700">
                      Manage your platform with {stats.total} total users, {contentStats.totalProfiles} profiles, and ₹{paymentStats.totalRevenue.toFixed(2)} in revenue
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 font-medium">Platform Status</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {stats.pending > 0 ? `${stats.pending} items need attention` : 'All systems operational'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Setup Notice */}
        {users.length === 0 && profiles.length === 0 && reviews.length === 0 && 
         content.length === 0 && transactions.length === 0 && payouts.length === 0 && 
         refunds.length === 0 && fees.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Database Setup Required
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    The admin dashboard is working, but some database tables don't exist yet. 
                    This is why you're seeing empty data.
                  </p>
                  <p className="mt-2">
                    <strong>To fix this:</strong>
                  </p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Go to your Supabase dashboard</li>
                    <li>Open the SQL Editor</li>
                    <li>Run the migration from <code className="bg-blue-100 px-1 rounded">supabase/migrations/create_essential_admin_tables.sql</code></li>
                    <li>Refresh this page</li>
                  </ol>
                  <p className="mt-2">
                    <strong>Note:</strong> The database setup guide has been removed from this dashboard. Please refer to the migration files in the <code className="bg-blue-100 px-1 rounded">supabase/migrations/</code> folder for detailed setup instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Users (All Roles)</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("verification")}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Users className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Pending Verification</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
                {stats.pending > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("verification")}
                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Verified Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("verification")}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserX className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Rejected Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                  </div>
                </div>
                {stats.rejected > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("verification")}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Moderation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Profiles</p>
                    <p className="text-2xl font-bold text-gray-900">{contentStats.totalProfiles}</p>
                    <p className="text-xs text-yellow-600">{contentStats.pendingProfiles} pending</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab("profiles")}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {contentStats.pendingProfiles > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab("profiles")}
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 text-xs"
                    >
                      {contentStats.pendingProfiles} Pending
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Star className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{contentStats.totalReviews}</p>
                    <p className="text-xs text-yellow-600">{contentStats.pendingReviews} pending</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab("reviews")}
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {contentStats.pendingReviews > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab("reviews")}
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 text-xs"
                    >
                      {contentStats.pendingReviews} Pending
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Content</p>
                    <p className="text-2xl font-bold text-gray-900">{contentStats.totalContent}</p>
                    <p className="text-xs text-yellow-600">{contentStats.pendingContent} pending</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab("content")}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Image className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {contentStats.pendingContent > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab("content")}
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 text-xs"
                    >
                      {contentStats.pendingContent} Pending
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="h-6 w-6 text-blue-600 font-bold text-center text-sm">₹</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{paymentStats.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-blue-600">{paymentStats.totalTransactions} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="h-6 w-6 text-green-600 font-bold text-center text-sm">↑</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">{paymentStats.pendingPayouts}</p>
                  <p className="text-xs text-green-600">Awaiting approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <div className="h-6 w-6 text-red-600 font-bold text-center text-sm">↓</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Refunds</p>
                  <p className="text-2xl font-bold text-gray-900">{paymentStats.pendingRefunds}</p>
                  <p className="text-xs text-red-600">Requires review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <div className="h-6 w-6 text-purple-600 font-bold text-center text-sm">%</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Fees</p>
                  <p className="text-2xl font-bold text-gray-900">{paymentStats.totalFees}</p>
                  <p className="text-xs text-purple-600">Platform charges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <div className="mb-8">
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Common admin tasks and shortcuts</p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("verification")}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Review Users
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("profiles")}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Moderate Profiles
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("reviews")}
                    className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Review Content
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("analytics")}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 gap-1">
            <TabsTrigger value="verification" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200">
              <Users className="h-4 w-4" />
              <span>Verification</span>
              {stats.pending > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center space-x-2 data-[state=active]:bg-purple-50 data-[state=active]:border-purple-200">
              <FileText className="h-4 w-4" />
              <span>Profiles</span>
              {contentStats.pendingProfiles > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {contentStats.pendingProfiles}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2 data-[state=active]:bg-yellow-50 data-[state=active]:border-yellow-200">
              <Star className="h-4 w-4" />
              <span>Reviews</span>
              {contentStats.pendingReviews > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {contentStats.pendingReviews}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2 data-[state=active]:bg-green-50 data-[state=active]:border-green-200">
              <Image className="h-4 w-4" />
              <span>Content</span>
              {contentStats.pendingContent > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {contentStats.pendingContent}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center space-x-2 data-[state=active]:bg-emerald-50 data-[state=active]:border-emerald-200">
              <div className="h-4 w-4 font-bold text-center text-xs">₹</div>
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center space-x-2 data-[state=active]:bg-orange-50 data-[state=active]:border-orange-200">
              <div className="h-4 w-4 font-bold text-center text-xs">↑</div>
              <span>Payouts</span>
              {paymentStats.pendingPayouts > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {paymentStats.pendingPayouts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="refunds" className="flex items-center space-x-2 data-[state=active]:bg-red-50 data-[state=active]:border-red-200">
              <div className="h-4 w-4 font-bold text-center text-xs">↓</div>
              <span>Refunds</span>
              {paymentStats.pendingRefunds > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {paymentStats.pendingRefunds}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center space-x-2 data-[state=active]:bg-indigo-50 data-[state=active]:border-indigo-200">
              <div className="h-4 w-4 font-bold text-center text-xs">%</div>
              <span>Fees</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-slate-50 data-[state=active]:border-slate-200">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* User Verification Tab */}
          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Verification Management (Tutors & Institutions Only)</CardTitle>
                <CardDescription>
                  Students are automatically verified and don't require manual approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Bar */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search by email..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          const searchTerm = e.target.value.toLowerCase();
                          // You can implement search filtering here
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Show all users
                        }}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Filter pending users
                        }}
                        className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                      >
                        Pending ({users.filter(u => u.role !== 'student' && u.verification_status === 'pending').length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Filter approved users
                        }}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        Approved ({users.filter(u => u.role !== 'student' && u.verification_status === 'approved').length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Filter rejected users
                        }}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        Rejected ({users.filter(u => u.role !== 'student' && u.verification_status === 'rejected').length})
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {users.filter(user => user.role !== 'student').map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge 
                            variant={user.verification_status === 'approved' ? 'default' : 
                                    user.verification_status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {user.verification_status}
                          </Badge>
                        </div>
                      </div>
                      
                      {user.verification_status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerification(user.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleVerification(user.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {user.verification_status === 'rejected' && (
                        <Button
                          size="sm"
                          onClick={() => handleVerification(user.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Re-approve
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profiles Tab */}
          <TabsContent value="profiles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{profile.full_name}</p>
                        <p className="text-sm text-gray-600">{profile.user_email}</p>
                        <p className="text-sm text-gray-500 mt-1">{profile.bio.substring(0, 100)}...</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Profile</Badge>
                          <Badge 
                            variant={profile.status === 'approved' ? 'default' : 
                                    profile.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {profile.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(profile.avatar_url, '_blank')}
                          disabled={!profile.avatar_url}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        {profile.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleProfileModeration(profile.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleProfileModeration(profile.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {profile.status === 'rejected' && (
                          <Button
                            size="sm"
                            onClick={() => handleProfileModeration(profile.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Re-approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">Reviewer: {review.reviewer_email}</span>
                          <span className="text-gray-500">→</span>
                          <span className="font-medium">Tutor: {review.tutor_email}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline">{review.rating}/5</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Review</Badge>
                          <Badge 
                            variant={review.status === 'approved' ? 'default' : 
                                    review.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {review.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {review.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleReviewModeration(review.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReviewModeration(review.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {review.status === 'rejected' && (
                          <Button
                            size="sm"
                            onClick={() => handleReviewModeration(review.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Re-approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.user_email}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.description.substring(0, 100)}...</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{item.file_type}</Badge>
                          <Badge 
                            variant={item.status === 'approved' ? 'default' : 
                                    item.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.file_url, '_blank')}
                          disabled={!item.file_url}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        {item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleContentModeration(item.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleContentModeration(item.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {item.status === 'rejected' && (
                          <Button
                            size="sm"
                            onClick={() => handleContentModeration(item.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Re-approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.user_email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{transaction.type}</Badge>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 
                                    transaction.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {transaction.status}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {transaction.currency} {transaction.amount.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{payout.user_email}</p>
                        <p className="text-sm text-gray-600">{payout.account_details}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{payout.method}</Badge>
                          <Badge 
                            variant={payout.status === 'completed' ? 'default' : 
                                    payout.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {payout.status}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {payout.currency} {payout.amount.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested: {new Date(payout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {payout.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handlePayoutApproval(payout.id, 'processing')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Process
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handlePayoutApproval(payout.id, 'failed')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {payout.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => handlePayoutApproval(payout.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Refund Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {refunds.map((refund) => (
                    <div key={refund.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">Refund Request</p>
                        <p className="text-sm text-gray-600">Reason: {refund.reason}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Refund</Badge>
                          <Badge 
                            variant={refund.status === 'processed' ? 'default' : 
                                    refund.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {refund.status}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {refund.currency} {refund.amount.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested: {new Date(refund.created_at).toLocaleDateString()}
                        </p>
                        {refund.admin_notes && (
                          <p className="text-xs text-gray-600 mt-1">
                            Admin Notes: {refund.admin_notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {refund.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleRefundApproval(refund.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRefundApproval(refund.id, 'rejected', 'Refund request denied')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {refund.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleRefundApproval(refund.id, 'processed')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Process
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fees.map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{fee.name}</p>
                        <p className="text-sm text-gray-600">{fee.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{fee.type}</Badge>
                          <Badge 
                            variant={fee.is_active ? 'default' : 'secondary'}
                          >
                            {fee.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {fee.type === 'percentage' ? `${fee.value}%` : `${fee.currency === 'USD' ? '₹' : fee.currency} ${fee.value.toFixed(2)}`}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Updated: {new Date(fee.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeeUpdate(fee.id, { is_active: !fee.is_active })}
                        >
                          {fee.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Platform Analytics Dashboard</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Real-time insights into platform performance, user growth, and engagement trends
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      loadAnalytics();
                      toast({
                        title: "Analytics Updated",
                        description: "Platform metrics have been refreshed",
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh Data</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {analytics ? (
                  <>
                    {/* Key Metrics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Total Users</p>
                            <p className="text-2xl font-bold text-blue-900">{analytics.userGrowth.totalUsers}</p>
                          </div>
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-blue-600">
                            {analytics.userGrowth.totalStudents} students + {analytics.userGrowth.verifiedUsers} verified
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-900">₹{analytics.revenueMetrics.totalRevenue.toFixed(2)}</p>
                          </div>
                          <div className="h-8 w-8 font-bold text-center text-green-600 text-xl">₹</div>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-green-600">
                            +{analytics.revenueMetrics.revenueGrowthRate.toFixed(1)}% growth
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Active Sessions</p>
                            <p className="text-2xl font-bold text-purple-900">{analytics.engagementMetrics.totalSessions}</p>
                          </div>
                          <Activity className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-purple-600">
                            {analytics.engagementMetrics.activeTutors} active tutors
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-orange-600 font-medium">Avg Rating</p>
                            <p className="text-2xl font-bold text-orange-900">{analytics.platformPerformance.averageRating.toFixed(1)}/5</p>
                          </div>
                          <Star className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-orange-600">
                            {analytics.platformPerformance.verificationRate.toFixed(1)}% tutors/institutions verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* User Growth Details */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span>User Growth Analytics</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Students</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.totalStudents}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Tutors/Institutions</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.totalVerificationRequired}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Verified Users</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.verifiedUsers}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">New Users This Month</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.newUsersThisMonth}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">New Users This Week</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.newUsersThisWeek}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Growth Rate</span>
                            <span className="font-semibold text-blue-600">{analytics.userGrowth.userGrowthRate.toFixed(1)}%</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Revenue Details */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <div className="h-5 w-5 font-bold text-center text-green-600 text-lg">₹</div>
                            <span>Revenue Analytics</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Monthly Revenue</span>
                            <span className="font-semibold text-green-600">₹{analytics.revenueMetrics.monthlyRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Weekly Revenue</span>
                            <span className="font-semibold text-green-600">₹{analytics.revenueMetrics.weeklyRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Revenue Growth Rate</span>
                            <span className="font-semibold text-green-600">{analytics.revenueMetrics.revenueGrowthRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Avg Transaction Value</span>
                            <span className="font-semibold text-green-600">₹{analytics.revenueMetrics.averageTransactionValue.toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Engagement Details */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            <span>Engagement Metrics</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Sessions</span>
                            <span className="font-semibold text-purple-600">{analytics.engagementMetrics.totalSessions}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Active Tutors</span>
                            <span className="font-semibold text-purple-600">{analytics.engagementMetrics.activeTutors}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Active Students</span>
                            <span className="font-semibold text-purple-600">{analytics.engagementMetrics.activeStudents}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Content Uploads</span>
                            <span className="font-semibold text-purple-600">{analytics.engagementMetrics.contentUploads}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Platform Performance */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            <span>Platform Performance</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Profiles</span>
                            <span className="font-semibold text-orange-600">{analytics.platformPerformance.totalProfiles}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Tutors/Institutions Verified</span>
                            <span className="font-semibold text-orange-600">{analytics.platformPerformance.verificationRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Content Approval Rate</span>
                            <span className="font-semibold text-orange-600">{analytics.platformPerformance.contentApprovalRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Response Time</span>
                            <span className="font-semibold text-orange-600">{analytics.platformPerformance.responseTime || 0}h</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-xl font-medium">No analytics data available</p>
                    <p className="text-sm">Analytics will appear here once users, transactions, and content are added to the platform</p>
                  </div>
                )}

                {/* Time Series Data Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-gray-600" />
                      <span>Daily Trends (Last 7 Days)</span>
                    </CardTitle>
                    <CardDescription>
                      Track daily performance metrics for better trend analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics?.timeSeriesData && analytics.timeSeriesData.dates.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Users</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue (₹)</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analytics.timeSeriesData.dates.map((date, index) => (
                              <tr key={date} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.timeSeriesData.userCounts[index] || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{analytics.timeSeriesData.revenueData[index] || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.timeSeriesData.sessionCounts[index] || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No time series data available</p>
                        <p className="text-sm">Data will appear here as users, transactions, and sessions are created</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
      </main>
    </div>
  );
}
