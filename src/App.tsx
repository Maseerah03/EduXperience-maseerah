import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import SignUpChoice from "@/pages/SignUpChoice";
import StudentSignUp from "@/pages/StudentSignUp";
import TutorSignUp from "@/pages/TutorSignUp";
import InstitutionSignUp from "@/pages/InstitutionSignUp";
import InstitutionSignupSuccess from "@/pages/InstitutionSignupSuccess";
import InstitutionSignupNew from './pages/institution-signup-new'
import InstitutionSignupSuccessNew from './pages/institution-signup/success/[id]'
import InstitutionSignupComplete from './pages/institution-signup/InstitutionSignupComplete'
import InstitutionSignupTest from './components/InstitutionSignupTest'
import { InstitutionSignupProvider } from './contexts/InstitutionSignupContext'
import InstitutionSignupRouter from './components/InstitutionSignupRouter'

import StudentDashboard from "@/pages/StudentDashboard";
import TutorDashboard from "@/pages/TutorDashboard";
import InstitutionDashboard from "@/pages/InstitutionDashboard";
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminRoute from "@/components/admin/AdminRoute";
import UserRegistration from "@/pages/UserRegistration";
import ContentUpload from "@/pages/ContentUpload";
import LeaveReview from "@/pages/LeaveReview";
import FeatureShowcase from "@/pages/FeatureShowcase";
import VerificationPage from "@/pages/VerificationPage";
import VerificationStatus from "@/components/verification/VerificationStatus";
import PricingPage from '@/pages/PricingPage';
import Tutors from '@/pages/Tutors';
import Institutions from '@/pages/Institutions';
import HowItWorks from '@/pages/HowItWorks';
import About from '@/pages/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<FeatureShowcase />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup-choice" element={<SignUpChoice />} />
        <Route path="/student-signup" element={<StudentSignUp />} />
        <Route path="/tutor-signup" element={<TutorSignUp />} />
        <Route path="/institution-signup/*" element={
          <InstitutionSignupProvider>
            <InstitutionSignupRouter />
          </InstitutionSignupProvider>
        } />
        <Route path="/institution-signup/success" element={<InstitutionSignupSuccess />} />
        <Route path="/institution-signup/complete" element={<InstitutionSignupComplete />} />
        <Route path="/institution-signup/test" element={<InstitutionSignupTest />} />
        <Route path="/institution-signup-new" element={<InstitutionSignupNew />} />
        <Route path="/institution-signup/success/:id" element={<InstitutionSignupSuccessNew />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/institution-dashboard" element={<InstitutionDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/upload-content" element={<ContentUpload />} />
        <Route path="/review/:tutorId" element={<LeaveReview />} />
        <Route path="/verification" element={<VerificationPage userType="tutor" />} />
        <Route path="/verification-status" element={<VerificationStatus userType="tutor" />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/tutors" element={<Tutors />} />
        <Route path="/institutions" element={<Institutions />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
