# Product Requirements Document (PRD) — Recollect

> **Platform:** Recollect (Cognitive Care, Routine Support & Monitoring Platform)  
> **Team:** ByteForce (Smart India Hackathon 2026)  
> **Licensing:** GNU General Public License v3.0 (GPL-3.0) — Licensed to **ByteForce** and **Creatomat**  
> **Target Deployments:** Bedside Tablets, Family Mobile Dashboards, Rural Community Health Centres (PHCs)  
> **Status:** Conforming to Running Prototype Implementation & Feasible Extensions

---

## 1. Executive Summary & Vision

### 1.1 The Challenge
Over 55 million people worldwide live with dementia, with Mild Cognitive Impairment (MCI / Phase-1 dementia) representing the crucial window where routine support, orientation anchors, and cognitive stimulation can preserve functional independence. In rural and semi-urban regions—especially Northeast India—healthcare access is strained, family caregivers suffer from acute burnout, and community health workers (ASHA/ANM) lack objective, longitudinal tools to monitor homebound seniors.

Existing consumer solutions are either high-stress (buzzing smartwatches, complex smartphone UIs with tiny text) or sensor-heavy surveillance systems that violate privacy and induce anxiety.

### 1.2 The Recollect Solution
**Recollect** is an offline-first, privacy-preserving assistive care platform designed around the philosophy of **"calm over clever"**:
* **For the Senior (Eleanor Vance):** Replaces anxiety-inducing alarms with peaceful, single-decision orientation cards, reassuring audio briefings, localized regional speech, and stress-free cognitive games with zero timers.
* **For the Family Caregiver (Sarah Vance):** Delivers live oversight, schedule authoring, multi-timeframe analytics, overdue medication alerts, memory journaling, and care circle communication.
* **For the Healthcare Team (Dr. Thorne & Anita Roy ASHA):** Provides explainable behavioral telemetry, non-diagnostic observational flags, a simplified mobile action view for rural home visits, and a structured, printable weekly clinical report.

---

## 2. Target Personas & User Roles

```
+-------------------------------------------------------------------------+
|                           USER ROLE MATRIX                              |
+---------------------+-------------------+-------------------------------+
| Persona             | Role Profile      | Access Gate                   |
+---------------------+-------------------+-------------------------------+
| Eleanor Vance       | Senior Patient    | 1-Tap Direct Entry (No PIN)   |
| (Age 78, Phase-1)   | Bedside Tablet    | Single-decision peaceful UI   |
+---------------------+-------------------+-------------------------------+
| Sarah Vance         | Primary Family    | PIN: 1234                     |
| (Daughter, POA)     | Caregiver Portal  | Full schedule, trends, alerts |
+---------------------+-------------------+-------------------------------+
| Priya Vance         | Secondary Family  | Linked in Care Circle         |
| (Daughter)          | Caregiver         | Standby emergency escalation  |
+---------------------+-------------------+-------------------------------+
| Dr. Robert Thorne   | Attending Doctor  | Passcode: 9999                |
| (Neurologist)       | Clinical Hub      | Telemetry, flags, PDF report  |
+---------------------+-------------------+-------------------------------+
| Anita Roy           | Lead ASHA Worker  | Passcode: 9999                |
| (Community Health)  | PHC Action View   | Simplified mobile action list |
+---------------------+-------------------+-------------------------------+
```

---

## 3. Core Functional Requirements (FRs)

### FR-1: Senior Bedside Orientation & Routine Reminders
* **FR-1.1 Dynamic Hour-Based Greeting:** Automatically computes time-of-day greetings based on device hour (Morning sunshine, Afternoon breeze, Peaceful twilight, Quiet night) in the selected regional language.
* **FR-1.2 Regional Date & Weather Anchor:** Formats the active calendar date with native regional day and month names (`getFormattedDate`) alongside ambient weather indicators.
* **FR-1.3 Spoken Audio Briefing & Pentatonic Chime Fallback:** A single tap on *"Listen to your day"* speaks a calm, unhurried briefing of the day's routine using calibrated Web Speech parameters (`rate = 0.85`, `pitch = 1.05`). If speech synthesis is unavailable or offline, a 5-note pentatonic chime progression (C4–C5) plays automatically via Web Audio API.
* **FR-1.4 Photographic Pill Specifications:** Routine medication cards present prominent pill appearance details (shape, imprint, e.g., *"Yellow Oval V 42 (Lisinopril 10mg)"*) and water requirements (*"1 Full Glass of cool water"*).
* **FR-1.5 Full-Screen Reminder Takeover:** When critical medication is due, the interface displays a full-screen attention takeover with exactly three vertically stacked actions:
  1. **"✓ Done" (I took my medicine):** Confirms administration, records timestamp, logs to Caregiver Activity Log, and clears overdue banners.
  2. **"⏰ Remind me in 10 minutes":** Snoozes the alert gently.
  3. **"🤝 Need help from Sarah":** Dispatches an instant caregiver assistance prompt.
* **FR-1.6 Two-Way Cross-Role Synchronization:** Confirming a routine on Eleanor's tablet immediately synchronizes with the Caregiver Portal, updating adherence metrics and removing overdue warning banners.

### FR-2: Stress-Free Cognitive Mind Games (4 Distinct Engines in Full-Screen)
* **FR-2.1 Full-Screen Immersion & Zero Timers:** Games launch into a dedicated full-screen takeover (`100vw` × `100vh`), replacing cramped dialog modals to maximize tablet screen space, optimize touch targets ($\ge 64\text{px}$), and eliminate countdown clocks, speed bonuses, and penalty buzzers. Includes prominent *"Pause & Rest"* exit controls.
* **FR-2.2 Four Dedicated Cognitive Engines:**
  1. **Memory (Photo Card Matching):** 2×4 card flip recall featuring personal Family Photos or Northeast Cultural Heritage packs.
  2. **Attention (Garden Flower Focus):** Calming visual search and target flower spotting (finding 3 target blooms in a randomized 10-flower garden bed).
  3. **Language (Word & Everyday Object Recall):** Functional everyday object naming and semantic association across 3 gentle rounds with 4 illustrated option cards.
  4. **Problem Solving (Daily Routine Sequencing):** Chronological sequencing of 4 morning or evening daily routine steps with sequential slot locking.
* **FR-2.3 Swappable Card Theme Packs:**
  * **Family Photo Pack:** Personal photos (Sarah, garden roses, seaside trips, afternoon tea).
  * **Northeast Cultural Heritage Pack:** Regional cultural imagery (Assam Golden Muga Silk, Majuli Masks, Living Root Bridges, Kaziranga Rhinos).
* **FR-2.4 Patient-Side Score & Star Tracker:** Features encouraging, senior-friendly metrics displayed in the senior orientation bar, the full-screen game header, and completion screens:
  * Persistent **Garden Stars (⭐)** (+3 to +5 stars per session).
  * Encouraging session points (75–100 pts) based on gentle accuracy.
  * Garden Blooming Stages: Sprout (🌱 0–5) -> Budding Green (🌿 6–12) -> Blooming Daisy (🌼 13–20) -> Sunflower Champion (🌻 21+).
* **FR-2.5 In-Game Gentle Assistance:** Seniors can tap *"Give Me a Gentle Hint"* to receive context-aware visual cues without penalty, or tap *"Read Instructions"* for localized spoken rules.
* **FR-2.6 Celebratory Completion Screen:** Displays warm celebratory feedback alongside awarded Garden Stars, session score, and reassuring garden greetings.
* **FR-2.7 Silent Behavioral Telemetry:** Records decision hesitation latency (in milliseconds), accuracy, and completion duration silently in `GameSession`, synchronizing directly with the Doctor's Clinical Hub and Caregiver Trends.

### FR-3: Mood & Wellbeing Check-In
* **FR-3.1 Four Visual Mood Anchors:** Seniors self-report their wellbeing using four large, joyful face buttons: ☀️ *Joyful* (5), 🌸 *Peaceful* (4), 🛋️ *Tired* (3), and 🤝 *Need Support* (2).
* **FR-3.2 Caregiver-Assisted Flag:** Caregivers can check the *"Caregiver-assisted observation"* box when logging observations on the senior's behalf.
* **FR-3.3 Instant Clinical Feed Sync:** Mood submissions immediately write to `MoodLog` and appear in the Caregiver Activity Log.

### FR-4: Communication & Emergency Escalation
* **FR-4.1 Simulated Voice Calling Dialog:** Tapping *"Call Sarah"* or *"Call Eleanor"* launches an interactive calling screen with visual connection pulses, ringing states, an active timer (`MM:SS`), and a clean *"End Call"* button.
* **FR-4.2 Urgent Care Emergency Escalation ("🚨 Call Help"):** One-tap emergency escalation that:
  1. Instantly notifies primary caregiver Sarah Vance via high-priority alert and SMS simulation.
  2. Queues standby escalation to secondary contact Priya Vance.
  3. Integrates a direct telephone link to the **112** National Emergency Helpline.
  4. Records an urgent incident audit log in `CaregiverActivityLog`.

### FR-5: Family Caregiver Oversight & Schedule Management
* **FR-5.1 Live Tablet Pairing & Sync Badge:** Hero bar displays Eleanor's status and the exact timestamp of the last hub synchronization.
* **FR-5.2 Critical Overdue Alert Banner:** The only place where alert amber/red is utilized. Appears when a critical medication is overdue, providing 1-tap options to call Eleanor's tablet, mark taken by caregiver, or test SMS fallback.
* **FR-5.3 Today's Visual Schedule Checklist:** Interactive timeline displaying all scheduled routines.
* **FR-5.4 Dynamic Task Authoring ("➕ Add Task"):** Caregivers can author custom routines (routine name, category, time, senior instructions, priority) that seamlessly coexist alongside baseline schedule items.
* **FR-5.5 Interactive Done / Undo & Deletion:** Caregivers can mark items as Done, Undo accidental completions, and delete custom tasks.

### FR-6: Longitudinal Trends & Analytics
* **FR-6.1 Timeframe Filtering:** Interactive toggles for **Daily**, **Weekly**, **Monthly**, and **Quarterly** views.
* **FR-6.2 Reactive SVG Chart:** Dynamically redraws routine adherence polylines (green) and composite cognitive score polylines (blue) with responsive data coordinates and x-axis labels.
* **FR-6.3 Expandable Notable Observations:** Surfaces behavioral variations (e.g., morning medication delay) with an expandable accordion exposing underlying raw evidence and clinical recommendations.
* **FR-6.4 Mandatory Non-Diagnostic Footnote:** Prominently states that scores reflect activity trends and do not constitute clinical diagnoses.

### FR-7: Family Memory Journal & Multi-Author Shift Logs
* **FR-7.1 Memory Journal Entry:** Caregivers record rich qualitative observations (e.g., *"Eleanor recognized seaside trip photos"*).
* **FR-7.2 Emotional & Behavioral Tagging:** Tag notes with ✨ *Cognitive Spark*, 🌿 *Calm & Engaged*, 🛋️ *A Bit Tired*, or ❓ *Mild Confusion*.
* **FR-7.3 Multi-Author Shift Hand-off Log:** Chronological communication stream allowing Sarah, Priya, and Anita Roy (ASHA) to log shift notes and home visit summaries.

### FR-8: Multi-Channel Care Circle Messaging
* **FR-8.1 Care Circle Directory:** Displays structured contact cards for all active caregivers, neurologists, and ASHA workers with dynamic *"➕ Add Member"* capabilities.
* **FR-8.2 Threaded Professional Channels:** Distinct messaging threads for **Dr. Robert Thorne** and **Anita Roy (ASHA)**.
* **FR-8.3 Non-Emergency Advisory Banner:** Displays clear expectations (24–48 hour expected reply window).
* **FR-8.4 Realistic Automated Replies:** Simulates clinical round-trip communication by automatically replying after 1.8 seconds.

### FR-9: Clinical Telemetry, Explainable AI & Reports
* **FR-9.1 Mandatory Clinical Advisory:** Enforces top-level clinical notices clarifying that the platform is a decision-support tool, not an autonomous diagnostic instrument.
* **FR-9.2 Composite Weekly Scoring (0–100 Index):** Weighted index combining Routine Adherence (40%), Memory Game Accuracy (40%), and Weekly Engagement Frequency (20%).
* **FR-9.3 Explainable Phase-1 Rule Engine (`RuleEngine`):** Evaluates longitudinal data against configurable constants (`RULE_CONFIG`):
  * Rule A: `checkMissedRemindersStreak` ($\ge 3$ Watch, $\ge 5$ Alert).
  * Rule B: `checkInactivityGap` ($\ge 48$h Watch, $\ge 96$h Alert).
  * Rule C: `checkGameScoreDecline` ($\ge 25\%$ drop over 3 sessions).
  * Rule D: `checkResponseLatencyIncrease` ($\ge 2.0\times$ hesitation baseline).
* **FR-9.4 Clinician Flag Actions:** Clinicians can review every flag with 1-tap actions: **"✓ Mark Reviewed"**, **"✕ Dismiss as Noise"**, or **"📝 Add Note"**.
* **FR-9.5 ASHA & ANM Simplified Mobile Action View:** Designed for rural field workers on low-spec smartphones:
  * Single-line status cue (*"Weekly Status: Adherence 94% • Recommended action: Routine weekly check-in"*).
  * Field inspection checklist (Pillbox inspection, Bedside water check, Family language comfort).
  * *"Log Completed Home Visit Check"* writing directly to the shared care log.
* **FR-9.6 Structured Weekly Clinical PDF Report:** Standardized 7-section medical summary with threaded physician reply box and native `@media print` PDF generation.
* **FR-9.7 Telemedicine & Compliance Data Bundle:** One-tap Ayushman Bharat Digital Health (ABHA) referral packet generation and encrypted DPDP/GDPR JSON export.

### FR-10: Universal Accessibility, Themes & Automated Scheduling
* **FR-10.1 Five Northeast India Regional Languages:** Full UI localization across **English (`en`)**, **Assamese (`as`)**, **Bengali (`bn`)**, **Khasi (`kha`)**, and **Hindi (`hi`)** covering 437+ dictionary keys.
* **FR-10.2 Senior Font Scaling:** 3-tier scaling supporting **Normal (20pt)**, **Large (24pt / +20%)**, and **Extra Large (28pt / +40%)**.
* **FR-10.3 Dark Mode (Calm Night Theme):** Low-glare deep slate palette (`#0b1329` / `#111e3e`) engineered for senior eye comfort during evening and night hours.
* **FR-10.4 High-Contrast Stark Theme:** WCAG AAA pure black-on-white theme with solid borders.
* **FR-10.5 Password-Gated Theme Management (PIN `1234`):** Appearance toggles and schedules are locked inside Caregiver Settings behind PIN `1234` so seniors cannot accidentally disrupt their visual settings from the tablet.
* **FR-10.6 Automated Theme Scheduling:** Independent custom time windows for Dark Mode (e.g., 20:00 to 07:00) and High-Contrast Mode, evaluated automatically every 30 seconds by the application clock engine.
* **FR-10.7 Low-Power Mode:** Disables non-critical animations and reduces background timers to maximize battery life on budget hardware.
* **FR-10.8 Four-Step Consent & Privacy Framework:** Guided onboarding modal covering Identity, Local Data Storage, Distinct AI Pattern Consent, and Plain-Language Companion Wording for Eleanor.

---

## 4. Prototype Implementation vs. Production Roadmap

To ensure technical transparency, the table below delineates the running prototype's capabilities from future production backend infrastructure:

| Feature Area | Prototype Implementation (Running Code) | Feasible Prototype Extensions | Production Cloud Scale |
|---|---|---|---|
| **Platform Stack** | Vanilla HTML5 / CSS3 / ES6+ PWA; Zero build dependencies | Mock REST API endpoints via Service Worker | React Native / Flutter native tablet app |
| **Data Persistence** | `RecollectDB` via browser `localStorage` + Sync Queue | IndexedDB for multi-year telemetry storage | PostgreSQL + Supabase / Cloud SQL |
| **Voice & Audio** | Web Speech API synthesis + Web Audio API pentatonic chimes | Pre-recorded native audio asset bundles | Offline neural TTS models (Vulkan/ONNX) |
| **Calling** | Simulated calling modal with ringing pulse and live timer | In-browser WebRTC audio peer connection | Full cellular telephony / VoIP gateway |
| **SMS / Escalation** | In-app simulated SMS/USSD notification fallback | Web Push API browser notifications | Twilio / CDAC National SMS Gateway |
| **Doctor Messaging** | In-app dual-channel thread with realistic auto-replies | Local WebSocket mock server | End-to-end encrypted clinical messaging |
| **Clinical Reports** | Native `@media print` clean browser PDF generation | Client-side jsPDF custom chart rendering | Automated scheduled EHR PDF delivery |
| **Telemedicine (ABDM)** | Formatted ABHA referral packet generator | ABDM Sandbox API mock integration | Live Ayushman Bharat M1/M2/M3 Bridge |
| **Compliance Export** | One-tap JSON bundle export adhering to DPDP/GDPR | Client-side AES-256 encrypted file download | Certified HIPAA/DPDP cloud storage vault |

---

## 5. Non-Functional Requirements (NFRs)

* **NFR-1 Offline Availability:** 100% of patient core interactions work without internet access.
* **NFR-2 Performance Budget:** Instant page load ($< 1.5\text{s}$) on 2GB RAM Android tablets via static caching.
* **NFR-3 Accessibility:** Enforces WCAG 2.2 Level AAA contrast and font floors on senior patient screens, and Level AA across caregiver and clinical portals.
* **NFR-4 Data Sovereignty:** Patient interaction logs are stored locally on the client device first.
* **NFR-5 Open Source Integrity:** Released under the GNU General Public License v3.0 (GPL-3.0) to ByteForce and Creatomat.
