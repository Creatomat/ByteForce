# Recollect — Cognitive Care, Routine Support & Monitoring Platform

> **ByteForce** • Smart India Hackathon 2026  
> Licensed under GNU General Public License v3.0 (GPL-3.0) to **ByteForce** and **Creatomat**.

Recollect is an offline-first, privacy-preserving assistive care platform designed to support seniors living with early-stage cognitive impairment (Mild Cognitive Impairment / Phase-1 dementia), their family caregivers, and rural/district healthcare teams.

Built with a **"calm over clever"** philosophy, the system enforces single-decision interfaces for patients while streaming real-time behavioral telemetry, adherence tracking, and clinical observations to family members and healthcare workers.

---

## Key Highlights & Core Features

### 1. Three Segregated Dashboard Modes
Recollect strictly isolates interfaces into three role-tailored spaces accessible via PIN protection (`1234` demo PIN):
* **Senior Patient Space (Bedside Tablet Mode)**: Designed for high legibility and minimal cognitive load. Features single prominent reminder cards, one decision per screen, dynamic orientation anchors (time of day, localized weather, date), reassuring voice narration, and quick-action calling.
* **Family Caregiver Portal (Sarah's Hub)**: Real-time oversight dashboard with live tablet sync, interactive visual schedule checklist (Done/Undo, task authoring), overdue medication alert banners with SMS/USSD fallback, family memory journal, care circle directory, and shift hand-off logs.
* **Clinical & Community Health Hub (Dr. Thorne & ASHA Lead)**: Decision-support telemetry featuring non-diagnostic behavioral variance tracking, explainable Phase-1 rule engine flags, Ayushman Bharat Digital Health telemedicine referral generation, a simplified mobile action view for ASHA/ANM workers, and a printable weekly clinical PDF report.

### 2. Universal Regional Localization (Northeast India Focus)
* **5 Supported Languages**: Fully localized into **English (`en`)**, **Assamese (`as`)**, **Bengali (`bn`)**, **Khasi (`kha`)**, and **Hindi (`hi`)**.
* **Comprehensive DOM Binding**: Over 435 dictionary keys mapped via `data-i18n`, `data-i18n-placeholder`, `data-i18n-title`, and `data-i18n-aria`.
* **Dynamic Time & Orientation**: Automatically computes localized greetings (*"Good Morning"*, *"সুপ্ৰভাত"*, *"সুপ্রভাত"*, *"Khublei step"*, *"शुभ प्रभात"*), time-of-day weather descriptions, and regional date formatting (`getFormattedDate()`).
* **Synchronized Selectors**: Header and settings language selectors remain synchronized across role transitions.

### 3. Senior-Centric Accessibility, Themes & Automated Scheduling
* **Dark Mode (Calm Night Theme)**: Deep slate palette reducing glare and ocular fatigue for seniors during evening and night hours.
* **High-Contrast Theme**: WCAG AAA stark black-on-white mode eliminating decorative distractions for seniors with visual impairments.
* **Password/PIN-Guarded Management**: Both Dark Mode and High-Contrast settings are securely locked inside the Caregiver Settings panel (PIN `1234`), preventing seniors from accidentally misconfiguring themes from the bedside tablet.
* **Automated Mode Scheduling**: Caregivers can set dedicated time windows for both Dark Mode (e.g., 20:00 to 07:00) and High-Contrast Mode. The platform automatically evaluates local device time every 30 seconds and seamlessly activates the scheduled theme.
* **3-Level Text Scaling**:
  * **Normal**: 20pt floor (exceeds standard web accessibility baselines)
  * **Large**: 24pt (+20% scale)
  * **Extra Large**: 28pt (+40% scale for low vision)
* **Low-Power & Reduced Animation Mode**: Disables motion and minimizes background polling to maximize device battery life on low-spec hardware.

### 4. Smart Reminders & Routine Scheduling
* **Full-Screen Attention Takeover**: When medication is due, the tablet presents a full-screen card with high-contrast photographic pill specifications (shape, color, imprint) and water glass indicators.
* **Two-Way Cross-Role Synchronization**: Confirming a pill on the tablet logs an entry in `ReminderLog`, dismisses the caregiver overdue banner, increments adherence metrics, and appends a timestamp to the caregiver activity stream.
* **Interactive Visual Checklist**: Caregivers can dynamically author new routine tasks, mark items as Done or Undo, and delete custom tasks while preserving baseline schedule anchors.

### 5. Stress-Free Cognitive Mind Games (4 Distinct Engines in Full-Screen)
* **Full-Screen Immersion**: Games launch into a dedicated full-screen takeover view (`100vw` × `100vh`), maximizing tablet screen space for seniors with large touch targets, high contrast, and a prominent "Pause & Rest" button.
* **4 Distinct Game Engines**:
  1. **Memory**: Family Photo & Northeast Cultural Heritage Match (card flip pair recall).
  2. **Attention**: Garden Flower Focus (calming visual search and target flower spotting among garden blooms).
  3. **Language**: Word & Everyday Object Recall (identifying familiar everyday objects and connecting questions to illustrations).
  4. **Problem Solving**: Daily Routine Steps (arranging morning and evening routine steps in chronological order).
* **Patient-Side Score Tracker**: Encouraging, non-punitive tracking featuring Garden Stars (⭐), session scores, and blooming stages (🌱 Sprout -> 🌻 Sunflower Champion) on Eleanor's tablet, celebrating achievements without anxiety.
* **Passive Clinical Telemetry**: Silently streams decision hesitation latency (ms), accuracy, and completion duration in `GameSession`, synchronizing directly with the Doctor's Clinical Hub and Caregiver Trends.
* **Universal Localization & Audio**: Full translation across 5 regional languages with context-aware "Give Me a Gentle Hint" and spoken audio instructions.

### 6. Voice Narration, Melodic Audio & Calling
* **Speech Synthesis Backend**: Localized text-to-speech using `SpeechSynthesisUtterance` configured with senior-friendly calm pacing (`rate = 0.85`, `pitch = 1.05`) and targeted BCP-47 voices (`en-IN`, `as-IN`, `bn-IN`, `kha-IN`, `hi-IN`).
* **Web Audio API Melodic Chime Fallback**: If speech voices are unavailable or the device is offline, a calming pentatonic chime progression (C4–C5) plays automatically via `AudioContext`.
* **Simulated Audio Calling**: Interactive calling dialog for *"Call Sarah"* and *"Call Eleanor"* with realistic connection status, pulse animation, and call timer.
* **Urgent Care Emergency Escalation**: One-tap emergency escalation displaying instant primary contact dispatch, secondary standby escalation, and integration with the 112 National Emergency Helpline.

---

## Technical Architecture

* **Zero Build Dependencies**: Native HTML5, modern vanilla CSS3 (CSS custom properties, flexbox/grid), and ES6+ JavaScript modules. Runs directly in any modern browser without npm/webpack compilation.
* **Offline-First Storage**: Powered by `RecollectDB` (`localStorage`), allowing full functionality in remote areas with zero network connectivity. Includes sync queue processing when reconnecting.
* **Progressive Web App (PWA)**: Includes `sw.js` (Service Worker) with cache-first static asset delivery, an offline fallback, and `.nojekyll` configuration for direct GitHub Pages deployment.
* **Explainable Clinical Rule Engine**: Deterministic rule triggers (e.g. `routine_latency_streak`, `sundowning_variance`) compute transparent, human-readable evidence traceable directly to raw interaction logs.

---

## Getting Started

### Local Setup
Clone the repository and serve it using any static HTTP server:

```bash
git clone https://github.com/Creatomat/ByteForce.git
cd ByteForce

# Using Python 3
python3 -m http.server 8000
```

Open `http://localhost:8000` in your web browser.

### Demo Credentials
* **Senior Patient Space**: Direct 1-tap entry as Eleanor Vance (no password required).
* **Family Caregiver Portal**: PIN `1234`
* **Clinical & Community Health Hub**: Passcode `9999`

---

## Documentation

* **[Context Handoff & Session Continuity](docs/context_handoff.md)**: Snapshot of current codebase state, active branch, feature inventory, remaining backlog, and instructions for continuing in a fresh session.
* **[Feature Lifecycle & Maintenance Instructions](docs/instructions.md)**: Mandatory developer checklist covering markup, styles, state, database, 5-language localization, and documentation requirements whenever features are added, improved, changed, or removed.
* **[Features & Architecture Document](docs/features.md)**: Exhaustive technical and functional breakdown of all platform features across Senior Space, Caregiver Portal, Clinical Hub, Rule Engine, and Localization.
* **[User Manual & Operational Guide](docs/user_manual.md)**: Comprehensive, step-by-step user guide for seniors, family caregivers, and health workers.
* **[Product Requirements Document (PRD)](docs/prd.md)**: Functional and non-functional requirements conforming to the active prototype and production roadmap.
* **[Architecture Document](docs/architecture.md)**: Technical architecture, component specifications, data schemas, and runtime state loops.
* **[UI/UX Design Specification](docs/design.md)**: Screen-by-screen layouts, color systems, typography standards, and touch ergonomics.
* **[Engineering & Safety Rules](docs/rules.md)**: Binding clinical safety, non-diagnostic verbiage, local-first storage, and verification rules.
* **[Historical Design & Planning Archive](docs/temp/)**: Staging archive containing early reference documents and legacy planning notes.

---

## AI Code of Ethics

Generative AI is a companion and productivity tool, not an autonomous replacement for human care. In Recollect, all cognitive telemetry flags are explicitly framed as **observational decision-support markers**, never independent clinical diagnoses. All project source code is architected, tested, and maintained by real engineers with real ideas.

---

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)** — see the [LICENSE](LICENSE) file for details.  
Copyright (C) 2026 **ByteForce** and **Creatomat**.
