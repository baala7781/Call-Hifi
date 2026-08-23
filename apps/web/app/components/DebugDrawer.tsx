"use client";

import React, { useState } from "react";
import { X, Terminal, Copy, Check, ShieldCheck, Database, Volume2 } from "lucide-react";
import { CallTaskRecord, HotelOfferRecord, TripRecord } from "@call-e/shared-types";

interface DebugDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripRecord | null;
  calls: CallTaskRecord[];
  offers: HotelOfferRecord[];
}

export const DebugDrawer: React.FC<DebugDrawerProps> = ({
  isOpen,
  onClose,
  trip,
  calls,
  offers,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"calls" | "schema" | "prompts">("calls");

  if (!isOpen) return null;

  const handleCopy = () => {
    const data = { trip, calls, offers };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950/95 border-l border-white/10 shadow-2xl backdrop-blur-xl flex flex-col animate-slideLeft">
      {/* Drawer Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
            CALL-E Technical Inspector
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy full JSON state"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy JSON"}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-slate-900/60 px-5 text-xs font-mono">
        <button
          onClick={() => setActiveTab("calls")}
          className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
            activeTab === "calls"
              ? "border-cyan-400 text-cyan-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Call Logs & Evidence ({calls.length})
        </button>
        <button
          onClick={() => setActiveTab("schema")}
          className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
            activeTab === "schema"
              ? "border-cyan-400 text-cyan-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Raw JSON Schemas
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs text-slate-300">
        {activeTab === "calls" && (
          <div className="space-y-4">
            {calls.length === 0 ? (
              <div className="text-slate-500 text-center py-10">No calls initiated yet.</div>
            ) : (
              calls.map((c, idx) => (
                <div key={c.id || idx} className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-bold text-white">{c.hotel_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : c.status === "calling"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {c.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>Confidence: {c.completion_confidence ? `${Math.round(c.completion_confidence * 100)}%` : "N/A"}</div>
                    <div>Duration: {c.duration_seconds || 0}s</div>
                  </div>

                  {/* Evidence Points */}
                  {c.evidence && c.evidence.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold">Verified Evidence:</div>
                      {c.evidence.map((ev, eIdx) => (
                        <div key={eIdx} className="text-emerald-400 text-[11px] pl-2 border-l border-emerald-500/30">
                          • {ev}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Structured Output Preview */}
                  {c.raw_structured_result && (
                    <div className="mt-2 p-2 rounded bg-slate-950 border border-white/5 overflow-x-auto text-[11px]">
                      <div className="text-[10px] text-slate-500 mb-1">CALL-E Structured Result:</div>
                      <pre className="text-cyan-300">
                        {JSON.stringify(c.raw_structured_result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "schema" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
              <div className="text-slate-400 mb-2 font-bold">Latest Offers Output:</div>
              <pre className="text-emerald-400 text-[11px] overflow-x-auto p-2 bg-slate-950 rounded">
                {JSON.stringify(offers, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
