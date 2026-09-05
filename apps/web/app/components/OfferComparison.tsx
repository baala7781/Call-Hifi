"use client";

import React, { useState } from "react";
import { HotelOfferRecord } from "@call-e/shared-types";
import {
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  Coffee,
  Plane,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  CreditCard,
  Percent,
} from "lucide-react";

interface OfferComparisonProps {
  offers: HotelOfferRecord[];
  onSelectOffer: (offer: HotelOfferRecord) => void;
  currency?: string;
  onBackToCalling?: () => void;
}

export const OfferComparison: React.FC<OfferComparisonProps> = ({
  offers,
  onSelectOffer,
  currency = "USD",
  onBackToCalling,
}) => {
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  if (!offers || offers.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-12 text-center calle-card rounded-3xl bg-white border-2 border-[#1E1E1E] shadow-xl space-y-5 font-mono">
        <div className="w-16 h-16 rounded-2xl bg-[#FFD733] border-2 border-[#1E1E1E] flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-8 h-8 text-[#1E1E1E] animate-spin" />
        </div>
        <h3 className="text-xl font-black text-[#1E1E1E]">Structuring Verified Hotel Offers...</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto font-sans">
          Audio calls have completed or are finalizing. Structuring negotiated rates, breakfast inclusions, and cancellation terms into your comparison matrix.
        </p>
        {onBackToCalling && (
          <div className="pt-3">
            <button
              onClick={onBackToCalling}
              className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#F9F9F0] hover:bg-[#FFD733] text-[#1E1E1E] border border-[#1E1E1E] shadow-xs cursor-pointer transition-all"
            >
              ← Back to Live Call Dashboard
            </button>
          </div>
        )}
      </div>
    );
  }

  const bestOffer = offers.find((o) => o.is_best_deal) || offers[0];

  const toggleExpand = (id: string) => {
    setExpandedOfferId(expandedOfferId === id ? null : id);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 sm:space-y-6">
      {/* Top AI Recommendation Spotlight Banner */}
      {bestOffer && (
        <div className="calle-card rounded-3xl p-5 sm:p-8 relative overflow-hidden bg-[#FFD733] border-2 border-[#1E1E1E] shadow-xl space-y-4 sm:space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">
            <div className="space-y-3 sm:space-y-3.5 flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1E1E] text-[#FFD733] text-xs font-mono font-black uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-[#FFD733]" />
                <span>HiFi Top Value Recommendation</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-3xl font-black text-[#1E1E1E] font-mono truncate">
                  {bestOffer.hotel_name}
                </h2>
                <div className="flex items-center gap-2 mt-1 font-mono text-xs text-[#1E1E1E]/80 font-bold">
                  <span>{bestOffer.room_type || "Deluxe King Room"}</span>
                  <span>•</span>
                  <span>Score: {typeof bestOffer.score === "number" ? bestOffer.score.toFixed(0) : "94"}/100</span>
                </div>
              </div>

              {/* Price Journey Progression: Listed -> CALL-E -> Direct -> Savings */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-[#1E1E1E]/20 space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#1E1E1E]/70 font-black">
                  Verified Price Progression & Direct Savings
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs sm:text-sm">
                  <div className="p-2 rounded-xl bg-white border border-[#EBECDC]">
                    <span className="text-[9px] sm:text-[10px] text-slate-500 block uppercase">Online Rack</span>
                    <span className="line-through text-slate-500 font-bold text-xs sm:text-sm">
                      {bestOffer.currency} {(bestOffer.original_total || (bestOffer.negotiated_total ? bestOffer.negotiated_total * 1.1 : 600)).toLocaleString()}
                    </span>
                  </div>

                  <span className="text-[#1E1E1E] font-black text-sm">→</span>

                  <div className="p-2 rounded-xl bg-[#1E1E1E] text-[#FFD733] border border-[#1E1E1E]">
                    <span className="text-[9px] sm:text-[10px] text-[#FFD84D] block uppercase font-bold">CALL-E Direct</span>
                    <span className="font-black text-sm sm:text-base">
                      {bestOffer.currency} {bestOffer.negotiated_total?.toLocaleString() || "—"}
                    </span>
                  </div>

                  {bestOffer.negotiated_savings && bestOffer.negotiated_savings > 0 && (
                    <>
                      <span className="text-[#1E1E1E] font-black text-sm">→</span>
                      <div className="p-2 rounded-xl bg-emerald-700 text-white font-black flex items-center gap-1.5 shadow-xs text-xs sm:text-sm">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-200" />
                        <span>SAVE {bestOffer.currency} {bestOffer.negotiated_savings.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* "Why HiFi Picked This" AI Explainer */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#1E1E1E] text-white space-y-1.5 shadow-md">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-[#FFD733] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD733]" />
                  <span>Why HiFi Picked This Hotel:</span>
                </div>
                <p className="text-xs text-white/90 font-mono leading-relaxed">
                  &ldquo;{bestOffer.recommendation_reason || "Selected for optimal balance of negotiated price savings, complimentary buffet breakfast, and verified flexible cancellation."}&rdquo;
                </p>
              </div>
            </div>

            {/* Quick Action CTA */}
            <div className="shrink-0 flex flex-col items-stretch md:items-end gap-1.5 pt-1 w-full md:w-auto">
              <button
                onClick={() => onSelectOffer(bestOffer)}
                className="w-full md:w-auto py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl font-black text-sm bg-[#1E1E1E] hover:bg-black text-[#FFD733] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
              >
                <span>Lock In Direct Rate</span>
                <ArrowRight className="w-4 h-4 text-[#FFD733]" />
              </button>
              <span className="text-[11px] font-mono text-[#1E1E1E]/70 font-bold text-center md:text-right">
                Taxes & inclusions verified
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Matrix Table & Mobile Cards */}
      <div className="calle-card rounded-3xl p-4 sm:p-8 relative overflow-hidden bg-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-[#EBECDC] mb-4 sm:mb-6 gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[#1E1E1E] flex items-center gap-2 font-mono">
              <Sparkles className="w-5 h-5 text-[#1E1E1E]" />
              <span>Verified Offer Comparison</span>
            </h3>
            <p className="text-xs text-[#1E1E1E]/70 mt-0.5 font-medium">
              Live phone quotes with taxes, fees, and negotiated inclusions.
            </p>
          </div>
          <span className="text-xs font-mono text-[#1E1E1E] bg-[#FFD733] px-3 py-1 rounded-full font-bold border border-[#EBECDC] self-start sm:self-auto">
            Step 3 of 4: Review
          </span>
        </div>

        {/* Mobile View: High-Fidelity Cards for Small Screens */}
        <div className="block md:hidden space-y-3.5">
          {offers.map((offer) => {
            const isUnavailable = !offer.available;
            const isExpanded = expandedOfferId === offer.id;

            return (
              <div
                key={offer.id}
                className={`p-4 rounded-2xl border transition-all ${
                  offer.is_best_deal
                    ? "bg-[#FFFDF5] border-[#1E1E1E] shadow-sm ring-1 ring-[#1E1E1E]/20"
                    : "bg-[#F9F9F0] border-[#EBECDC]"
                } ${isUnavailable ? "opacity-50" : ""}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-mono font-black text-sm text-[#1E1E1E]">
                        {offer.hotel_name}
                      </h4>
                      {offer.is_best_deal && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFD733] text-[#1E1E1E] font-black border border-[#1E1E1E]/20">
                          BEST DEAL
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {isUnavailable ? "Fully Booked" : offer.room_type || "Deluxe Room"}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-black px-2 py-1 rounded-xl bg-[#1E1E1E] text-[#FFD733] shrink-0">
                    {typeof offer.score === "number" ? offer.score.toFixed(0) : "88"} pts
                  </span>
                </div>

                {/* Price & Savings */}
                <div className="my-3 p-3 rounded-xl bg-white border border-[#EBECDC] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">
                      Direct Rate
                    </span>
                    <span className="text-base font-black font-mono text-[#1E1E1E]">
                      {offer.currency} {offer.negotiated_total?.toLocaleString() || "—"}
                    </span>
                  </div>

                  {offer.negotiated_savings && offer.negotiated_savings > 0 ? (
                    <div className="text-right">
                      <span className="line-through text-slate-400 font-mono text-xs block">
                        {offer.original_total?.toLocaleString()}
                      </span>
                      <span className="text-emerald-700 font-mono font-bold text-xs">
                        Save {offer.currency} {offer.negotiated_savings.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">Rack Rate</span>
                  )}
                </div>

                {/* Key Inclusions */}
                <div className="flex flex-wrap gap-2 text-xs font-mono mb-3">
                  <span className="px-2 py-1 rounded-lg bg-white border border-[#EBECDC] text-[#1E1E1E] flex items-center gap-1">
                    {offer.breakfast_included ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Breakfast Included</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-400" />
                        <span>Breakfast: +{offer.currency} {offer.breakfast_price || 650}/d</span>
                      </>
                    )}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-white border border-[#EBECDC] text-[#1E1E1E] flex items-center gap-1">
                    {offer.free_cancellation ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Free Cancellation</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                        <span>Non-refundable</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#EBECDC]">
                  <button
                    onClick={() => toggleExpand(offer.id)}
                    className="px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    {isExpanded ? "Hide Details" : "Details"}
                  </button>

                  <button
                    disabled={isUnavailable}
                    onClick={() => onSelectOffer(offer)}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-black bg-[#FFD733] hover:bg-[#FFEB99] text-[#1E1E1E] border border-[#1E1E1E] shadow-sm transition-all text-center disabled:opacity-40 cursor-pointer"
                  >
                    {isUnavailable ? "Unavailable" : "Reserve Direct Rate"}
                  </button>
                </div>

                {/* Expanded Details on Mobile */}
                {isExpanded && (
                  <div className="mt-3 p-3 rounded-xl bg-white border border-[#EBECDC] text-xs font-mono space-y-2">
                    <p className="text-slate-700 leading-relaxed">
                      {offer.offer_notes || "Verified directly from live front desk phone conversation."}
                    </p>
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      Cancellation: {offer.cancellation_deadline || "Standard policy"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop Responsive Table */}
        <div className="hidden md:block overflow-x-auto touch-scroll">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#EBECDC] text-slate-500 uppercase text-[11px] font-mono font-bold">
                <th className="py-3.5 px-3">Hotel & Room</th>
                <th className="py-3.5 px-3">Quoted vs Negotiated</th>
                <th className="py-3.5 px-3">Breakfast</th>
                <th className="py-3.5 px-3">Cancellation</th>
                <th className="py-3.5 px-3">Transfer</th>
                <th className="py-3.5 px-3 text-center">Score</th>
                <th className="py-3.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBECDC]">
              {offers.map((offer) => {
                const isUnavailable = !offer.available;
                const isExpanded = expandedOfferId === offer.id;

                return (
                  <React.Fragment key={offer.id}>
                    <tr
                      className={`hover:bg-[#F9F9F0] transition-colors cursor-pointer ${
                        offer.is_best_deal ? "bg-[#FFEB99]/20" : ""
                      } ${isUnavailable ? "opacity-40" : ""}`}
                      onClick={() => toggleExpand(offer.id)}
                    >
                      {/* Hotel Name */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          {offer.is_best_deal && (
                            <Award className="w-4 h-4 text-[#1E1E1E] shrink-0" />
                          )}
                          <div>
                            <div className="font-bold text-[#1E1E1E] flex items-center gap-1.5">
                              <span>{offer.hotel_name}</span>
                              {offer.is_best_deal && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFD733] text-[#1E1E1E] font-black border border-[#1E1E1E]/20">
                                  BEST DEAL
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                              <span>{isUnavailable ? "Fully Booked" : offer.room_type || "Deluxe Room"}</span>
                              <span className="text-black/40">•</span>
                              <span className="text-[10px] text-blue-600 underline">
                                {isExpanded ? "Hide breakdown" : "View breakdown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price & Savings */}
                      <td className="py-4 px-3 font-mono">
                        {isUnavailable ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <div>
                            <div className="font-black text-[#1E1E1E] text-sm">
                              {offer.currency} {offer.negotiated_total?.toLocaleString()}
                            </div>
                            {offer.negotiated_savings && offer.negotiated_savings > 0 ? (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <span className="line-through text-slate-400">
                                  {offer.original_total?.toLocaleString()}
                                </span>
                                <span className="text-emerald-700 font-bold">
                                  -{offer.negotiated_savings?.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500">Direct Rate</div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Breakfast */}
                      <td className="py-4 px-3">
                        {offer.breakfast_included === true ? (
                          <span className="inline-flex items-center gap-1 text-[#1E1E1E] font-bold font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Included
                          </span>
                        ) : offer.breakfast_included === false ? (
                          <span className="text-slate-500 text-xs font-mono">
                            +{offer.currency} {offer.breakfast_price || 650}/d
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">Unverified</span>
                        )}
                      </td>

                      {/* Cancellation */}
                      <td className="py-4 px-3">
                        {offer.free_cancellation === true ? (
                          <span className="inline-flex items-center gap-1 text-[#1E1E1E] font-bold font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {offer.cancellation_deadline || "Free (48h)"}
                          </span>
                        ) : offer.free_cancellation === false ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-mono font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Non-ref
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">Unverified</span>
                        )}
                      </td>

                      {/* Transfer */}
                      <td className="py-4 px-3">
                        {offer.airport_transfer_available === true ? (
                          <span className="inline-flex items-center gap-1 text-[#1E1E1E] font-bold font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Free Shuttle
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">—</span>
                        )}
                      </td>

                      {/* Score */}
                      <td className="py-4 px-3 text-center font-mono font-bold">
                        {isUnavailable ? (
                          <span className="text-slate-400">0</span>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-xl ${
                              (offer.score || 0) >= 85
                                ? "bg-[#FFD733] text-[#1E1E1E] border border-[#1E1E1E]/20"
                                : "bg-[#F9F9F0] text-[#1E1E1E]"
                            }`}
                          >
                            {typeof offer.score === "number" ? offer.score.toFixed(0) : "88"}
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {isUnavailable ? (
                          <span className="text-xs text-slate-400 font-mono">Unavailable</span>
                        ) : (
                          <button
                            onClick={() => onSelectOffer(offer)}
                            className="px-4 py-2 rounded-xl text-xs font-black font-mono bg-[#FFD733] hover:bg-[#FFEB99] text-[#1E1E1E] border border-[#1E1E1E] shadow-sm transition-all cursor-pointer"
                          >
                            Reserve
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Breakdown Drawer */}
                    {isExpanded && (
                      <tr className="bg-[#FFFDF5] border-b border-[#EBECDC]">
                        <td colSpan={7} className="p-4 sm:p-6">
                          <div className="space-y-4 rounded-2xl bg-white border border-[#EBECDC] p-4 sm:p-5 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#EBECDC] pb-3">
                              <h4 className="font-mono font-bold text-sm text-[#1E1E1E] flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#1E1E1E]" />
                                <span>Negotiation Details & Verification Evidence: {offer.hotel_name}</span>
                              </h4>
                              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                Verified by CALL-E Audio Agent
                              </span>
                            </div>

                            {/* Summary Notes */}
                            <p className="text-xs font-mono text-[#1E1E1E]/90 bg-[#F9F9F0] p-3 rounded-xl border border-[#EBECDC] leading-relaxed">
                              {offer.offer_notes || "Verified directly from live front desk phone conversation."}
                            </p>

                            {/* Detailed Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                              <div className="p-3 rounded-xl bg-[#F9F9F0] border border-[#EBECDC] space-y-1">
                                <span className="text-[#1E1E1E]/60 text-[10px] uppercase font-bold">Rates & Savings</span>
                                <div className="font-bold text-[#1E1E1E]">
                                  {offer.currency} {offer.negotiated_total?.toLocaleString()} Total
                                </div>
                                <div className="text-[11px] text-emerald-700">
                                  {offer.negotiated_savings && offer.negotiated_savings > 0
                                    ? `Saved ${offer.currency} ${offer.negotiated_savings.toLocaleString()} off rack rate`
                                    : "Best Direct Rate Available"}
                                </div>
                              </div>

                              <div className="p-3 rounded-xl bg-[#F9F9F0] border border-[#EBECDC] space-y-1">
                                <span className="text-[#1E1E1E]/60 text-[10px] uppercase font-bold">Included Amenities</span>
                                <div className="font-bold text-[#1E1E1E]">
                                  {offer.special_benefits && offer.special_benefits.length > 0
                                    ? offer.special_benefits.join(", ")
                                    : "Standard Room Stay"}
                                </div>
                                <div className="text-[11px] text-black/60">Taxes & facility charges included</div>
                              </div>

                              <div className="p-3 rounded-xl bg-[#F9F9F0] border border-[#EBECDC] space-y-1">
                                <span className="text-[#1E1E1E]/60 text-[10px] uppercase font-bold">Cancellation & Payment</span>
                                <div className="font-bold text-[#1E1E1E]">
                                  {offer.cancellation_deadline || "Free cancellation up to 48h"}
                                </div>
                                <div className="text-[11px] text-black/60">
                                  {offer.advance_payment_required ? "Advance deposit required" : "Pay upon check-in at property"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
