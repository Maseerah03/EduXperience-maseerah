// import { Header } from "@/components/layout/Header";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Home as HomeIcon,
  Search,
  List,
  Calendar,
  MessageCircle,
  Wallet,
  User,
  HelpCircle,
  ChevronRight,
  Users,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import React from "react";

// Demo data
const studentName = "Alex";
const profileCompletion = 70;
const unreadMessages = 3;
const recentActivity = [
  { type: "search", text: "Maths tutor in Mumbai" },
  { type: "demo", text: "Demo class with Mr. Sharma" },
  { type: "message", text: "Message from Ms. Gupta" },
  { type: "reminder", text: "Class: Physics at 5pm today" },
];
const recommendedTutors = [
  { name: "Mr. Sharma", subject: "Mathematics", rating: 4.8 },
  { name: "Ms. Gupta", subject: "Physics", rating: 4.9 },
  { name: "Mr. Verma", subject: "Chemistry", rating: 4.7 },
  { name: "Ms. Iyer", subject: "Biology", rating: 4.6 },
  { name: "Mr. Singh", subject: "English", rating: 4.8 },
  { name: "Ms. Das", subject: "History", rating: 4.5 },
];
const learningProgress = [
  { subject: "Mathematics", progress: 80, nextClass: "Tomorrow, 4pm" },
  { subject: "Physics", progress: 60, nextClass: "Friday, 5pm" },
  { subject: "English", progress: 90, nextClass: "Monday, 3pm" },
];

const navMenu = [
  { label: "Dashboard", icon: <HomeIcon />, active: true },
  { label: "Find Tutors", icon: <Search /> },
  { label: "My Requirements", icon: <List /> },
  { label: "My Classes", icon: <Calendar /> },
  { label: "Messages", icon: <MessageCircle />, badge: unreadMessages },
  { label: "Payments", icon: <Wallet /> },
  { label: "Profile", icon: <User /> },
  { label: "Help & Support", icon: <HelpCircle /> },
];

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* <Header /> */}
      <SidebarProvider>
        <div className="flex flex-1">
          {/* Sidebar Navigation */}
          <Sidebar className="bg-sidebar border-r">
            <SidebarContent>
              <SidebarMenu>
                {navMenu.map((item, idx) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton isActive={item.active} className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6 md:p-10 bg-background">
            {/* Welcome Header */}
            <section className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back, <span className="text-primary">{studentName}</span>
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-sm">Profile Completion</span>
                  <Progress value={profileCompletion} className="w-40 h-2" />
                  <span className="text-sm font-semibold">{profileCompletion}%</span>
                  {profileCompletion < 100 && (
                    <Button size="sm" className="ml-4 bg-gradient-primary">Complete Profile</Button>
                  )}
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button size="lg" className="col-span-2 md:col-span-1 bg-gradient-primary shadow-soft flex flex-col items-center justify-center gap-2 h-28">
                <Search className="h-6 w-6" />
                Find Tutors
              </Button>
              <Button size="lg" className="bg-secondary text-secondary-foreground flex flex-col items-center justify-center gap-2 h-28">
                <List className="h-6 w-6" />
                Post Requirement
              </Button>
              <Button size="lg" className="bg-accent text-accent-foreground flex flex-col items-center justify-center gap-2 h-28">
                <Calendar className="h-6 w-6" />
                My Classes
              </Button>
              <Button size="lg" className="bg-muted text-foreground flex flex-col items-center justify-center gap-2 h-28 relative">
                <MessageCircle className="h-6 w-6" />
                Messages
                {unreadMessages > 0 && (
                  <span className="absolute top-2 right-4 bg-destructive text-white rounded-full px-2 text-xs font-bold">{unreadMessages}</span>
                )}
              </Button>
            </section>

            {/* Recent Activity */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentActivity.map((item, idx) => (
                  <Card key={idx} className="shadow-soft">
                    <CardContent className="p-4 flex items-center gap-3">
                      {item.type === "search" && <Search className="text-primary" />}
                      {item.type === "demo" && <BookOpen className="text-secondary" />}
                      {item.type === "message" && <MessageCircle className="text-accent" />}
                      {item.type === "reminder" && <CheckCircle className="text-success" />}
                      <span className="text-muted-foreground">{item.text}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recommended Tutors */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recommended Tutors</h3>
                <Button variant="link" className="text-primary flex items-center gap-1 p-0 h-auto">View All <ChevronRight className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {recommendedTutors.slice(0, 6).map((tutor, idx) => (
                  <Card key={idx} className="shadow-soft hover:shadow-medium transition-all duration-300">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <Users className="h-8 w-8 text-primary mb-2" />
                      <span className="font-semibold">{tutor.name}</span>
                      <span className="text-muted-foreground text-sm">{tutor.subject}</span>
                      <span className="text-yellow-500 font-bold mt-1">★ {tutor.rating}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Learning Progress */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Learning Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {learningProgress.map((item, idx) => (
                  <Card key={idx} className="shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{item.subject}</span>
                        <span className="text-xs text-muted-foreground">{item.nextClass}</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                      <span className="text-sm text-muted-foreground mt-2 block">Progress: {item.progress}%</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </main>
        </div>
      </SidebarProvider>
      {/* Footer */}
      <footer className="w-full py-4 border-t bg-background text-center text-muted-foreground text-sm mt-auto">
        © {new Date().getFullYear()} EduXperience. All rights reserved.
      </footer>
    </div>
  );
}