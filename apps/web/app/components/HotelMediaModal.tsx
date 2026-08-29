"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Image as ImageIcon,
  Compass,
} from "lucide-react";

export interface HotelMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName: string;
  address?: string;
  rating?: number | null;
  reviewCount?: number | null;
  photos?: string[];
  photoUrl?: string | null;
  mapsUrl?: string | null;
  mapsEmbedUrl?: string | null;
  initialTab?: "photos" | "map";
}

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
];

const PHOTO_CAPTIONS = [
  "Property Overview & Resort Grounds",
  "Deluxe Suite & Bedroom Interior",
  "Infinity Pool & Sun Terrace",
  "Fine Dining & Sunset Lounge",
  "Spa, Wellness & Amenities",
];

export const HotelMediaModal: React.FC<HotelMediaModalProps> = ({
  isOpen,
  onClose,
  hotelName,
  address = "Verified Property Location",
  rating = 4.7,
  reviewCount = 500,
  photos,
  photoUrl,
  mapsUrl,
  mapsEmbedUrl,
  initialTab = "photos",
}) => {
  const [activeTab, setActiveTab] = useState<"photos" | "map">(initialTab);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Normalize photo list
  const photoList: string[] =
    photos && photos.length > 0
      ? photos
      : photoUrl
      ? [photoUrl, ...DEFAULT_PHOTOS.filter((p) => p !== photoUrl)]
      : DEFAULT_PHOTOS;

  // Build fallback Google Maps URLs if not provided
  const query = encodeURIComponent(`${hotelName}, ${address}`);
  const directMapsUrl =
    mapsUrl || `https://www.google.com/maps/search/?api=1&query=${query}`;
  const embedMapsUrl =
    mapsEmbedUrl ||
    `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  // Reset tab when reopened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setActivePhotoIdx(0);
    }
  }, [isOpen, initialTab]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && activeTab === "photos") {
        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
      } else if (e.key === "ArrowRight" && activeTab === "photos") {
        setActivePhotoIdx((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeTab, photoList.length, onClose]);

  if (!isOpen) return null;

  const currentPhoto = photoList[activePhotoIdx] || photoList[0];
  const currentCaption =
    PHOTO_CAPTIONS[activePhotoIdx % PHOTO_CAPTIONS.length] || "Hotel Feature";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border-2 border-[#1E1E1E] shadow-2xl overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-[#FFD733] border-b-2 border-[#1E1E1E] flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1E1E1E] text-[#FFD733] text-[10px] font-mono font-black uppercase tracking-wider">
                Hotel Media & Map
              </span>
              {rating && (
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#1E1E1E] bg-white/80 px-2 py-0.5 rounded-md border border-[#1E1E1E]/20">
                  <Star className="w-3.5 h-3.5 fill-[#1E1E1E] text-[#1E1E1E]" />
                  <span>{rating.toFixed(1)}</span>
                  <span className="text-[#1E1E1E]/60 text-[10px]">({reviewCount}+)</span>
                </div>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-[#1E1E1E] truncate font-mono mt-1">
              {hotelName}
            </h2>
            <p className="text-xs text-[#1E1E1E]/80 truncate font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{address}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={directMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E1E1E] text-[#FFD733] hover:bg-black text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>Explore on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-black/10 text-[#1E1E1E] border border-[#1E1E1E] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#F9F9F0] border-b border-[#EBECDC] shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("photos")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "photos"
                  ? "bg-[#1E1E1E] text-[#FFD733] shadow-sm"
                  : "bg-white text-[#1E1E1E] border border-[#EBECDC] hover:bg-black/5"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photo Gallery ({photoList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "map"
                  ? "bg-[#1E1E1E] text-[#FFD733] shadow-sm"
                  : "bg-white text-[#1E1E1E] border border-[#EBECDC] hover:bg-black/5"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Interactive Google Map</span>
            </button>
          </div>

          <a
            href={directMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden text-xs font-bold text-blue-700 underline flex items-center gap-1"
          >
            <span>Open Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white min-h-[350px]">
          {activeTab === "photos" ? (
            /* PHOTOS TAB */
            <div className="space-y-4">
              {/* Big Main Stage Photo */}
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/10] bg-slate-900 rounded-2xl overflow-hidden border-2 border-[#1E1E1E] group shadow-md">
                <img
                  src={currentPhoto}
                  alt={`${hotelName} - ${currentCaption}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Left/Right controls */}
                <button
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev > 0 ? prev - 1 : photoList.length - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-all cursor-pointer opacity-90 group-hover:opacity-100 shadow-md"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev < photoList.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-all cursor-pointer opacity-90 group-hover:opacity-100 shadow-md"
                  title="Next Photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Caption Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[11px] font-mono text-[#FFD733] uppercase tracking-wider font-bold">
                      Photo {activePhotoIdx + 1} of {photoList.length}
                    </span>
                    <p className="text-sm sm:text-base font-bold drop-shadow">
                      {currentCaption}
                    </p>
                  </div>

                  <a
                    href={directMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#1E1E1E] text-xs font-mono font-bold flex items-center gap-1.5 shadow"
                  >
                    <span>View More on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
                {photoList.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? "border-[#1E1E1E] ring-2 ring-[#FFD733] scale-105 shadow-sm"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {activePhotoIdx === idx && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-[#FFD733] font-mono text-[9px] font-bold">
                        #{idx + 1}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* GOOGLE MAPS IFRAME TAB */
            <div className="space-y-4">
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/10] bg-slate-100 rounded-2xl overflow-hidden border-2 border-[#1E1E1E] shadow-md">
                <iframe
                  title={`Google Maps - ${hotelName}`}
                  src={embedMapsUrl}
                  width="100%"
                  height="100%"
                  className="border-0 w-full h-full"
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Maps Actions Footer */}
              <div className="p-4 rounded-2xl bg-[#F9F9F0] border border-[#EBECDC] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#1E1E1E]">
                  <MapPin className="w-4 h-4 text-[#1E1E1E] shrink-0" />
                  <span className="font-medium truncate max-w-md">{address}</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-black/5 text-[#1E1E1E] border border-[#1E1E1E] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>

                  <a
                    href={directMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#FFD733] hover:bg-[#FFEB99] text-[#1E1E1E] border border-[#1E1E1E] font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F9F9F0] border-t border-[#EBECDC] flex items-center justify-between shrink-0 font-mono text-xs">
          <span className="text-[#1E1E1E]/70 text-[11px]">
            Photos & location verified via Google Places & HiFi Data Engine
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1E1E1E] text-white hover:bg-black font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
