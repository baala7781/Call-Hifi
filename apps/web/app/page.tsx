"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookingRecord,
  CallStatusResponse,
  CallTaskRecord,
  HotelCandidate,
  HotelOfferRecord,
  TripRecord,
} from "@call-e/shared-types";
import { Header } from "./components/Header";
import { RuntimeControlBar } from "./components/RuntimeControlBar";
import { LoginModal } from "./components/LoginModal";
import { HeroSection } from "./components/HeroSection";
import { TripForm, TripFormData } from "./components/TripForm";
import { DiscoveryRadar } from "./components/DiscoveryRadar";
import { CallDashboard } from "./components/CallDashboard";
import { OfferComparison } from "./components/OfferComparison";
import { OfferDetailModal } from "./components/OfferDetailModal";
import { PaymentModal } from "./components/PaymentModal";
import { ConfirmationView } from "./components/ConfirmationView";
import { DebugDrawer } from "./components/DebugDrawer";
import { TripHistoryDrawer } from "./components/TripHistoryDrawer";
import { DemoPhoneModal } from "./components/DemoPhoneModal";
import { getApiBaseUrl } from "./lib/api";

export default function Home() {
  const API_BASE_URL = getApiBaseUrl();
  // Authentication & Evaluator State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Application Stage: "form" | "discovery" | "calling" | "offers" | "confirmed"
  const [stage, setStage] = useState<"form" | "discovery" | "calling" | "offers" | "confirmed">("form");

  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [candidates, setCandidates] = useState<HotelCandidate[]>([]);
  const [discoveredCount, setDiscoveredCount] = useState<number>(0);
  const [eligibleCount, setEligibleCount] = useState<number>(0);

  const [calls, setCalls] = useState<CallTaskRecord[]>([]);
  const [offers, setOffers] = useState<HotelOfferRecord[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<HotelOfferRecord | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedForCallsCount, setSelectedForCallsCount] = useState<number>(0);

  const [formData, setFormData] = useState<TripFormData>({
    destination: "Bali",
    check_in: "2026-10-12",
    check_out: "2026-10-17",
    adults: 2,
    children: 0,
    rooms: 1,
    room_type_preference: "any",
    budget_amount: 2000,
    budget_currency: "USD",
    min_rating: 4.0,
    breakfast_required: true,
    free_cancellation_required: true,
    airport_transfer_preferred: true,
    room_upgrade_preferred: true,
    late_checkout_preferred: false,
  });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Check auth state on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("hifi_user_email");
    const savedToken = localStorage.getItem("hifi_auth_token");
    if (savedEmail && savedToken) {
      setUserEmail(savedEmail);
      setIsLoginOpen(false);
    } else {
      localStorage.removeItem("hifi_user_email");
      localStorage.removeItem("hifi_auth_token");
      setUserEmail(null);
      setIsLoginOpen(true);
    }
  }, []);

  const handleLoginSuccess = (email: string, token: string) => {
    setUserEmail(email);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("hifi_user_email");
    localStorage.removeItem("hifi_auth_token");
    setUserEmail(null);
    setIsLoginOpen(true);
  };

  // Quick Preset Selector for instant demo
  const handleSelectPreset = (preset: "bali" | "tokyo" | "paris") => {
    if (preset === "bali") {
      setFormData({
        destination: "Bali",
        check_in: "2026-10-12",
        check_out: "2026-10-17",
        adults: 2,
        children: 0,
        rooms: 1,
        budget_amount: 2000,
        budget_currency: "USD",
        min_rating: 4.0,
        breakfast_required: true,
        free_cancellation_required: true,
        airport_transfer_preferred: true,
        room_upgrade_preferred: true,
        late_checkout_preferred: false,
      });
    } else if (preset === "tokyo") {
      setFormData({
        destination: "Tokyo",
        check_in: "2026-11-05",
        check_out: "2026-11-10",
        adults: 2,
        children: 0,
        rooms: 1,
        budget_amount: 800,
        budget_currency: "USD",
        min_rating: 4.0,
        breakfast_required: true,
        free_cancellation_required: true,
        airport_transfer_preferred: true,
        room_upgrade_preferred: true,
        late_checkout_preferred: true,
      });
    }
  };

  // Step 1: Submit Trip Form & Discover Hotels
  const handleTripSubmit = async (data: TripFormData) => {
    setLoading(true);
    try {
      // 1. Create Trip
      const tripRes = await fetch(`${API_BASE_URL}/api/v1/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          user_email: userEmail || "guest@example.com",
        }),
      });
      if (!tripRes.ok) throw new Error("Failed to create trip");
      const tripData: TripRecord = await tripRes.json();
      setTrip(tripData);

      // 2. Discover Hotels
      const discRes = await fetch(`${API_BASE_URL}/api/v1/trips/${tripData.id}/hotels/discover`, {
        method: "POST",
      });
      if (!discRes.ok) throw new Error("Failed to discover hotels");
      const discData = await discRes.json();

      setCandidates(discData.candidates);
      setDiscoveredCount(discData.discovered_count);
      setEligibleCount(discData.eligible_count);
      setStage("discovery");
    } catch (err) {
      console.error(err);
      alert("Failed to discover hotels. Please verify backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const [runtimeSettings, setRuntimeSettings] = useState<{
    demo_mode: boolean;
    test_phone_number: string;
    voice_provider: string;
  }>({
    demo_mode: false,
    test_phone_number: "",
    voice_provider: "calle",
  });

  const [isDemoPhoneOpen, setIsDemoPhoneOpen] = useState(false);
  const [pendingHotelIds, setPendingHotelIds] = useState<string[] | undefined>(undefined);

  // Core execution helper for starting calls
  const proceedWithCalls = async (selectedHotelIds?: string[], testPhoneOverride?: string) => {
    if (!trip) return;
    setLoading(true);
    try {
      setSelectedForCallsCount(selectedHotelIds?.length || 3);
      const callRes = await fetch(`${API_BASE_URL}/api/v1/trips/${trip.id}/calls/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel_ids: selectedHotelIds,
          demo_mode: runtimeSettings.demo_mode,
          test_phone_number: testPhoneOverride || runtimeSettings.test_phone_number,
        }),
      });
      if (!callRes.ok) {
        const errData = await callRes.json().catch(() => ({}));
        throw new Error(errData?.detail || "Failed to start calls");
      }

      setStage("calling");
      startPolling(trip.id);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to start hotel calls.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Start CALL-E Outbound Calls with selected hotel IDs
  const handleStartCalls = async (selectedHotelIds?: string[]) => {
    if (!trip) return;

    // Safety Safeguard: In Demo Mode, require that a test phone number is provided!
    if (
      runtimeSettings.demo_mode &&
      (!runtimeSettings.test_phone_number || !runtimeSettings.test_phone_number.trim())
    ) {
      setPendingHotelIds(selectedHotelIds);
      setIsDemoPhoneOpen(true);
      return;
    }

    await proceedWithCalls(selectedHotelIds);
  };

  const handleDemoPhoneSaved = (phoneNumber: string) => {
    setRuntimeSettings((prev) => ({ ...prev, test_phone_number: phoneNumber, demo_mode: true }));
    setIsDemoPhoneOpen(false);
    // Proceed immediately with the calls using the confirmed phone number
    proceedWithCalls(pendingHotelIds, phoneNumber);
  };

  // Step 3: Poll Real-time Status
  const startPolling = (tripId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/trips/${tripId}/calls/status`);
        if (!res.ok) return;

        const data: CallStatusResponse = await res.json();
        setCalls(data.calls || []);

        if (data.offers && data.offers.length > 0) {
          setOffers(data.offers);
        }

        // Check if all calls have reached terminal state
        const allCallsDone =
          data.calls &&
          data.calls.length > 0 &&
          data.calls.every(
            (c: CallTaskRecord) =>
              c.status === "completed" || c.status === "failed" || c.status === "no_answer"
          );

        if (allCallsDone && data.offers && data.offers.length > 0) {
          setOffers(data.offers);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1500);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Continuous polling while in offers stage if offers are not yet loaded
  useEffect(() => {
    if (stage !== "offers" || !trip) return;
    if (offers.length > 0) return;

    let isMounted = true;
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/trips/${trip.id}/calls/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          if (data.calls && data.calls.length > 0) {
            setCalls(data.calls);
          }
          if (data.offers && data.offers.length > 0) {
            setOffers(data.offers);
          }
        }
      } catch (err) {
        console.error("Error polling offers in offers stage:", err);
      }
    };

    fetchOffers();
    const interval = setInterval(fetchOffers, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [stage, trip, offers.length]);

  const completedCount = calls.filter((c) => c.status === "completed" || c.status === "failed" || c.status === "no_answer").length;
  const isAllCallsCompleted = calls.length > 0 && calls.every((c) => c.status === "completed" || c.status === "failed" || c.status === "no_answer");

  const handleGoToOffers = async () => {
    if (trip) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/trips/${trip.id}/calls/status`);
        if (res.ok) {
          const data: CallStatusResponse = await res.json();
          if (data.offers && data.offers.length > 0) {
            setOffers(data.offers);
          }
          if (data.calls && data.calls.length > 0) {
            setCalls(data.calls);
          }
        }
      } catch (err) {
        console.error("Error refreshing offers on transition:", err);
      }
    }
    setStage("offers");
  };

  // Step 4: Review Offer in Modal
  const handleSelectOffer = (offer: HotelOfferRecord) => {
    setSelectedOffer(offer);
    setIsDetailOpen(true);
  };

  // Step 5: User Approves Offer -> Open Payment
  const handleApproveOffer = async (offer: HotelOfferRecord) => {
    if (!trip) return;
    setIsDetailOpen(false);
    setSelectedOffer(offer);
    setIsPaymentOpen(true);
  };

  // Step 6: Execute Simulated Payment & Final CALL-E Confirmation
  const handlePayAndConfirm = async () => {
    if (!trip || !selectedOffer) return;
    setLoading(true);
    try {
      // Create initial booking
      const bookRes = await fetch(`${API_BASE_URL}/api/v1/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: trip.id,
          hotel_id: selectedOffer.hotel_id,
          offer_id: selectedOffer.id,
        }),
      });
      if (!bookRes.ok) throw new Error("Failed to create booking");
      const bookData: BookingRecord = await bookRes.json();

      // Trigger Confirmation Call
      const confirmRes = await fetch(`${API_BASE_URL}/api/v1/bookings/${bookData.id}/confirm`, {
        method: "POST",
      });
      if (!confirmRes.ok) throw new Error("Failed to confirm booking");
      const confirmedBooking: BookingRecord = await confirmRes.json();

      setBooking(confirmedBooking);
      setIsPaymentOpen(false);
      setStage("confirmed");
    } catch (err) {
      console.error(err);
      alert("Failed during payment or confirmation call.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setTrip(null);
    setCandidates([]);
    setCalls([]);
    setOffers([]);
    setSelectedOffer(null);
    setBooking(null);
    setStage("form");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Runtime Evaluator Control Bar */}
      <RuntimeControlBar onSettingsChange={setRuntimeSettings} />

      {/* Navigation Header */}
      <Header
        onOpenDebug={() => setIsDebugOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onSelectPreset={handleSelectPreset}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Main Experience Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Step 1: Form & Hero */}
        {stage === "form" && (
          <div className="space-y-4 sm:space-y-6">
            <HeroSection />
            <TripForm
              initialData={formData}
              onSubmit={handleTripSubmit}
              isLoading={loading}
            />
          </div>
        )}

        {/* Step 2: Discovery Radar */}
        {stage === "discovery" && (
          <div className="py-6">
            <DiscoveryRadar
              candidates={candidates}
              discoveredCount={discoveredCount}
              eligibleCount={eligibleCount}
              destination={trip?.destination || formData.destination}
              onStartCalls={handleStartCalls}
              isLoading={loading}
            />
          </div>
        )}

        {/* Step 3: Calling Dashboard */}
        {stage === "calling" && (
          <div className="py-6">
            <CallDashboard
              calls={calls}
              completedCount={completedCount}
              totalCalls={selectedForCallsCount || calls.length || 3}
              destination={trip?.destination || formData.destination}
              onViewOffers={handleGoToOffers}
              isAllCompleted={isAllCallsCompleted}
            />
          </div>
        )}

        {/* Step 4: Offer Comparison Matrix */}
        {stage === "offers" && (
          <div className="py-6">
            <OfferComparison
              offers={offers}
              onSelectOffer={handleSelectOffer}
              currency={trip?.budget_currency || "USD"}
              onBackToCalling={() => setStage("calling")}
            />
          </div>
        )}

        {/* Step 5: Confirmed Booking Pass */}
        {stage === "confirmed" && booking && selectedOffer && (
          <div className="py-6">
            <ConfirmationView
              booking={booking}
              offer={selectedOffer}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* Evaluator Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Offer Detail Modal */}
      <OfferDetailModal
        offer={selectedOffer}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onApprove={handleApproveOffer}
        datesText={`${trip?.check_in || formData.check_in} to ${trip?.check_out || formData.check_out}`}
        guestsText={`${trip?.adults || formData.adults} Adults, ${trip?.rooms || formData.rooms} Room(s)`}
      />

      {/* Payment Sheet Modal */}
      <PaymentModal
        offer={selectedOffer}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPayAndConfirm={handlePayAndConfirm}
        isLoading={loading}
      />

      {/* Demo Mode Safety Phone Number Modal */}
      <DemoPhoneModal
        isOpen={isDemoPhoneOpen}
        onClose={() => setIsDemoPhoneOpen(false)}
        onSaved={handleDemoPhoneSaved}
        currentPhoneNumber={runtimeSettings.test_phone_number}
      />

      {/* Technical Debug Inspector Drawer */}
      <DebugDrawer
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        trip={trip}
        calls={calls}
        offers={offers}
      />

      {/* Trip History Drawer */}
      <TripHistoryDrawer
        isOpen={isHistoryOpen}
        userEmail={userEmail}
        onClose={() => setIsHistoryOpen(false)}
        onResume={async (tripId: string) => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/v1/trips/${tripId}/resume`);
            if (!res.ok) return;
            const data = await res.json();
            setTrip(data.trip);
            setCandidates(data.candidates || []);
            setCalls(data.calls || []);
            setOffers(data.offers || []);
            setIsHistoryOpen(false);

            // Determine which stage to resume to
            if (data.offers && data.offers.length > 0) {
              setStage("offers");
            } else if (data.calls && data.calls.length > 0) {
              setStage("calling");
            } else if (data.candidates && data.candidates.length > 0) {
              setStage("discovery");
            } else {
              setStage("form");
            }
          } catch (e) {
            console.error("Failed to resume trip:", e);
          }
        }}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-black/10 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            HiFi — AI Hotel Procurement Agent • Built for CALL-E Hackathon 2026
          </div>
          <div className="text-[11px] text-slate-400">
            Search → Verify → Call → Negotiate → Compare → Approve → Confirm
          </div>
        </div>
      </footer>
    </div>
  );
}
