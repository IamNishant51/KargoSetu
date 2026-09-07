"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/LanguageContext";
import { persistSessionAndRedirect } from "@/lib/auth";
import AuthShell from "@/components/auth/AuthShell";

export default function LoginPage() {
  const { t } = useLanguage();
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
        throw new Error(data.detail || t("err_login"));
      }

      const data = await res.json();
      persistSessionAndRedirect(data.access_token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("err_unknown"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860"}/api/v1/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      if (!res.ok) throw new Error(t("err_google_login"));

      const data = await res.json();
      persistSessionAndRedirect(data.access_token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("err_unknown"));
    }
  };

  return (
    <AuthShell
      eyebrow={t("login_eyebrow")}
      title={<>{t("login_title")}<span className="text-[#D95D0F]">{t("login_title_accent")}</span></>}
      sub={t("login_sub")}
    >
      <p className="mono-label text-[#B45309]">{t("login_form_kicker")}</p>
      <h2 className="mt-2 font-display font-black text-[30px] sm:text-[34px] tracking-[-0.025em] text-[#0A2342]">
        {t("login_form_title")}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[#3D4F68]">
        {t("login_form_sub")}
      </p>

      <form onSubmit={handleLogin} className="mt-7 space-y-5">
        {error && (
          <div className="rounded-xl border border-[#F3C2C2] bg-[#FDECEC] px-4 py-3 text-[13.5px] font-semibold text-[#B42318]">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="mono-label text-[#3D4F68]">{t("email")}</Label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7D99] pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-[#E2E6EB] bg-white pl-11 text-[15px] text-[#0A2342] placeholder:text-[#6B7D99]/70 focus-visible:border-[#D95D0F] focus-visible:ring-[#D95D0F]/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="mono-label text-[#3D4F68]">{t("password")}</Label>
              <Link href="#" className="text-[12.5px] font-bold text-[#B45309] hover:text-[#0A2342] transition-colors">
                {t("forgot")}
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-[#6B7D99] pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-[#E2E6EB] bg-white pl-11 pr-12 text-[15px] text-[#0A2342] placeholder:text-[#6B7D99]/70 focus-visible:border-[#D95D0F] focus-visible:ring-[#D95D0F]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 p-1 text-[#6B7D99] hover:text-[#0A2342] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-auto rounded-xl bg-[#D95D0F] px-6 py-4 text-[15px] font-bold text-white hover:bg-[#B45309] transition-colors shadow-[0_3px_0_#0A2342] ring-1 ring-[#0A2342]/10"
        >
          {loading ? t("signing_in") : t("sign_in")}
          {!loading && <ArrowRight size={16} className="ml-2" />}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="harbour-rule absolute inset-x-0 top-1/2" />
        <div className="relative flex justify-center">
          <span className="bg-white px-4 mono-label text-[#6B7D99]">{t("or_continue")}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google Sign-In failed")}
          theme="outline"
          size="large"
          width="320"
          shape="rectangular"
        />
      </div>

      <p className="mt-7 text-center text-[14px] font-medium text-[#3D4F68]">
        {t("no_account")}{" "}
        <Link href="/register" className="font-bold text-[#B45309] hover:text-[#0A2342] transition-colors">{t("signup_link")}</Link>
      </p>
    </AuthShell>
  );
}
