# Design.md — Recollect UI/UX Design Specification

**Purpose:** This document translates PRD.md, architecture.md, rules.md, and phases.md into a concrete design specification — screen-by-screen structure, a design system, and interaction rules — that a designer, developer, or low-code tool can build from directly. It does not replace high-fidelity mockups, but it's specific enough that a team could build a working, correctly-behaving UI without them.

**How this doc relates to the others:** PRD.md defines *what* each screen must do (FR numbers referenced throughout). rules.md Section 7 sets the accessibility/UX constraints that are **[HARD]** — this doc turns those constraints into actual specs (font sizes, contrast ratios, tap targets). phases.md determines *when* each screen ships — this doc is organized by product surface, not by phase, but each section notes which phase it belongs to.

---

## 1. DESIGN PHILOSOPHY & PRINCIPLES

Five principles govern every screen in this product. When a design decision is ambiguous, resolve it against these, in order:

1. **Calm over clever.** No screen should ever make the patient feel tested, judged, or rushed. No countdown timers on games, no red "WRONG" states, no urgency cues in the patient-facing UI (urgency belongs only in caregiver-facing escalation alerts, never shown to the patient).
2. **One decision per screen.** Every patient-facing screen should have exactly one primary action visible at a time. If a screen needs two decisions, it's two screens.
3. **Never surface uncertainty to the patient.** Sync status, connectivity state, loading spinners, and error messages are a caregiver/dashboard concern (rules.md Section 3) — the patient app should always look confident and complete, even when it's silently retrying a sync in the background.
4. **Evidence before conclusions.** Anywhere a score, trend, or flag appears for a caregiver or doctor, the underlying data it's built from must be reachable in one tap or visible alongside it (rules.md Section 2, PRD FR-8.7). Never show a number or a flag with nothing behind it.
5. **Design for the second user, not just the first.** Most patient-facing screens are configured by a caregiver, not the patient — the caregiver's setup experience (adding a reminder, uploading a family photo) deserves the same care as the patient's daily-use experience, since a confusing setup flow is the single biggest churn risk before the patient ever sees value.

---

## 2. DESIGN SYSTEM FOUNDATIONS

### 2.1 Typography
- **Patient app base font size: 20pt**, never below 18pt anywhere on a patient-facing screen (rules.md Section 7 sets 18pt as the floor — we design at 20pt as the default so there's headroom before hitting the floor at max device text-scaling).
- **Caregiver dashboard base font size: 16pt** (standard web/app body text) — this surface is used by working-age adults, not the target accessibility population, so it follows normal responsive-web conventions.
- **Font family:** a single humanist sans-serif with a tall x-height and unambiguous numerals (avoid fonts where "1," "l," and "I" are easily confused) — e.g. Inter, Noto Sans, or Atkinson Hyperlegible (Atkinson Hyperlegible is purpose-built for low-vision readers and is a strong default for the patient app specifically).
- **Regional script support (Phase 4):** the chosen font family must have full glyph coverage for Bengali script (Assamese, Bengali), Devanagari (Nepali, Hindi bridge language), and Meitei Mayek (Manipuri) — confirm this during font selection, not after content is already built, since swapping fonts late breaks layout assumptions across every screen.
- **Line height:** minimum 1.5x on patient-facing body text to aid readability for users with mild visual processing difficulty.
- **Never use all-caps for patient-facing labels** — it reduces legibility for low-vision users and reads as shouting.

### 2.2 Color & Contrast
- **Minimum contrast ratio 4.5:1 for all patient-facing text**, targeting 7:1 (WCAG AAA) where feasible given rules.md's WCAG 2.1 AA floor (Section 7) — treat AA as the minimum, not the target, for this specific user base.
- **High-contrast mode** (PRD Section 7): a toggle that switches the patient app to a black-on-white or white-on-black palette with all decorative color removed — build this as a real alternate theme from Phase 1, not a stretch goal, since it's listed as a core NFR.
- **Color is never the only signal.** Every state (done/not-done, correct/incorrect in games, urgent/routine in dashboard alerts) must be distinguishable by shape/icon/text as well as color, for colorblind users.
- **No red for patient-facing "incorrect" states in games** (ties to rules.md Section 2's positive-reinforcement rule) — use a neutral, gentle color (e.g. soft amber or gray) with encouraging copy, never red or a harsh buzzer-style cue.
- **Reserve red exclusively for caregiver-facing critical alerts** (missed critical medication, escalation-tier flags) — this makes red meaningful precisely because it's never used for anything routine.

### 2.3 Iconography
- Every core patient action must have both an icon and a text label — never icon-only, given variable literacy across the target population (PRD FR-9.7).
- Icons should be **large (minimum 44x44dp visual size), simple, high-contrast, and object-based rather than abstract** (e.g. a pill bottle for medication, a fork/plate for meals, a water droplet for hydration) — avoid abstract UI conventions like a gear for settings without a text label alongside it.
- Maintain one consistent icon set across the patient app; do not mix icon styles (outline vs. filled) within the same screen.

### 2.4 Spacing & Touch Targets
- **Minimum tap target: 48x48dp** (rules.md Section 7) on all patient-facing interactive elements, with a minimum of 16dp spacing between adjacent tap targets to prevent mis-taps from motor impairment.
- Patient-facing screens use generous whitespace and a **single-column layout** — never a multi-column or grid layout on a patient-facing screen where mis-tapping an adjacent item is costly (e.g. accidentally dismissing a reminder instead of completing it).

### 2.5 Motion
- Minimal, purposeful animation only — no decorative motion on the patient app that could disorient a user with cognitive impairment.
- **Low-power mode (Phase 4, FR-9.10)** disables all non-essential animation entirely, not just reduces it — design every animated element with a true "off" state from the start rather than retrofitting one later.

---

## 3. PATIENT APP — SCREEN SPECIFICATIONS

*(Phase 1 unless otherwise noted)*

### 3.1 Home Screen
- **Purpose:** the default screen a patient sees on app open; shows the single next thing to do.
- **Structure:** large greeting ("Good morning, Anita"), one prominent card showing the *next upcoming or currently-due reminder* (not a list of all reminders — one thing at a time, per Principle 2), a secondary row of large icon buttons for "Play a Game," "How I'm Feeling Today" (mood check-in, once live), and "Call [Primary Caregiver Name]" (always visible, per FR-4.6's emergency quick-access, mirrored into the patient app for the patient's own use, not just the caregiver's).
- **No navigation bar, no menu, no settings icon visible on this screen** — anything beyond these four things is a caregiver-configured concern, not a patient decision to make daily.

### 3.2 Reminder Full-Attention Prompt (FR-1.2, FR-1.3)
- **Structure:** takes over the entire screen (not a banner/toast) when a reminder fires. Large icon representing the task category, the task name in large text ("Time for your morning medication"), and for medication reminders, the dosage/instruction text plus the caregiver-uploaded photo of the pill/package (FR-1.5) shown large and centered.
- **Actions:** exactly three large buttons stacked vertically — "Done," "Snooze," "Need Help" (FR-1.3) — each with icon + label, each meeting the 48x48dp+ target with generous spacing. "Need Help" should visually read as safe/supportive, not alarming (soft color, a hand or person icon) — it triggers a caregiver notification, not a patient-visible alarm state.
- **Voice mode:** the same prompt supports voice acknowledgment ("Done," spoken) as an equivalent path to tapping (FR-1.3, FR-9.7) — design the screen so a visible microphone/listening indicator confirms the app is listening, without requiring the patient to press a button to activate it if voice mode is enabled in settings.
- **No countdown or urgency visual on this screen** — per Principle 1, escalation timing (FR-1.4) is invisible to the patient; only the caregiver sees the 30-minute clock.

### 3.3 Games Hub & Game Session (Section 6.2)
- **Games Hub:** a simple large-tile grid (2 tiles per row max, given single-column/large-target principles) organized by the four categories (Memory, Attention, Language, Problem-solving — FR-2.1), each tile showing a friendly icon and category name, not a difficulty number or score.
- **In-game:** sessions are short (3–7 min, FR-2.3) with a **single instruction visible at a time**, large tappable elements, and **no visible timer countdown** creating pressure (a soft, optional pacing cue is acceptable, but never a red countdown clock).
- **Feedback:** correct actions get warm, varied positive reinforcement (visual + audio, e.g. a gentle chime and a smiling icon); incorrect or missed actions get neutral, encouraging redirection ("Let's try that one again") — never a buzzer, red X, or "Incorrect" label (rules.md Section 2, FR-2.4).
- **End-of-session screen:** shows a simple, warm summary ("Great job today!") — **never shows the numeric score or accuracy percentage to the patient directly** unless product decides otherwise; scores are a caregiver/doctor-facing construct (FR-3.1) to avoid the patient feeling "graded," which runs counter to Principle 1. Flag this as a product decision to confirm, but default to hiding raw scores from the patient view.
- **Family Photos mode (FR-2.7):** when enabled, memory-matching games use caregiver-uploaded photos of real family members/pets instead of generic stock images — the game template must accept a swappable image set, not hardcode default assets.

### 3.4 Mood Check-in (FR-6.1, FR-6.2 — Phase 2)
- **Structure:** a row of 4–5 large emoji-style faces (e.g. very happy → very low) the patient taps once daily; no follow-up questions on the patient side (keep it truly one-tap, per FR-6.1).
- **Caregiver-assisted variant (FR-6.2):** an identical screen accessible from the caregiver's own view of "patient mode" (see Section 3.6, multi-profile) for patients who can't self-report — the caregiver taps on the patient's behalf, and the record should be flagged internally as caregiver-reported vs. self-reported (a field worth adding to the mood check-in data model, flagged here since it wasn't explicit in architecture.md's data model and should be reconciled with it).

### 3.5 Settings / "Senior Mode" (PRD Section 7)
- Accessible only via a clearly separate, caregiver-oriented entry point (e.g. a small, labeled "Caregiver Settings" affordance that requires a simple PIN or confirmation step) — this is the one place a light "are you sure" gate is appropriate, specifically to prevent a patient from accidentally wandering into settings and changing something.
- Contains: high-contrast toggle, font-scaling control, voice mode on/off, language selection (Phase 4), low-power mode toggle (Phase 4).

### 3.6 Multi-Profile / Shared Device Switch (FR-9.11 — Phase 4)
- A simple, caregiver-gated "Switch to Patient Mode" / "Switch to My Profile" control — large, clearly labeled, positioned so it's easy for a caregiver to hand the device to the patient in "patient mode" and just as easy to reclaim it afterward without confusing the patient mid-handoff.

---

## 4. FAMILY / CAREGIVER DASHBOARD — SCREEN SPECIFICATIONS

*(Phase 1–2, standard responsive web app conventions — this audience does not need senior-mode accessibility treatment, though general WCAG AA still applies)*

### 4.1 Today View (FR-4.1 — Phase 1)
- **Structure:** a checklist-style view of today's reminders with status (Done / Missed / Pending / Snoozed), timestamps, and a persistent "last synced [time]" indicator (rules.md Section 3 — staleness must always be visible here). This is the caregiver's default landing screen.
- **Empty/good-day state:** when everything is on track, show a calm, positive confirmation ("Everything's on track today") rather than an empty list with no feedback — reinforces the "supportive, not surveillance" framing from PRD Section 11.

### 4.2 Trends View (FR-3.2, FR-4.2 — Phase 1–2)
- Line-graph views of adherence % and composite score (FR-3.1) across daily/weekly/monthly/quarterly toggles (FR-3.2). Mood trend (Phase 2) and caregiver notes (FR-3.4) plotted on the same timeline so a caregiver can visually correlate a note ("seemed tired Wednesday") with a score dip the same week.
- **Notable-change flags (FR-3.3, Phase 3 for AI-driven ones, Phase 1 for rule-based ones):** rendered as a distinct, non-alarming card type — e.g. a small flag icon with a one-line summary ("Memory game accuracy down over the last 3 weeks — worth discussing with your doctor") — tapping it expands to the required evidence (rules.md Section 2, PRD FR-8.7): the specific underlying data points, never just a bare score.
- **Disclaimer placement:** the exact required disclaimer text from PRD Section 6.3 ("This score reflects engagement and activity trends. It is not a medical diagnosis...") must appear persistently on this screen — e.g. as a fixed, always-visible footnote near the score, not a one-time dismissible tooltip a caregiver could permanently dismiss.

### 4.3 Notes & Observations (FR-3.4 — Phase 1)
- A simple timestamped log a caregiver can add free-text entries to, displayed inline on the Trends view timeline and also as its own scrollable list. No character limit low enough to frustrate a caregiver trying to describe something specific.

### 4.4 Reminders Management (FR-1.1 — Phase 1)
- A standard create/edit/delete list UI for reminders: task name, time, recurrence, category (icon-linked to the patient-app iconography from Section 2.3, so what the caregiver picks here visually matches what the patient will see), priority level, and — for medication specifically — dosage/instruction text and photo upload (FR-1.5).

### 4.5 Multi-Caregiver & Activity Log (FR-4.4 — Phase 2)
- A shared view listing all linked caregivers and a simple activity log ("Priya added a note at 3:40 PM," "Raj marked the 8 AM reminder as sent") so siblings/family sharing duties aren't duplicating effort or missing handoffs.

### 4.6 Doctor Messaging (FR-4.5 — Phase 2)
- A simple async message thread between caregiver and the assigned doctor/health-worker account, explicitly labeled "non-emergency" — pair this with a persistent, separate, always-visible emergency quick-access control (Section 4.7) so the two paths are never confused.

### 4.7 Emergency Quick-Access (FR-4.6 — Phase 1)
- A persistent, high-contrast button (not buried in a menu) visible from every dashboard screen — one tap to call the primary caregiver, secondary contact, or emergency services if configured. This is the one caregiver-facing element that should borrow the patient app's "large, unambiguous, single-tap" design language, since it may be used under stress.

### 4.8 Escalation & Critical Alerts (FR-1.4, FR-4.3, Section 6 of rules.md — Phase 1–2)
- Critical alerts (missed critical medication, sharp decline flags) render as a distinct visual tier — the only place red is used (Section 2.2) — separate from routine notifications, which should be visually calmer and batchable into a digest (rules.md Section 6, PRD Section 11's "alert fatigue" mitigation).
- Notification preference controls (per-priority-level opt-in/digest settings) live in caregiver account settings, not buried in a general settings menu — this is a frequently-used control given the alert-fatigue risk called out in the PRD.

---

## 5. DOCTOR / HEALTH-WORKER FACING SURFACES

### 5.1 Standard Weekly Doctor Report (FR-5.1–5.3 — Phase 2)
- **Format:** 1–2 page PDF/email, structured in a fixed, scannable order every week so a doctor managing many patients can pattern-match quickly: (1) patient name + reporting period header, (2) adherence % with a small trend indicator, (3) game performance summary + trend graph, (4) any notable flags with their evidence (never a bare score), (5) caregiver qualitative notes for the period, (6) mood/wellbeing summary, (7) missed-task/escalation incident log for the period.
- **Non-diagnostic disclaimer** appears once, clearly, near the top of the report — not buried in fine print at the bottom.
- **Reply mechanism (FR-5.5):** a simple, clearly-labeled reply path (in-platform threaded reply or a reply-to email that routes into the same message thread as Section 4.6) that notifies the caregiver.

### 5.2 ASHA/ANM/PHC Simplified Report (FR-9.15 — Phase 4)
- **This is a different template, not a stripped-down version of the doctor report** (rules.md Section 9 explicitly calls this out) — design it separately from the start.
- **Format:** a single-line or few-line action-oriented status, e.g.: *"Adherence dropped to 60% this week. 2 missed medications. Recommend a home visit."* No trend graphs, no multi-page structure — this is designed to be read on a basic phone screen in seconds, matching the workflow and training level of community health workers (PRD FR-9.15).
- **Escalation cue built in:** the template should make it visually obvious when a home visit or referral (FR-9.14) is being recommended vs. when the status is simply informational — e.g. a clear "Recommended action:" line that's either present or explicitly says "No action needed this week."

### 5.3 Doctor-Facing Clinical Insight Panel (FR-8.6 — Phase 5)
- Presented as a list of observations to investigate, each formatted as: the observation in plain language, the underlying data supporting it (charts/numbers, not just a sentence), and an explicit "this is an observation, not a diagnosis" framing repeated at the panel level, not just once globally — repetition here is intentional, since this is the highest-risk surface for overreliance (PRD Section 11).

---

## 6. CROSS-CUTTING UI PATTERNS

### 6.1 Offline & Sync State
- **Patient app:** never shown. Full stop — no icon, no banner, no "waiting to sync" text anywhere in the patient-facing UI (rules.md Section 3, Principle 3 above).
- **Caregiver dashboard:** a persistent, small, non-alarming "Last synced: [relative time]" indicator on every data-bearing screen (Today View, Trends View) — becomes visually distinct (e.g. a muted warning color, not red) only if staleness exceeds a defined threshold (e.g. 24–48 hours), so a caregiver never mistakes old data for current without realizing it.

### 6.2 Non-Diagnostic Disclaimer Pattern
- Defined once as a reusable component (not re-written ad hoc per screen) so the exact required wording from PRD Section 6.3 stays consistent everywhere it's legally/clinically required: Trends View (4.2), Doctor Report (5.1), Clinical Insight Panel (5.3), and any onboarding screen introducing the scoring system.

### 6.3 Flag/Evidence Card Pattern
- One reusable component for every AI- or rule-generated flag, used consistently across the Trends View, Doctor Report, and Insight Panel: a one-line plain-language summary + an expandable "Why is this flagged?" section showing the specific evidence (rules.md Section 2 and 5, PRD FR-8.7) + severity indicator (info/watch/alert, per architecture.md's `BehaviorFlag.severity`) + confirm/dismiss/annotate controls once Phase 3's human-in-the-loop feedback ships (PRD FR-8.8).

### 6.4 Consent & Onboarding Flow (FR-7.2, FR-7.3 — Phase 1)
- A linear, unambiguous multi-step flow (not a single dense consent wall of text) covering: patient/guardian identity confirmation, what data is collected, who it's shared with (which caregiver(s), which doctor), and — as a **separate, distinct step, not bundled in** — consent specifically for AI analysis use (PRD Section 6.8 guardrail, rules.md Section 8), with a clear statement that declining this step does not disable reminders/games/logging.
- Design this as caregiver-facing primarily (given the target patient population), with a simplified, plain-language companion explanation screen the caregiver can show/read to the patient where the patient is able to participate in consent.

### 6.5 Error & Empty States
- Patient-facing errors should never appear as raw technical messages — if something genuinely can't proceed (rare, given the offline-first design), fail into a calm, generic "Let's try that again in a moment" state rather than exposing any technical detail.
- Caregiver/doctor-facing empty states (no data yet, e.g. a brand-new patient with no trend history) should explain *why* clearly ("Trends will appear here after about a week of activity") rather than showing a blank chart with no explanation.

---

## 7. ACCESSIBILITY SPECIFICATION (Patient App)

Binding floor, per rules.md Section 7 — treat every item below as a release gate for any patient-facing screen, not a nice-to-have:

- WCAG 2.1 AA conformance minimum (contrast, focus order, screen-reader labels on every icon-only element even though the UI is icon+label by design — screen reader users still benefit from proper semantic labeling).
- Minimum 18pt-equivalent text, no exceptions, with the app supporting further OS-level text scaling gracefully (test layouts at 200% system font scaling, not just default size).
- Minimum 48x48dp tap targets with 16dp minimum spacing.
- Full functionality reachable via a single tap or single voice command for every core action (FR-1.3, FR-1.7, FR-9.7) — no screen should require a multi-step gesture (swipe-then-tap, long-press) for a core action.
- High-contrast alternate theme available system-wide, not just on select screens.
- Voice narration support for patients with vision impairment, layered on top of (not replacing) the icon/voice-first design already in place for literacy reasons.

---

## 8. LOCALIZATION & REGIONAL DESIGN (Phase 4)

- **Icon-first, voice-first as the actual navigation model**, not a fallback — text labels support icons, not the other way around, for the target population described in PRD Section 8.2.
- **Voice content design:** scripts for locally-recorded voice talent (FR-9.8) should be written and reviewed per-language, not translated word-for-word from an English base script — tone, pacing, and phrasing for elderly comfort vary meaningfully by language and culture; treat script localization as its own design task, not a translation checkbox.
- **Culturally localized game asset sets (FR-9.9):** the Games Hub (Section 3.3) must be built on a template that accepts fully swappable regional asset packs (images, object names, scenarios) per pilot district — do not hardcode a single "default" visual set that regional packs merely patch over.
- **Feature-phone flow (FR-9.12 — no smartphone UI, but still a "design" surface):** define the exact SMS/call script wording for reminder delivery and the caregiver-side logging flow that stands in for the patient app — this is a content/flow design task even though there's no visual screen involved.

---

## 9. DESIGN QA CHECKLIST (per phases.md)

Run this checklist before any patient-facing or caregiver-facing screen ships, mapped to the phase it belongs to:

**Every phase:**
- [ ] Non-diagnostic disclaimer component used verbatim where required (Section 6.2)
- [ ] No sync/error/technical state visible anywhere in the patient app (Section 6.1)
- [ ] All new patient-facing screens meet the Section 7 accessibility floor
- [ ] Any new flag type uses the reusable Flag/Evidence Card pattern (Section 6.3), not a custom one-off display

**Phase 1 additions:**
- [ ] Reminder full-attention prompt tested for single-tap/voice completion, no multi-step gesture required
- [ ] Game feedback states reviewed for zero harsh/red/failure language or color

**Phase 2 additions:**
- [ ] Doctor report template reviewed by the clinical advisor for 2-minute scannability (PRD Section 4.3)
- [ ] Critical vs. routine alert visual tiers confirmed distinct, red reserved only for critical

**Phase 3 additions:**
- [ ] Confirm/dismiss/annotate controls present on every flag card
- [ ] Insight/flag evidence confirmed traceable to real underlying data in the UI, not just present in the database

**Phase 4 additions:**
- [ ] Font/script rendering confirmed correct for each launch language, at both default and 200% scaling
- [ ] Regional game asset packs reviewed by local content reviewer + clinical advisor, not machine-translated defaults
- [ ] ASHA/ANM report template usability-tested with an actual community health worker, not just internally reviewed

**Phase 5 additions:**
- [ ] Clinical Insight Panel's repeated non-diagnostic framing confirmed present at both the panel and per-observation level
