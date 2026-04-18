"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-kiln-500", "bg-kiln-300", "bg-sage-400", "bg-sage-500"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < score ? colors[score] : "bg-earth-100"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-earth-400">{labels[score]}</p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!username.trim()) e.username = "Username is required";
    if (username && !/^[a-z0-9_]{3,20}$/.test(username))
      e.username = "3–20 chars: lowercase, numbers, underscores";
    if (!email.trim()) e.email = "Email is required";
    if (password.length < 8) e.password = "At least 8 characters";
    if (!agreed) e.terms = "You must accept the terms";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    router.push("/onboarding");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-clay-50"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 32px, rgb(211 201 182 / 0.12) 32px, rgb(211 201 182 / 0.12) 33px), repeating-linear-gradient(90deg, transparent, transparent 32px, rgb(211 201 182 / 0.12) 32px, rgb(211 201 182 / 0.12) 33px)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-full bg-clay-500 flex items-center justify-center mb-3">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-earth-900">
            Create your studio
          </h1>
          <p className="text-sm text-earth-500 mt-1">
            Free forever. No credit card needed.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-earth-100 clay-shadow-md p-6">
          {/* OAuth */}
          <div className="flex flex-col gap-2.5 mb-5">
            <button
              className={cn(
                "flex items-center justify-center gap-2.5 w-full rounded-lg border border-earth-200 bg-white px-4 h-10 text-sm font-medium text-earth-700",
                "hover:bg-earth-50 hover:border-earth-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500"
              )}
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <button
              className={cn(
                "flex items-center justify-center gap-2.5 w-full rounded-lg border border-earth-200 bg-white px-4 h-10 text-sm font-medium text-earth-700",
                "hover:bg-earth-50 hover:border-earth-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500"
              )}
            >
              <Code2 className="h-4 w-4" />
              Continue with GitHub
            </button>
          </div>

          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-earth-100" />
            <span className="text-xs text-earth-400">or</span>
            <div className="flex-1 h-px bg-earth-100" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Maya Goldberg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              autoComplete="name"
            />
            <Input
              label="Username"
              type="text"
              placeholder="mayaclays"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              error={errors.username}
              autoComplete="username"
              helperText="Shown publicly on your profile"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="pointer-events-auto text-earth-400 hover:text-earth-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <PasswordStrength password={password} />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-earth-300 text-clay-500 focus:ring-clay-500"
              />
              <span className="text-xs text-earth-600 leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-clay-600 hover:text-clay-700 transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-clay-600 hover:text-clay-700 transition-colors">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.terms && (
              <p className="text-xs text-kiln-600 -mt-2">{errors.terms}</p>
            )}

            <Button type="submit" variant="primary" size="md" loading={loading} className="mt-1">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-earth-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-clay-600 font-medium hover:text-clay-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
