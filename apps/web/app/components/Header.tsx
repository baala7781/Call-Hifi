"use client";

import React, { useEffect, useState } from "react";
import { Terminal, ArrowUpRight, Code2, ShieldCheck, LogOut, User, Clock } from "lucide-react";

interface HeaderProps {
  onOpenDebug: () => void;
  onOpenHistory?: () => void;
  onSelectPreset?: (preset: "bali" | "tokyo" | "paris") => void;
  isDemoMode?: boolean;
  userEmail?: string | null;
  onLogout?: () => void;
}

import { getApiBaseUrl } from "../lib/api";

export const Header: React.FC<HeaderProps> = ({
  onOpenDebug,
  onOpenHistory,
  onSelectPreset,
  isDemoMode = true,
  userEmail,
  onLogout,
}) => {
  const [provider, setProvider] = useState<string>("calle");

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/api/v1/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.voice_provider) {
          setProvider(data.voice_provider);
        }
      })
      .catch(() => { });
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full py-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand: CALL-E / HiFi Logo */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.heycall-e.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group cursor-pointer"
          >
            {/* Friendly Speech Bubble Logo */}
            <div className="w-9 h-9 rounded-2xl bg-[#1A1A1A] flex items-center justify-center shadow-sm">
              <span className="text-white font-mono font-black text-sm">Hi</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#1A1A1A] font-mono">
                  HiFi
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-[#1A1A1A]/70 align-top">
                  BETA
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#1A1A1A]/80 hidden sm:inline font-medium">
                • powered by CALL-E
              </span>
            </div>
          </a>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-[#1A1A1A] font-medium">
          <a
            href="http://localhost:3000/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
          >
            About
          </a>
          <a
            href="http://docs.heycall-e.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 flex items-center gap-1 transition-opacity"
          >
            <span>Docs</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

        {/* Right CTA Buttons & User State */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Authenticated Evaluator Badge */}
          {userEmail && (
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-md border border-black/10 text-xs font-mono text-[#1A1A1A] max-w-[120px] sm:max-w-none">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate font-bold max-w-[60px] sm:max-w-[120px]">{userEmail}</span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="ml-0.5 text-black/40 hover:text-black transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Preset Buttons */}
          {onSelectPreset && (
            <div className="hidden lg:flex items-center gap-1.5 bg-white/40 backdrop-blur-md px-2 py-1 rounded-xl border border-black/5 text-xs font-mono">
              <button
                onClick={() => onSelectPreset("bali")}
                className="px-2 py-1 rounded-lg text-[#1A1A1A] hover:bg-white/80 transition-colors font-bold cursor-pointer"
              >
                Bali
              </button>
              <button
                onClick={() => onSelectPreset("tokyo")}
                className="px-2 py-1 rounded-lg text-[#1A1A1A] hover:bg-white/80 transition-colors font-bold cursor-pointer"
              >
                Tokyo
              </button>
            </div>
          )}

          {/* GitHub Pill Button (hidden on mobile, visible on tablet/desktop) */}
          <a
            href="https://github.com/CALLE-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex calle-btn-white px-3 py-2 text-xs font-mono uppercase items-center gap-1.5 cursor-pointer"
            title="View on GitHub"
          >
            <span className="hidden md:inline">GITHUB</span>
            <Code2 className="w-3.5 h-3.5" />
          </a>

          {/* Trip History */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="calle-btn-white px-2.5 sm:px-3.5 py-2 text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer"
              title="View Trip History"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">HISTORY</span>
            </button>
          )}

          {/* Logs / Inspector Pill */}
          <button
            onClick={onOpenDebug}
            className="calle-btn-black px-2.5 sm:px-4 py-2 text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer"
            title="Inspect CALL-E Realtime Logs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LOGS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
