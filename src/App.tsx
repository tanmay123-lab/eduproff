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
import Verify from "./pages/Verify";
import GenerateCV from "./pages/GenerateCV";
import UploadSuccess from "./pages/UploadSuccess";
import UploadFailed from "./pages/UploadFailed";
import Support from "./pages/Support";
import Careers from "./pages/Careers";
import PublicVerify from "./pages/PublicVerify";
import HowItWorks from "./pages/HowItWorks";
import Demo from "./pages/Demo";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import InstitutionDashboard from "./pages/institution/InstitutionDashboard";
import InstitutionOverview from "./pages/institution/InstitutionOverview";
import IssueCertificate from "./pages/institution/IssueCertificate";
import IssuedCertificates from "./pages/institution/IssuedCertificates";
import VerificationLogs from "./pages/institution/VerificationLogs";
import InstitutionAnalytics from "./pages/institution/InstitutionAnalytics";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterOverview from "./pages/recruiter/RecruiterOverview";
import RecruiterVerify from "./pages/recruiter/RecruiterVerify";
import RecruiterHistory from "./pages/recruiter/RecruiterHistory";

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
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              
              {/* Candidate routes - both old and new paths for backward compatibility */}
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <Student />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/candidate/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <Student />
                  </ProtectedRoute>
                } 
              />
              
              {/* Recruiter routes - old path */}
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute allowedRoles={["recruiter"]}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RecruiterOverview />} />
                <Route path="verify" element={<RecruiterVerify />} />
                <Route path="history" element={<RecruiterHistory />} />
              </Route>
              
              {/* Recruiter routes - new path */}
              <Route
                path="/recruiter/portal"
                element={
                  <ProtectedRoute allowedRoles={["recruiter"]}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RecruiterOverview />} />
                <Route path="verify" element={<RecruiterVerify />} />
                <Route path="history" element={<RecruiterHistory />} />
              </Route>
              
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
              <Route 
                path="/generate-cv" 
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <GenerateCV />
                  </ProtectedRoute>
                } 
              />
              
              {/* Institution routes - old path */}
              <Route
                path="/institution"
                element={
                  <ProtectedRoute allowedRoles={["institution"]}>
                    <InstitutionDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<InstitutionOverview />} />
                <Route path="issue" element={<IssueCertificate />} />
                <Route path="certificates" element={<IssuedCertificates />} />
                <Route path="logs" element={<VerificationLogs />} />
                <Route path="analytics" element={<InstitutionAnalytics />} />
              </Route>
              
              {/* Institution routes - new path */}
              <Route
                path="/institution/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["institution"]}>
                    <InstitutionDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<InstitutionOverview />} />
                <Route path="issue" element={<IssueCertificate />} />
                <Route path="certificates" element={<IssuedCertificates />} />
                <Route path="logs" element={<VerificationLogs />} />
                <Route path="analytics" element={<InstitutionAnalytics />} />
              </Route>
              
              <Route path="/support" element={<Support />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/check" element={<PublicVerify />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
