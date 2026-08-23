"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Phone, Sparkles, Check, Database, Radio, Volume2 } from "lucide-react";

interface RuntimeSettings {
  demo_mode: boolean;
  test_phone_number: string;
  voice_provider: string;
  cartesia_voice_id?: string;
  calle_configured: boolean;
  cartesia_configured: boolean;
}

interface RuntimeControlBarProps {
  onSettingsChange?: (settings: RuntimeSettings) => void;
}

export const RuntimeControlBar: React.FC<RuntimeControlBarProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<RuntimeSettings>({
    demo_mode: true,
    test_phone_number: "+919705730130",
    voice_provider: "calle",
    calle_configured: true,
    cartesia_configured: true,
  });
  const [phoneInput, setPhoneInput] = useState("+919705730130");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch initial settings
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setPhoneInput(data.test_phone_number || "+919705730130");
        if (onSettingsChange) onSettingsChange(data);
      })
      .catch(() => {});
  }, []);

  const saveSettings = async (updates: Partial<RuntimeSettings>) => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/settings", {
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
    <div className="w-full bg-[#1A1A1A] text-white border-b border-white/10 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        {/* Left: Mode Indicators & Demo Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
            <Sliders className="w-3.5 h-3.5 text-[#FED800]" />
            <span className="font-bold text-[#FED800]">EVALUATOR CONTROLS:</span>
          </div>

          {/* Demo Mode Toggle Switch */}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
            <span className="text-white/70">Mode:</span>
            <button
              onClick={() => saveSettings({ demo_mode: !settings.demo_mode })}
              className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                settings.demo_mode
                  ? "bg-[#FED800] text-black shadow-xs"
                  : "bg-emerald-500 text-white shadow-xs"
              }`}
            >
              {settings.demo_mode ? "DEMO MODE (Test Phone)" : "PRODUCTION (Real Hotels)"}
            </button>
          </div>

          {/* SQLite DB Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 text-white/70 border border-white/10">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>SQLite:</span>
            <span className="text-cyan-300 font-bold">hifi.db (Persistent)</span>
          </div>
        </div>

        {/* Right: Test Phone Input & Voice Engine */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Test Phone Number */}
          {settings.demo_mode && (
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/15">
              <Phone className="w-3 h-3 text-[#FED800]" />
              <span className="text-white/60 text-[11px]">Dial To:</span>
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
                placeholder="+919705730130"
                className="w-32 bg-transparent text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#FED800] px-1 rounded"
              />
              <button
                onClick={() => saveSettings({ test_phone_number: phoneInput })}
                className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-[#FED800] hover:text-black font-bold text-[10px] transition-colors cursor-pointer"
              >
                {saveSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : "Set"}
              </button>
            </div>
          )}

          {/* Voice Engine Toggle */}
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
            <Volume2 className="w-3.5 h-3.5 text-white/70" />
            <span className="text-white/60 text-[11px]">Voice:</span>
            <button
              onClick={() =>
                saveSettings({
                  voice_provider: settings.voice_provider === "calle" ? "cartesia" : "calle",
                })
              }
              className="px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-white font-bold uppercase transition-colors cursor-pointer"
            >
              {settings.voice_provider === "cartesia" ? "Cartesia Sonic" : "CALL-E"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
