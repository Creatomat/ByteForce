# Design System Specification & UI/UX Architecture (`design.md`)

**Project:** Recollect / Memoria — Cognitive Care, Routine Support & Monitoring Platform  
**Target Environments:** Elderly Bedside/Mobile Tablet, Family Caregiver Dashboard, Clinical Care-Team Hub, and Northeast India Rural/Remote Deployment  
**Basis & Inputs:** Stitch Design Export (`memoria_cognitive_care`, `senior_pictorial_routine_medicine_hub`, `role_gateway_profile_selection`, `senior_pictorial_memory_photo_game`, `caregiver_visual_timeline_alerts`), `PRD.md`, `architecture.md`, `rules.md`, `phases.md`  
**Compliance Standard:** WCAG 2.2 Level AAA (Patient UI) / Level AA (Caregiver & Clinical Hubs)  
**Status:** Canonical Design Specification v1.0  

---

## 1. Executive Summary & Design Vision

Recollect (branded in the patient-facing touch experience as **Memoria**) is a specialized care and cognitive support ecosystem engineered for aging seniors experiencing mild cognitive impairment (MCI) or early-to-mid-stage dementia, their primary family caregivers, and community healthcare partners (physicians, geriatricians, and ASHA/ANM community health workers).

The physical and cognitive constraints of memory loss demand an architecture where **recognition permanently replaces recall**, **dignity supersedes clinical sterility**, and **unwavering visual clarity eliminates cognitive anxiety**. Unlike standard healthcare tools that mimic medical charts or child-like consumer games, Recollect treats every screen as a calming, tactile, physical journal.

### Foundational Tenets
1. **Dignity & Non-Infantilizing Respect:** Older adults retain complex life histories. The design rejects condescending childish motifs, high-frequency game animations, harsh buzzing timers, and clinical "failure" states.
2. **Zero-Friction Cognitive Processing:** Interfaces minimize working-memory load. Every routine interaction requires at most **1–2 taps or a single voice prompt**; modal "Are you sure?" confirmation dialogs are banned.
3. **Calm, Reassuring Emotional Tenor:** Amber and biophilic emerald tones replace alarming red error states. The interface never conveys panic, urgency, or deficit.
4. **Resilient Local-First Realism:** Tailored for both connected urban families and remote Northeast Indian districts with intermittent electricity, solar charging, 2G connectivity, and shared family devices.

---

## 2. Token Architecture & Theme Variables

The design system is governed by a strict semantic token hierarchy defined below in YAML and CSS custom property formats.

```yaml
name: Memoria Cognitive Care System
version: 1.0.0
colors:
  surface: '#f7f9ff'
  surface-dim: '#d4dbe4'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4fe'
  surface-container: '#e8eef8'
  surface-container-high: '#e2e9f2'
  surface-container-highest: '#dce3ed'
  on-surface: '#151c23'
  on-surface-variant: '#404943'
  inverse-surface: '#2a3138'
  inverse-on-surface: '#ebf1fb'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary: '#395f94'
  on-secondary: '#ffffff'
  secondary-container: '#9ec2fe'
  on-secondary-container: '#284f83'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#a7c8ff'
  on-secondary-fixed: '#001c3b'
  on-secondary-fixed-variant: '#1e477b'
  tertiary: '#6f3a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#914d00'
  on-tertiary-container: '#ffd1ae'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  background: '#f7f9ff'
  on-background: '#151c23'
  surface-variant: '#dce3ed'

typography:
  display-lg:
    fontFamily: 'Atkinson Hyperlegible Next, -apple-system, sans-serif'
    fontSize: '44px'
    fontWeight: '700'
    lineHeight: '56px'
    letterSpacing: '-0.01em'
  display-lg-mobile:
    fontFamily: 'Atkinson Hyperlegible Next, -apple-system, sans-serif'
    fontSize: '34px'
    fontWeight: '700'
    lineHeight: '44px'
    letterSpacing: '-0.01em'
  headline-lg:
    fontFamily: 'Atkinson Hyperlegible Next, -apple-system, sans-serif'
    fontSize: '32px'
    fontWeight: '700'
    lineHeight: '42px'
  headline-md:
    fontFamily: 'Atkinson Hyperlegible Next, -apple-system, sans-serif'
    fontSize: '26px'
    fontWeight: '600'
    lineHeight: '36px'
  headline-sm:
    fontFamily: 'Atkinson Hyperlegible Next, -apple-system, sans-serif'
    fontSize: '22px'
    fontWeight: '600'
    lineHeight: '32px'
  body-xl:
    fontFamily: 'Atkinson Hyperlegible Next, -apple-system, sans-serif'
    fontSize: '22px'
    fontWeight: '400'
    lineHeight: '34px'
  body-lg:
    fontFamily: 'Atkinson Hyperlegible Next, -apple-system, sans-serif'
    fontSize: '20px'
    fontWeight: '400'
    lineHeight: '32px'
  body-md:
    fontFamily: 'Atkinson Hyperlegible Next, -apple-system, sans-serif'
    fontSize: '18px'
    fontWeight: '400'
    lineHeight: '28px'
  label-lg:
    fontFamily: 'Atkinson Hyperlegible Next, -apple-system, sans-serif'
    fontSize: '18px'
    fontWeight: '700'
    lineHeight: '26px'
    letterSpacing: '0.01em'
  label-md:
    fontFamily: 'Atkinson Hyperlegible Next, -apple-system, sans-serif'
    fontSize: '16px'
    fontWeight: '600'
    lineHeight: '24px'
    letterSpacing: '0.01em'

rounded:
  sm: '0.5rem'      # 8px
  DEFAULT: '1rem'   # 16px
  md: '1.5rem'      # 24px
  lg: '2rem'        # 32px
  xl: '2.5rem'      # 40px
  full: '9999px'    # Pill architecture

spacing:
  space-2xs: '0.25rem'
  space-xs: '0.5rem'
  space-sm: '0.75rem'
  space-md: '1rem'
  space-lg: '1.5rem'
  space-xl: '2rem'
  space-2xl: '3rem'
  space-3xl: '4rem'
  touch-target-min: '3.5rem'        # 56px non-negotiable minimum
  touch-target-comfortable: '4rem'  # 64px recommended target
  gutter-mobile: '1.25rem'
  gutter-desktop: '2.5rem'
  container-max-width: '75rem'
```

---

## 3. Color Strategy & Accessibility

The color palette draws from restorative natural biophilic greens, warm morning sunlight, calm sky periwinkle, and grounding sandstone.

```
+-----------------------------------------------------------------------------+
|                               COLOR TOKENS                                  |
+-----------------------------------------------------------------------------+
| Primary: Deep Forest Sage        | #0F5238 / #2D6A4F (Action, Affirmation)  |
| Primary Container: Soft Mint     | #A8E7C5 / #B1F0CE (Affirmation Backdrops)|
| Secondary: Periwinkle Horizon    | #395F94 / #4A6FA5 (Caregiver/Orientation)|
| Secondary Tint: Sky Mist         | #E8F1F5 / #D5E3FF (Gentle Auditory Pill) |
| Tertiary: Warm Honey Terracotta  | #6F3A00 / #D97706 (Gentle Reminders)     |
| Tertiary Glow: Soft Amber Wash   | #FFDCC3 / #FEF3C7 (Routine Cards)        |
| Neutral Charcoal: Slate Ink      | #151C23 / #1D242B (Body & Headings)      |
| Structural Outline: Soft Border  | #BFC9C1 / #D1CCC0 (Container Definition) |
| Error / Emergency: Ruby Garnet   | #BA1A1A / #93000A (One-Tap Emergency)    |
+-----------------------------------------------------------------------------+
```

### Accessibility Compliance Matrix
- **Text Contrast:** Deep Slate Ink (`#151C23`) on Surface Sand (`#F7F9FF` / `#FFFFFF`) yields a **14.8:1 contrast ratio**, far surpassing WCAG 2.2 AAA requirements (7:1).
- **Interactive Boundaries:** All interactive buttons, pill containers, and cards feature an explicit **1.5px to 2px structural perimeter** (`#BFC9C1` / `#D1CCC0` / `#0F5238`) with a minimum 3:1 contrast against adjacent backgrounds to safeguard patients with cataract degradation or loss of contrast sensitivity.
- **Color Independence:** Visual state is never communicated solely by hue:
  - Completed items feature an explicit checkmark glyph (`check_circle`) and localized text ("Completed").
  - Overdue items pair an amber clock icon (`hourglass_top`), bold text, and tactile border outlines.
  - Active buttons combine high-contrast fill, distinct pill curvature, and left-aligned pictograms.

---

## 4. Typographic Hierarchy & Letterform Architecture

The primary typeface across all digital interfaces is **Atkinson Hyperlegible Next**, developed by the Braille Institute to maximize character distinguishability:
- Unambiguous glyphs: Capital `I` has distinct upper and lower crossbars; numeral `1` has an angled cap and base serifs; lowercase `l` features a curved tail.
- Generous internal counters, open apertures, and exaggerated letterform ascenders.
- Fallbacks: System-native high-legibility sans-serifs (`Roboto`, `Segoe UI`, `-apple-system`).

### Typographic Application Rules
1. **Absolute Minimum Text Size:** Never render any text below **16px** anywhere in the system.
2. **Patient UI Baseline:** All core patient-facing text starts at **18px–22px** (body-lg to body-xl).
3. **Comfortable Vertical Leading:** Line heights are strictly calibrated to **140%–160%** of font size to eliminate line-jumping during eye tracking.
4. **No Decorative Typography:** Italics and thin font weights (<400) are prohibited in patient mode.

---

## 5. Screen Layouts & Component Archetypes (Stitch System)

The design system decomposes into four primary screen paradigms exported in the Stitch UI repository:

### 5.1 Senior Pictorial Routine & Medicine Hub
**File:** `senior_pictorial_routine_medicine_hub/code.html`  
**Purpose:** Bedside or handheld tablet home interface for Eleanor (the senior patient).

```
+-----------------------------------------------------------------------------+
| [Memoria Brand Icon] Memoria        [🚨 Call Help (Emergency Red Pill)]  (Avatar) |
+-----------------------------------------------------------------------------+
| [☀️ Sun Icon] MORNING SUNSHINE • 72° MILD                                    |
| Good Morning, Eleanor!                                                      |
| Thursday, October 24                                                        |
|                                                                             |
| [🔊 Tap to Listen to Your Day] (Full-width Periwinkle Audio Trigger)         |
+-----------------------------------------------------------------------------+
| ╭── GENTLE CURRENT ROUTINE CARD ──────────────────────────────────────────╮ |
| │ [⏰ Right Now] 9:00 AM Routine                                          │ |
| │ Morning Medicine                                                        │ |
| │ Take 1 pill with a full glass of cool water                             │ |
| │                                                                         │ |
| │ [📸 Large Macro Photo: Yellow Pill & Full Glass of Water on Wood Table] │ |
| │                                                                         │ |
| │ ╭───────────────────────╮       ╭───────────────────────╮               │ |
| │ │ [💊 Icon] 1 Pill      │       │ [🥤 Icon] 1 Glass     │               │ |
| │ │ Yellow Oval V 42      │       │ Full of Water         │               │ |
| │ ╰───────────────────────╯       ╰───────────────────────╯               │ |
| │                                                                         │ |
| │ [  ✓  TAP HERE: I TOOK MY MEDICINE  ] (Deep Biophilic Green Button, 64px)│ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
|                                                                             |
| 📅 Your Day Today                                                           |
| ╭─────────────────────────────────────────────────────────────────────────╮ |
| │ 🍽️ Warm Breakfast                       [ ✓ Finished 8:15 AM (Soft Mint) ]│ |
| │ [Photo of Oatmeal & Tea] "Oatmeal & Berry Tea enjoyed"                  │ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
| ╭─────────────────────────────────────────────────────────────────────────╮ |
| │ 🚶 11:30 AM Garden Walk                                  [ Up Next (Blue)]│ |
| │ [Rose Garden] -> [Fresh Air] -> [Sunlight]                              │ |
| │ [ ✓ Tap When Walk is Done ]                                             │ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
|                                                                             |
| ╭── FAMILY CONTACT TILE ──────────────────────────────────────────────────╮ |
| │ [Photo of Sarah] ALWAYS HERE FOR YOU                                    │ |
| │                  Sarah (Daughter) • Available to chat                   │ |
| │ [ 📞 Call Sarah (Daughter) ] (Full-width Forest Sage Pill)              │ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
|                                                                             |
| ╭── REASSURANCE BANNER ───────────────────────────────────────────────────╮ |
| │ 💚 You are doing wonderfully today! Everything is right on track.        │ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
|                                                                             |
| [ ☀️ My Day (Selected Pill) ]           [ 🧩 Photo Games (Unselected Pill) ]|
+-----------------------------------------------------------------------------+
```

**Key Interactions & Rules:**
- Full-screen, high-priority visual presentation (never a small banner).
- One-tap resolution: Tapping "TAP HERE: I TOOK MY MEDICINE" generates an instant local SQLite timestamped write (`ReminderLog`).
- Auditory Narration: Pressing "Tap to Listen to Your Day" plays human-recorded, dialect-appropriate regional voice prompts.

---

### 5.2 Role Gateway & Profile Selection (Shared Household Device)
**File:** `role_gateway_profile_selection/code.html`  
**Purpose:** Household shared-device access mode satisfying PRD FR-9.11 and Phase 4 deployment constraints.

```
+-----------------------------------------------------------------------------+
| [ ← Back ] [Logo] Memoria Role Gateway                      [Profile Icon]  |
| ☀️ Tuesday Morning • Calm & Peaceful                                        |
|                                                                             |
| Welcome to Memoria                                                          |
| Choose who is using this device today.                                      |
|                                                                             |
| ╭── PRIMARY PATIENT SPACE (Elevation Level 2) ────────────────────────────╮ |
| │ [Eleanor Photo] • PRIMARY SPACE                                         │ |
| │                 I am Eleanor                                            │ |
| │                 Daily Routine & Fun Activities                          │ |
| │ ╭─────────────────────────────────────────────────────────────────────╮ │ |
| │ │ 🧘 3 joyful activities and gentle music waiting for you.            │ │ |
| │ ╰─────────────────────────────────────────────────────────────────────╯ │ |
| │ [ 💚 Tap Here to Open My Day ] (Huge Emerald Pill Action, 64px height)  │ │ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
|                                                                             |
| ╭── FAMILY CAREGIVER SPACE ───────────────────────────────────────────────╮ |
| │ [Sarah Photo] Family Caregiver                                          │ |
| │               I am Sarah                                                │ |
| │               Monitor medicine, timeline & daily wellbeing              │ |
| │ [ 🛡️ Open Caregiver Hub ] (Soft Blue Outline Pill)                     │ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
|                                                                             |
| ╭── MEDICAL & CLINICAL GATEWAY (PIN-Gated) ───────────────────────────────╮ |
| │ [Doctor Photo] Medical & Clinic 🔒                                      │ |
| │                Dr. Thorne (Neurologist) / ASHA Lead                     │ |
| │                Weekly cognitive scores, flags & clinical telemetry      │ |
| │ [ 📊 Access Clinical Telemetry 🔑 ] (Muted Steel Button)                │ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
|                                                                             |
| 🔁 You can change profiles anytime from the top corner.                     |
+-----------------------------------------------------------------------------+
```

---

### 5.3 Senior Pictorial Memory Photo Game
**File:** `senior_pictorial_memory_photo_game/code.html`  
**Purpose:** Cognitive stimulation module utilizing personalized family photography (PRD FR-2.1–2.7).

```
+-----------------------------------------------------------------------------+
| [Logo] Memoria               [🚨 Call Help]                  (Eleanor Face) |
+-----------------------------------------------------------------------------+
| 🌸 No Timers, Ever • Take all your time, Eleanor           [🌿 Leaf Motif]  |
|                                                                             |
| [ 🔊 Tap to Hear Instructions (Memoria will read slowly) ]                  |
|                                                                             |
| 💚 You found sweet Lily!                                                    |
| Who is playing with Lily in the sunny garden today?                         |
|                                                                             |
| ╭─────────────────────────╮         ╭─────────────────────────╮             |
| │ ⭐ Matched              │         │                         │             |
| │ [Photo of Lily in dress]│         │      [ 🌸 Flower Icon ] │             |
| │ Lily                    │         │      Tap to Peek        │             |
| │ Granddaughter           │         │      Touch gently 👆    │             |
| ╰─────────────────────────╯         ╰─────────────────────────╯             |
| ╭─────────────────────────╮         ╭─────────────────────────╮             |
| │ 🐾 Buddy                │         │                         │             |
| │ [Photo of Golden Dog]   │         │      [ 🖼️ Photo Icon ]  │             |
| │ Buddy                   │         │      Tap to Peek        │             |
| │ Family Dog 🐶           │         │      Touch gently 👆    │             |
| ╰─────────────────────────╯         ╰─────────────────────────╯             |
|                                                                             |
| [ 💡 Give Me a Gentle Hint ] (Warm Ochre Amber Pill)                        |
|                                                                             |
| Garden Progress: 1 of 4 Blooming                                            |
| (🌻 Found!)      (🌱 Soon)      (🌱 Soon)      (🌱 Soon)                    |
|                                                                             |
| [ ⏸️ Pause & Rest Anytime ] (Your game stays saved right here for you)     |
+-----------------------------------------------------------------------------+
```

**Cognitive Care Safeguards:**
- **No Timers:** Countdown clocks induce anxiety and trigger catastrophic reactions; time is tracked invisibly in background telemetry (`duration_seconds`, `hesitation_avg_ms`).
- **Encouraging Affirmation:** Unsuccessful matches generate gentle reassurance ("Let's check another petal!") rather than harsh buzzers or red crosses.
- **Supportive Non-Diagnostic Tag:** Stamped with: *"Supportive engagement tool, not a clinical therapy or diagnostic device."*

---

### 5.4 Caregiver Visual Timeline & Alerts Hub
**File:** `caregiver_visual_timeline_alerts/code.html`  
**Purpose:** Asynchronous remote oversight dashboard for family members and care teams (PRD FR-4, FR-8).

```
+-----------------------------------------------------------------------------+
| [Logo] Memoria Caregiver • Eleanor: Resting at home          (Sarah Avatar) |
+-----------------------------------------------------------------------------+
| 🗓️ Thursday, October 24               [ 🟢 Live Hub Sync: 9:35 AM ]        |
|    Morning Routine Tracking                                                 |
|                                                                             |
| ╭── PATIENT LIVE CONTEXT ─────────────────────────────────────────────────╮ |
| │ [Eleanor Photo] Eleanor Vance (Mother)                                  │ |
| │                 Active in Living Room • Last pillbox check: 18m ago     │ |
| │                 Home sensor status: Motion detected near reading chair  │ |
| │ [ 📞 Call Eleanor ]                 [ 📍 Safe Zone Map ]                │ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
|                                                                             |
| ╭── GENTLE OVERDUE ALERT BANNER ──────────────────────────────────────────╮ |
| │ 🔔 Gentle Routine Reminder                     [ 35m Overdue (Amber) ]  │ |
| │ [Photo of Yellow Pill on Wood Table]                                    │ |
| │ Morning Blood Pressure Pill                                             │ |
| │ Lisinopril 10mg (Yellow oval tablet marked 'V 42') with full glass      │ |
| │ ⚠️ Smart pillbox lid not yet opened                                     │ |
| │                                                                         │ |
| │ [ 📢 Call Eleanor to Remind ]        [ ✓ Mark Taken by Caretaker ]      │ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
|                                                                             |
| Today's Visual Schedule                                 [ 🔄 Sync Backlog ] |
| Chronological checkpoints with sensor verification                          |
|                                                                             |
|  (✓) 8:15 AM • Breakfast                [ Completed (Mint Badge) ]          |
|   |  Warm Oatmeal & Berry Tea enjoyed                                       |
|   |  Sensor: Kitchen kettle logged at 8:22 AM                               |
|                                                                             |
|  (⏳) 9:00 AM • Blood Pressure Pill      [ Pending / Overdue (Amber) ]       |
|   |  10mg Lisinopril with tall water glass                                  |
|   |  Automated chime played on Eleanor's bedside speaker at 9:00 AM         |
|                                                                             |
|  (🗓️) 11:30 AM • Garden Walk             [ Upcoming (Blue Badge) ]           |
|      Light terrace stroll & bird feeding                                    |
|                                                                             |
| ╭── FAMILY MEMORY JOURNAL & OBSERVATIONS ─────────────────────────────────╮ |
| │ 📝 Caregiver Note by Sarah M.                       Yesterday 7:45 PM   │ |
| │ "Eleanor had bright recall looking at seaside trip photos. She          │ |
| │ remembered the salt water taffy shop and laughed about the sea gulls."  │ |
| │ Tag: [ Cognitive Spark (Mint) ]                                         │ |
| ╰─────────────────────────────────────────────────────────────────────────╯ |
|                                                                             |
| [ 🚶 Eleanor's Bedside Screen ]               [ 🩺 Doctor Portal Link ]     |
+-----------------------------------------------------------------------------+
```

---

## 6. Elevation, Surfaces & Tactile Geometry

| Level | Token / Name | Surface Color | Outline Perimeter | Box Shadow & Depth | Semantic Role |
|---|---|---|---|---|---|
| **0** | `canvas-base` | `#F7F9FF` / `#FBFBFA` | None | None | App foundation & viewport plane |
| **1** | `card-resting` | `#FFFFFF` | 1.5px solid `#DCE3ED` | `0 4px 12px rgba(21, 28, 35, 0.04)` | Routine cards, schedule blocks |
| **2** | `card-active` | `#FFFFFF` | 2px solid `#2D6A4F` | `0 6px 16px rgba(45, 106, 79, 0.08)` | Selected tiles, active routines |
| **3** | `button-press`| `#0F5238` | None (Pill) | `0 3px 8px rgba(15, 82, 56, 0.20)` | Primary actionable triggers (64px) |
| **4** | `modal-scrim` | Scrim `rgba(21,28,35,0.45)` | 2px solid `#151C23` | `0 12px 32px rgba(0, 0, 0, 0.16)` | Pin gateways, emergency calls |

---

## 7. Component Library Specifications

### 7.1 Buttons & Interactive Hitboxes
- **Minimum Hitbox:** `56px × 56px` (`touch-target-min`); all primary patient buttons expand to **`64px` height** (`touch-target-comfortable`).
- **Target Separation:** Minimum **`16px` margin** between clickable containers to prevent tremor-induced mis-taps.
- **Pill Architecture:** `border-radius: 9999px`.
- **Text-Icon Pairing:** Icon-only interactive buttons are banned on patient screens; icons must accompany explicit text labels (e.g., `check_circle` + "TAP HERE: I TOOK MY MEDICINE").

### 7.2 The Orientation Anchor Bar
- Anchored persistently at the screen summit.
- Features: Time of day (e.g., "Morning Sunshine"), ambient temperature ("72° Mild"), full day and date ("Thursday, October 24"), and full patient name.
- Provides immediate environmental grounding to alleviate disorientation upon waking.

### 7.3 Visual Routine Pictogram Cards
- Real-world photographic references (e.g., Eleanor's actual yellow Lisinopril tablet next to a glass of water).
- Eliminates abstract iconography that patients with cognitive decline can no longer translate.

---

## 8. Clinical Copy, Safety Disclaimers & Framing Guardrails

Recollect operates strictly as an assistive and monitoring companion. All copy must conform to the following rules:

### 8.1 Prohibited vs. Approved Language
- ❌ **Banned:** "Dementia score", "Cognitive stage", "Your dementia is declining/improving", "Diagnosis", "Assessment test", "Failure".
- ✅ **Mandatory Framing:** "Pattern observed", "Gentle routine reminder", "Worth discussing with your doctor", "Supporting cognitive engagement", "Maintaining function".

### 8.2 Mandatory In-App Disclaimers
1. **Weekly Composite Score:**  
   > *"This score reflects engagement and activity trends. It is not a medical diagnosis. Please consult your doctor about any concerns."*
2. **Cognitive Games & Memory Photos:**  
   > *"Supportive engagement tool, not a clinical treatment or diagnostic device."*
3. **AI Flags & Anomaly Insights (`BehaviorFlag.evidence`):**  
   > *"AI decision-support observation based on historical routine timing. Consult a qualified clinician for medical evaluation."*

---

## 9. Northeast India Regional UI/UX Adaptations

To satisfy PRD Section 8 and Phases 0–4 deployment requirements:

```
+-----------------------------------------------------------------------------+
|                       NORTHEAST INDIA REGIONAL MATRIX                       |
+-----------------------------------------------------------------------------+
| Languages & Dialects  | Assamese, Bengali, Bodo, Khasi, Garo, Mizo,        |
|                       | Manipuri/Meitei (Meitei Mayek script), Nagamese,    |
|                       | Nepali, Hindi, and English bridge.                  |
+-----------------------+-----------------------------------------------------+
| Human Voice First     | Human-recorded regional native voice prompts        |
|                       | overrule robotic synthetic TTS for all orientations.|
+-----------------------+-----------------------------------------------------+
| Cultural Games        | Personalized photo albums replace Western imagery;   |
|                       | local festivals (Bihu, Wangala, Chapchar Kut),      |
|                       | local fauna, and regional foods.                    |
+-----------------------+-----------------------------------------------------+
| Shared-Device Mode    | Role Gateway allows instant switching between       |
|                       | Patient Space, Family Caregiver, and ASHA Worker.   |
+-----------------------+-----------------------------------------------------+
| Infrastructure Modes  | Low-power mode (suppresses animations & background  |
|                       | polling); SMS/USSD fallback for missed critical meds|
+-----------------------+-----------------------------------------------------+
```

---

## 10. Data Model Mapping to UI States

The user interface components bind directly to the canonical entities defined in `architecture.md`:

```
+---------------------------+-------------------------------+----------------------------------+
| Architecture Entity       | UI Screen / Element           | Captured / Rendered State        |
+---------------------------+-------------------------------+----------------------------------+
| Patient                   | Profile Header & Greeting     | full_name, timezone, care_notes  |
| Caregiver                 | Family Tile & Notes Card      | full_name, role, phone           |
| PatientCaregiverLink      | Permission & Consent Guard    | consent_confirmed_at             |
| GameSession               | Photo Matching Game           | session_id, hesitation_avg_ms,   |
|                           |                               | score, mistake_count             |
| Reminder                  | Schedule Item & Routine Card  | reminder_id, scheduled_time,     |
|                           |                               | label, priority (cloud-auth)     |
| ReminderLog               | Status Badge & Checkpoint     | patient_response ('acknowledged',|
|                           |                               | 'dismissed', 'no_response')      |
| BehaviorFlag              | Caregiver Alert Banner        | flag_type, severity, evidence    |
| SyncLog                   | Hub Sync Badge (Staleness)    | last_synced_at, status           |
+---------------------------+-------------------------------+----------------------------------+
```

---

## 11. Engineering Handoff & Checklist for Developers

- [x] **Local Storage Priority:** Patient interactions write immediately to local SQLite (`GameSession`, `ReminderLog`) before attempting sync.
- [x] **Touch Target Floor:** All interactive tap areas meet or exceed `56px × 56px` (Patient primary controls: `64px`).
- [x] **Typography Floor:** No text smaller than `16px` across any screen; patient copy defaults to `18px–22px`.
- [x] **Staleness Transparency:** Caregiver dashboard prominently surfaces sync recency (e.g., "Last synced: 18m ago").
- [x] **Safety Verbiage:** Zero diagnostic claims across notifications, reports, and UI labels.
- [x] **Shared Profile Security:** Role transitions between Patient, Caregiver, and Clinical telemetry are protected by role authentication barriers.
