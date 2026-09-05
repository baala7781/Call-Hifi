"use client";

import React from "react";
import { Sparkles, Phone, ArrowUpRight } from "lucide-react";

interface HeroSectionProps {
  onQuickStart?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onQuickStart }) => {
  return (
    <div className="relative overflow-hidden py-8 sm:py-14 text-center px-2">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 relative z-10 space-y-4 sm:space-y-6">
        {/* Center Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/50 backdrop-blur-md border border-black/10 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#1A1A1A] font-bold shadow-xs">
          <span>Powered by</span>
          <span className="opacity-40">•</span>
          <span className="font-black">Call-E</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#1A1A1A] leading-tight sm:leading-tight">
          Don&apos;t call five hotels. <br className="hidden sm:inline" />
          <span className="inline-block relative font-normal pb-1">
            Let HiFi do it.
            <span className="absolute bottom-0 left-0 right-0 h-[3px] sm:h-[4px] bg-gradient-to-r from-[#EBECDC] via-[#A6E9F9] to-[#439CF5] rounded-full" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-[#1A1A1A]/80 max-w-xl mx-auto font-normal leading-relaxed px-2">
          HiFi verifies availability, negotiates direct rates, and confirms your stay — autonomously over the phone.
        </p>

        {/* Hero Action Banner */}
        <div className="mt-6 sm:mt-8 max-w-xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-white/55 backdrop-blur-xl border border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="text-xs sm:text-sm text-[#1A1A1A] font-medium text-center sm:text-left">
            Online listings show rack rates. We call to get direct deals.
          </div>
          <a
            href="#trip-form"
            className="w-full sm:w-auto calle-btn-black px-4 py-3 text-xs uppercase flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-sm shrink-0"
          >
            <span>FIND MY BEST DEAL</span>
            <span className="flex items-center gap-0.5 text-[#FFD84D]">
              <span className="w-0.5 h-2 bg-[#FFD84D] rounded-full animate-pulse" />
              <span className="w-0.5 h-3.5 bg-[#FFD84D] rounded-full animate-pulse delay-75" />
              <span className="w-0.5 h-1.5 bg-[#FFD84D] rounded-full animate-pulse delay-150" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
