"use client";

import React, { useState } from "react";
import { Phone, Shield, X, ArrowRight } from "lucide-react";
import { getApiBaseUrl } from "../lib/api";

interface DemoPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (phoneNumber: string) => void;
  currentPhoneNumber?: string;
}

export const DemoPhoneModal: React.FC<DemoPhoneModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  currentPhoneNumber = "",
}) => {
  const [phone, setPhone] = useState(currentPhoneNumber);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError("Please enter a valid phone number (e.g., +15551234567 or +919876543210)");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_phone_number: cleanPhone, demo_mode: true }),
      });

      if (!res.ok) {
        throw new Error("Failed to update test phone number");
      }

      onSaved(cleanPhone);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Error saving test phone number. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl bg-white border-2 border-[#1E1E1E] shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD733] border-2 border-[#1E1E1E] flex items-center justify-center shadow-xs">
              <Phone className="w-5 h-5 text-[#1E1E1E]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono uppercase font-black px-2 py-0.5 rounded bg-[#FED800] text-black">
                  DEMO MODE SAFETY
                </span>
              </div>
              <h3 className="text-lg font-black text-[#1E1E1E] font-mono mt-0.5">
                Enter Your Phone Number
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 text-black/50 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Explanation */}
        <div className="p-3.5 rounded-2xl bg-[#F9F9F0] border border-[#EBECDC] space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#1E1E1E] font-mono font-bold">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Protecting Actual Hotel Trunks</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-sans">
            Because <strong>Demo Mode</strong> is active, CALL-E will dial <strong>your phone</strong> so you can experience the live hotel front-desk negotiation dialogue firsthand.
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            Actual hotel phone lines will NOT be dialed.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] font-mono flex items-center justify-between">
              <span>Your Phone Number (with Country Code)</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+15551234567 or +919876543210"
                className="w-full bg-[#F9F9F0] border-2 border-[#1E1E1E] rounded-xl px-4 py-3.5 text-base text-[#1E1E1E] placeholder-slate-400 focus:outline-none focus:bg-white font-mono font-bold"
              />
            </div>
            <span className="text-[11px] text-slate-500 font-mono block">
              Format: +[Country Code][Phone Number]
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-bold">
              {error}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex-1 py-3.5 px-5 rounded-xl font-black text-sm bg-[#FFD733] hover:bg-[#FFEB99] text-[#1E1E1E] border-2 border-[#1E1E1E] shadow-[0_3px_0_#1E1E1E] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-mono"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin" />
                  Saving number...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Save & Start Live Call</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
