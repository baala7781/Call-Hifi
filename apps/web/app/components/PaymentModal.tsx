"use client";

import React, { useState } from "react";
import { HotelOfferRecord } from "@call-e/shared-types";
import {
  CreditCard,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
} from "lucide-react";

interface PaymentModalProps {
  offer: HotelOfferRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onPayAndConfirm: () => void;
  isLoading?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  offer,
  isOpen,
  onClose,
  onPayAndConfirm,
  isLoading = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");

  if (!isOpen || !offer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow w-full max-w-lg rounded-2xl p-6 sm:p-8 border relative overflow-hidden shadow-2xl space-y-6">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" /> Simulated Hackathon Payment
          </div>
          <h2 className="text-2xl font-bold text-white">Payment & Authorization</h2>
          <p className="text-xs text-slate-400 mt-1">
            {offer.hotel_name} • Total Due:{" "}
            <strong className="text-emerald-400 font-mono">
              {offer.currency} {offer.negotiated_total?.toLocaleString()}
            </strong>
          </p>
        </div>

        {/* Payment Methods Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod("card")}
            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-semibold cursor-pointer ${
              paymentMethod === "card"
                ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-sm"
                : "bg-slate-900/60 border-white/5 text-slate-400"
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Credit / Debit Card</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("upi")}
            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-semibold cursor-pointer ${
              paymentMethod === "upi"
                ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-sm"
                : "bg-slate-900/60 border-white/5 text-slate-400"
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>UPI / Net Banking</span>
          </button>
        </div>

        {/* Mock Card Form */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3 text-xs">
          <div>
            <label className="text-slate-400 uppercase text-[10px] font-mono tracking-wider block mb-1">
              Card Number (Simulated)
            </label>
            <input
              type="text"
              readOnly
              value="4242 •••• •••• 4242"
              className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 uppercase text-[10px] font-mono tracking-wider block mb-1">
                Expiry
              </label>
              <input
                type="text"
                readOnly
                value="12 / 28"
                className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 uppercase text-[10px] font-mono tracking-wider block mb-1">
                CVV
              </label>
              <input
                type="text"
                readOnly
                value="•••"
                className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Simulated checkout. Upon payment, HiFi immediately calls {offer.hotel_name} to confirm reservation.
          </span>
        </div>

        {/* Submit Action */}
        <button
          onClick={onPayAndConfirm}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              Calling hotel to confirm...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Pay {offer.currency} {offer.negotiated_total?.toLocaleString()} & Confirm with CALL-E
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
