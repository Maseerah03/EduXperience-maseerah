import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import SignUpChoice from "@/pages/SignUpChoice";
import StudentSignUp from "@/pages/StudentSignUp";
import TutorSignUp from "@/pages/TutorSignUp";
import StudentDashboard from "@/pages/StudentDashboard";
import TutorDashboard from "@/pages/TutorDashboard";
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminRoute from "@/components/admin/AdminRoute";
import UserRegistration from "@/pages/UserRegistration";
import ContentUpload from "@/pages/ContentUpload";
import LeaveReview from "@/pages/LeaveReview";
import FeatureShowcase from "@/pages/FeatureShowcase";

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
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
