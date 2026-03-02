import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Award,
  Activity,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Building2,
  Briefcase,
} from "lucide-react";
import {
  getStoredUsers,
  getStoredCertificates,
  getActivityLogs,
  getActionLabel,
  addAdminEmail,
  type StoredUser,
  type StoredCertificate,
  type ActivityLog,
} from "@/utils/adminStorage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ROLE_COLORS: Record<string, string> = {
  candidate: "bg-primary/10 text-primary border-primary/20",
  recruiter: "bg-accent/10 text-accent-foreground border-accent/20",
  institution: "bg-success/10 text-success border-success/20",
  admin: "bg-destructive/10 text-destructive border-destructive/20",
};

const ACTION_COLORS: Record<string, string> = {
  user_registered: "bg-primary/10 text-primary",
  certificate_uploaded: "bg-success/10 text-success",
  certificate_viewed: "bg-accent/10 text-accent-foreground",
  verification_happened: "bg-warning/10 text-warning",
};

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [certificates, setCertificates] = useState<StoredCertificate[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [adminEmailInput, setAdminEmailInput] = useState("");

  useEffect(() => {
    setUsers(getStoredUsers());
    setCertificates(getStoredCertificates());
    setLogs(getActivityLogs());
  }, []);

  const filteredUsers =
    roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  const usersByRole = {
    candidate: users.filter((u) => u.role === "candidate").length,
    recruiter: users.filter((u) => u.role === "recruiter").length,
    institution: users.filter((u) => u.role === "institution").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  const handleAddAdmin = () => {
    if (adminEmailInput.trim()) {
      addAdminEmail(adminEmailInput.trim());
      const addedEmail = adminEmailInput.trim();
      setAdminEmailInput("");
      toast({
        title: "Admin added",
        description: `${addedEmail} has been granted admin access. They must sign in again to see the change.`,
      });
    }
  };

  return (
    <Layout>
      <section className="py-10 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Admin Dashboard
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Platform Overview
          </h1>
          <p className="text-muted-foreground">
            Monitor all users, certificates, and platform activity.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{certificates.length}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{logs.length}</p>
                  <p className="text-sm text-muted-foreground">Activities</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {certificates.filter((c) => c.status === "verified").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Verified Certs</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              <TabsTrigger value="activity">Activity Logs</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Role Distribution */}
                <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Users by Role
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Candidates</span>
                      </div>
                      <Badge className={ROLE_COLORS.candidate}>{usersByRole.candidate}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-accent-foreground" />
                        <span className="text-sm font-medium">Recruiters</span>
                      </div>
                      <Badge className={ROLE_COLORS.recruiter}>{usersByRole.recruiter}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium">Institutions</span>
                      </div>
                      <Badge className={ROLE_COLORS.institution}>{usersByRole.institution}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium">Admins</span>
                      </div>
                      <Badge className={ROLE_COLORS.admin}>{usersByRole.admin}</Badge>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                  </h2>
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">
                      No activity recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {logs.slice(0, 6).map((log) => (
                        <div key={log.id} className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${ACTION_COLORS[log.action]}`}>
                            <Activity className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {getActionLabel(log.action)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{log.userEmail}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Links */}
                <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50 md:col-span-2">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                    Quick Navigation
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Link
                      to="/student"
                      className="p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
                    >
                      <UserCheck className="w-5 h-5 text-primary mb-2" />
                      <p className="font-medium text-sm text-foreground">Candidate Page</p>
                      <p className="text-xs text-muted-foreground">View candidate dashboard</p>
                    </Link>
                    <Link
                      to="/recruiter"
                      className="p-4 rounded-lg bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors"
                    >
                      <Briefcase className="w-5 h-5 text-accent-foreground mb-2" />
                      <p className="font-medium text-sm text-foreground">Recruiter Page</p>
                      <p className="text-xs text-muted-foreground">View recruiter dashboard</p>
                    </Link>
                    <Link
                      to="/institution"
                      className="p-4 rounded-lg bg-success/5 border border-success/20 hover:bg-success/10 transition-colors"
                    >
                      <Building2 className="w-5 h-5 text-success mb-2" />
                      <p className="font-medium text-sm text-foreground">Institution Page</p>
                      <p className="text-xs text-muted-foreground">View institution dashboard</p>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
                <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">All Users</h2>
                  <div className="flex gap-2 ml-auto flex-wrap">
                    {["all", "candidate", "recruiter", "institution", "admin"].map((r) => (
                      <Button
                        key={r}
                        size="sm"
                        variant={roleFilter === r ? "default" : "outline"}
                        onClick={() => setRoleFilter(r)}
                        className="capitalize"
                      >
                        {r}
                      </Button>
                    ))}
                  </div>
                </div>
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No users found.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="font-medium text-sm text-foreground">{u.email}</p>
                          {u.fullName && (
                            <p className="text-xs text-muted-foreground">{u.fullName}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(u.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={ROLE_COLORS[u.role] || ""}>{u.role}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates">
              <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-display text-lg font-semibold text-foreground">All Certificates</h2>
                </div>
                {certificates.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No certificates recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-foreground">{cert.title}</p>
                            <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                            {cert.userEmail && (
                              <p className="text-xs text-muted-foreground">{cert.userEmail}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(cert.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            cert.status === "verified"
                              ? "bg-success/10 text-success border-success/20"
                              : cert.status === "failed"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }
                        >
                          {cert.status === "verified" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : cert.status === "failed" ? (
                            <XCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {cert.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="activity">
              <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-display text-lg font-semibold text-foreground">Activity Logs</h2>
                </div>
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No activity logged yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 px-4 py-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ACTION_COLORS[log.action]}`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-foreground">
                              {getActionLabel(log.action)}
                            </span>
                            <span className="text-xs text-muted-foreground">{log.userEmail}</span>
                          </div>
                          {log.details && (
                            <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50 max-w-md">
                <h2 className="font-display text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-destructive" />
                  Manage Admins
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an email address to grant admin access. The user must sign in again after being added.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="admin@example.com"
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
                  />
                  <Button onClick={handleAddAdmin} disabled={!adminEmailInput.trim()}>
                    Add Admin
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Current admin: {user?.email}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;