import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticated, adminLogout } from "@/lib/adminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, FileText, ShieldCheck, LogOut, Loader2 } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalCertificates: number;
  totalVerifications: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCertificates: 0,
    totalVerifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/admin/login", { replace: true });
      return;
    }

    const fetchStats = async () => {
      const [usersRes, certsRes, verifRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("issued_certificates").select("*", { count: "exact", head: true }),
        supabase.from("verification_logs").select("*", { count: "exact", head: true }),
      ]);

      const errors = [usersRes.error, certsRes.error, verifRes.error].filter(Boolean);
      if (errors.length > 0) {
        toast({
          title: "Error loading stats",
          description: "Some statistics could not be loaded.",
          variant: "destructive",
        });
      }

      setStats({
        totalUsers: usersRes.count ?? 0,
        totalCertificates: certsRes.count ?? 0,
        totalVerifications: verifRes.count ?? 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, [navigate, toast]);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login", { replace: true });
  };

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Certificates Issued", value: stats.totalCertificates, icon: FileText, color: "bg-success/10 text-success" },
    { label: "Verifications", value: stats.totalVerifications, icon: ShieldCheck, color: "bg-accent/10 text-accent-foreground" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Platform overview and management
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.label}
                className="bg-card rounded-xl p-6 shadow-soft border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
