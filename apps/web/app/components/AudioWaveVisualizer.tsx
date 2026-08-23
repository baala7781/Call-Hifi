"use client";

import React from "react";

interface AudioWaveProps {
  active?: boolean;
  className?: string;
}

export const AudioWaveVisualizer: React.FC<AudioWaveProps> = ({
  active = true,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-1 h-7 ${className}`}>
      <span
        className={`w-1 rounded-full bg-emerald-400 transition-all duration-300 ${
          active ? "wave-bar-1" : "h-1.5 opacity-40"
        }`}
      />
      <span
        className={`w-1 rounded-full bg-emerald-400 transition-all duration-300 ${
          active ? "wave-bar-2" : "h-2 opacity-40"
        }`}
      />
      <span
        className={`w-1 rounded-full bg-cyan-400 transition-all duration-300 ${
          active ? "wave-bar-3" : "h-1 opacity-40"
        }`}
      />
      <span
        className={`w-1 rounded-full bg-emerald-400 transition-all duration-300 ${
          active ? "wave-bar-4" : "h-2.5 opacity-40"
        }`}
      />
      <span
        className={`w-1 rounded-full bg-cyan-300 transition-all duration-300 ${
          active ? "wave-bar-5" : "h-1.5 opacity-40"
        }`}
      />
    </div>
  );
};
