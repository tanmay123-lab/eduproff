import { Shield, ArrowRight } from "lucide-react";

export function BrandingPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#0f172a] p-12">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb] via-[#4f46e5] to-[#7c3aed] opacity-90" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating orb accents */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#818cf8]/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#3b82f6]/20 blur-3xl" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            EduProff
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">
          Verify credentials.
          <br />
          Build trust.
          <br />
          Hire smarter.
        </h1>
        <p className="max-w-md text-base leading-relaxed text-white/70">
          The all-in-one platform for certificate verification, credential
          management, and recruitment — trusted by institutions and recruiters
          worldwide.
        </p>

        {/* Social proof */}
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[
                "bg-[#60a5fa]",
                "bg-[#a78bfa]",
                "bg-[#818cf8]",
                "bg-[#38bdf8]",
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 text-xs font-medium text-white ${bg}`}
                >
                  {["AK", "SR", "JP", "ML"][i]}
                </div>
              ))}
            </div>
            <span className="text-sm text-white/60">
              Join 2,400+ professionals already on the platform
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 text-sm text-white/50">
        <span>Secure, fast, and reliable</span>
        <ArrowRight className="h-3.5 w-3.5" />
        <span>SOC 2 Compliant</span>
      </div>
    </div>
  );
}
