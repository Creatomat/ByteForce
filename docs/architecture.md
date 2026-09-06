# Architecture Document

**Project:** Patient Cognitive Care & Family Monitoring App
**Audience:** Founder (non-technical/low-code), contract developers, low-code tool configuration
**Status:** Draft v1 — see Section 9 for open decisions

> **Assumption flagged:** This doc assumes the product is a companion app for an aging or cognitively-declining patient (e.g. early-stage dementia, mild cognitive impairment, or general elder wellness monitoring), used daily via simple games/reminders, with a separate family-facing dashboard that surfaces behavioral trends and alerts. If the actual clinical target population or use case differs, the data model and rules in Sections 4 and 6 will need adjustment, but the overall architecture pattern holds.

---

## 1. OVERVIEW

This system helps families remotely monitor the cognitive and behavioral wellbeing of an aging or at-risk relative ("the patient") without requiring the patient to use anything more complex than a tablet. The patient interacts with a simple, game-based app that logs light cognitive activity (memory/attention games) and daily reminders (medication, hydration, appointments) directly on the device, working fully offline. This activity data syncs opportunistically to the cloud whenever internet is available, where it's processed into trends and flagged anomalies (e.g. missed reminders, declining game performance, unusual inactivity) that a family member can review on a web dashboard. The core goal is early, low-friction detection of behavioral or cognitive changes — without turning the patient's daily experience into something that feels like surveillance or medical equipment.

---

## 2. SYSTEM COMPONENTS

### 2.1 Patient-Facing App
- **Responsibility:** Present daily games, reminders, and simple activity logging in a large-text, low-step, offline-capable interface. This is the only component the patient directly touches.
- **Owns:** Raw interaction data — game session results, reminder acknowledgments/dismissals, timestamps, local device state, app-open/usage events.
- **Depends on:** Local on-device storage (must function with zero connectivity for days); Sync Layer to eventually push data out. Does **not** depend on the backend being reachable to function.

### 2.2 Family Dashboard
- **Responsibility:** Web app where one or more family members/caregivers view trends, historical activity, and alerts for a linked patient. Read-mostly; the only writes it makes are caregiver account/consent data and alert acknowledgments ("I've seen this, dismiss").
- **Owns:** Caregiver account data, notification/alert preferences, which caregivers are linked to which patients, alert-acknowledgment records.
- **Depends on:** Cloud database (reads synced patient data), AI/monitoring layer output (reads flags, not raw data directly), backend auth.

### 2.3 Sync Layer
- **Responsibility:** Move data from the patient device's local store to the cloud DB, and (much more rarely) push config/reminder changes back down to the device. Must be local-first: the patient app never blocks on network, and the sync layer runs as a background process that retries opportunistically.
- **Owns:** No permanent data of its own — owns *sync state* (last-synced-at, pending queue, conflict logs).
- **Depends on:** Local storage (source of truth on-device), cloud DB (destination), connectivity (best-effort — designed to be absent for long stretches).

### 2.4 Backend/Cloud Database
- **Responsibility:** Durable, authoritative store for all patients once synced; serves the family dashboard; enforces access control (which caregiver can see which patient); runs the rules engine / triggers ML jobs.
- **Owns:** The canonical, cross-device copy of all synced data — patient profiles, historical game sessions, reminder logs, behavior flags, caregiver accounts, consent records.
- **Depends on:** Sync layer for inbound data, AI/monitoring layer (can be a service that reads from it), auth provider.

### 2.5 AI/Monitoring Layer
- **Responsibility:** Turn raw logged activity into meaningful signals — starting with simple threshold rules, evolving to per-patient anomaly detection, and eventually a population-trained model (see Section 6). Produces `BehaviorFlag` records that the dashboard displays.
- **Owns:** Derived data only — flags, computed baselines, model outputs. Never owns raw source data (that belongs to the DB).
- **Depends on:** Cloud DB for historical data (Phase 2+ needs history); may run partly on-device for Phase 1 (see Section 6).

---

## 3. TECH STACK

| Layer | Recommendation | Why |
|---|---|---|
| Patient app frontend | **Flutter** (or React Native if the dev team is JS-heavy) | Single codebase for iOS/Android/tablet, strong offline-first support, easy to build large-text/low-cognitive-load UI without fighting the framework. Flutter's rendering is more consistent across low-end Android tablets, which matters since patients likely use budget devices. |
| Family dashboard frontend | **React (Next.js)** | Standard, huge hiring pool for a non-technical founder to contract out, good ecosystem for charts/dashboards (Recharts, etc.), easy to deploy on Vercel with minimal DevOps. |
| On-device local storage (patient app) | **SQLite** via a local-first sync framework — recommend **PowerSync** or **Supabase's offline/local-first tooling**, or **WatermelonDB** if using React Native | Needs to support days-long offline use, structured queries for "last 7 days of games," and reliable conflict-free sync later. Plain SQLite + a hand-rolled sync queue is the low-cost fallback if you want to avoid a sync-framework subscription early on. |
| Sync/backend service | **Supabase** (Postgres + Auth + Realtime + Edge Functions) | Gives you Postgres (relational, good for trend queries), built-in auth, and row-level security for the caregiver-to-patient access model in one bill. Alternative: **Firebase** (Firestore + Cloud Functions) if the team prefers Google's ecosystem and NoSQL is acceptable — but Firestore is a worse fit for the relational trend queries you'll want in Section 6. |
| Cloud database | **Postgres** (via Supabase, or managed RDS/Cloud SQL if scaling beyond Supabase later) | Relational structure matches the data model well (patients → sessions → flags), time-series trend queries are straightforward, and it's a standard skill for any contractor to pick up. |
| On-device AI runtime | **None required for Phase 1** (rules run as plain code). For Phase 2, simple on-device statistics (rolling mean/stddev) can run in plain Dart/JS — no ML runtime needed yet. If Phase 3 ever needs on-device inference, **TensorFlow Lite** or **ONNX Runtime Mobile** would be the choice. | Avoid pulling in an ML runtime before there's an actual model — added complexity/binary size with no payoff in Phase 1–2. |
| Cloud AI usage | **None for Phase 1–2.** Phase 3 population model would run as a cloud batch/inference job (e.g. a scheduled Python job or a hosted endpoint), not real-time. | Keeps Phase 1 ship-able without any ML infrastructure cost. |

**Trade-offs to flag for the founder:**
- **Supabase vs. rolling your own (Node/Postgres on a VPS):** Supabase is faster to build on and much easier for a non-technical founder to reason about (dashboard, built-in auth, RLS), but comes with vendor lock-in risk and less control over exactly how sync conflict resolution works. Rolling your own gives full control but needs a real backend engineer.
- **Flutter vs. React Native:** Flutter tends to have smoother performance on cheap Android tablets (common in this user base), but React Native has a larger hiring pool if you expect to need many contractors quickly.
- **SQLite + custom sync vs. a managed local-first framework (PowerSync/WatermelonDB):** Managed frameworks solve conflict resolution and background sync for you (huge time savings) but add a recurring cost and another vendor dependency. Hand-rolled sync is cheaper but is a common source of subtle bugs (duplicate writes, missed syncs) — budget real QA time if you go this route.

---

## 4. DATA MODEL

Legend: **[Local]** = lives on patient device only until synced · **[Synced]** = replicated to cloud DB · **[Cloud-only]** = never exists on patient device

### Patient
Core profile — created once, rarely changes.
- `patient_id` (UUID, primary key)
- `full_name`
- `date_of_birth`
- `device_id` (the paired patient tablet/phone)
- `timezone`
- `care_notes` (free text, caregiver-entered — e.g. known conditions, medication schedule context)
- `created_at`
- **[Synced]** — this record must exist in the cloud for the dashboard to function at all; created during onboarding while online.

### Caregiver / Family Member
- `caregiver_id` (UUID, primary key)
- `full_name`
- `email`
- `phone` (for alert notifications)
- `role` (e.g. `primary`, `secondary` — affects notification defaults)
- `auth_provider_id` (link to Supabase Auth / Firebase Auth user)
- `created_at`
- **[Cloud-only]** — caregivers never touch the patient device.

### PatientCaregiverLink
Join table — supports multiple family members per patient.
- `link_id`
- `patient_id` (FK)
- `caregiver_id` (FK)
- `consent_confirmed_at` (see Section 7)
- `notification_prefs` (JSON — which alert types this caregiver wants)
- **[Cloud-only]**

### GameSession
One row per completed (or abandoned) game/activity on the patient device. This is the richest source for trend/anomaly analysis.
- `session_id` (UUID, generated on-device)
- `patient_id`
- `game_type` (e.g. `memory_match`, `word_recall`, `sequence_tap`)
- `started_at`, `completed_at` (or `abandoned_at`)
- `score` (normalized 0–100 where possible, for cross-game comparability)
- `duration_seconds`
- `mistake_count`
- `hesitation_avg_ms` (average response latency — a strong early signal for cognitive change)
- `difficulty_level`
- `device_battery_pct_at_start` (helps distinguish "patient struggled" from "device was dying")
- **[Local] → [Synced]** — written locally the instant the session ends, synced in the background. This is the record type where offline-durability matters most.

### Reminder
Defines a recurring or one-off reminder (medication, hydration, appointment).
- `reminder_id`
- `patient_id`
- `type` (`medication`, `hydration`, `appointment`, `custom`)
- `label`
- `scheduled_time` (or recurrence rule, e.g. `daily@08:00,20:00`)
- `created_by` (caregiver_id — reminders are configured on the dashboard, pushed down to device)
- `active` (bool)
- **[Synced]** — created/edited on the dashboard **[Cloud-only origin]**, pushed down to the patient device as a **[Local]** copy for offline display.

### ReminderLog
One row per reminder *occurrence* — did the patient act on it.
- `log_id` (UUID, generated on-device)
- `reminder_id` (FK)
- `patient_id`
- `scheduled_for` (the specific occurrence time)
- `patient_response` (`acknowledged`, `dismissed`, `snoozed`, `no_response`)
- `responded_at`
- `response_latency_seconds` (time between reminder firing and patient action — another trend signal)
- **[Local] → [Synced]**

### BehaviorFlag
Output of the AI/monitoring layer (Section 6) — never written by the patient app.
- `flag_id`
- `patient_id`
- `flag_type` (e.g. `missed_reminders_streak`, `game_score_decline`, `inactivity_gap`, `response_latency_increase`)
- `severity` (`info`, `watch`, `alert`)
- `generated_by` (`rule_v1`, `baseline_model_v1`, `population_model_v1` — traceability across phases)
- `evidence` (JSON — the specific data points that triggered the flag, for caregiver/clinician review)
- `detected_at`
- `acknowledged_by` (caregiver_id, nullable)
- `acknowledged_at` (nullable)
- **[Cloud-only]** — computed centrally, only ever read (not written) by the dashboard.

### SyncLog
Operational/debugging record, not clinical data.
- `sync_id`
- `device_id`
- `patient_id`
- `sync_started_at`, `sync_completed_at`
- `records_pushed`, `records_failed`
- `status` (`success`, `partial`, `failed`)
- `error_detail` (nullable)
- **[Local, with periodic rollup Synced]** — full logs stay on-device for debugging; only a summary syncs up, to avoid bloating the cloud DB with operational noise.

---

## 5. LOCAL-FIRST SYNC ARCHITECTURE

**Data flow, happy path:**
1. Patient completes a game or responds to a reminder → app writes immediately to **local SQLite** (no network call in this path — this must never block on connectivity).
2. A background sync process (runs on app foreground, on a timer, and on network-reconnect events) reads the local "unsynced" queue and pushes new/changed rows to the **cloud DB** via the Sync Layer.
3. Cloud DB accepts the write, marks it synced, and (for Postgres/Supabase) triggers any server-side function that runs Phase 1 rule checks (Section 6) on the new data.
4. Any resulting `BehaviorFlag` rows are written to the cloud DB.
5. Family Dashboard queries the cloud DB (directly, or via a lightweight API) on load and via periodic polling/realtime subscription, and renders trends + flags.

**Conflict resolution strategy:**
The data model is designed to make conflicts rare by making almost everything **append-only and device-authored**: `GameSession` and `ReminderLog` rows are created with a UUID on the device and are never edited after creation, only inserted — so there's nothing to "merge," just inserts that may arrive out of order. The one bidirectional-edit case is `Reminder` definitions, which are edited on the dashboard and pushed to the device. For this case, use **last-write-wins keyed on `updated_at`**, with the cloud copy always treated as authoritative — reminders are configured by caregivers, not by patients, so the device should never need to "win" a conflict here. If a patient device somehow has a locally-modified reminder (shouldn't normally happen via the UI, but could via a bug), it gets overwritten silently by the next sync and logged in `SyncLog` — this is an acceptable trade-off given reminders aren't safety-critical, but flag it for review if the product later supports patient-initiated reminder changes.

**If sync fails or is delayed for days:**
- The patient app must remain **fully functional offline indefinitely** — local storage has no hard cap that would block new writes for a normal usage period (design target: comfortably hold 90+ days of game/reminder data locally before any pruning is needed).
- On reconnect, the sync layer pushes the entire backlog in batches (don't push thousands of rows in one request — chunk by e.g. 100 records) and updates `SyncLog`.
- The Family Dashboard should visibly indicate **staleness** — e.g. "Last synced 6 days ago" — rather than silently showing old data as if it were current. This is important: a family member should never mistake a stale dashboard for "everything's fine."
- If sync failure is prolonged (e.g. >48–72 hours, configurable), consider a **local-only fallback alert on the patient device itself** (not just the dashboard) is out of scope for v1 but worth flagging as a future safety feature — see Section 9.

---

## 6. AI/MONITORING LAYER — PHASED APPROACH

### Phase 1 — Rule-Based Thresholds
Runs as simple, deterministic code — no model, no training data needed. Can run **on the cloud DB via a server-side function triggered on new-row-insert** (recommended, since it needs to see recent history, not just the single new row) rather than on-device.

Example rules:
- **Missed reminders streak:** `flag_type = missed_reminders_streak`, `severity = watch` if a patient has 3+ consecutive `no_response` reminders of type `medication`; `severity = alert` at 5+.
- **Inactivity gap:** `flag_type = inactivity_gap`, `severity = watch` if no `GameSession` and no `ReminderLog` response for 48 hours; `alert` at 96 hours.
- **Game score drop:** `flag_type = game_score_decline`, `severity = watch` if a patient's `score` on a given `game_type` drops more than 25% below their own prior 14-day average across 3+ consecutive sessions.
- **Response latency spike:** `flag_type = response_latency_increase`, `severity = watch` if `hesitation_avg_ms` in games or `response_latency_seconds` on reminders exceeds 2x the patient's 30-day average.

These thresholds should be **configurable constants**, not hardcoded magic numbers, so they can be tuned without a redeploy once real usage data comes in.

### Phase 2 — Per-Patient Baseline / Anomaly Detection
**Requires:** cloud-side, needs internet — this runs against historical data in the cloud DB, not on-device.

**Approach:** For each patient, maintain a rolling statistical baseline per metric (game score, response latency, reminder-response rate, daily activity count) — e.g. a rolling mean and standard deviation over a trailing 30-day window, recalculated nightly. Flag a new data point as anomalous if it falls outside roughly 2 standard deviations from that patient's own baseline (a personalized z-score approach), rather than comparing patients to each other. This is a meaningful step up from Phase 1 because it adapts to each patient's individual normal — someone who's always been a slow responder won't get falsely flagged, but a sudden change from *their own* pattern will.

**Data needed:** At minimum ~4–6 weeks of consistent per-patient activity before the baseline is stable enough to trust; fewer than that, flags should be suppressed or shown as "low confidence."

### Phase 3 — Population-Level Trained Model
**Requires:** cloud, internet, and substantially more infrastructure than Phases 1–2.

What this would need before it's viable:
- **Data volume:** Realistically hundreds of patients with months of longitudinal data each — Phase 3 is not worth building until there's a meaningful patient base (see open question in Section 9 on what "meaningful" means here).
- **Labeling:** Some ground truth for what constitutes a genuine clinically-relevant decline vs. noise — likely requires caregiver or clinician feedback loops (e.g. caregivers confirming/dismissing Phase 1–2 flags becomes training signal) or partnership with a clinical evaluator.
- **Clinical validation:** Any model making claims that influence real caregiving/medical decisions should go through review with a clinical advisor or partner before being presented as more than "informational" — flagged strongly for legal/product review, not just engineering.
- **Model type:** Likely a gradient-boosted tree model (e.g. XGBoost) or a simple sequence model (e.g. a lightweight LSTM/temporal model) over engineered features (rolling stats, trend slopes) rather than raw time series — favor interpretability over black-box deep learning, since caregivers and clinicians will want to know *why* a flag fired.
- **Runs:** cloud batch inference (e.g. nightly scoring job), not real-time, not on-device.

---

## 7. SECURITY & PRIVACY

**Encryption:**
- **At rest:** Local on-device SQLite should be encrypted (e.g. via SQLCipher or platform-level full-disk encryption at minimum). Cloud DB encryption at rest is provided by default by Supabase/RDS/Cloud SQL — confirm it's enabled, don't assume.
- **In transit:** All sync traffic and dashboard API calls over TLS (HTTPS) only — no exceptions, including internal service-to-service calls.

**Consent model:**
- Patient data collection consent should be captured **at onboarding**, ideally with the patient's own understanding/agreement where cognitively appropriate, plus a caregiver/legal-guardian consent record (`consent_confirmed_at` on `PatientCaregiverLink`) for cases where the patient cannot meaningfully consent themselves.
- Family visibility should be **explicit and per-caregiver** — a caregiver only sees a patient's data after being linked via `PatientCaregiverLink`, not by default. Consider whether *all* linked caregivers see *all* data, or whether a "primary" caregiver can restrict what "secondary" caregivers see (e.g. a sibling may not want full visibility) — this is a product decision to make before building the permission model, not after.

**Compliance considerations to flag for legal review (not legal conclusions):**
- Whether this product's data (health-adjacent behavioral/cognitive data) triggers **HIPAA** obligations in the US — this depends heavily on business model (e.g. whether you ever contract with a healthcare provider/insurer) and should be reviewed with counsel, not assumed either way.
- **State-level health data laws** (e.g. laws covering "consumer health data" beyond HIPAA's scope) that increasingly apply to apps like this even outside traditional healthcare — worth a specific legal check given the trend in this area.
- If any patients or families are outside the US, **GDPR** (EU) or similar regional frameworks for health/biometric-adjacent data.
- **Capacity to consent** — since the target user may have cognitive impairment, there may be specific legal/ethical requirements around obtaining consent from or on behalf of someone with diminished capacity; worth a targeted legal conversation early, since it affects the onboarding flow design.
- Data retention and deletion policy (how long is data kept after a patient/family stops using the app, and what "delete my data" needs to actually do across local + cloud copies).

---

## 8. NON-FUNCTIONAL REQUIREMENTS

**Performance/latency expectations (elderly, low-tech-literacy users):**
- Every patient-facing screen should be reachable in **1–2 taps maximum** from the home screen — no nested menus.
- Text and tap targets sized for low vision/dexterity — target minimum 18–20pt equivalent text, tap targets at least 48x48dp.
- No screen should require the patient to type on a keyboard for core flows (games and reminders should be tap/swipe only).
- Interactions should be **forgiving**: no "wrong answer" dead-ends in games that make the patient feel like they failed; reminders should be dismissible/snoozable without requiring the patient to understand what "snooze" technically does.
- App must **launch and be usable in under 3 seconds** on low-end/older tablets — this is a real constraint on what frontend framework and asset sizes are acceptable, not a nice-to-have.
- No modal dialogs or confirmation steps that assume the user understands typical app UX conventions (e.g. avoid "Are you sure?" patterns where possible; design flows where mistakes are cheap to undo instead).

**Reliability expectations for intermittent connectivity:**
- Patient app: **100% of core functionality (games, reminders) must work fully offline**, indefinitely — this is not a "nice to have," it's the core architectural premise (Section 5).
- Sync should be **silent and automatic** from the patient's perspective — no sync status, errors, or technical indicators should ever surface on the patient-facing app.
- Family Dashboard should **clearly communicate data staleness** (last-synced timestamp, visible and not buried) rather than presenting potentially days-old data as current, per Section 5.
- Target: sync latency under normal connectivity (dashboard reflects new patient activity) within a few minutes; explicitly design for and test the multi-day-offline case, not just the happy path.

---

## 9. OPEN QUESTIONS / RISKS

**Technical:**
- Which sync provider/framework to commit to (Supabase built-in sync vs. PowerSync vs. hand-rolled) — affects both cost and how much conflict-handling code you own vs. buy. Needs a spike/prototype before committing.
- Whether local storage needs encryption strong enough to survive a lost/stolen device scenario as a hard requirement, or whether device-level encryption is sufficient — affects SQLCipher vs. plain SQLite decision.
- How reminders get authored — is there a caregiver-facing reminder editor in v1, or are reminders manually configured by the team initially (affects how much of the `Reminder` push-sync flow needs to be built for launch)?
- Whether a "local-only safety alert" on the patient device itself (e.g. surfacing something on-device if sync has failed for days) is in scope — flagged in Section 5 as a possible future safety feature, not yet decided.

**Product:**
- What counts as a "family member" with dashboard access — is there a cap, and is there a designated "primary" caregiver with elevated permissions, or is access flat/equal across all linked caregivers?
- How false positives/negatives on Phase 1 rules get tuned in practice — is there a feedback mechanism where caregivers can mark a flag as "not actually a concern," and does that feed into rule tuning (or eventually Phase 3 labeling)?
- What the actual clinical/product goal is for flags — informational only, or intended to prompt real caregiving action? This materially affects the legal/compliance posture in Section 7 and should be settled early.

**AI/ML roadmap:**
- What patient volume and data history are actually needed before Phase 3 is worth investing in — needs a rough business-side estimate (e.g. "50 patients x 6 months" as a strawman) rather than an open-ended "eventually."
- Whether there's an identified clinical validation partner (geriatrician, memory clinic, etc.) for Phase 3, or whether that partnership needs to be sourced before Phase 3 work starts — likely a prerequisite, not a parallel track.
- Whether caregiver flag-acknowledgment data (Section 4, `BehaviorFlag.acknowledged_by`) is being captured from day one specifically so it can become Phase 3 training/labeling data later — worth confirming this is being logged even before Phase 3 is built, since retrofitting labels onto old data is much harder than capturing them as you go.
