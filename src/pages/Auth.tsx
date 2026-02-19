import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-all duration-200 hover:gap-3 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card className="border-2 shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-8">
            <CardTitle className="text-4xl font-bold">Welcome to EduProof</CardTitle>
            <CardDescription className="text-base">
              Secure credential verification platform
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1.5 h-12">
                <TabsTrigger value="login" className="rounded-lg text-sm font-semibold">Login</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg text-sm font-semibold">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-8 space-y-6">
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
              
              <TabsContent value="signup" className="mt-8 space-y-6">
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
  );
}