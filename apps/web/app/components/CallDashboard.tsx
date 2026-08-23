"use client";

import React, { useState, useEffect } from "react";
import { CallTaskRecord } from "@call-e/shared-types";
import { AudioWaveVisualizer } from "./AudioWaveVisualizer";
import {
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Volume2,
  FileText,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";

interface CallDashboardProps {
  calls: CallTaskRecord[];
  completedCount: number;
  totalCalls: number;
  destination: string;
  onViewOffers?: () => void;
  isAllCompleted?: boolean;
}

export const CallDashboard: React.FC<CallDashboardProps> = ({
  calls,
  completedCount,
  totalCalls,
  destination,
  onViewOffers,
  isAllCompleted = false,
}) => {
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

  // Auto-expand the first completed call if none is expanded
  useEffect(() => {
    if (!expandedCallId && calls.length > 0) {
      const firstCompleted = calls.find((c) => c.status === "completed" && c.transcript && c.transcript.length > 0);
      if (firstCompleted) {
        setExpandedCallId(firstCompleted.id);
      }
    }
  }, [calls, expandedCallId]);

  const toggleExpand = (id: string) => {
    setExpandedCallId(expandedCallId === id ? null : id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Calling Banner */}
      <div className="calle-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EBECDC]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                {!isAllCompleted && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD733] opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFD733]" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-[#1E1E1E] font-black">
                {isAllCompleted ? "All Direct Calls Verified" : "Live Front-Desk Telephony & Verification"}
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#1E1E1E] font-mono">
              Direct Hotel Procurement & Negotiation
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Destination: <span className="font-bold text-[#1E1E1E]">{destination}</span> • Real-time front-desk verification
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-[#1E1E1E]/70 font-mono font-medium">Verification Status</div>
            <div className="text-xl font-black font-mono text-[#1E1E1E]">
              {completedCount} / {totalCalls || 1} Verified
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#F9F9F0] rounded-full h-3 my-6 overflow-hidden border border-[#EBECDC]">
          <div
            className="bg-[#FFD733] h-3 rounded-full transition-all duration-700 ease-out border border-[#1E1E1E]/20"
            style={{
              width: `${Math.max(5, Math.round(((completedCount || 0) / Math.max(1, totalCalls || 1)) * 100))}%`,
            }}
          />
        </div>

        {/* Dynamic Hotel Call Cards */}
        <div className="space-y-3.5">
          {calls.map((call, idx) => {
            const isCalling = call.status === "calling";
            const isCompleted = call.status === "completed";
            const isExpanded = expandedCallId === call.id;

            return (
              <div
                key={call.id || idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isCalling
                    ? "bg-[#FFEB99]/30 border-[#1E1E1E] shadow-md ring-1 ring-[#1E1E1E]"
                    : isCompleted
                    ? "bg-[#F9F9F0] border-[#EBECDC]"
                    : "bg-white border-[#EBECDC] opacity-70"
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(call.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-black ${
                        isCalling
                          ? "bg-[#FFD733] text-[#1E1E1E] border border-[#1E1E1E] shadow-sm"
                          : isCompleted
                          ? "bg-[#1E1E1E] text-[#FFD733]"
                          : "bg-[#F9F9F0] text-slate-500"
                      }`}
                    >
                      {isCalling ? (
                        <PhoneCall className="w-4 h-4 animate-bounce text-[#1E1E1E]" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        `#${idx + 1}`
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-[#1E1E1E]">
                          {call.hotel_name}
                        </h3>
                        {call.completion_confidence && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FFD733] text-[#1E1E1E] border border-[#1E1E1E]/20 font-bold">
                            {Math.round(call.completion_confidence * 100)}% Conf
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#1E1E1E]/70 font-mono font-medium">
                        {call.phone_number || "Direct Hotel Trunk"} • {call.purpose.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  {/* Status pill & Waveform */}
                  <div className="flex items-center gap-3">
                    {isCalling && <AudioWaveVisualizer active={true} />}

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${
                        isCalling
                          ? "bg-[#FFD733] text-[#1E1E1E] border border-[#1E1E1E] animate-pulse"
                          : isCompleted
                          ? "bg-[#1E1E1E] text-[#FFD733]"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isCalling ? "Live on Phone..." : isCompleted ? "Offer Verified" : "Queued"}
                    </span>

                    <button className="text-slate-600 hover:text-black transition-colors p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Evidence & Quote Badges */}
                {call.evidence && call.evidence.length > 0 && (
                  <div className="px-4 pb-3 flex flex-wrap gap-1.5 font-mono">
                    {call.evidence.map((ev: any, eIdx: number) => (
                      <span
                        key={eIdx}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white text-[#1E1E1E] border border-[#EBECDC] flex items-center gap-1 font-medium shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{String(ev)}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Structured Raw Notes if available */}
                {isCompleted && Boolean((call.raw_structured_result as any)?.notes) && (
                  <div className="px-4 pb-3 text-xs text-slate-700 font-medium">
                    <span className="font-bold text-[#1E1E1E]">Summary: </span>
                    <span>{String((call.raw_structured_result as any).notes)}</span>
                  </div>
                )}

                {/* Expandable Live Transcript */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-[#F9F9F0] border-t border-[#EBECDC] space-y-2.5 text-xs font-mono">
                    <div className="text-[10px] uppercase tracking-wider text-slate-600 flex items-center gap-1 font-bold">
                      <Volume2 className="w-3.5 h-3.5 text-[#1E1E1E]" /> Verified Front-Desk Audio Transcript
                    </div>
                    {call.transcript && call.transcript.length > 0 ? (
                      call.transcript.map((turn, tIdx) => {
                        const isAlex = turn.speaker.toLowerCase().includes("alex") || turn.speaker.toLowerCase().includes("hifi") || turn.speaker.toLowerCase().includes("travel");
                        return (
                          <div key={tIdx} className={`p-2.5 rounded-xl leading-relaxed ${isAlex ? "bg-[#FFEB99]/40 border border-[#1E1E1E]/10" : "bg-white border border-[#EBECDC]"}`}>
                            <span
                              className={
                                isAlex
                                  ? "text-[#1E1E1E] font-black"
                                  : "text-slate-700 font-bold"
                              }
                            >
                              {turn.speaker}:{" "}
                            </span>
                            <span className="text-slate-900">{turn.text}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-500 italic p-2">
                        Audio call in progress. Live transcript will update once speech frames are processed.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA when all completed */}
        {isAllCompleted && onViewOffers && (
          <div className="mt-8 pt-6 border-t border-[#EBECDC] flex justify-end">
            <button
              onClick={onViewOffers}
              className="py-4 px-8 rounded-2xl font-black text-sm bg-[#FFD733] hover:bg-[#FFEB99] text-[#1E1E1E] border-2 border-[#1E1E1E] shadow-[0_4px_0_#1E1E1E] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 cursor-pointer font-mono"
            >
              <Sparkles className="w-4 h-4" />
              Compare Verified Offers & Savings ({calls.filter(c => c.status === "completed").length} Ready)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
