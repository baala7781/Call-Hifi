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
      <div className="calle-card rounded-3xl p-5 sm:p-8 relative overflow-hidden bg-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-[#EBECDC]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                {!isAllCompleted && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD733] opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFD733]" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-[#1E1E1E] font-black">
                {isAllCompleted ? "All Direct Calls Verified" : "Live Telephony & Verification"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1E1E1E] font-mono">
              Direct Hotel Procurement & Negotiation
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Destination: <span className="font-bold text-[#1E1E1E]">{destination}</span> • Real-time front-desk verification
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-[#1E1E1E]/70 font-mono font-medium">Hotel Verification</div>
            <div className="text-lg sm:text-xl font-black font-mono text-[#1E1E1E]">
              {completedCount} / {calls.length || totalCalls || 1} Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#F9F9F0] rounded-full h-3 my-5 sm:my-6 overflow-hidden border border-[#EBECDC]">
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
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer select-none hover:bg-black/5 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 ${
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

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-[#1E1E1E] truncate">
                          {call.hotel_name}
                        </h3>
                        {call.completion_confidence && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FFD733] text-[#1E1E1E] border border-[#1E1E1E]/20 font-bold shrink-0">
                            {Math.round(call.completion_confidence * 100)}% Conf
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#1E1E1E]/70 font-mono font-medium truncate">
                        {call.phone_number || "Direct Hotel Trunk"} • {call.purpose.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  {/* Status pill, Transcript Button & Waveform */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 flex-wrap pt-1 sm:pt-0 border-t sm:border-t-0 border-[#EBECDC]/60">
                    {isCalling && <AudioWaveVisualizer active={true} />}

                    <span
                      className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${
                        isCalling
                          ? "bg-[#FFD733] text-[#1E1E1E] border border-[#1E1E1E] animate-pulse"
                          : isCompleted
                          ? "bg-[#1E1E1E] text-[#FFD733]"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isCalling ? "Live on Phone..." : isCompleted ? "Offer Verified" : "Queued"}
                    </span>

                    {/* Prominent Transcript Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(call.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                        isExpanded
                          ? "bg-[#1E1E1E] text-[#FFD733] border-[#1E1E1E]"
                          : "bg-white text-[#1E1E1E] border-[#1E1E1E]/20 hover:bg-[#FFD733]"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>
                        {isExpanded
                          ? "Hide Transcript"
                          : `Transcript (${call.transcript?.length || 0})`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Human-Readable Spoken Offer Summary Pill */}
                {isCompleted && Boolean(call.raw_structured_result) && (
                  <div className="mx-4 mb-3 p-3 rounded-xl bg-white border border-[#EBECDC] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Agreed Phone Rate:</span>
                      <span className="font-black text-sm text-[#1E1E1E]">
                        {(call.raw_structured_result as any).currency || "USD"}{" "}
                        {((call.raw_structured_result as any).negotiated_total || (call.raw_structured_result as any).total_price || 0).toLocaleString()}
                      </span>
                      {(call.raw_structured_result as any).negotiated_savings > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Save {(call.raw_structured_result as any).currency} {((call.raw_structured_result as any).negotiated_savings).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                      {(call.raw_structured_result as any).breakfast_included && (
                        <span className="font-bold text-emerald-700">✓ Breakfast Included</span>
                      )}
                      {(call.raw_structured_result as any).free_cancellation && (
                        <span className="font-bold text-emerald-700">✓ Free Cancellation</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Evidence & Spoken Quote Badges */}
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

                {/* Summary Notes */}
                {isCompleted && Boolean((call.raw_structured_result as any)?.notes) && (
                  <div className="px-4 pb-3 text-xs text-slate-700 font-medium">
                    <span className="font-bold text-[#1E1E1E]">Summary: </span>
                    <span>{String((call.raw_structured_result as any).notes)}</span>
                  </div>
                )}

                {/* Expandable Live Transcript with Clear Speech Bubbles */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-[#F9F9F0] border-t border-[#EBECDC] space-y-2.5 text-xs font-mono">
                    <div className="flex items-center justify-between pb-1 border-b border-[#EBECDC]">
                      <div className="text-[10px] uppercase tracking-wider text-slate-600 flex items-center gap-1.5 font-bold">
                        <Volume2 className="w-3.5 h-3.5 text-[#1E1E1E]" />
                        <span>Verified Front-Desk Audio Transcript ({call.transcript?.length || 0} spoken turns)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">CALL-E Live Recording</span>
                    </div>

                    {call.transcript && call.transcript.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {call.transcript.map((turn, tIdx) => {
                          const isAlex =
                            turn.speaker.toLowerCase().includes("alex") ||
                            turn.speaker.toLowerCase().includes("hifi") ||
                            turn.speaker.toLowerCase().includes("travel") ||
                            turn.speaker.toLowerCase().includes("assistant") ||
                            turn.speaker.toLowerCase().includes("bot");
                          return (
                            <div
                              key={tIdx}
                              className={`p-3 rounded-2xl leading-relaxed shadow-xs ${
                                isAlex
                                  ? "bg-[#FFEB99]/60 border border-[#1E1E1E]/15 ml-4"
                                  : "bg-white border border-[#EBECDC] mr-4"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span
                                  className={`text-[11px] font-black uppercase ${
                                    isAlex ? "text-[#1E1E1E]" : "text-emerald-800"
                                  }`}
                                >
                                  {turn.speaker}
                                </span>
                              </div>
                              <p className="text-slate-900 text-xs font-sans leading-relaxed">
                                {turn.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-slate-500 italic p-3 bg-white rounded-xl border border-[#EBECDC]">
                        Audio call in progress. Speech transcription frames will appear here once audio is received.
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
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#EBECDC] flex justify-end">
            <button
              onClick={onViewOffers}
              className="w-full sm:w-auto py-4 px-6 sm:px-8 rounded-2xl font-black text-xs sm:text-sm bg-[#FFD733] hover:bg-[#FFEB99] text-[#1E1E1E] border-2 border-[#1E1E1E] shadow-[0_4px_0_#1E1E1E] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Compare Offers & Savings ({calls.filter(c => c.status === "completed").length} Ready)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
