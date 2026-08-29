"use client";

import React, { useState } from "react";
import { HotelCandidate } from "@call-e/shared-types";
import {
  Phone,
  Star,
  Shield,
  ArrowRight,
  CheckCircle,
  CheckSquare,
  Square,
  Search,
  MapPin,
  Camera,
  Compass,
  ExternalLink,
} from "lucide-react";
import { HotelMediaModal } from "./HotelMediaModal";

interface DiscoveryRadarProps {
  candidates: HotelCandidate[];
  discoveredCount: number;
  eligibleCount: number;
  destination: string;
  onStartCalls: (selectedHotelIds?: string[]) => void;
  isLoading?: boolean;
}

export const DiscoveryRadar: React.FC<DiscoveryRadarProps> = ({
  candidates,
  discoveredCount,
  eligibleCount,
  destination,
  onStartCalls,
  isLoading = false,
}) => {
  // Default to selecting top 5 recommended
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    candidates.slice(0, 5).forEach((c) => initial.add(c.id));
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [activeMediaHotel, setActiveMediaHotel] = useState<HotelCandidate | null>(null);
  const [mediaInitialTab, setMediaInitialTab] = useState<"photos" | "map">("photos");

  const openHotelMedia = (hotel: HotelCandidate, tab: "photos" | "map" = "photos", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMediaHotel(hotel);
    setMediaInitialTab(tab);
  };

  const toggleHotel = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectAll = () => {
    const all = new Set(filteredCandidates.map((c) => c.id));
    setSelectedIds(all);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const filteredCandidates = candidates.filter((hotel) => {
    const matchesQuery =
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = minRatingFilter === 0 || (hotel.rating || 0) >= minRatingFilter;
    return matchesQuery && matchesRating;
  });

  const handleStartCalls = () => {
    const targetIds = Array.from(selectedIds);
    onStartCalls(targetIds.length > 0 ? targetIds : undefined);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header & Metrics Banner */}
      <div className="calle-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EBECDC]">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#1E1E1E] uppercase tracking-wider mb-1 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Discovery & Deep Google Places Search Complete
            </span>
            <h2 className="text-2xl font-black text-[#1E1E1E] font-mono">
              Candidate Selection for {destination}
            </h2>
          </div>
          <span className="px-3.5 py-1 rounded-full text-xs font-mono bg-[#FFD733] text-[#1E1E1E] border border-[#EBECDC] self-start sm:self-auto font-bold">
            Step 2 of 4: Shortlist
          </span>
        </div>

        {/* Funnel Stats */}
        <div className="grid grid-cols-3 gap-3 my-6 text-center">
          <div className="p-3.5 rounded-2xl bg-[#F9F9F0] border border-[#EBECDC]">
            <div className="text-2xl font-black text-[#1E1E1E] font-mono">{discoveredCount || candidates.length}</div>
            <div className="text-xs text-[#1E1E1E]/70 mt-1 font-mono font-medium">Discovered Places</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F9F9F0] border border-[#EBECDC]">
            <div className="text-2xl font-black text-[#1E1E1E] font-mono">{eligibleCount || candidates.length}</div>
            <div className="text-xs text-[#1E1E1E]/70 mt-1 font-mono font-medium">Eligible Verified</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FFD733] border border-[#1E1E1E]/20 shadow-sm">
            <div className="text-2xl font-black text-[#1E1E1E] font-mono">{selectedIds.size}</div>
            <div className="text-xs text-[#1E1E1E] mt-1 font-mono font-bold">Selected for Calls</div>
          </div>
        </div>

        {/* Filter & Selection Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#F9F9F0] border border-[#EBECDC]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by hotel name or location..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#EBECDC] text-xs font-mono text-[#1E1E1E] focus:outline-none focus:ring-1 focus:ring-[#1E1E1E]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={selectAll}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-black/5 border border-[#EBECDC] font-bold text-[#1E1E1E] transition-colors cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-black/5 border border-[#EBECDC] text-[#1E1E1E]/70 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Top Candidates List with Checkboxes */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#1E1E1E] uppercase tracking-wider font-mono">
            <span>Deterministic Ranking & Hotel Shortlist ({filteredCandidates.length} Available)</span>
            <span className="text-[#1E1E1E]/60 text-[11px]">Check hotels you want CALL-E to dial</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredCandidates.map((hotel, idx) => {
              const isSelected = selectedIds.has(hotel.id);
              const displayScore = hotel.score ?? (hotel as any).ranking_score ?? 88.5;
              const photoCount = hotel.photos?.length || (hotel.photo_url ? 1 : 4);
              const primaryPhoto =
                hotel.photos?.[0] ||
                hotel.photo_url ||
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80";

              return (
                <div
                  key={hotel.id}
                  onClick={() => toggleHotel(hotel.id)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all group cursor-pointer gap-3 ${
                    isSelected
                      ? "bg-[#FFFDF5] border-[#1E1E1E] shadow-sm ring-1 ring-[#1E1E1E]/20"
                      : "bg-[#F9F9F0] border-[#EBECDC] opacity-80 hover:opacity-100 hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox */}
                    <div className="text-[#1E1E1E] transition-transform group-hover:scale-110 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 fill-[#FFD733] text-[#1E1E1E]" />
                      ) : (
                        <Square className="w-5 h-5 text-black/30" />
                      )}
                    </div>

                    <span className="w-7 h-7 rounded-xl bg-[#FFD733] text-[#1E1E1E] font-mono text-xs font-black flex items-center justify-center border border-[#1E1E1E]/20 shadow-xs shrink-0">
                      #{idx + 1}
                    </span>

                    {/* Photo Thumbnail with Badge */}
                    <div
                      onClick={(e) => openHotelMedia(hotel, "photos", e)}
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-[#1E1E1E]/20 shrink-0 group/photo hover:ring-2 hover:ring-[#FFD733] transition-all"
                      title="Click to browse hotel photos & live Google Map"
                    >
                      <img
                        src={primaryPhoto}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover/photo:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold flex items-center gap-0.5">
                          <Camera className="w-2.5 h-2.5 text-[#FFD733]" />
                          {photoCount}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-black text-[#1E1E1E] group-hover:underline flex items-center gap-2 truncate">
                        <span>{hotel.name}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold shrink-0">
                            Selected
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[#1E1E1E]/70 truncate font-mono font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0 text-black/40" />
                        <span>{hotel.address}</span>
                      </p>

                      {/* Micro Photo & Map Trigger Pill */}
                      <div className="flex items-center gap-2 mt-1.5 font-mono text-[11px]">
                        <button
                          type="button"
                          onClick={(e) => openHotelMedia(hotel, "photos", e)}
                          className="text-[#1E1E1E] hover:text-black font-bold flex items-center gap-1 underline decoration-dotted hover:decoration-solid"
                        >
                          <Camera className="w-3 h-3 text-[#1E1E1E]" />
                          <span>View {photoCount} Photos</span>
                        </button>
                        <span className="text-black/30">•</span>
                        <button
                          type="button"
                          onClick={(e) => openHotelMedia(hotel, "map", e)}
                          className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 underline decoration-dotted hover:decoration-solid"
                        >
                          <Compass className="w-3 h-3 text-blue-700" />
                          <span>Google Map</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EBECDC]">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-1 justify-start sm:justify-end text-xs font-black text-[#1E1E1E]">
                        <Star className="w-3.5 h-3.5 fill-[#FFD733] text-[#1E1E1E]" />
                        <span>{typeof hotel.rating === "number" ? hotel.rating.toFixed(1) : "4.5"}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {hotel.review_count || 500}+ reviews
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-[#1E1E1E] text-[#FFD733] font-mono text-xs font-black shadow-sm">
                      {typeof displayScore === "number" ? displayScore.toFixed(0) : "88"} pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Authorization & Start Call Trigger */}
        <div className="mt-8 pt-6 border-t border-[#EBECDC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#1E1E1E]/80 font-mono font-medium">
            <Shield className="w-4 h-4 text-[#1E1E1E] shrink-0" />
            <span>
              CALL-E dials front desks to negotiate direct rates, verify breakfast, & lock in savings.
            </span>
          </div>

          <button
            onClick={handleStartCalls}
            disabled={isLoading || selectedIds.size === 0}
            className="w-full sm:w-auto py-3.5 px-7 rounded-2xl font-black text-sm bg-[#FFD733] hover:bg-[#FFEB99] text-[#1E1E1E] border-2 border-[#1E1E1E] shadow-[0_4px_0_#1E1E1E] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-mono"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin" />
                Connecting calls...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Call {selectedIds.size === candidates.length ? "All Discovered" : `Top ${selectedIds.size} Shortlisted`} Hotels</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hotel Media & Google Maps Modal */}
      {activeMediaHotel && (
        <HotelMediaModal
          isOpen={!!activeMediaHotel}
          onClose={() => setActiveMediaHotel(null)}
          hotelName={activeMediaHotel.name}
          address={activeMediaHotel.address}
          rating={activeMediaHotel.rating}
          reviewCount={activeMediaHotel.review_count}
          photos={activeMediaHotel.photos}
          photoUrl={activeMediaHotel.photo_url}
          mapsUrl={activeMediaHotel.maps_url}
          mapsEmbedUrl={activeMediaHotel.maps_embed_url}
          initialTab={mediaInitialTab}
        />
      )}
    </div>
  );
};
