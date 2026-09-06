# Rules.md — Recollect Development Rules

**Purpose:** This document is the binding rule set for anyone or anything building Recollect — human developers, contractors, or low-code/AI coding tools. It translates PRD.md and architecture.md into concrete, checkable rules. **If a rule here conflicts with a convenience shortcut, the rule wins.** When in doubt, re-read the source PRD/architecture docs before deviating from a rule below.

Each rule is written to be checkable — either it was followed or it wasn't. Use Section 10 as a literal PR/build checklist.

---

## 1. HOW TO USE THIS DOCUMENT

- Every PR, low-code workflow, or AI-generated feature must be checked against the relevant section(s) below before being considered done.
- Rules marked **[HARD]** are non-negotiable — violating them blocks merge/release regardless of deadline pressure. Rules marked **[GUIDANCE]** are strong defaults that need an explicit, documented reason to deviate from.
- If a rule references a data field or entity (e.g. `BehaviorFlag.evidence`), that field must exist in the schema exactly as named in architecture.md Section 4, unless a schema change is proposed and this doc is updated to match.

---

## 2. NON-NEGOTIABLE PRODUCT & CLINICAL SAFETY RULES

These come directly from PRD.md Sections 1, 6.3, 6.8, and 11 — this app operates adjacent to a vulnerable population and a medical context, so these are treated as **[HARD]** rules, not style preferences.

- **[HARD] No diagnostic or curative claims, anywhere.** No copy, notification, report, log message, error string, or marketing text may say or imply the app diagnoses dementia, stages its severity, cures it, or reverses it. Banned phrasing includes "you have dementia," "your dementia is worsening/improving," "risk score," or any numeric "dementia score." Approved framing: *"pattern observed," "worth discussing with your doctor," "flagged for review," "supporting cognitive engagement," "maintaining function."*
- **[HARD] Every AI/rule-generated flag must be explainable.** Any `BehaviorFlag` (or equivalent) surfaced to a caregiver or doctor must carry human-readable evidence pointing to the underlying data that triggered it (PRD FR-8.7). Never ship a flag, score, or insight that can't be traced back to specific logged data points in the UI.
- **[HARD] Human-in-the-loop on every AI/rule output.** Caregivers and doctors must always be able to confirm, dismiss, or annotate a flag (PRD FR-8.8). No flag should trigger an irreversible automated action (e.g. auto-alerting emergency services) without a human decision point, except the explicitly-defined escalation path in Section 6 below.
- **[HARD] Raw data stays visible next to every AI output.** Never present an AI-derived insight, score, or summary without a path to the underlying raw data it was built from, for both caregiver and doctor views (PRD "Avoiding overreliance," Section 11).
- **[HARD] Scoring/grading copy must include the non-diagnostic disclaimer.** Any screen showing the composite weekly score (PRD FR-3.1–3.5) must display or link to: *"This score reflects engagement and activity trends. It is not a medical diagnosis. Please consult your doctor about any concerns."*
- **[GUIDANCE] Positive-reinforcement only in game feedback.** No "you failed," "wrong," or similarly harsh feedback strings in game code — use encouraging, retry-oriented copy regardless of outcome (PRD FR-2.4).
- **[HARD] Games and the conversational companion are explicitly labeled as non-clinical.** Any in-app surface for games (Section 6.2) or the AI companion (FR-8.4) must carry a visible "supportive/engagement tool, not a treatment or therapy device" label — do not silently drop this label to simplify UI.

---

## 3. ARCHITECTURE CONFORMANCE RULES

Derived from architecture.md — these enforce the local-first design so the product doesn't quietly regress into "needs internet to function."

- **[HARD] Patient-facing core flows must work with zero connectivity.** Reminders, games, task logging, and mood check-ins (PRD FR-9.1) must never block on a network call. Any code path that makes the patient wait on a network response before completing a core interaction is a bug, not an edge case.
- **[HARD] All patient-device writes go to local storage first, always.** Per architecture.md Section 5: game sessions, reminder responses, and mood check-ins are written to local SQLite immediately, then queued for sync. No patient-facing write path may be `await`-blocked on a remote API call.
- **[HARD] Sync failures/staleness must be silent to the patient, visible to the caregiver.** The patient app must never surface sync errors, spinners, or technical states (architecture.md Section 8). The Family Dashboard must show a visible "last synced" timestamp and must not present stale data as current.
- **[GUIDANCE] Sync payloads should be incremental deltas, not full re-uploads** (PRD FR-9.2), to respect the low-bandwidth/high-data-cost constraint in Section 8 of the PRD.
- **[HARD] `GameSession` and `ReminderLog` rows are append-only.** Once written on-device, these records are never edited, only inserted — this is what makes the conflict-resolution strategy in architecture.md Section 5 valid. If a bug fix requires "correcting" a historical row, insert a correction record; do not mutate the original.
- **[HARD] `Reminder` definitions are cloud-authoritative.** Reminders are created/edited by caregivers or doctors on the dashboard/portal, synced down to the device (architecture.md Section 5). The patient device must never be treated as the source of truth for a reminder's schedule — any local reminder edit path (if ever built) needs an explicit new conflict-resolution rule before shipping, not an assumption that last-write-wins is fine.
- **[HARD] No continuous cloud-AI dependency for core functionality.** Per PRD FR-9.5, reminder logic and basic adaptive difficulty must not require a live call to a cloud AI service. Heavier AI analysis (Section 6.8) is allowed to be async/cloud-based, but must never block the patient-facing experience.

---

## 4. DATA MODEL RULES

- **[HARD] Use the entity/field names defined in architecture.md Section 4 exactly** (`Patient`, `Caregiver`, `PatientCaregiverLink`, `GameSession`, `Reminder`, `ReminderLog`, `BehaviorFlag`, `SyncLog`) unless this document and architecture.md are updated together. Do not invent parallel/duplicate tables for the same concept (e.g. a second "PatientProfile" table).
- **[HARD] Every field that will feed trend/anomaly detection must be captured at write time, not backfilled.** This includes `hesitation_avg_ms`, `mistake_count`, `response_latency_seconds`, and `device_battery_pct_at_start`. If a new game or reminder type is added, its session/log record must include these fields or an equivalent, from day one.
- **[HARD] `BehaviorFlag.evidence` is required, not optional**, on every flag-generating code path (rules engine and, later, models) — enforced at the schema level (`NOT NULL`), not just by convention.
- **[GUIDANCE] Local-only vs. synced classification from architecture.md Section 4 must be respected in schema/migration code** — e.g. don't sync full `SyncLog` detail rows to the cloud DB; only sync the periodic rollup, per the architecture doc.
- **[HARD] Caregiver qualitative notes (PRD FR-3.4) and mood check-ins (FR-6.1–6.3) are first-class, timestamped, queryable records** — not free text buried in a JSON blob that can't be surfaced in reports or trend views.

---

## 5. AI/MONITORING LAYER RULES

- **[HARD] Follow the phased approach in architecture.md Section 6 — do not skip ahead.** Phase 1 (rule thresholds) ships before Phase 2 (per-patient baseline). Phase 2 ships before Phase 3 (population model). Phase 3 does not start implementation until the data-volume, labeling, and clinical-validation prerequisites in architecture.md Section 6 are actually met — not "roughly met."
- **[HARD] Phase 1 thresholds are configurable constants, not hardcoded values**, so they can be tuned post-launch without a redeploy (architecture.md Section 6).
- **[HARD] Any new flag type must specify: trigger condition, severity levels, and the exact evidence fields shown to the user** before it's implemented — this is a spec requirement, not just a code requirement.
- **[HARD] Escalation logic (PRD FR-8.9) may combine rule-based and AI signals to raise urgency, but the underlying event log must record which rule(s) fired** — no escalation without a traceable cause.
- **[HARD] Any Phase 2/3 model change must be versioned**, and `BehaviorFlag.generated_by` must record the exact model/rule version that produced it (architecture.md data model — `rule_v1`, `baseline_model_v1`, etc.), per PRD's AI Model Governance requirement (Section 7).
- **[HARD] Before any Phase 3 (or FR-8.5 speech analysis) feature is enabled for real patients:** clinical validation with a geriatrician/neuropsychologist and a bias audit across languages/education levels must be complete and documented (PRD Section 6.8 guardrails, Appendix checklist). Treat this as a release gate, not a post-launch nice-to-have.
- **[GUIDANCE] Prefer interpretable models (rules, rolling statistics, gradient-boosted trees) over black-box deep learning** for any model that produces a doctor-facing or caregiver-facing flag, per the explainability requirement in Section 2 above.

---

## 6. ESCALATION & NOTIFICATION RULES

Derived from PRD FR-1.4 and FR-8.9 — this is the one place where automated, time-sensitive behavior is expected and must be implemented precisely.

- **[HARD] Default unacknowledged-reminder window is 30 minutes**, then escalate: second in-app alert → SMS/push to primary caregiver → optional call/alert to secondary contact. This window must be configurable per-patient/per-task-priority, not hardcoded globally.
- **[HARD] Caregivers must be notified within 5 minutes of a missed critical task** (PRD Section 3 success metric) — treat this as a measurable SLA for the notification pipeline, not an approximate target.
- **[HARD] Critical alerts must have an SMS/USSD fallback path** (PRD FR-9.4) for caregivers without reliable data connectivity — push-notification-only is not acceptable for critical (e.g. missed-medication) alerts in this deployment context.
- **[GUIDANCE] Batch/digest non-critical notifications** to avoid alert fatigue (PRD Section 11) — only critical-priority items should interrupt a caregiver in real time.

---

## 7. UX & ACCESSIBILITY RULES

Derived from PRD Sections 4.1, 6.1, 7, and 8.2 — the target user is 60+, may have cognitive/motor/vision impairment, and may have low tech and/or literacy.

- **[HARD] Minimum 18pt-equivalent font size** on all patient-facing screens; high-contrast mode available.
- **[HARD] Reminders render as full-attention, on-screen prompts — never a small dismissible banner or toast** (PRD FR-1.2).
- **[HARD] Every core patient action (acknowledge reminder, play a game, mood check-in) must be completable via a single tap or a single voice command** — no multi-step confirmation flows on the patient side (PRD FR-1.3, FR-1.7, FR-9.7).
- **[HARD] No modal "Are you sure?" confirmation patterns on the patient app** unless the action is destructive and irreversible — default to easily-undoable actions instead.
- **[HARD] Cold start under 3 seconds; reminder delivery within 10 seconds of scheduled time** (PRD Section 7 NFR table) — treat both as measurable performance budgets, tested on low-end target hardware (Android 8+, 2GB RAM), not high-end dev devices.
- **[GUIDANCE] Icon-first, voice-first navigation over text-dense UI** wherever literacy or vision may be a barrier (PRD FR-9.7).
- **[HARD] WCAG 2.1 AA is the accessibility floor**, not an aspiration, for anything shipped to patients or caregivers (PRD Section 7).

---

## 8. SECURITY, PRIVACY & CONSENT RULES

- **[HARD] All health-adjacent data encrypted at rest and in transit** — TLS for all network calls, encrypted local storage on the patient device (architecture.md Section 7, PRD Section 7).
- **[HARD] No caregiver or doctor account can view a patient's data without an explicit consent-backed link.** Every access path must trace back to a `PatientCaregiverLink`-equivalent record with `consent_confirmed_at` populated — no default-visible access, no "invite pending" implicit access.
- **[HARD] Consent for AI analysis/model training is separate from consent for core app functionality** (PRD FR-8.8 guardrails, Section 6.8) — a patient/guardian who opts out of AI analysis must still get full reminders/games/logging functionality. Do not gate core features behind AI-analysis consent.
- **[HARD] Legal guardian / power-of-attorney account flows must be supported wherever the primary consent flow assumes patient self-consent** (PRD FR-7.4) — do not build a consent flow that has no path for a patient who cannot legally or cognitively consent for themselves.
- **[GUIDANCE] Flag, but do not resolve in code, the following for legal review before launch:** HIPAA (US) applicability, GDPR (EU) applicability, India's DPDP Act applicability given the NE India deployment target, and SaMD/MDR classification risk for the AI features in Section 6.8 of the PRD. Do not make an internal assumption about any of these and ship as if it were resolved — leave a visible `// LEGAL REVIEW REQUIRED` marker in any code area that implements a compliance-sensitive flow (e.g. report transmission, data export/delete) until sign-off is on record.
- **[HARD] Data export and deletion ("right to be forgotten") must be implemented as real, testable functionality**, not a support-ticket promise — per PRD Section 7 Data Retention requirement.

---

## 9. REGIONAL DEPLOYMENT RULES (Northeast India Pilot)

These apply specifically to any build targeting the PRD Section 8 deployment context — do not assume these are optional polish.

- **[HARD] Full offline capability for reminders, games, logging, and mood check-ins** — this is stated twice in the PRD (Sections 6.1 and 8.1) for a reason; treat any regression here as a release blocker for this deployment target.
- **[HARD] Low-power mode must exist and reduce background sync frequency and animation load** (PRD FR-9.10) — do not ship a build for this market without it.
- **[HARD] Support a multi-profile/shared-device mode** (PRD FR-9.11) for households where the patient uses a caregiver's phone — do not hardcode a one-device-one-user assumption anywhere in auth/session logic.
- **[HARD] Community health worker (ASHA/ANM/PHC) must be a first-class report-recipient role**, not a repurposed "Doctor" role with a relabeled UI (PRD FR-9.13, FR-9.15) — their reports must default to the simplified, action-oriented format described in FR-9.15, not the standard doctor report.
- **[GUIDANCE] Locally-recorded human voice audio takes priority over synthetic TTS** for launch languages; synthetic TTS is an acceptable interim fallback only for lower-priority languages (PRD FR-9.8).
- **[HARD] Minimize per-sync-cycle mobile data usage** — treat this as a tracked, tested metric (e.g. KB per sync), not a vague aspiration, given the cost-sensitivity noted in PRD Section 8.6.
- **[GUIDANCE] Game content should be culturally localized (regional objects, festivals, food, family structures), not machine-translated from generic content** (PRD FR-9.9) — flag any game content PR that is a direct translation without regional adaptation for review.

---

## 10. DEFINITION OF DONE — PRE-MERGE / PRE-RELEASE CHECKLIST

Copy this checklist into every PR touching patient-facing, AI/flag-generating, or data-handling code:

- [ ] No diagnostic/curative language introduced anywhere in copy, logs, or notification strings (Section 2)
- [ ] Any new/changed flag has explainable `evidence` wired to the UI (Section 2, 5)
- [ ] No new patient-facing code path blocks on network connectivity (Section 3)
- [ ] New writes on the patient device hit local storage first, sync is background/best-effort (Section 3)
- [ ] Schema changes reviewed against architecture.md Section 4 entity/field names (Section 4)
- [ ] New thresholds/rules are configurable, not hardcoded (Section 5)
- [ ] Any new model/rule version is recorded in `generated_by` (Section 5)
- [ ] Critical alerts have an SMS/fallback path, not push-only (Section 6)
- [ ] Font size, tap-target size, and single-step interaction rules checked on the actual patient-facing screen (Section 7)
- [ ] Consent boundaries respected — no data visible without a linked, consented relationship (Section 8)
- [ ] `// LEGAL REVIEW REQUIRED` marker added if the change touches a compliance-sensitive flow still pending legal sign-off (Section 8)
- [ ] If targeting the NE India deployment build: offline, low-power, and multi-profile behavior manually tested, not just assumed from the base build (Section 9)

---

## 11. WHEN THIS DOCUMENT AND ANOTHER SPEC DISAGREE

If PRD.md, architecture.md, and this rules.md ever conflict:
1. **Clinical safety and consent rules (Section 2, 8) win regardless of source** — no other requirement overrides these.
2. Otherwise, PRD.md is the source of truth for *what* the product must do; architecture.md is the source of truth for *how* it's technically implemented; this rules.md exists to make both enforceable day-to-day. If a rule here seems to contradict either source document, treat it as a bug in this document and flag it for correction rather than silently picking a side.
