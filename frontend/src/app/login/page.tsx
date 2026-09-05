"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860"}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to login");
      }

      const data = await res.json();
      Cookies.set("auth_token", data.access_token, { expires: 7, path: "/" });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860"}/api/v1/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      if (!res.ok) throw new Error("Google login failed");
      
      const data = await res.json();
      Cookies.set("auth_token", data.access_token, { expires: 7, path: "/" });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-sans selection:bg-orange-100 selection:text-orange-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-[#EA580C]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-white rounded-[28px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 relative z-10 my-4">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Link href="/" className="group flex flex-col items-center gap-2">
            <div className="relative w-20 h-20 sm:w-20 sm:h-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo-ks.png"
                alt="KargoSetu Logo"
                fill
                sizes="80px"
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
            <span className="font-extrabold text-3xl sm:text-[32px] tracking-tighter text-[#0F172A] font-sans leading-none mt-1">
              KargoSetu<span className="text-[#EA580C]">.</span>
            </span>
          </Link>
          <p className="text-slate-500 font-medium text-center mt-2 text-sm">
            Log in to your enterprise account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="pl-12 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="pl-12 pr-12 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase font-bold tracking-wider">
            <span className="bg-white px-4 text-slate-400">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Sign-In failed")}
            theme="outline"
            size="large"
            width="100%"
            shape="rectangular"
          />
        </div>

        <p className="mt-6 text-center text-sm font-medium text-slate-600">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-[#EA580C] hover:text-[#C2410C] hover:underline transition-all">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
