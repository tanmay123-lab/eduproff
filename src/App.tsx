import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Student from "./pages/Student";
import Recruiter from "./pages/Recruiter";
import Verify from "./pages/Verify";
import UploadSuccess from "./pages/UploadSuccess";
import UploadFailed from "./pages/UploadFailed";
import Support from "./pages/Support";
import Careers from "./pages/Careers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={["candidate"]}>
                  <Student />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter" 
              element={
                <ProtectedRoute allowedRoles={["recruiter"]}>
                  <Recruiter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/verify" 
              element={
                <ProtectedRoute allowedRoles={["candidate"]}>
                  <Verify />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload-success" 
              element={
                <ProtectedRoute allowedRoles={["candidate"]}>
                  <UploadSuccess />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload-failed" 
              element={
                <ProtectedRoute allowedRoles={["candidate"]}>
                  <UploadFailed />
                </ProtectedRoute>
              } 
            />
            <Route path="/support" element={<Support />} />
            <Route path="/careers" element={<Careers />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
