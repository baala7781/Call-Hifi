"use client";

import React from "react";
import { HotelOfferRecord } from "@call-e/shared-types";
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Coffee,
  Plane,
  Calendar,
  IndianRupee,
  Clock,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

interface OfferDetailModalProps {
  offer: HotelOfferRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (offer: HotelOfferRecord) => void;
  datesText?: string;
  guestsText?: string;
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  offer,
  isOpen,
  onClose,
  onApprove,
  datesText = "Oct 12 – Oct 17, 2026 (5 Nights)",
  guestsText = "2 Adults, 1 Room",
}) => {
  if (!isOpen || !offer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow w-full max-w-xl rounded-2xl p-6 sm:p-8 border relative overflow-hidden shadow-2xl space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Direct Offer
          </div>
          <h2 className="text-2xl font-bold text-white">{offer.hotel_name}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {datesText} • {guestsText}
          </p>
        </div>

        {/* Pricing breakdown */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Rack / Online Price:</span>
            <span className="font-mono line-through">
              {offer.currency} {offer.original_total?.toLocaleString()}
            </span>
          </div>

          {offer.negotiated_savings && offer.negotiated_savings > 0 && (
            <div className="flex justify-between items-center text-xs text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Direct Negotiated Savings:
              </span>
              <span className="font-mono">
                -{offer.currency} {offer.negotiated_savings.toLocaleString()}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-sm font-bold text-white">Final Direct Total:</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {offer.currency} {offer.negotiated_total?.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>All local taxes and mandatory service charges included.</span>
          </div>
        </div>

        {/* Included benefits checklist */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Confirmed Direct Inclusions
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{offer.room_type || "Deluxe King Room"}</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-200">
              <Coffee className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {offer.breakfast_included ? "Daily Breakfast for All Guests" : "Breakfast Not Included"}
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-200">
              <Plane className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {offer.airport_transfer_available ? "Airport Pickup Included" : "Airport Transfer On Request"}
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-slate-200">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{offer.cancellation_deadline || "Free Cancellation"}</span>
            </div>
          </div>
        </div>

        {/* Authorization disclaimer */}
        <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300 font-medium">Authorization Boundary:</strong> HiFi never
          commits or books without explicit approval. Clicking below will proceed to a simulated
          checkout before the final CALL-E confirmation call.
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-1/3 py-3 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={() => onApprove(offer)}
            className="w-2/3 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Approve & Proceed to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
