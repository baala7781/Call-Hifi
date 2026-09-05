"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { BookingRecord, HotelOfferRecord } from "@call-e/shared-types";
import {
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Users,
  Bed,
  Coffee,
  Plane,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  PhoneCall,
  XCircle,
} from "lucide-react";

interface ConfirmationViewProps {
  booking: BookingRecord;
  offer: HotelOfferRecord;
  onReset: () => void;
  onRetryConfirmation?: () => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  booking,
  offer,
  onReset,
  onRetryConfirmation,
}) => {
  const isConfirmed = booking.confirmation_status === "confirmed";
  const isFailed = booking.confirmation_status === "failed";

  useEffect(() => {
    if (isConfirmed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FFD733", "#1E1E1E", "#FFEB99"],
        });
      } catch {
        // ignore in non-browser environments
      }
    }
  }, [isConfirmed]);

  const handlePrint = () => {
    window.print();
  };

  // Case 1: Hotel declined or payment not acknowledged by hotel front desk
  if (isFailed) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Top Warning Banner */}
        <div className="text-center space-y-2 py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 border-2 border-rose-400 text-rose-600 mb-2 shadow-md">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-[#1E1E1E] font-mono">
            Hotel Confirmation Unsuccessful
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
            CALL-E reached <strong className="text-rose-600 font-bold">{booking.hotel_name}</strong>, but the front desk could not verify receipt of payment.
          </p>
        </div>

        {/* Failed Details Card */}
        <div className="calle-card rounded-3xl overflow-hidden border-2 border-rose-400 shadow-xl relative p-6 sm:p-8 space-y-6 bg-white">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 text-sm font-bold font-mono">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Reason from Hotel Front Desk:</span>
            </div>
            <p className="text-xs text-rose-900 pl-6 leading-relaxed font-medium">
              {booking.failure_reason || "The hotel front desk stated that payment was not received in their accounting system and the reservation could not be confirmed."}
            </p>
            {booking.confirmation_notes && (
              <p className="text-[11px] text-slate-500 pl-6 italic font-mono">
                Call Notes: {booking.confirmation_notes}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F9F9F0] border border-[#EBECDC] text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">Hotel</span>
              <span className="font-black text-[#1E1E1E] mt-0.5 block">{booking.hotel_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">Attempted Rate</span>
              <span className="font-black text-[#1E1E1E] mt-0.5 block font-mono text-sm">
                {booking.currency} {booking.final_amount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">Payment Status</span>
              <span className="font-bold text-amber-700 mt-0.5 block">Held in Escrow (Simulated)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 font-mono">
            <button
              onClick={onReset}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#F9F9F0] hover:bg-white text-[#1E1E1E] text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#EBECDC]"
            >
              <RotateCcw className="w-4 h-4" />
              Back to Shortlist & Offers
            </button>

            {onRetryConfirmation && (
              <button
                onClick={onRetryConfirmation}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#FFD733] hover:bg-[#FFEB99] text-[#1E1E1E] text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#1E1E1E] shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                Retry Confirmation Call
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Confirmed successfully
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Confirmed Banner */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFD733] border-2 border-[#1E1E1E] text-[#1E1E1E] mb-2 shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-[#1E1E1E] font-mono">
          Reservation Confirmed!
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
          CALL-E successfully called <strong className="text-[#1E1E1E] font-bold">{booking.hotel_name}</strong> and locked in your direct-booking rate.
        </p>
      </div>

      {/* Boarding Pass Style Voucher */}
      <div className="calle-card rounded-3xl overflow-hidden border-2 border-[#1E1E1E] shadow-2xl relative bg-white">
        {/* Voucher Header in Solid Yellow */}
        <div className="p-5 sm:p-8 bg-[#FFD733] border-b-2 border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono text-[#1E1E1E] uppercase tracking-widest block mb-1 font-black">
              Official Hotel Reservation Pass
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#1E1E1E] font-mono">{booking.hotel_name}</h3>
            <p className="text-xs text-[#1E1E1E]/80 mt-0.5 font-mono font-bold">
              {offer.room_type || "Deluxe Room"}
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#1E1E1E] text-left sm:text-right shadow-sm self-start sm:self-auto">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
              Confirmation Code
            </div>
            <div className="text-lg sm:text-2xl font-black font-mono text-[#1E1E1E] tracking-wider">
              {booking.confirmation_number || "HIFI-48291"}
            </div>
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-5 sm:p-8 space-y-5 sm:space-y-6 bg-white">
          {/* Dates & Party Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#F9F9F0] border border-[#EBECDC] text-xs">
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 font-bold">
                <Calendar className="w-3.5 h-3.5 text-[#1E1E1E]" /> Check-in
              </div>
              <div className="font-black text-[#1E1E1E] mt-1 text-sm font-mono">{booking.check_in || "2026-10-12"}</div>
            </div>

            <div>
              <div className="text-slate-500 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 font-bold">
                <Calendar className="w-3.5 h-3.5 text-[#1E1E1E]" /> Check-out
              </div>
              <div className="font-black text-[#1E1E1E] mt-1 text-sm font-mono">{booking.check_out || "2026-10-17"}</div>
            </div>

            <div>
              <div className="text-slate-500 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 font-bold">
                <Users className="w-3.5 h-3.5 text-[#1E1E1E]" /> Party
              </div>
              <div className="font-black text-[#1E1E1E] mt-1 text-sm font-mono">{booking.guests_summary || "2 Adults, 1 Room"}</div>
            </div>

            <div>
              <div className="text-slate-500 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E1E1E]" /> Total Paid
              </div>
              <div className="font-black text-[#1E1E1E] mt-1 text-sm font-mono">
                {booking.currency} {booking.final_amount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Confirmed Perks */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider font-mono">
              Verified & Locked Direct Benefits
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {booking.confirmed_inclusions && booking.confirmed_inclusions.length > 0 ? (
                booking.confirmed_inclusions.map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-[#F9F9F0] border border-[#EBECDC] text-[#1E1E1E] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F9F9F0] border border-[#EBECDC] text-[#1E1E1E] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Room Availability Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F9F9F0] border border-[#EBECDC] text-[#1E1E1E] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct Booking Rate Confirmed</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2-Call Agentic Workflow Audit Trail */}
          <div className="p-4 rounded-2xl bg-[#1E1E1E] text-white space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[#FFD733] font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD733]" /> CALL-E 2-Call Multi-Step Workflow Audit
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                100% Agentic Verified
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFD733] text-[#1E1E1E] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <span className="font-bold text-[#FFD84D]">Call #1 (Procurement & Negotiation): </span>
                  <span className="text-white/80">Called front desk, verified {offer.room_type || "Deluxe Room"}, negotiated direct discount & confirmed complimentary breakfast.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-400 text-[#1E1E1E] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <span className="font-bold text-emerald-300">Call #2 (Payment & Final Confirmation): </span>
                  <span className="text-white/80">Called property again to confirm booking terms, acknowledged payment receipt, & secured reference {booking.confirmation_number || "HIFI-48291"}.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Highlight */}
          {offer.negotiated_savings && offer.negotiated_savings > 0 && (
            <div className="p-4 rounded-2xl bg-[#FFD733] border border-[#1E1E1E] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5 text-xs text-[#1E1E1E] font-bold">
                <Sparkles className="w-4 h-4 text-[#1E1E1E]" />
                <span>Total Negotiated Direct Savings:</span>
              </div>
              <span className="font-mono font-black text-[#1E1E1E] text-base">
                Saved {offer.currency} {offer.negotiated_savings.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Voucher Footer Action */}
        <div className="p-6 bg-[#F9F9F0] border-t border-[#EBECDC] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl border border-[#EBECDC] hover:bg-white text-xs font-bold text-[#1E1E1E] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Print / Save Pass
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#FFD733] hover:bg-[#FFEB99] text-[#1E1E1E] text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#1E1E1E] shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Plan Another Trip
          </button>
        </div>
      </div>
    </div>
  );
};
