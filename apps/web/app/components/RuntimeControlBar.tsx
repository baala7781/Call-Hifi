"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Phone, Sparkles, Check, Database, Radio, Volume2 } from "lucide-react";

interface RuntimeSettings {
  demo_mode: boolean;
  test_phone_number: string;
  voice_provider: string;
  calle_configured: boolean;
}

interface RuntimeControlBarProps {
  onSettingsChange?: (settings: RuntimeSettings) => void;
}

import { getApiBaseUrl } from "../lib/api";

export const RuntimeControlBar: React.FC<RuntimeControlBarProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<RuntimeSettings>({
    demo_mode: true,
    test_phone_number: "",
    voice_provider: "calle",
    calle_configured: true,
  });
  const [phoneInput, setPhoneInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch initial settings
  useEffect(() => {
    fetch(`${getApiBaseUrl()}/api/v1/settings`)
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setPhoneInput(data.test_phone_number || "");
        if (onSettingsChange) onSettingsChange(data);
      })
      .catch(() => {});
  }, []);

  const saveSettings = async (updates: Partial<RuntimeSettings>) => {
    setSaving(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        if (onSettingsChange) onSettingsChange(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (e) {
      console.error("Failed to save runtime settings", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-full bg-[#1A1A1A] text-white border-b border-white/10 px-3 sm:px-4 py-2 sm:py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 text-xs font-mono">
        {/* Row 1 on mobile / Left on Desktop: Evaluator Tag & Mode Switch */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/10 border border-white/15">
            <Sliders className="w-3.5 h-3.5 text-[#FED800]" />
            <span className="font-bold text-[#FED800] text-[10px] sm:text-xs">EVALUATOR:</span>
          </div>

          {/* Demo Mode Toggle Switch */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
            <span className="text-white/70 text-[10px] sm:text-xs">Mode:</span>
            <button
              onClick={() => saveSettings({ demo_mode: !settings.demo_mode })}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer text-[10px] sm:text-[11px] flex items-center gap-1.5 ${
                settings.demo_mode
                  ? "bg-[#FED800] text-black shadow-xs"
                  : "bg-emerald-500 text-white shadow-xs"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${settings.demo_mode ? "bg-black animate-pulse" : "bg-white animate-pulse"}`} />
              {settings.demo_mode ? "DEMO" : "LIVE CALL"}
            </button>
          </div>

          {/* Voice Engine Telephony Pill */}
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
            <Volume2 className="w-3 h-3 text-[#FED800]" />
            <span className="px-1.5 py-0.5 rounded bg-[#FED800]/20 border border-[#FED800]/40 text-[#FED800] font-bold uppercase text-[10px] sm:text-[11px]">
              CALL-E
            </span>
          </div>

          {/* SQLite DB Status (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 text-white/70 border border-white/10">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>SQLite:</span>
            <span className="text-cyan-300 font-bold">hifi.db</span>
          </div>
        </div>

        {/* Row 2 on mobile / Right on Desktop: Test Phone Input */}
        {settings.demo_mode && (
          <div className="flex items-center justify-between sm:justify-end gap-2 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/15 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 min-w-0 flex-1 sm:flex-initial">
              <Phone className="w-3 h-3 text-[#FED800] shrink-0" />
              <span className="text-white/60 text-[10px] sm:text-[11px] shrink-0">Dial To:</span>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                onBlur={() => {
                  if (phoneInput !== settings.test_phone_number) {
                    saveSettings({ test_phone_number: phoneInput });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveSettings({ test_phone_number: phoneInput });
                  }
                }}
                placeholder="+15551234567"
                className="w-full sm:w-32 bg-transparent text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#FED800] px-1 rounded"
              />
            </div>
            <button
              onClick={() => saveSettings({ test_phone_number: phoneInput })}
              className="px-2.5 py-0.5 rounded-md bg-white/20 hover:bg-[#FED800] hover:text-black font-bold text-[10px] transition-colors cursor-pointer shrink-0"
            >
              {saveSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : "Set"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
