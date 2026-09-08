# Design System Specification & UI/UX Architecture (`design.md`)

> **Platform:** Recollect (Cognitive Care, Routine Support & Monitoring Platform)  
> **Team:** ByteForce (Smart India Hackathon 2026)  
> **Licensing:** GNU General Public License v3.0 (GPL-3.0) — Licensed to **ByteForce** and **Creatomat**  
> **Compliance Standards:** WCAG 2.2 Level AAA (Patient UI) / Level AA (Caregiver & Clinical Hubs)  
> **Status:** Conforming to Running Prototype Implementation & Production UI Blueprint

---

## 1. Design Philosophy & Core Principles

Recollect is built upon five foundational design principles engineered specifically for seniors experiencing Phase-1 cognitive decline (Mild Cognitive Impairment) and the family caregivers who support them:

1. **Calm Over Clever:** Interfaces never test, rush, or judge the senior. There are zero countdown timers on games, zero negative buzzers, and zero red error banners on the patient app.
2. **One Decision Per Screen:** Senior bedside screens present one prominent decision at a time. Complex branching menus and multi-step confirmation modals are strictly avoided.
3. **Never Surface Uncertainty to the Patient:** Network connectivity fluctuations, sync spinners, and background retries remain silent on Eleanor's tablet, appearing only on Sarah's Caregiver Portal.
4. **Evidence Before Conclusions:** Every clinical score, trend line, and behavioral flag displayed to caregivers and doctors provides 1-tap access to the underlying raw timestamps and interaction data.
5. **Dignified Aesthetics:** Replaces sterile, clinical gray medical styling with a warm biophilic palette, soothing typography, and reassuring voice narration.

---

## 2. Design System Foundations

### 2.1 Color Palettes

#### Default Biophilic Light Theme (Day Mode)
Inspired by natural botanical tones to evoke feelings of calm and security:
* **Background Surface:** `#f7f9ff` (Soft serene mist)
* **Card Containers:** `#ffffff` / `#edf4fe`
* **Primary Brand Accent:** `#0f5238` (Deep Forest Emerald)
* **Secondary Supportive Accent:** `#395f94` (Calm Coastal Slate)
* **Tertiary Warm Accent:** `#6f3a00` (Warm Terracotta)
* **Alert & Emergency:** `#ba1a1a` (Reserved strictly for overdue medication and emergency SOS)

#### Dark Mode Theme (Calm Night Mode)
Engineered for reduced glare, minimal blue-light disruption, and high legibility in dim lighting:
* **Background Surface:** `#0b1329` (Deep Midnight Slate)
* **Card Containers:** `#111e3e` / `#16254c`
* **Typography:** `#f1f5f9` (Crisp Off-White)
* **Primary Accent:** `#10b981` (Vibrant Mint Emerald)
* **Secondary Accent:** `#60a5fa` (Soft Sky Blue)
* **Border Outlines:** `#1e3164`
* **Comprehensive Component Overrides:** Telemedicine handoff cards (`#064e3b`), ASHA cue boxes (`#0d1e3d`), AI consent warnings (`#451a03`), emergency alert overlays (`#3f1212`), and dynamic SVG chart grids (`#1e293b`).

#### High-Contrast Dual-Variant Theme (WCAG AAA)
Engineered for severe presbyopia, cataracts, and photophobia:
* **Stark White Variant (Default):**
  * **Background Surface:** `#ffffff` (Pure White)
  * **Typography & Borders:** `#000000` (Pure Black, 3px solid borders, 21:1 contrast ratio)
  * **Active Selection / Highlights:** `#ffff00` (Pure Canary Yellow with 4px solid black border)
  * **Focus Ring:** 4px solid `#000000` with 3px offset
* **Midnight Dark Variant (Low-Glare WCAG AAA):**
  * **Background Surface:** `#000000` (Pure Black)
  * **Typography & Borders:** `#ffffff` (Pure White, 3px solid borders)
  * **Active Selection / Highlights:** `#ffff00` (Canary Yellow with white border)
  * **Focus Ring:** 4px solid `#ffff00` with 3px offset
* **Decorative Styling:** Strips all shadows, gradients, and secondary colors across both variants.

#### Colourblind Accessibility System (WCAG 2.2 Compliant)
Guarantees that color is never the sole indicator of health status, urgency, or routine completion:
* **Deuteranopia & Protanopia (Red-Green Deficient Safe):**
  * **Completed / Normal:** Cobalt Blue (`#1d4ed8`, chip `#dbeafe`, text `#1e40af`)
  * **Pending / In-Progress:** Amber (`#f59e0b`, chip `#fef3c7`, text `#92400e`)
  * **Critical Alert / Overdue:** Vivid Magenta (`#c026d3`, chip `#fae8ff`, text `#701a75`)
* **Tritanopia (Blue-Yellow Deficient Safe):**
  * **Completed / Normal:** Deep Teal (`#0d9488`, chip `#ccfbf1`, text `#0f766e`)
  * **Pending / In-Progress:** Regal Purple (`#9333ea`, chip `#f3e8ff`, text `#6b21a8`)
  * **Critical Alert / Overdue:** Crimson Rose (`#e11d48`, chip `#ffe4e6`, text `#9f1239`)
* **Achromatopsia (High-Luminance Monochrome):**
  * Grayscale contrast normalization with double-border indicators (`3px double #000000`) for critical alerts.
* **Enhanced Geometric Pattern Markers (`body.cb-patterns`):**
  * **Completed Actions:** Prefixed with `✓ ` checkmark icon.
  * **Pending Routines:** Prefixed with `⏱ ` stopwatch icon.
  * **Critical Alerts & Overdue Reminders:** Prefixed with `⚠️ ` warning triangle and 8px left indicator bar.
  * **Matched Mind Game Pairs:** Stamped with `★ ` star insignia.

### 2.2 Typography & Legibility Baselines
* **Heading Typography:** *Plus Jakarta Sans* / *Atkinson Hyperlegible*
* **Body Typography:** *Atkinson Hyperlegible* — specifically designed by the Braille Institute to maximize character distinction (e.g., distinguishing 'I', 'l', and '1').
* **Monospace Typography:** *JetBrains Mono* (used for timestamps, clinical codes, and raw evidence).
* **Senior Font Scaling Engine:**
  * **Normal:** 20pt base floor (exceeds standard 16px web baselines).
  * **Large:** 24pt (+20% scale for aging vision).
  * **Extra Large:** 28pt (+40% scale for low vision).

### 2.3 Touch Hitboxes & Ergonomics
* **Minimum Hitbox:** `56px × 56px` across all interactive elements.
* **Primary Patient Actions:** `64px–72px` vertical height with high-contrast text and prominent leading icons.

### 2.4 Mobile & Phone Screen Responsiveness
* **Fluid Layout Containers:** Automatic padding and width normalization (`width: 100%; box-sizing: border-box`) preventing horizontal overflow on phone viewports (360px–430px).
* **Vertical Stacking of Patient Action Cards:** Secondary action cards (Games, Mood, Calls) and attention takeover actions smoothly transition to vertical column layouts with full-width action buttons for thumb ergonomics.
* **Scrollable Caregiver & Clinical Tab Bars:** Horizontal touch scrolling (`overflow-x: auto; -webkit-overflow-scrolling: touch`) for role navigation and panel tabs on compact phone viewports.
* **Responsive Modals:** Centered dialogs with max 94vh height and adaptive padding to fit comfortably within phone dimensions.

---

## 3. Screen-by-Screen UI/UX Specifications

### 3.1 Role Selection Gateway (`#view-login`)
* **Header:** Recollect logo, language selector, network simulation pill, low-power toggle, and demo credentials hint.
* **Three Segregated Profile Cards:**
  1. **Senior Patient Space (Eleanor Vance):** Large 1-tap green action button (*"Tap Here to Enter"*). Requires zero passwords or PINs.
  2. **Family Caregiver Portal (Sarah Vance):** PIN-protected card (`1234` default demo PIN).
  3. **Clinical & Community Health Hub (Dr. Thorne & Anita Roy):** Passcode-protected card (`9999` default demo passcode).

```
+-------------------------------------------------------------------------+
| [Recollect]                       [🌐 Language] [📶 Online] [⚡ Normal] |
+-------------------------------------------------------------------------+
|                                                                         |
|                          Welcome to Recollect                           |
|        Please select your profile to enter your dedicated dashboard     |
|                                                                         |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | 👵 Senior Space    |  | 👩 Family Caregiver|  | 🩺 Clinical Hub    | |
|  | Eleanor Vance      |  | Sarah Vance        |  | Dr. Thorne / Anita | |
|  | Large text & audio |  | Live sync & trends |  | Telemetry & reports| |
|  |                    |  | PIN: [••••] (1234) |  | Passcode: [••••]   | |
|  | [ Tap to Enter ]   |  | [ Log In ]         |  | [ Log In ]         | |
|  +--------------------+  +--------------------+  +--------------------+ |
+-------------------------------------------------------------------------+
```

### 3.2 Senior Patient Space (Bedside Tablet Mode, `#view-patient`)
* **Dynamic Orientation Bar:**
  * Greeting computed by device hour (*"Good Morning, Eleanor!"*, *"সুপ্ৰভাত"*, *"সুপ্রভাত"*, *"Khublei step"*, *"शुभ प्रभात"*).
  * Regional calendar date formatted via `getFormattedDate()`.
  * Contextual weather status (Morning Sunshine 24°C, Afternoon Breeze 27°C, Twilight 22°C, Quiet Night 19°C).
  * **Patient-Side Score Badge (`#patientHomeScorePill`)**: Displays accumulated Garden Stars and blooming level (e.g., `⭐ Garden Stars: 12 • 🌻 Sunflower Champion`).
  * **"🔊 Listen to your day"**: Spoken briefing with pentatonic chime fallback.
  * **"Aa Text Size"**: Quick-cycle font size button (Normal -> Large -> Extra Large).
  * **"🚨 Call Help"**: High-contrast emergency quick call.
* **Prominent Next-Due Routine Card:**
  * Visual pill icon, pill shape and imprint specification (*"Yellow Oval V 42 (Lisinopril 10mg)"*).
  * Water requirement badge (*"1 Full Glass of cool water"*).
  * Prominent **"✓ I took my medicine"** action button.
* **Action Tiles Grid:**
  * **"🌸 Play a Game"**: Opens the Mind Games Hub.
  * **"😊 How I am Feeling Today"**: Opens the 4-face visual mood check-in.
  * **"📞 Call Sarah"**: Launches the simulated family audio call.
* **Visual Timeline Checklist:**
  * Chronological stream of daily routines with completed, due now, and upcoming status badges.

### 3.3 Senior Modal Overlays

#### Full-Screen Reminder Takeover (`#reminderAttentionModal`)
* Full-screen high-focus overlay triggered during medication windows.
* Centered SVG illustration of the pill and cool water glass.
* Simulated voice listening indicator (*"Listening for 'Done'..."*).
* **Three Vertically Stacked Actions:**
  1. **"✓ Done" (I took my medicine):** Confirms adherence, updates records, and clears overdue banners.
  2. **"⏰ Remind me in 10 minutes":** Snoozes the alert gently.
  3. **"🤝 Need help from Sarah":** Dispatches an instant caregiver notification.

#### Full-Screen Cognitive Game Takeover (`#gameModal`)
* **Full-Screen Canvas (`100vw` × `100vh`):** Replaces cramped dialog overlays with an edge-to-edge calming environment optimized for senior tablet ergonomics ($\ge 64\text{px}$ targets).
* **Top Navigation & Live Score Header:**
  * Category Icon Badge (`🌸`, `🔍`, `🗣️`, `🧩`, `🧺`, `🍃`) and localized Game Title.
  * Peace banner: *"🌿 No Timers, Ever • Take all your time, Eleanor"*.
  * **Live Patient Score Badge:** Shows persistent Garden Stars (⭐) and session points (e.g., `⭐ Garden Stars: 12 | Score: 95 pts • 🌻 Blooming`).
  * Localized TTS Instruction button (*"🔊 Read Instructions"*).
  * Prominent Senior Exit button (*"✕ Pause & Rest"*).
* **Six Distinct Game Canvas Architectures:**
  1. **Memory (Photo Match):** 2×4 responsive grid with card-flip physics and pair matching across Family Photos or Northeast Cultural Heritage packs.
  2. **Attention (Garden Flower Focus):** Spotlight target banner (*"Spot and tap all 3 blooming Sunflowers 🌻"*) above a 10-flower garden bed grid. Target flowers lock with glowing green halos upon touch; non-targets receive gentle reassurance.
  3. **Language (Word & Object Recall):** Object clue card with everyday prompts (e.g., *"What do we use to enjoy our warm morning tea?"*) and 4 large illustrated option cards across 3 progressive rounds.
  4. **Problem Solving (Daily Routine Steps):** 4 numbered sequence slots (Steps 1 to 4) paired with 4 shuffled daily routine cards. Senior taps cards in chronological order to lock them into their routine slots.
  5. **Harvest Count (Numeracy & Visual Discrimination):** Wicker garden basket holding 3–5 items (apples, marigolds, teacups, strawberries, oranges) across 3 progressive rounds, paired with 3 large tactile number choice buttons. Hint reveals item counting numbers and pulses the matching choice.
  6. **Nature Harmony (Odd-One-Out / Semantic Classification):** 4 tactile cards with 3 matching theme items and 1 distinct odd-one-out item (flowers vs teapot, fruits vs lantern, birds vs hat) across 3 progressive rounds. Hint illuminates the odd item with a warm golden pulse.
* **Bottom Controls & Blooming Progress:**
  * Context-aware **"💡 Give Me a Gentle Hint"** button (reveals pairs, pulses target blooms, highlights correct cards, numbers basket items, or pulses odd-one-out without penalties).
  * Garden Progress Dots: Visual blooming progression (🌱 -> 🌻).
  * **"⏸️ Pause & Rest Anytime"** exit button.
* **Celebratory Completion Screen (`#gameCompleteModal`):**
  * Displays warm celebratory feedback, awarded Garden Stars (e.g., `⭐ +5 Garden Stars Bloomed!`), session score, and gentle return to home.

#### Mood Check-In Modal (`#moodModal`)
* Four large visual mood faces: ☀️ *Joyful*, 🌸 *Peaceful*, 🛋️ *Tired*, 🤝 *Need Support*.
* Caregiver-assisted checkbox for observations recorded on Eleanor's behalf.

#### Simulated Audio Call Modal (`#audioCallModal`)
* Pulsing animated call icon, ringing status (*"Calling Sarah Vance..."* -> *"Connected"*), live elapsed timer (`MM:SS`), and *"🔴 End Call"* button.

#### Emergency Escalation Modal (`#emergencyModal`)
* Urgent red header with immediate three-tier escalation status:
  1. Primary Daughter (Sarah Vance) — Notified immediately.
  2. Secondary Sibling (Priya Vance) — Standby queue.
  3. National Emergency Helpline (**112**) — Direct phone dialer link.

---

### 3.4 Family Caregiver Portal (Sarah's Hub, `#view-caregiver`)
* **Hero Status Bar:**
  * Eleanor's live location and pairing status (*"Active in Living Room • Bedside Tablet Paired"*).
  * **Hub Sync Badge:** Real-time sync timestamp (e.g., *"Live Hub Sync: 9:02 AM"*).
  * Quick action buttons: *"➕ Add Reminder"*, *"📞 Call Eleanor"*, and *"🚨 Emergency Quick Call"*.
* **Overdue Routine Alert Banner:**
  * Displays only when critical morning medication is unconfirmed past the 5-minute escalation target window.
  * Three instant actions: *Call Eleanor's Tablet*, *Mark Taken by Caregiver*, and *Test SMS/USSD Fallback*.
* **Tab 1: Today's Visual Schedule Checklist:**
  * Interactive checklist showing all daily routines.
  * **"➕ Add Task" Button:** Modal authoring custom reminders with priority tiers.
  * **Done / Undo Controls:** Allows caregivers to manually check off tasks or revert accidental check-offs.
  * **Delete Button ("✕"):** Deletes custom routines.
* **Tab 2: Trends & Longitudinal Analytics:**
  * Timeframe selectors: **Daily**, **Weekly**, **Monthly**, and **Quarterly**.
  * Reactive SVG chart rendering Adherence Rate (green polyline) and Composite Cognitive Score (blue dashed polyline).
  * Expandable **Notable Activity Observations** accordion exposing underlying raw timestamps, latency figures, and clinical recommendations.
  * Mandatory non-diagnostic advisory footnote.
* **Tab 3: Family Memory Journal:**
  * Rich text observation entry with emotional tags (✨ *Cognitive Spark*, 🌿 *Calm & Engaged*, 🛋️ *A Bit Tired*, ❓ *Mild Confusion*).
  * Preserved chronologically for Dr. Thorne's clinical report.
* **Tab 4: Care Team & Messaging:**
  * Care circle contact cards with *"➕ Add Member"* dialog.
  * Shared shift hand-off log supporting Sarah, Priya, and Anita Roy (ASHA).
  * Dual-channel chat threads (**Dr. Robert Thorne** and **Anita Roy ASHA**) with realistic automated clinical replies.
* **Tab 5: Alert Escalation Preferences:**
  * Push alerts toggle, SMS fallback toggle, unacknowledged window selector (30/45/60 min), and batch routine digest toggle.

---

### 3.5 Clinical & Community Health Hub (`#view-clinical`)
* **Mandatory Clinical Advisory Notice:** Prominently framed at the top of all views.
* **Tab 1: Doctor Standard Portal:**
  * Metric Cards: Composite Weekly Score (0–100), Routine Adherence (%), Memory Game Accuracy (%), Active Flags Count.
  * **Explainable Behavior Flags Stack:** Displays flags generated by `RuleEngine` with raw evidence and clinician review controls (**"✓ Confirm Concern"**, **"✕ Dismiss as Noise"**, **"📝 Add Clinical Note"**).
  * **Clinical Insight Panel:** Longitudinal observational trends.
  * **Telemedicine Handoff:** Formatted Ayushman Bharat ABHA referral packet generator and DPDP/GDPR JSON data bundle export.
* **Tab 2: ASHA & ANM Simplified Mobile Action View:**
  * Designed specifically for rural field workers with low-resolution mobile screens.
  * High-visibility green/amber action cue (*"Weekly Status: Adherence 94% • Recommended action: Routine weekly check-in"*).
  * Field inspection checklist (Pillbox storage, Bedside water, Family language comfort).
  * **"✍️ Log Completed Home Visit Check"** button logging formal inspections.
* **Tab 3: Structured Weekly Clinical PDF Report:**
  * Standardized 7-section medical document.
  * Threaded physician clinical reply box transmitting notes directly to Sarah's dashboard.
  * **"🖨️ Print / Save PDF"** button triggering clean print stylesheets.

---

### 3.6 Caregiver Settings & Theme Management Modal (`#caregiverSettingsModal`)
* **PIN Gate (`#settingsPinGate`):** Enforces caregiver PIN `1234` before visual appearance controls are unlocked.
* **Dark Mode & Scheduling Controls:**
  * Manual Dark Mode toggle.
  * **"Schedule Dark Mode Automatically"** toggle with custom Start (default `20:00`) and End (default `07:00`) time inputs.
  * Live status badge (*"Active Now (Scheduled)"* / *"Scheduled"*).
* **High-Contrast & Scheduling Controls:**
  * Manual High-Contrast toggle (WCAG AAA black-and-white).
  * **"Schedule High-Contrast Mode Automatically"** toggle with custom Start (`18:00`) and End (`21:00`) time inputs.
* **Senior Font Scaling Selector:** Normal (20pt), Large (24pt), Extra Large (28pt).
* **Voice Narration & Low-Power Toggles.**
* **Regional Language Dropdown:** 5 Northeast India regional languages.
* **Shared Device Profile Switcher:** Seamless switching to Patient Space, Caregiver Portal, or Clinical Hub.
* **Four-Step Consent & Privacy Framework Modal:** Identity, local storage, distinct AI pattern opt-in, and plain-language companion explanation.

---

## 4. Prototype Implementation vs. Production UX Boundaries

| Feature Area | Prototype Implementation (Running Code) | Feasible Prototype Extensions | Production Mobile/Cloud Scale |
|---|---|---|---|
| **Form Factor** | Responsive CSS Grid/Flexbox for 10-inch tablets & desktops | Dedicated mobile viewport simulator | Dedicated iOS/Android native applications |
| **Audio Playback** | Web Speech API synthesis + Web Audio API pentatonic chimes | Pre-recorded native audio asset bundles | Offline on-device neural TTS models |
| **Voice Calling** | In-browser simulated overlay with timer & pulse | WebRTC audio peer-to-peer connection | Native cellular dialing / Twilio Voice |
| **SMS Alerts** | In-app notification & simulated SMS fallback | Web Push API browser notifications | Production Twilio / CDAC National SMS Gateway |
| **Print / PDF** | Native `@media print` browser-to-PDF layout | Client-side jsPDF rendering engine | Automated scheduled background PDF generation |
| **Theme Scheduling** | In-app 30-second clock loop in `app.js` | Web Worker background clock timer | Native Android `AlarmManager` / iOS Background Tasks |
