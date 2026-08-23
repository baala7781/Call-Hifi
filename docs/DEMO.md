# HiFi — 3-Minute Hackathon Demo Script

## Core Pitch
> **"Booking sites help you find hotels. HiFi calls them."**

---

## 3-Minute Timing Breakdown

### **0:00 – 0:25: The Problem & Trip Intake**
- **Presenter**: "When you book online, list prices often conceal extra fees, lack direct discount perks, and leave availability uncertain. Normally, travelers would have to spend hours calling multiple hotels."
- **Action**: Open HiFi web app. Click "Quick Fill: Bali 5-Night Deal (₹50k)".
- **Visual**: Inputs automatically populated: *Destination: Bali, Dates: Oct 12–17, 2 Adults, 1 Room, Budget: ₹50,000 INR, Preferences: Breakfast & Free Cancellation*.
- **Action**: Click **Find & Negotiate Hotels**.

---

### **0:25 – 0:45: Hotel Discovery & Deterministic Ranking**
- **Presenter**: "HiFi queries Google Places, filters properties by traveler constraints, and deterministically ranks the top 5 candidates across rating, review confidence, budget alignment, and preferences."
- **Visual**: Scanner radar activates, displaying *18 found → 11 eligible → Top 5 candidates selected*.
- **Action**: Review top candidate card: *Ocean Pearl Resort, Canggu Cove, Ubud Grove, Seminyak Beachside, Jimbaran Bay*.
- **Action**: Click **Authorize & Start Calls**.

---

### **0:45 – 1:40: The Hero Calling Dashboard (Live CALL-E Execution)**
- **Presenter**: "HiFi connects to CALL-E to initiate outbound calls in parallel. Notice how each hotel card streams real-time status: Dialing, Connected, and Negotiating."
- **Visual**:
  - Live audio waveform pulses as calls connect.
  - Hotel cards stream live verified evidence:
    - *Ocean Pearl Resort*: "Deluxe Ocean King available, rack rate ₹45k, negotiated direct rate ₹41k (Saved ₹4,000!), breakfast & airport transfer included, free cancellation up to 48h."
    - *Jimbaran Bay*: "Verified fully booked for dates (handling real-world constraints gracefully)."
- **Action**: Click on Ocean Pearl Resort card to reveal audio waveform and live conversation transcript snippet.

---

### **1:40 – 2:15: Offer Matrix & AI Recommendation Reasoning**
- **Presenter**: "Once calls complete, HiFi calculates a multi-factor HiFi Value Score (0–100) and provides transparent AI reasoning explaining why the top choice is recommended."
- **Visual**:
  - Top Recommendation Banner: *"Ocean Pearl Resort is recommended because it saved ₹4,000 over rack rate, includes daily breakfast, and provides free cancellation within your ₹50,000 budget."*
  - Side-by-side comparison table showing original rack rates vs negotiated rates.

---

### **2:15 – 2:40: User Approval & Simulated Payment**
- **Presenter**: "HiFi strictly respects authorization boundaries. No booking is made without explicit traveler approval."
- **Action**: Click **Book This Hotel** on Ocean Pearl Resort.
- **Visual**: Inspection modal opens with full policy guarantee. Click **Proceed to Payment**.
- **Action**: Simulated payment sheet opens. Click **Pay ₹41,000 & Confirm**.

---

### **2:40 – 3:00: Confirmation Call & Verified Voucher**
- **Presenter**: "HiFi immediately triggers a second CALL-E confirmation call to lock in the reservation and retrieve the official hotel confirmation number."
- **Visual**:
  - Confirmation status turns green: *"Confirmation Number: HIFI-48291"*.
  - Boarding-pass style luxury verified booking voucher appears with confetti animation!
- **Closing**: *"HiFi saved you ₹4,000 and verified every condition without you making a single phone call."*
