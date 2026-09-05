"use client";

import React, { useState } from "react";
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (email: string, token: string) => void;
}

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Authentication failed. Invalid email or password.");
      }

      const data = await res.json();

      // Store in localStorage
      localStorage.setItem("hifi_user_email", data.email);
      localStorage.setItem("hifi_auth_token", data.token);

      onLoginSuccess(data.email, data.token);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#FFFDE8] rounded-3xl border border-[#1E1E1E] shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFD733] border border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] mb-1">
            <Lock className="w-6 h-6 text-[#1E1E1E]" />
          </div>
          <h2 className="text-2xl font-black text-[#1E1E1E] font-heading tracking-tight">
            HiFi Procurement Access
          </h2>
          <p className="text-xs text-[#1E1E1E]/70 font-sans">
            Enter your authorized email to access automated hotel negotiation and booking data.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

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
            <label className="text-xs font-mono font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1E1E1E]/70" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E1E1E]/30 bg-white text-sm text-[#1E1E1E] font-sans placeholder-[#1E1E1E]/40 focus:outline-none focus:ring-2 focus:ring-[#FFD733] focus:border-transparent transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#1E1E1E]/70" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E1E1E]/30 bg-white text-sm text-[#1E1E1E] font-sans placeholder-[#1E1E1E]/40 focus:outline-none focus:ring-2 focus:ring-[#FFD733] focus:border-transparent transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#1E1E1E] hover:bg-[#333333] active:scale-[0.98] text-white font-bold text-sm transition-all shadow-[2px_2px_0px_#FFD733] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to HiFi</span>
                <ArrowRight className="w-4 h-4 text-[#FFD733]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
