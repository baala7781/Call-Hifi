"use client";

import React, { useEffect, useState } from "react";
import { Clock, MapPin, Phone, Tag, ChevronRight, X, Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TripSummary {
  id: string;
  destination: string;
  check_in: string;
  check_out: string;
  adults: number;
  budget_amount: number;
  budget_currency: string;
  status: string;
  created_at: string;
  call_count: number;
  offer_count: number;
  best_offer_total: number | null;
}

interface TripHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onResume: (tripId: string) => void;
  userEmail?: string | null;
}

export function TripHistoryDrawer({ isOpen, onClose, onResume, userEmail }: TripHistoryDrawerProps) {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [resumingId, setResumingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const emailParam = userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : "";
      fetch(`${API_BASE_URL}/api/v1/trips${emailParam}`)
        .then((r) => r.json())
        .then((data) => {
          setTrips(data.trips || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, userEmail]);

  const handleResume = async (tripId: string) => {
    setResumingId(tripId);
    onResume(tripId);
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return d;
    }
  };

  const formatTime = (d: string) => {
    try {
      return new Date(d).toLocaleString("en-IN", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#FFFDF5] border-l border-[#EBECDC] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EBECDC]">
          <div>
            <h2 className="text-lg font-black font-mono text-[#1E1E1E]">Trip History</h2>
            <p className="text-xs font-mono text-[#1E1E1E]/50 mt-0.5">
              {trips.length} past searches • Resume anytime
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#EBECDC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-[#1E1E1E]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E1E1E]/40" />
              <span className="text-xs font-mono text-[#1E1E1E]/40">Loading history...</span>
            </div>
          ) : trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Clock className="w-8 h-8 text-[#1E1E1E]/20" />
              <span className="text-sm font-mono text-[#1E1E1E]/40">No past trips yet</span>
              <span className="text-xs font-mono text-[#1E1E1E]/30">
                Start a new search to build your history
              </span>
            </div>
          ) : (
            trips.map((trip) => {
              const nights = Math.max(
                1,
                Math.round(
                  (new Date(trip.check_out).getTime() - new Date(trip.check_in).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              );
              const isResuming = resumingId === trip.id;

              return (
                <button
                  key={trip.id}
                  onClick={() => handleResume(trip.id)}
                  disabled={isResuming}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-[#EBECDC] hover:border-[#FFD733] hover:shadow-md transition-all group cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Destination */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <MapPin className="w-4 h-4 text-[#1E1E1E]/60 flex-shrink-0" />
                        <span className="font-mono font-black text-sm text-[#1E1E1E] truncate capitalize">
                          {trip.destination}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="text-[11px] font-mono text-[#1E1E1E]/50 mb-2">
                        {formatDate(trip.check_in)} → {formatDate(trip.check_out)} • {nights}N •{" "}
                        {trip.adults} Guest{trip.adults > 1 ? "s" : ""}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {trip.call_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <Phone className="w-3 h-3" />
                            {trip.call_count} call{trip.call_count > 1 ? "s" : ""}
                          </span>
                        )}
                        {trip.offer_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            <Tag className="w-3 h-3" />
                            {trip.offer_count} offer{trip.offer_count > 1 ? "s" : ""}
                          </span>
                        )}
                        {trip.best_offer_total && (
                          <span className="text-[10px] font-mono font-bold text-[#1E1E1E]/70">
                            Best: {trip.budget_currency}{" "}
                            {trip.best_offer_total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow / Loading */}
                    <div className="flex-shrink-0 mt-1">
                      {isResuming ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#FFD733]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#1E1E1E]/20 group-hover:text-[#FFD733] transition-colors" />
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="mt-2 pt-2 border-t border-[#EBECDC]/60">
                    <span className="text-[10px] font-mono text-[#1E1E1E]/30">
                      Created: {formatTime(trip.created_at)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
