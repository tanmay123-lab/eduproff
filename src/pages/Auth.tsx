import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle, Lock, Zap } from "lucide-react";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-white/80 hover:text-white transition-all duration-200 hover:gap-3 gap-2 mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-semibold shadow-lg">
              <Shield className="w-4 h-4" />
              Secure Platform
            </div>

            <h1 className="text-5xl font-bold text-white leading-tight">
              Welcome to<br />EduProof
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed max-w-md">
              Secure credential verification platform for students, recruiters, and educational institutions.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Verified Credentials</h3>
              <p className="text-white/80 text-sm">Instant verification with 99.9% accuracy</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Secure & Private</h3>
              <p className="text-white/80 text-sm">Enterprise-grade security for your data</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Lightning Fast</h3>
              <p className="text-white/80 text-sm">Get results in under 3 seconds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile back button */}
          <div className="lg:hidden mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-all duration-200 hover:gap-3 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <Card className="border-2 shadow-xl">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="text-3xl font-bold">
                {activeTab === "login" ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-base">
                {activeTab === "login" 
                  ? "Sign in to your account to continue" 
                  : "Join EduProof to verify credentials"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1.5 h-12 mb-6">
                  <TabsTrigger value="login" className="rounded-lg text-sm font-semibold">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg text-sm font-semibold">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-6">
                  <LoginForm />
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setActiveTab("signup")}
                      className="text-primary hover:underline font-semibold transition-all duration-200"
                    >
                      Sign up
                    </button>
                  </p>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-6">
                  <SignupForm />
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      onClick={() => setActiveTab("login")}
                      className="text-primary hover:underline font-semibold transition-all duration-200"
                    >
                      Login
                    </button>
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}