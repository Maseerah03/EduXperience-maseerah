import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import SignUpChoice from "./pages/SignUpChoice";
import StudentSignUp from "./pages/StudentSignUp";
import TutorSignUp from "./pages/TutorSignUp";
import NotFound from "./pages/NotFound";
import StudentDashboard from "./pages/StudentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpChoice />} />
          <Route path="/signup/student" element={<StudentSignUp />} />
          <Route path="/signup/tutor" element={<TutorSignUp />} />
          {/* Legacy route for backwards compatibility */}
          <Route path="/signup/legacy" element={<SignUp />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
