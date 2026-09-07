# Recollect — Comprehensive Features & Capabilities Document

> **Platform:** Recollect (Cognitive Care, Routine Support & Monitoring Platform)  
> **Team:** ByteForce (Smart India Hackathon 2026)  
> **Licensing:** GNU General Public License v3.0 (GPL-3.0) — Licensed to **ByteForce** and **Creatomat**  
> **Architecture:** Zero-dependency, Client-Side Progressive Web App (PWA) with Local-First Persistence

---

## Executive Summary

**Recollect** is a specialized, human-centered assistive platform engineered to support seniors living with early-stage cognitive impairment (Mild Cognitive Impairment / Phase-1 dementia), their family caregivers, and primary community healthcare workers.

Guided by the foundational ethos of **"calm over clever"**, Recollect replaces high-stress, sensor-heavy, or notification-dense interfaces with serene, single-decision orientation points for patients, while simultaneously streaming rich, explainable, and non-diagnostic behavioral telemetry to caregivers and clinical health workers.

---

## 1. System Architecture & Core Technology

### 1.1 Zero-Dependency Native Web Stack
* **Standards-Compliant Execution:** Built exclusively using HTML5, modern CSS3 (custom variables, flexbox, CSS grid, print stylesheets), and modular ES6+ JavaScript.
* **No Build Step Required:** Operates directly within any modern web browser without requiring node packages, npm builds, webpack, or external framework runtimes.
* **Static Deployment Ready:** Pre-configured with `.nojekyll` for native hosting on GitHub Pages, Cloudflare Pages, or static web servers.

### 1.2 Local-First Storage Engine (`RecollectDB`)
* **Storage Layer:** Implemented in `js/db.js` using browser `localStorage` wrapped in a transactional data store with an automated sync queue.
* **Hard Offline Guarantees:** Patient-facing reads and writes operate against local storage first with zero blocking on network requests.
* **Append-Only Logging:** Core clinical tables (`ReminderLog`, `GameSession`, `MoodLog`, `CaregiverActivityLog`) enforce strict append-only immutability.
* **Automatic Recovery & Seeding:** Automatically detects uninitialized environments and seeds realistic clinical baselines, caregiver profiles, schedule items, and messages.

### 1.3 Progressive Web App (PWA) & Offline Capabilities
* **Service Worker (`sw.js`):** Cache-first static asset caching ensuring instant offline availability.
* **Web App Manifest (`manifest.json`):** Configured with standalone display mode, orientation anchors, and themed UI chrome for bedside tablet installation.
* **Network Mode Emulation:** Dynamic in-app toggle allows testing and running in `Online` or `Offline (Local-Only)` operation with live visual badges.

### 1.4 Power & Hardware Optimization
* **Low-Power Mode:** Disables non-critical animations, reduces CSS transitions, pauses continuous polling loops, and minimizes CPU/GPU load to preserve battery on low-cost rural tablet hardware.
* **Reduced Motion Compliance:** Respects `prefers-reduced-motion` system accessibility preferences.

---

## 2. Role Segregation & Access Security

Recollect implements strict visual and functional segregation across three distinct user roles to protect seniors from overwhelming settings while granting appropriate oversight to caregivers and health workers:

```
+-------------------------------------------------------------------+
|                     RECOLLECT PLATFORM GATEWAY                     |
+---------------------------------+---------------------------------+
                                  |
         +------------------------+------------------------+
         |                                                 |
         v                                                 v
+-----------------------+                         +-----------------------+
|  Senior Patient Space |                         | Family Caregiver Hub  |
|  (Eleanor Vance)      |                         | (Sarah Vance)         |
|  - 1-Tap Entry        |                         | - PIN: 1234           |
|  - No Password Gate   |                         | - Full Care Dashboard |
+-----------------------+                         +-----------------------+
                                  |
                                  v
                       +-----------------------+
                       | Clinical & ASHA Hub   |
                       | (Dr. Thorne / Anita)  |
                       | - Passcode: 9999      |
                       | - Telemetry & Reports |
                       +-----------------------+
```

### 2.1 Senior Patient Space (Eleanor Vance)
* **Zero Friction Entry:** 1-tap entry without passwords, PINs, or complex biometric barriers.
* **Safe Sandbox:** Excludes configuration panels, raw numbers, statistical metrics, clinical diagnoses, and billing forms.

### 2.2 Family Caregiver Portal (Sarah Vance)
* **PIN-Guarded Gateway:** Protected by a 4-digit security PIN (`1234` default demo PIN).
* **Direct Space Switching:** Caregivers can seamlessly navigate between Eleanor's tablet view, the Caregiver Portal, and the Clinical Hub via the authenticated settings panel.

### 2.3 Clinical & Community Health Hub (Dr. Thorne & Anita Roy ASHA Lead)
* **Passcode-Guarded Gateway:** Protected by clinical passcode (`9999` default demo passcode).
* **Multi-Disciplinary Views:** Provides dedicated tabs for clinical neurology review, ASHA/ANM rural community action reports, and printable weekly medical summaries.

---

## 3. Senior Patient Space (Bedside Tablet Mode)

Designed specifically for bedside tablets (e.g., 10-inch landscape mounts), the Senior Patient Space maximizes legibility, minimizes anxiety, and reinforces daily orientation.

### 3.1 Dynamic Orientation Anchors
* **Live Time-Aware Greeting:** Dynamically updates greeting text based on the local system hour:
  * *Morning (5:00 AM – 11:59 AM):* "Good Morning, Eleanor!"
  * *Afternoon (12:00 PM – 4:59 PM):* "Good Afternoon, Eleanor!"
  * *Evening (5:00 PM – 8:59 PM):* "Good Evening, Eleanor!"
  * *Night (9:00 PM – 4:59 AM):* "Restful Evening, Eleanor!"
* **Localized Regional Date Bar:** Dynamically renders the current date with regional month and day names formatted for the active locale.
* **Contextual Weather Bar:** Automatically reflects current time conditions (Morning sunshine 24°C, Afternoon breeze 27°C, Peaceful twilight 22°C, Quiet night 19°C).

### 3.2 Spoken Audio Narration & Synthesis Engine
* **One-Tap Voice Briefing:** The *"Listen to your day"* button activates a warm, conversational spoken briefing informing the senior of the current time, scheduled routine, and reassuring guidance.
* **Web Speech API Pacing:** Speech synthesis uses calibrated senior-friendly parameters (`rate = 0.85`, `pitch = 1.05`) mapped to appropriate regional BCP-47 voices (`en-IN`, `as-IN`, `bn-IN`, `hi-IN`).
* **Web Audio API Melodic Chime Fallback:** If speech synthesis is unsupported, disabled, or offline voices are unavailable, an integrated pentatonic chime progression (C4–E4–G4–A4–C5) plays automatically via `AudioContext`.

### 3.3 Single-Decision Routine Card
* **Clear Current Anchor:** Displays the active scheduled routine (e.g., *Morning Blood Pressure Pill*).
* **High-Contrast Photographic Pill Specifications:** 
  * Pill appearance: "Yellow Oval V 42 (Lisinopril 10mg)"
  * Water requirement: "1 Full Glass of cool water"
* **One-Tap Action:** Prominent *"I took my medicine"* button triggers immediate visual confirmation, plays audio feedback, logs the event to the caregiver activity stream, and clears overdue banners.

### 3.4 Full-Screen Reminder Attention Takeover
* **Dedicated Attention Modal:** For time-critical medications, the interface can display a high-focus full-screen modal containing an SVG graphic of the medicine and water glass.
* **Three Vertically Stacked Actions:**
  1. **"✓ Done" (I took my medicine):** Confirms adherence with a timestamp.
  2. **"⏰ Remind me in 10 minutes":** Snoozes the alert and schedules a gentle follow-up prompt.
  3. **"🤝 Need help from Sarah":** Dispatches an instant caregiver notification.
* **Voice Mode Indicator:** Displays simulated voice listening cue (*"Listening for 'Done'..."*).

### 3.5 Stress-Free Cognitive Mind Games
* **Zero Timers, Ever:** All cognitive activities eliminate countdown timers, ticking clocks, speed bonuses, and penalty counters.
* **Four Diverse Categories:**
  1. **Memory:** Family Photo Match / Cultural Heritage Card Match
  2. **Attention:** Garden Flower Focus & Observation
  3. **Language:** Word & Everyday Object Recall
  4. **Problem Solving:** Daily Routine Sequencing & Step Matching
* **Swappable Card Packs:**
  * **Family Photo Pack:** Personal photos featuring Sarah, garden roses, seaside trips, and tea sets.
  * **Northeast Cultural Pack:** Regional imagery featuring Assam Golden Muga Silk, Majuli Island Masks, Meghalaya Living Root Bridges, and Kaziranga Rhinos.
* **Garden Blooming Progress Indicator:** Replaces numerical scores with blooming floral icons (🌱 -> 🌻).
* **Gentle Audio Instructions:** Seniors can tap *"Read Instructions"* anytime to hear spoken gameplay guidance.
* **Calm Hint System:** The *"Give Me a Gentle Hint"* button briefly reveals matching card pairs without penalty.
* **Warm Score-Free Completion:** Displays a warm celebratory card (*"Great job today, Eleanor! Your garden memories bloomed beautifully."*) without exposing raw statistics.
* **Passive Telemetry Logging:** In the background, `RecollectDB` silently records completion time, decision hesitation latency (in milliseconds), and accuracy for clinical tracking.

### 3.6 One-Tap Mood & Wellbeing Check-In
* **Friendly Visual Faces:** Four large, expressive mood selectors:
  * ☀️ **Joyful** (Score 5)
  * 🌸 **Peaceful** (Score 4)
  * 🛋️ **Tired** (Score 3)
  * 🤝 **Need Support** (Score 2)
* **Caregiver-Assisted Flag:** Allows caregivers to record observations on Eleanor's behalf when she is unable to interact directly.
* **Instant Feed Sync:** Mood entries are immediately logged to `MoodLog` and reflected in Caregiver and Clinical dashboards.

### 3.7 Simulated Voice Calling
* **One-Tap Family Call:** Tap *"Call Sarah"* to open a realistic, senior-friendly calling overlay.
* **Ringing & Pulse Animation:** Displays soft visual pulses, connection status (*"Calling Sarah Vance..."* -> *"Connected"*), and a live call elapsed timer (`MM:SS`).
* **Safe Termination:** Accessible *"End Call"* button cleanly disconnects the simulated session.

### 3.8 Urgent Care & Emergency Help
* **Prominent Emergency Button:** High-contrast *"🚨 Call Help"* button positioned safely on the patient header.
* **Multi-Tier Escalation Modal:**
  1. **Primary Contact:** Dispatches instant high-priority notification and SMS alert to Sarah Vance.
  2. **Secondary Contact:** Queues escalation to Priya Vance (+91 98765 43211).
  3. **National Emergency Helpline:** Direct 1-tap telephone link to **112**.
* **Audit Trail:** Emergency triggers are immediately posted to the shared Caregiver Activity Log.

---

## 4. Family Caregiver Portal (Sarah's Hub)

The Family Caregiver Portal equips family members with real-time visibility, schedule management, alert escalation controls, and clinical communication tools.

### 4.1 Hero Status Bar & Live Tablet Pairing
* **Patient Status Pill:** Displays Eleanor's location (*"Active in Living Room • Bedside Tablet Paired"*).
* **Hub Sync Staleness Badge:** Real-time indicator displaying the exact last sync time (e.g., *"Live Hub Sync: 9:02 AM"*).
* **Header Quick Actions:** 1-tap *"Add Reminder"*, *"Call Eleanor"*, and *"Emergency Quick Call"*.

### 4.2 Critical Overdue Alert Banner
* **Single Use of Alert Red:** Strictly reserved for urgent, unconfirmed critical medications.
* **Contextual Information:** Displays overdue duration badge (e.g., *"35m Overdue"*) and the specific missing pill.
* **Immediate Resolution Actions:**
  * *"Call Eleanor's Tablet"* (launches audio call simulation)
  * *"Mark Taken by Caregiver"* (resolves the alert and logs caregiver confirmation)
  * *"Test SMS/USSD Fallback"* (verifies emergency network delivery)
* **Dynamic Dismissal:** Hides automatically the moment Eleanor confirms her medicine on the tablet or the caregiver records manual administration.

### 4.3 Interactive Visual Schedule Checklist (Tab 1)
* **Full Schedule Stream:** Chronological timeline of daily morning, afternoon, and evening routines.
* **Dynamic Task Authoring ("➕ Add Task"):** Caregivers can author custom reminders specifying routine name, category, scheduled time, senior instructions, and alert priority.
* **Live Task Coexistence:** Custom tasks seamlessly coexist alongside baseline clinical routines.
* **Interactive Checkbox Controls:**
  * **"✓ Done":** Marks the routine complete, updating adherence scores.
  * **"↺ Undo":** Reverts accidental completions.
  * **"✕":** Deletes custom routines.

### 4.4 Longitudinal Trends & Analytics (Tab 2)
* **Interactive Timeframe Selectors:** Toggle between **Daily**, **Weekly**, **Monthly**, and **Quarterly** views.
* **Dual-Metric Reactive SVG Chart:**
  * 🟢 **Routine Adherence Polyline:** Visualizes percentage of medication and task compliance.
  * 🔵 **Composite Cognitive Score Polyline:** Displays normalized score trajectories across time.
* **Dynamic Chart Updates:** Recalculates SVG points, coordinates, gridlines, x-axis date labels, and summary averages on timeframe selection.
* **Notable Activity Observations (Expandable Accordion):** Highlights behavioral changes (e.g., *"Routine Latency: Morning pill delay observed (+18 mins)"*) with inspectable underlying evidence and clinical recommendations.
* **Persistent Non-Diagnostic Footnote:** WCAG-compliant advisory emphasizing that scores track engagement trends and do not constitute clinical diagnoses.

### 4.5 Family Memory Journal & Clinical Notes (Tab 3)
* **Rich Observation Entry:** Caregivers can record qualitative notes (e.g., *"Eleanor had bright recall looking at seaside photos today"*).
* **Behavioral Tagging System:**
  * ✨ *Cognitive Spark*
  * 🌿 *Calm & Engaged*
  * 🛋️ *A Bit Tired*
  * ❓ *Mild Confusion*
* **Physician Visibility:** All journal entries appear chronologically in Section 4 of Dr. Thorne's Structured Weekly PDF report.

### 4.6 Multi-Disciplinary Care Circle & Messaging (Tab 4)
* **Care Circle Directory:** Displays structured contact cards for all active caregivers and health workers:
  * **Sarah Vance** (Primary Family Caregiver / Daughter)
  * **Priya Vance** (Secondary Co-Caregiver / Sibling)
  * **Dr. Robert Thorne** (Attending Neurologist, District Hospital)
  * **Anita Roy** (Lead ASHA Worker, Primary Health Centre)
* **Contact Action Buttons:** One-tap calling or messaging links for each care circle member.
* **"➕ Add Member" Dialog:** Allows inviting additional family members, nurses, or local volunteers.
* **Shared Shift Hand-Off Log:** Multi-author communication stream where Sarah, Priya, or Anita can post shift notes, hand-off summaries, and home visit observations.
* **Multi-Channel Professional Messaging:**
  * Independent channels for **Dr. Robert Thorne** and **Anita Roy (ASHA)**.
  * Non-emergency advisory banner (24–48 hour expected reply window).
  * Realistic automated clinical replies triggered 1.8 seconds after message transmission.

### 4.7 Alert Escalation & Notification Preferences (Tab 5)
* **Instant Critical Push Alerts:** Toggle for high-priority browser notifications on missed critical medications.
* **SMS / USSD Fallback (+91 98765 43210):** Automatic offline fallback when data connection drops.
* **Unacknowledged Alert Window Selector:** Configurable timeout (30 min default, 45 min, 60 min) before alert escalates to secondary contacts.
* **Batch Routine Digest:** Groups non-critical checkpoints into a single summary to eliminate caregiver alert fatigue.
* **Settings Persistence:** All checkbox states persist across sessions in `localStorage`.

---

## 5. Clinical & Community Health Hub

The Clinical Hub provides evidence-based decision support for neurologists, geriatric specialists, and rural community health workers (ASHA/ANM).

### 5.1 Mandatory Non-Diagnostic Clinical Advisory
* Prominently displayed across all clinical screens:  
  > *"Mandatory Clinical Advisory: This platform is an assistive cognitive engagement and routine monitoring decision-support tool. It does not independently diagnose dementia, stage disease severity, or provide clinical treatments. All observations are based on logged activity timelines."*

### 5.2 Doctor Portal & Cognitive Telemetry (Tab 1)
* **Telemetry Metric Cards:**
  * **Composite Weekly Score:** 0–100 weighted index (Routine Adherence 40%, Game Performance 40%, Engagement Frequency 20%).
  * **Routine Adherence:** Percentage and fraction of acknowledged reminders (e.g., 94%, 16 of 17).
  * **Memory Game Accuracy:** Normalized accuracy score and average decision hesitation latency (ms).
  * **Active Flags for Review:** Count of pending rule-engine alerts and watch notices.
* **Clinical Insight Observations:** Explanatory panel analyzing longitudinal trends (e.g., 3-minute medication latency elongation over 14 days against historical baselines).
* **Telemedicine Handoff (Ayushman Bharat Digital Health):**
  * One-tap dispatch generating a standardized ABHA clinical referral packet.
* **DPDP / GDPR Compliance Bundle:** Export button downloading an encrypted JSON bundle containing all patient logs, consent timestamps, and telemetry.

### 5.3 Explainable AI Rule Engine (`RuleEngine`)
Implemented in `js/ruleEngine.js`, the deterministic rule engine evaluates patient telemetry against configurable threshold constants:

| Rule Name | Trigger Condition | Severity | Evidence Output |
|---|---|---|---|
| **Rule A: Missed Reminders Streak** | $\ge 3$ consecutive missed doses ($\ge 5$ for alert) | Watch / Alert | List of scheduled timestamps and consecutive count |
| **Rule B: Inactivity Gap** | $\ge 48$ hours without interactions ($\ge 96$h for alert) | Watch / Alert | Inactive duration and timestamp of last recorded event |
| **Rule C: Game Score Decline** | $\ge 25\%$ drop over 3 consecutive sessions vs 14-day baseline | Watch | Recent average vs baseline average and percentage drop |
| **Rule D: Response Latency Spike** | Current session hesitation $\ge 2.0\times$ historical baseline | Watch | Exact millisecond latency comparison and multiplier |

* **Clinician Review Actions:** For every flag, doctors can:
  * **"✓ Mark Reviewed":** Records physician acknowledgment.
  * **"✕ Dismiss":** Clears false-positive observations.
  * **"📝 Add Note":** Appends clinical annotations directly to the flag record.
* **"Re-evaluate Rule Engine" Button:** Allows instant on-demand evaluation of recent logs.

### 5.4 ASHA & ANM Simplified Mobile Action View (Tab 2)
* **Optimized for Rural Field Use:** Designed specifically for low-resolution smartphone screens carried by Accredited Social Health Activists (ASHA) and Auxiliary Nurse Midwives (ANM).
* **Single-Line Action Cue:** High-visibility green/blue summary card (*"Weekly Status: Adherence 94% • Recommended action: Routine weekly check-in. No emergency home visit required."*).
* **Field Inspection Priority List:**
  1. **Medication Checkpoint:** Verifies pillbox adherence (Lisinopril 10mg confirmed at 9:02 AM).
  2. **Water & Hydration Check:** Confirms boiled/filtered bedside water availability.
  3. **Family Language Comfort:** Monitors engagement with regional voice narration.
* **"Log Completed Home Visit Check":** Formally registers an official home inspection entry into the shared activity stream.

### 5.5 Structured Weekly Clinical PDF Report (Tab 3)
* **Structured 7-Section Medical Summary:**
  1. Patient Demographics & Reporting Period Header
  2. Non-Diagnostic Advisory Statement
  3. Quantitative Routine Adherence & Task Latency
  4. Cognitive Activity & Engagement Trends
  5. Notable Activity Flags with Explainable Evidence
  6. Qualitative Caregiver Observations (Sarah Vance)
  7. Mood / Wellbeing Summary & Escalation Incident Log
* **Physician Threaded Reply Box:** Allows Dr. Thorne to write feedback and guidance that transmits directly to Sarah Vance's Family Caregiver Portal.
* **Native Print & PDF Generation:** One-tap *"Print / Save PDF"* button triggering `@media print` optimized stylesheets that strip web chrome, navigation bars, and buttons.

---

## 6. Accessibility & Regional Localization

### 6.1 Northeast India Regional Localization Engine (`I18nManager`)
* **5 Supported Languages:**
  * **English (`en`)**
  * **Assamese (`as`)** — অসমীয়া
  * **Bengali (`bn`)** — বাংলা
  * **Khasi (`kha`)** — Khasi (Meghalaya)
  * **Hindi (`hi`)** — हिन्दी
* **Universal UI Coverage:** Over 435 translation keys translated across all 5 languages, covering every button, card, modal, placeholder, tooltip, SVG label, and disclaimer.
* **Universal DOM Data Attributes:**
  * `data-i18n`: Text content replacement
  * `data-i18n-placeholder`: Input and textarea placeholders
  * `data-i18n-title`: Tooltips and button labels
  * `data-i18n-aria`: Assistive screen-reader labels
* **Synchronized Selectors:** Changing the language in the header or in Caregiver Settings instantly updates all views, re-renders dynamic calendars, and synchronizes both selectors.
* **Regional Calendar Localization:** `getFormattedDate()` formats dates with native regional day and month names.

### 6.2 3-Tier Senior Font Scaling
* **Normal (20pt):** High-legibility base floor exceeding standard web minimums.
* **Large (24pt / +20%):** Enhanced scaling for moderate presbyopia.
* **Extra Large (28pt / +40%):** Maximum contrast and size for low vision.
* **Quick Cycle Button:** Seniors can cycle through font sizes directly from the tablet orientation bar without entering settings.

### 6.3 WCAG AAA High-Contrast Stark Theme
* **Pure Black-on-White:** Replaces all warm pastels and decorative gradients with sharp, high-contrast monochrome borders and typography.
* **Zero Decorative Noise:** Removes shadows, transparent overlays, and non-essential icons.

### 6.4 Four-Step Consent & Privacy Framework
Accessible via Caregiver Settings, the interactive onboarding modal walks families through a transparent 4-step framework:
1. **Step 1: Patient & Caregiver Identity:** Confirms Sarah Vance's power-of-attorney authority.
2. **Step 2: Local Data Storage Disclosure:** Explains what data is stored locally on the tablet.
3. **Step 3: Separate AI Pattern Monitoring Consent:** Distinct opt-in checkbox for rule-engine telemetry. Explicitly states that declining pattern monitoring does *not* disable reminders or mind games.
4. **Step 4: Plain-Language Companion Explanation:** Simple, reassuring wording to read to Eleanor Vance explaining the tablet's role.

---

## 7. Feature Comparison Matrix

| Feature / Capability | Senior Patient Space | Family Caregiver Portal | Clinical & Community Hub |
|---|:---:|:---:|:---:|
| **Access Gate** | 1-Tap (No Password) | PIN `1234` | Passcode `9999` |
| **Dynamic Orientation & Greeting** | Yes | Header Sync Time | Header Sync Time |
| **Audio Day Narration & Chimes** | Yes | No | No |
| **Medicine Reminder Takeover** | Yes (Full Screen) | Overdue Alert Banner | Adherence Metric |
| **Cognitive Mind Games** | Playable (Score-Free) | Activity Logged | Accuracy & Latency Stats |
| **Mood Check-In** | Visual Self-Report | Caregiver-Assisted | Mood Summary & Trend |
| **Voice Calling Simulation** | "Call Sarah" | "Call Eleanor" | No |
| **Emergency Escalation (112)** | "Call Help" Button | Emergency Trigger | Incident Audit Stream |
| **Task Authoring ("Add Task")** | Read-Only Checklist | Full Authoring / Delete | Viewable in PDF Report |
| **Longitudinal Charts** | No | Daily / Wk / Mo / Qtr | Composite Metric Cards |
| **Explainable AI Flags** | Hidden | Expandable Evidence | Full Review / Dismiss / Note |
| **Care Circle Messaging** | No | Doctor & ASHA Channels | Threaded Caregiver Reply |
| **ASHA Field Action View** | No | Shift Hand-off Log | Simplified Action View |
| **Printable Weekly PDF Report** | No | No | 7-Section PDF Export |
| **Telemedicine ABHA Handoff** | No | No | Full Referral Dispatch |
| **Font Scaling (20pt–28pt)** | Yes | Follows Base CSS | Standard Web |
| **WCAG AAA High Contrast** | Yes | Yes | Yes |
| **5-Language Regional i18n** | Full UI | Full UI | Full UI |

---

## 8. Summary of Verification & Compliance

* **Syntax & Linkage:** 100% of event handlers (`app.*()`) map to verified methods in `js/app.js`.
* **Zero External Dependencies:** Completely standalone; runs offline via Service Worker.
* **Non-Diagnostic Integrity:** Verified persistent non-diagnostic disclaimers across patient modals, caregiver trend charts, and clinical doctor reports.
* **GPL-3.0 Licensed:** Fully open-source under GNU General Public License v3.0, credited to ByteForce and Creatomat.
