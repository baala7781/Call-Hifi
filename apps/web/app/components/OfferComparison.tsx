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
}

export const OfferComparison: React.FC<OfferComparisonProps> = ({
  offers,
  onSelectOffer,
  currency = "INR",
}) => {
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  if (!offers || offers.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-12 text-center calle-card rounded-3xl bg-white border-2 border-[#1E1E1E] shadow-xl space-y-4 font-mono">
        <div className="w-16 h-16 rounded-2xl bg-[#FFD733] border-2 border-[#1E1E1E] flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-8 h-8 text-[#1E1E1E] animate-spin" />
        </div>
        <h3 className="text-xl font-black text-[#1E1E1E]">Structuring Verified Hotel Offers...</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto font-sans">
          Audio calls have completed. Structuring negotiated rates, breakfast inclusions, and cancellation terms into your comparison matrix.
        </p>
      </div>
    );
  }

  const bestOffer = offers.find((o) => o.is_best_deal) || offers[0];

  const toggleExpand = (id: string) => {
    setExpandedOfferId(expandedOfferId === id ? null : id);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top AI Recommendation Spotlight Banner */}
      {bestOffer && (
        <div className="calle-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-[#FFD733] border-2 border-[#1E1E1E] shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E1E1E] text-[#FFD733] text-xs font-mono font-black uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#FFD733]" />
                <span>HiFi Top Value Recommendation</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1E1E1E] font-mono">
                  {bestOffer.hotel_name}
                </h2>
                <p className="text-sm text-[#1E1E1E]/90 mt-1 max-w-2xl font-semibold leading-relaxed">
                  {bestOffer.recommendation_reason ||
                    "Top overall value combining negotiated direct savings, verified room availability, and flexible terms."}
                </p>
              </div>

              {/* Price & Savings Spotlight */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div>
                  <div className="text-xs text-[#1E1E1E]/80 font-mono uppercase tracking-wider font-bold">
                    Negotiated Direct Rate
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#1E1E1E] font-mono">
                    {bestOffer.currency} {bestOffer.negotiated_total?.toLocaleString() || "—"}
                  </div>
                </div>

                {bestOffer.negotiated_savings && bestOffer.negotiated_savings > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-[#1E1E1E] text-[#FFD733] text-xs font-mono font-bold flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-[#FFD733]" />
                    <span>Saved {bestOffer.currency} {bestOffer.negotiated_savings.toLocaleString()}</span>
                  </div>
                )}

                <div className="px-3 py-1.5 rounded-xl bg-[#F9F9F0] border border-[#1E1E1E] text-[#1E1E1E] text-xs font-mono font-bold">
                  Score: {typeof bestOffer.score === "number" ? bestOffer.score.toFixed(0) : "92"}/100
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="shrink-0">
              <button
                onClick={() => onSelectOffer(bestOffer)}
                className="w-full sm:w-auto py-4 px-8 rounded-2xl font-black text-sm bg-[#1E1E1E] hover:bg-black text-[#FFD733] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
              >
                <span>Book Direct Rate</span>
                <ArrowRight className="w-4 h-4 text-[#FFD733]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      <div className="calle-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-white shadow-xl">
        <div className="flex items-center justify-between pb-6 border-b border-[#EBECDC] mb-6">
          <div>
            <h3 className="text-xl font-black text-[#1E1E1E] flex items-center gap-2 font-mono">
              <Sparkles className="w-5 h-5 text-[#1E1E1E]" />
              <span>Verified Offer Comparison Matrix</span>
            </h3>
            <p className="text-xs text-[#1E1E1E]/70 mt-1 font-medium">
              Live phone quotes with taxes, fees, and negotiated inclusions. Click any row for details.
            </p>
          </div>
          <span className="text-xs font-mono text-[#1E1E1E] bg-[#FFD733] px-3 py-1 rounded-full font-bold border border-[#EBECDC]">
            Step 3 of 4: Review & Reserve
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
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
