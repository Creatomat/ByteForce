# Recollect — Context Handoff & Session Transition Guide

> **Document Type:** Context Persistence & State Snapshot  
> **Repository:** `recollect/ByteForce`  
> **Active Git Branch:** `main`  
> **Last Synchronized:** 2026-09-07  
> **Target Audience:** Next AI Agent / Developer starting in a fresh conversation.

---

## 1. Executive Summary & Purpose

This document captures the complete architectural, functional, and operational context of the **Recollect** cognitive care platform. Use this document at the start of a new chat session to continue engineering without losing historical context or architectural alignment.

---

## 2. Project Overview & Technology Stack

- **Platform Name:** Recollect
- **Mission:** A dignified, biophilic, cognitive care and daily routine support platform designed for seniors with Mild Cognitive Impairment (MCI) or early-stage dementia, their family caregivers, and community clinical teams (ASHA workers and physicians) in Northeast India.
- **Root Directory:** `/home/creatomat/Desktop/projects/recollect/ByteForce`
- **Core Engineering Philosophy:**
  - **Zero Build Dependencies:** Pure semantic HTML5, CSS3 variables, and vanilla ES6+ modules. No Node.js, Webpack, Vite, React, or npm build steps. The app runs directly in any modern browser and deploys statically to GitHub Pages (supported by `.nojekyll`).
  - **Local-First / Offline-First:** All clinical telemetry, routine logs, mood check-ins, and game sessions persist locally in `localStorage` via [`js/db.js`](file:///home/creatomat/Desktop/projects/recollect/ByteForce/js/db.js). Sync queue handles online/offline transitions gracefully.
  - **Calm Over Clever Senior UX:** Zero countdown timers, zero penalty buzzers, zero red error states on the senior interface. Generous touch targets ($\ge 64\text{px}$) and large typography ($\ge 20\text{pt}$).

---

## 3. Architecture & File Inventory

```
ByteForce/
├── index.html              # Single Page Application (Patient Space, Caregiver Portal, Clinical Hub)
├── css/
│   └── styles.css          # Biophilic Light, Dark Mode, High Contrast (WCAG AAA), 3-tier font scaling
├── js/
│   ├── app.js              # Central application controller (RecollectApp) & game engines
│   ├── db.js               # RecollectDB local storage layer, seeded data, append-only logs
│   ├── i18n.js             # 5 regional languages (en, as, bn, kha, hi), TTS narration, chime fallback
│   └── ruleEngine.js       # Deterministic Phase-1 clinical rule evaluation & score calculation
├── docs/
│   ├── architecture.md     # System architecture, schemas, and runtime loops
│   ├── context_handoff.md  # THIS DOCUMENT: Full context snapshot for new conversations
│   ├── design.md           # UI/UX design specifications, color palettes, and component layouts
│   ├── features.md         # Comprehensive feature catalog by role and module
│   ├── instructions.md     # MANDATORY: 6-layer developer maintenance checklist
│   ├── prd.md              # Product requirements document conforming to running prototype
│   ├── rules.md            # Binding clinical safety, non-diagnostic framing, and architectural rules
│   ├── user_manual.md      # User operating manual for patients, caregivers, and doctors
│   └── temp/               # Archive of legacy original planning documents
├── sw.js                   # Service Worker for PWA caching and offline support
├── manifest.json           # Web App Manifest for tablet bedside installation
├── LICENSE                 # GNU General Public License v3.0 (ByteForce & creatomat)
└── README.md               # Project overview and technical documentation index
```

---

## 4. User Roles & Credentials

| Role | Persona | Access Method | Storage ID | Responsibilities |
|---|---|---|---|---|
| **Senior Patient** | Eleanor Vance (76) | 1-tap PIN-less bedside tablet | `p_eleanor_vance_001` | Time orientation, scheduled medication, 4 cognitive games, mood check-in, family speed dial, emergency call. |
| **Family Caregiver** | Sarah Vance (Daughter) | PIN: `1234` | `cg_sarah_vance_001` | Today's routine checklist, custom task authoring, longitudinal trend charts, memory journal, care team messaging, alert escalation rules, theme scheduling. |
| **Clinical Lead** | Dr. Thorne / Anita Roy (ASHA) | Passcode: `9999` | `dr_thorne_001` | Objective telemetry review, behavior flags (hesitation, missed streaks, score drop), ASHA home visit checkpoints, Ayushman Bharat telemedicine packet, printable clinical PDF. |

---

## 5. Completed Work & Current State

1. **Four Distinct Cognitive Game Engines (`js/app.js`)**:
   - **Memory (`memory`)**: Photo Match (6 cards / 3 pairs) with swappable *Family Photo Pack* and *Northeast Cultural Heritage Pack*.
   - **Attention (`attention`)**: Garden Flower Focus (visual search for 3 target flowers in a 10-flower bed).
   - **Language (`language`)**: Word & Everyday Object Recall (3 rounds of functional object clues and illustrated options).
   - **Problem Solving (`problem`)**: Daily Routine Steps (arranging 4 chronological steps into sequential slots).
2. **Full-Screen Immersion**:
   - Fixed edge-to-edge takeover (`100vw` $\times$ `100vh`, `z-index: 2100`) with no distracting navigation and prominent "Pause & Rest" exit controls.
3. **Encouraging Patient Score & Silent Telemetry**:
   - Patient sees friendly Garden Stars ⭐ and Bloom Stages (🌱 *Sprout* $\rightarrow$ 🌿 *Budding Green* $\rightarrow$ 🌼 *Blooming Daisy* $\rightarrow$ 🌻 *Sunflower Champion*) with a minimum score floor of 75/100.
   - Silently streams clinical telemetry (`hesitation_avg_ms`, `accuracy`, `mistake_count`, `duration_seconds`) to `recollectDB`, caregiver activity logs, and doctor telemetry cards.
4. **Complete Localization of Runtime Strings (594 Keys Total, 100% Parity)**:
   - Added audio transcript keys across all 5 languages (**594 keys total per language, 100% parity**): `briefing_morning_pending`, `briefing_morning_completed`, `voice_preview_sample`.
   - Eliminated all hardcoded English strings in `js/app.js`: all ~50 `showToast()` calls, dialog `prompt()` and `alert()` calls, `speakText()` prompts, game feedback banners, card peek labels, and routine instructions dynamically resolve through `window.i18n.t()`.
5. **Studio Neural Audio & Biophilic Sound Effects Integration (`audio/tts/`, `js/i18n.js`, `js/app.js`)**:
   - **45 Pre-recorded Studio MP3 Audio Files (`9 prompts` $\times$ `5 languages`)**: Replaced robotic speech synthesis with natural, calming regional studio voice recordings:
     1. `briefing_morning_pending`: Bedside tablet morning briefing when medication is pending.
     2. `briefing_morning_completed`: Bedside tablet morning briefing when medication has been taken.
     3. `tts_med_morning_prompt`: Full Attention Takeover morning medicine reminder.
     4. `tts_med_morning_congrat`: "I took my medicine" confirmation celebration voice.
     5. `tts_instruction_memory`: Memory photo match game instructions audio.
     6. `tts_instruction_attention`: Garden flower attention game instructions audio.
     7. `tts_instruction_language`: Everyday object language game instructions audio.
     8. `tts_instruction_problem`: Daily routine sequencing problem-solving game instructions audio.
     9. `voice_preview_sample`: Soothing voice sample preview on language switch and voice mode toggle.
   - **Biophilic Web Audio SFX (0 external bytes, zero latency, offline-first)**:
     - `playPillConfirmSound()`: Gentle 3-note major triad chime (C5-E5-G5) on medicine acknowledgment.
     - `playCardFlipSound()`: Organic acoustic woodblock/soft tap (~320Hz) on card peek and option selection.
     - `playMatchSuccessSound()`: Warm harmonic sparkle bell (E5-B5-E6) on pair match, target flower find, and routine step placement.
     - `playGameCompleteSound()`: Calm 4-note ascending chord progression (C5-G5-C6-E6) upon completing games.
     - `playAttentionChime()`: Resonant singing bowl chime (~440Hz) when the reminder takeover appears.
     - `playSoftTap()`: Tactile biophilic click for mood check-in and brand home navigation.
   - **Zero UI Layout Changes**: Exact visual layout, button positions, and CSS styles preserved.
   - **PWA Cache (`sw.js`)**: Bumped to `recollect-cache-v3` with automatic caching of audio assets.
6. **Theming, Scaling & Accessibility**:
   - Triple Theme Support: Biophilic Light Theme, Dark Mode (`body.dark-mode`), High Contrast Mode (`body.high-contrast-mode`, WCAG AAA).
   - 3-Tier Font Scaling: Standard (20pt), Large (24pt), Extra Large (28pt).
   - 5 Regional Languages: English (`en`), Assamese (`as`), Bengali (`bn`), Khasi (`kha`), Hindi (`hi`).
   - Password-gated theme scheduler evaluating every 30 seconds.

---

## 6. Known Backlog & Next Steps

When continuing in a new conversation, these items are pre-analyzed and ready for execution:

### Priority 2: Khasi (`kha`) Translation Quality Enhancement
- In [`js/i18n.js`](file:///home/creatomat/Desktop/projects/recollect/ByteForce/js/i18n.js), ~35 keys in the `kha` block retain verbatim English text (e.g. `brand_title`, `role_senior_space`, `role_clinical_title`, `net_online`, `net_offline`, `power_normal`, `power_low`, `btn_cg_settings`, `btn_cancel`, `btn_refresh`, `chart_legend_adherence`, `chart_legend_score`, `flags_title`, `insight_title`, `telemed_title`, `high_contrast`, `emerg_modal_title`).
- **Action:** Replace these English placeholders with authentic Khasi translations or transliterations.

### Priority 3: Dead Key Alias Pruning
- [`js/i18n.js`](file:///home/creatomat/Desktop/projects/recollect/ByteForce/js/i18n.js) contains ~50 duplicate key pairs from legacy refactors (e.g., `overdue_title` vs `cg_overdue_title`, `checklist_title` vs `cg_today_checklist_title`, `btn_add_task` vs `cg_btn_add_task`).
- The HTML uses the newer `cg_` prefixed keys; the older keys are dead code.
- **Action:** Prune unused legacy keys from all 5 language dictionaries to streamline maintenance.

---

## 7. Mandatory Engineering Invariants

Refer to [docs/instructions.md](file:///home/creatomat/Desktop/projects/recollect/ByteForce/docs/instructions.md) before making any code modifications. Key rules:
1. **5-Language Parity:** Every new key must be defined in `en`, `as`, `bn`, `kha`, and `hi`. Never introduce unlocalized strings.
2. **Triple Theme Verification:** Every UI element must support Default Light, Dark Mode, and High Contrast Mode.
3. **Cross-Role Telemetry:** Patient actions must always synchronize with caregiver logs and clinical rules.
4. **Shell Execution:** On this Linux system, shell commands run via `run_command` require `BypassSandbox: true`.
5. **Git Operations:** Commit locally to `main`; do not push to remote without explicit user approval.

---

## 8. Quick-Start Prompt for New Conversation

To resume work seamlessly in a new conversation, paste the following prompt:

```markdown
Hello! I am continuing work on the Recollect project in `/home/creatomat/Desktop/projects/recollect/ByteForce`.
Please read `docs/context_handoff.md` and `docs/instructions.md` to ground yourself in the current codebase state.

Let's address Priority 2 from the localization audit:
- Review and replace the ~35 English placeholder keys in the Khasi (`kha`) block in `js/i18n.js` with authentic Khasi translations.
- Verify 100% key parity and delimiter balance across all 5 languages.
```
