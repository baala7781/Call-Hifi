"use client";

import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Bed,
  DollarSign,
  Coffee,
  CheckCircle2,
  Plane,
  Star,
  Search,
  Sparkles,
} from "lucide-react";

export interface TripFormData {
  destination: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  rooms: number;
  room_type_preference?: string;
  budget_amount: number;
  budget_currency: string;
  min_rating: number | null;
  breakfast_required: boolean;
  free_cancellation_required: boolean;
  airport_transfer_preferred: boolean;
  room_upgrade_preferred: boolean;
  late_checkout_preferred: boolean;
}

interface TripFormProps {
  initialData?: TripFormData;
  onSubmit: (data: TripFormData) => void;
  isLoading?: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [destination, setDestination] = useState(initialData?.destination || "Hyderabad");
  const [checkIn, setCheckIn] = useState(initialData?.check_in || "2026-10-12");
  const [checkOut, setCheckOut] = useState(initialData?.check_out || "2026-10-17");
  const [adults, setAdults] = useState(initialData?.adults || 2);
  const [children, setChildren] = useState(initialData?.children || 0);
  const [rooms, setRooms] = useState(initialData?.rooms || 1);
  const [roomTypePreference, setRoomTypePreference] = useState(initialData?.room_type_preference || "any");
  const [budgetAmount, setBudgetAmount] = useState(initialData?.budget_amount || 600);
  const [budgetCurrency, setBudgetCurrency] = useState(initialData?.budget_currency || "USD");
  const [minRating, setMinRating] = useState<number | null>(initialData?.min_rating || 4.0);

  const [breakfastRequired, setBreakfastRequired] = useState(initialData?.breakfast_required ?? true);
  const [freeCancellationRequired, setFreeCancellationRequired] = useState(initialData?.free_cancellation_required ?? true);
  const [airportTransferPreferred, setAirportTransferPreferred] = useState(initialData?.airport_transfer_preferred ?? true);
  const [roomUpgradePreferred, setRoomUpgradePreferred] = useState(initialData?.room_upgrade_preferred ?? true);
  const [lateCheckoutPreferred, setLateCheckoutPreferred] = useState(initialData?.late_checkout_preferred ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      destination,
      check_in: checkIn,
      check_out: checkOut,
      adults,
      children,
      rooms,
      room_type_preference: roomTypePreference,
      budget_amount: budgetAmount,
      budget_currency: budgetCurrency,
      min_rating: minRating,
      breakfast_required: breakfastRequired,
      free_cancellation_required: freeCancellationRequired,
      airport_transfer_preferred: airportTransferPreferred,
      room_upgrade_preferred: roomUpgradePreferred,
      late_checkout_preferred: lateCheckoutPreferred,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="calle-card rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden bg-white">
        <div className="flex items-center justify-between pb-6 border-b border-[#EBECDC] mb-6">
          <div>
            <h2 className="text-xl font-black text-[#1E1E1E] flex items-center gap-2 font-mono">
              <Sparkles className="w-5 h-5 text-[#FFD733] fill-[#FFD733]" />
              <span>Configure Trip & Procurement Scope</span>
            </h2>
            <p className="text-xs text-[#1E1E1E]/70 mt-1 font-medium">
              HiFi will discover top-ranked hotels and autonomously call to negotiate direct rates.
            </p>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-mono bg-[#FFD733] text-[#1E1E1E] border border-[#EBECDC] font-bold">
            Step 1 of 4: Setup
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Destination & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Destination */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-[#1E1E1E]" /> Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Hyderabad, Bali, Goa, Tokyo"
                  className="w-full bg-[#F9F9F0] border border-[#EBECDC] rounded-xl px-4 py-3 text-sm text-[#1E1E1E] placeholder-slate-400 focus:outline-none focus:border-[#FFD733] focus:bg-white transition-colors font-medium"
                />
              </div>
            </div>

            {/* Check-in */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#1E1E1E]" /> Check-in
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-[#F9F9F0] border border-[#EBECDC] rounded-xl px-3 py-3 text-sm text-[#1E1E1E] focus:outline-none focus:border-[#FFD733] focus:bg-white transition-colors font-medium"
              />
            </div>

            {/* Check-out */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#1E1E1E]" /> Check-out
              </label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-[#F9F9F0] border border-[#EBECDC] rounded-xl px-3 py-3 text-sm text-[#1E1E1E] focus:outline-none focus:border-[#FFD733] focus:bg-white transition-colors font-medium"
              />
            </div>
          </div>

          {/* Row 2: Guests, Rooms, Room Type, Budget, Rating */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Adults */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5 font-mono">
                <Users className="w-3.5 h-3.5 text-[#1E1E1E]" /> Adults
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full bg-[#F9F9F0] border border-[#EBECDC] rounded-xl px-3 py-3 text-sm text-[#1E1E1E] focus:outline-none focus:border-[#FFD733] focus:bg-white cursor-pointer font-medium"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Adult" : "Adults"}
                  </option>
                ))}
              </select>
            </div>

            {/* Rooms */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5 font-mono">
                <Bed className="w-3.5 h-3.5 text-[#1E1E1E]" /> Rooms
              </label>
              <select
                value={rooms}
                onChange={(e) => setRooms(Number(e.target.value))}
                className="w-full bg-[#F9F9F0] border border-[#EBECDC] rounded-xl px-3 py-3 text-sm text-[#1E1E1E] focus:outline-none focus:border-[#FFD733] focus:bg-white cursor-pointer font-medium"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Room" : "Rooms"}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5 font-mono">
                <Bed className="w-3.5 h-3.5 text-[#1E1E1E]" /> Room Type
              </label>
              <select
                value={roomTypePreference}
                onChange={(e) => setRoomTypePreference(e.target.value)}
                className="w-full bg-[#F9F9F0] border border-[#EBECDC] rounded-xl px-3 py-3 text-sm text-[#1E1E1E] focus:outline-none focus:border-[#FFD733] focus:bg-white cursor-pointer font-medium font-mono text-xs"
              >
                <option value="any">Standard / Any</option>
                <option value="King Bed Room">King Size Room</option>
                <option value="Executive Suite">Suite / Exec</option>
                <option value="Deluxe Ocean/Garden View">Deluxe Room</option>
                <option value="Private Pool Villa">Pool Villa</option>
              </select>
            </div>

            {/* Total Budget */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5 font-mono">
                <DollarSign className="w-3.5 h-3.5 text-[#1E1E1E]" /> Max Budget ($)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-sm text-[#1E1E1E]">$</span>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="w-full bg-[#F9F9F0] border border-[#EBECDC] rounded-xl pl-7 pr-3 py-3 text-sm text-[#1E1E1E] focus:outline-none focus:border-[#FFD733] focus:bg-white font-mono font-bold"
                />
              </div>
            </div>

            {/* Min Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5 font-mono">
                <Star className="w-3.5 h-3.5 text-[#1E1E1E]" /> Min Rating
              </label>
              <select
                value={minRating || ""}
                onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-[#F9F9F0] border border-[#EBECDC] rounded-xl px-3 py-3 text-sm text-[#1E1E1E] focus:outline-none focus:border-[#FFD733] focus:bg-white cursor-pointer font-medium"
              >
                <option value="">Any Rating</option>
                <option value="4.0">★ 4.0 & above</option>
                <option value="4.5">★ 4.5 & above</option>
              </select>
            </div>
          </div>

          {/* Row 3: Negotiation & Verification Preferences */}
          <div className="space-y-2.5 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] block font-mono">
              Negotiation & Inclusions Preferences
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Breakfast */}
              <label
                onClick={() => setBreakfastRequired(!breakfastRequired)}
                className={`flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none font-mono ${
                  breakfastRequired
                    ? "bg-[#FFD733] border-[#1E1E1E] text-[#1E1E1E] font-bold shadow-sm"
                    : "bg-[#F9F9F0] border-[#EBECDC] text-slate-600 hover:border-[#1E1E1E]/30"
                }`}
              >
                <Coffee className={`w-4 h-4 ${breakfastRequired ? "text-[#1E1E1E]" : "text-slate-500"}`} />
                <span className="text-xs">Require Breakfast</span>
              </label>

              {/* Free Cancellation */}
              <label
                onClick={() => setFreeCancellationRequired(!freeCancellationRequired)}
                className={`flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none font-mono ${
                  freeCancellationRequired
                    ? "bg-[#FFD733] border-[#1E1E1E] text-[#1E1E1E] font-bold shadow-sm"
                    : "bg-[#F9F9F0] border-[#EBECDC] text-slate-600 hover:border-[#1E1E1E]/30"
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${freeCancellationRequired ? "text-[#1E1E1E]" : "text-slate-500"}`} />
                <span className="text-xs">Free Cancellation</span>
              </label>

              {/* Airport Transfer */}
              <label
                onClick={() => setAirportTransferPreferred(!airportTransferPreferred)}
                className={`flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none font-mono ${
                  airportTransferPreferred
                    ? "bg-[#FFD733] border-[#1E1E1E] text-[#1E1E1E] font-bold shadow-sm"
                    : "bg-[#F9F9F0] border-[#EBECDC] text-slate-600 hover:border-[#1E1E1E]/30"
                }`}
              >
                <Plane className={`w-4 h-4 ${airportTransferPreferred ? "text-[#1E1E1E]" : "text-slate-500"}`} />
                <span className="text-xs">Airport Transfer</span>
              </label>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl font-black text-sm bg-[#FFD733] hover:bg-[#FFEB99] text-[#1E1E1E] border-2 border-[#1E1E1E] shadow-[0_4px_0_#1E1E1E] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-mono tracking-tight"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin" />
                  Discovering hotels...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Discover & Shortlist Top Candidates
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
