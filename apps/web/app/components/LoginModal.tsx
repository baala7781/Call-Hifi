"use client";

import React, { useState } from "react";
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (email: string, token: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [email, setEmail] = useState("baala3536@gmail.com");
  const [password, setPassword] = useState("1234567890");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (targetEmail?: string, targetPassword?: string) => {
    const emailToSubmit = (targetEmail || email).trim();
    const pwToSubmit = (targetPassword || password).trim();

    if (!emailToSubmit || !emailToSubmit.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!pwToSubmit) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSubmit, password: pwToSubmit }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed. Access restricted to authorized accounts.");
      }

      // Store in localStorage
      localStorage.setItem("hifi_user_email", data.email);
      localStorage.setItem("hifi_auth_token", data.token);

      onLoginSuccess(data.email, data.token);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Access restricted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FFFDF5] border border-black/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Accent Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FFD733]" />

        {/* Header */}
        <div className="space-y-2 text-center pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1E1E1E] text-white mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6 text-[#FFD733]" />
          </div>
          <h2 className="text-2xl font-black font-mono tracking-tight text-[#1E1E1E]">
            HiFi Access Portal
          </h2>
          <p className="text-xs font-mono text-[#1E1E1E]/70 max-w-xs mx-auto">
            Authorized single-user sign in for CALL-E Autonomous Procurement Agent.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1E1E1E]/70" />
              <span>Authorized Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="baala3536@gmail.com"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-black/15 text-sm font-mono text-[#1E1E1E] placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#1E1E1E] shadow-inner"
              autoFocus
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#1E1E1E]/70" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-black/15 text-sm font-mono text-[#1E1E1E] placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#1E1E1E] shadow-inner"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#1E1E1E] hover:bg-black text-white font-mono font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In to HiFi</span>
                <ArrowRight className="w-4 h-4 text-[#FFD733]" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Fast Access for baala3536@gmail.com */}
        <div className="pt-3 border-t border-[#EBECDC] space-y-2 text-center">
          <p className="text-[11px] font-mono text-[#1E1E1E]/60 uppercase tracking-wider font-bold">
            Authorized Account:
          </p>
          <button
            type="button"
            onClick={() => {
              setEmail("baala3536@gmail.com");
              setPassword("1234567890");
              handleLogin("baala3536@gmail.com", "1234567890");
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#FFD733]/20 hover:bg-[#FFD733]/40 border border-[#1E1E1E]/20 text-xs font-mono font-bold text-[#1E1E1E] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-[#1E1E1E]" />
            <span>1-Click Sign In: baala3536@gmail.com</span>
          </button>
        </div>
      </div>
    </div>
  );
};
