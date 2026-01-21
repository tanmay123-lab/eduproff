import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/student" element={<Student />} />
          <Route path="/recruiter" element={<Recruiter />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/upload-success" element={<UploadSuccess />} />
          <Route path="/upload-failed" element={<UploadFailed />} />
          <Route path="/support" element={<Support />} />
          <Route path="/careers" element={<Careers />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
