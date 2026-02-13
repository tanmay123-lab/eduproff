import { Outlet } from "react-router-dom";
import { InstitutionSidebar } from "@/components/institution/InstitutionSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const InstitutionDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        <SidebarProvider>
          <div className="flex min-h-[calc(100vh-4rem)] w-full">
            <InstitutionSidebar />
            <main className="flex-1 p-6 lg:p-8">
              <div className="lg:hidden mb-4">
                <SidebarTrigger />
              </div>
              <Outlet />
            </main>
          </div>
        </SidebarProvider>
      </div>
      <Footer />
    </div>
  );
};

export default InstitutionDashboard;
