import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  createTutorProfileAfterVerification, 
  getPendingTutorProfile, 
  clearPendingTutorProfile,
  createStudentProfileAfterVerification,
  getPendingStudentProfile,
  clearPendingStudentProfile
} from "@/lib/profile-creation";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { toast } = useToast();

  // Check for pending profile creation on component mount
  useEffect(() => {
    const checkPendingProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email_confirmed_at) {
        // Check for pending tutor profile
        const pendingTutor = getPendingTutorProfile();
        if (pendingTutor) {
          setIsLoading(true);
          const result = await createTutorProfileAfterVerification(user.id, pendingTutor.formData);
          if (result.success) {
            clearPendingTutorProfile();
            toast({
              title: "Profile Created Successfully!",
              description: result.message,
            });
          } else {
            toast({
              title: "Profile Creation Failed",
              description: "There was an issue creating your profile. Please contact support.",
              variant: "destructive",
            });
          }
          setIsLoading(false);
        }

        // Check for pending student profile
        const pendingStudent = getPendingStudentProfile();
        if (pendingStudent) {
          setIsLoading(true);
          const result = await createStudentProfileAfterVerification(user.id, pendingStudent.formData);
          if (result.success) {
            clearPendingStudentProfile();
            toast({
              title: "Profile Created Successfully!",
              description: result.message,
            });
          } else {
            toast({
              title: "Profile Creation Failed",
              description: "There was an issue creating your profile. Please contact support.",
              variant: "destructive",
            });
          }
          setIsLoading(false);
        }
      }
    };

    checkPendingProfile();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        toast({
          title: "Login Successful!",
          description: "Welcome back to EduXperience.",
        });
        
        // Check for pending profile creation
        const pendingTutor = getPendingTutorProfile();
        if (pendingTutor && data.user.email_confirmed_at) {
          const result = await createTutorProfileAfterVerification(data.user.id, pendingTutor.formData);
          if (result.success) {
            clearPendingTutorProfile();
            toast({
              title: "Profile Created Successfully!",
              description: result.message,
            });
          }
        }

        const pendingStudent = getPendingStudentProfile();
        if (pendingStudent && data.user.email_confirmed_at) {
          const result = await createStudentProfileAfterVerification(data.user.id, pendingStudent.formData);
          if (result.success) {
            clearPendingStudentProfile();
            toast({
              title: "Profile Created Successfully!",
              description: result.message,
            });
          }
        }
        
        // Redirect to home page or dashboard
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <Card className="shadow-medium border-none">
            <CardHeader className="space-y-4 text-center">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to your EduXperience account to continue your learning journey
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary-soft transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-primary shadow-soft hover:shadow-medium h-12 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 text-base border-border hover:bg-muted"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:text-primary-soft font-medium transition-colors">
                    Sign up here
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:text-primary-soft">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-primary hover:text-primary-soft">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}