# phases.md — Recollect Development Phases

**Project:** Recollect — A Support App for Dementia & Memory Care  
**Basis:** `PRD.md`, `architecture.md`, `rules.md`  
**Status:** Development roadmap / implementation sequencing  
**Last Updated:** September 4, 2026

---

## 1. Purpose

This document converts the product requirements, technical architecture, and binding development rules into an implementation sequence.

The phases are intentionally ordered so that:

1. Core patient and caregiver workflows work reliably before advanced intelligence.
2. Offline-first behavior is foundational rather than added later.
3. Data required for monitoring is captured from day one.
4. Rule-based monitoring ships before personalized anomaly detection.
5. Population-level AI is gated behind sufficient data, labeling, clinical validation, and bias review.
6. Northeast India deployment requirements are treated as product requirements, not post-launch localization.

### Source hierarchy

- `PRD.md` defines **what** Recollect must do.
- `architecture.md` defines **how** the system should be implemented.
- `rules.md` defines **binding, checkable constraints** and release gates.

---

# 2. Phase Overview

| Phase | Name | Primary Outcome |
|---|---|---|
| 0 | Foundation & Decisions | Architecture, safety, compliance, UX and delivery foundations locked |
| 1 | Core Offline MVP | Patient app works offline with reminders, games, mood, local storage and sync |
| 2 | Caregiver & Care-Team Platform | Dashboard, alerts, permissions, observations and care-team workflows |
| 3 | Reporting, Scoring & Phase-1 Monitoring | Trends, explainable rule flags, weekly reports and escalation |
| 4 | Northeast India Pilot Readiness | Low-bandwidth, low-power, language, shared-device and community-health workflows |
| 5 | Pilot & Stabilization | Real-world validation of reliability, usability and product assumptions |
| 6 | Phase-2 Personalized Intelligence | Per-patient statistical baselines and anomaly detection |
| 7 | Advanced AI & Clinical Decision Support | Carefully gated AI features such as summarization and doctor insight |
| 8 | Phase-3 Population Model | Population-trained model only after explicit readiness gates |
| 9 | Scale, Governance & Continuous Improvement | Operational maturity, audits, model governance and expansion |

> **Important:** These are implementation phases, not promises that every feature belongs in the first public release. The PRD explicitly leaves several AI and deployment decisions open. Those decisions must be resolved at the relevant gates.

---

# 3. Global Rules Applying to Every Phase

These rules are release-blocking unless explicitly marked otherwise in `rules.md`.

## 3.1 Clinical Safety

- No diagnostic or curative claims anywhere in product copy, notifications, reports, logs or marketing.
- Use framing such as:
  - "pattern observed"
  - "flagged for review"
  - "worth discussing with your doctor"
  - "supporting cognitive engagement"
  - "maintaining function"
- AI and rule outputs are decision-support signals, never diagnoses.
- Every surfaced flag must include explainable evidence.
- Raw data must remain accessible next to AI-derived outputs.
- Caregivers and doctors must be able to confirm, dismiss or annotate flags.
- Composite scoring must carry the required non-diagnostic disclaimer.
- Games and the conversational companion must be labeled as supportive/engagement tools, not treatment or therapy devices.

## 3.2 Local-First Architecture

- Core patient functions must work with zero connectivity.
- Patient-device writes go to local storage first.
- Sync is background/best-effort and must never block the patient.
- `GameSession` and `ReminderLog` are append-only.
- `Reminder` definitions are cloud-authoritative.
- Sync failure is invisible to the patient but visible as data staleness to caregivers.
- Sync should use incremental deltas and batched backlog processing.

## 3.3 Data Model

Use the architecture-defined entities and field names:

- `Patient`
- `Caregiver`
- `PatientCaregiverLink`
- `GameSession`
- `Reminder`
- `ReminderLog`
- `BehaviorFlag`
- `SyncLog`

Also implement caregiver qualitative notes and mood check-ins as first-class, timestamped, queryable records.

Any field needed for future trends/anomaly detection must be captured at write time.

`BehaviorFlag.evidence` is required.

## 3.4 Accessibility & UX

- Minimum 18pt-equivalent patient-facing text.
- High contrast and WCAG 2.1 AA.
- Core patient actions must be single-tap or single voice command.
- Reminders use full-attention prompts.
- Avoid "Are you sure?" confirmation flows.
- Cold start target: under 3 seconds.
- Reminder delivery target: within 10 seconds of scheduled time.
- Optimize and test on low-end target hardware, not only development devices.

## 3.5 Security & Consent

- Encrypt health-adjacent data at rest and in transit.
- No patient data access without an explicit consent-backed relationship.
- Support legal guardian / power-of-attorney flows.
- AI-analysis/training consent is separate from core functionality consent.
- Implement actual data export and deletion.
- Compliance-sensitive areas retain `// LEGAL REVIEW REQUIRED` until legal sign-off.

## 3.6 Northeast India Requirements

For the target deployment:

- Core functionality works fully offline.
- Incremental low-bandwidth sync.
- SMS/USSD fallback for critical alerts.
- Low-power mode.
- Multi-profile/shared-device mode.
- ASHA, ANM and PHC/CHC roles are first-class.
- Community-health-worker reports are action-oriented and simpler than doctor reports.
- Human-recorded regional voice is preferred for launch languages.
- Game content is culturally localized.
- Per-sync data usage is measured and tested.
- Feature-phone fallback is supported where included in the deployment scope.

---

# 4. Phase 0 — Foundation & Decisions

## Objective

Remove architectural and product ambiguity before building patient-facing functionality.

## 4.1 Product Decisions

Resolve or document:

- Initial launch/pilot districts in Northeast India.
- Initial language/dialect priority order.
- Whether v1 supports institutional/care-home use.
- Caregiver role hierarchy and visibility.
- Maximum/expected number of caregivers per patient.
- Reminder-authoring workflow.
- Doctor portal vs. secure email report as the initial doctor workflow.
- Pricing/distribution model for the pilot.
- Exact pilot device/connectivity specification.
- Clinical advisory arrangement.
- Whether advanced AI features are deferred until after core launch.

## 4.2 Technical Spikes

Evaluate:

- Flutter vs. React Native.
- Supabase vs. alternatives.
- PowerSync / Supabase local-first tooling / WatermelonDB / custom SQLite sync.
- SQLite encryption approach: SQLCipher vs. platform encryption.
- Background sync behavior under prolonged offline periods.
- Notification reliability on low-end Android.
- SMS/USSD provider and fallback architecture.
- Secure PDF/report delivery.
- Shared-device identity/session model.

### Required outcome

A documented technical decision record must exist before implementation depends on the selected approach.

## 4.3 Data & Security Foundation

Define migrations and policies for all architecture entities.

Required:

- UUID strategy.
- timestamps and timezone handling.
- append-only constraints for `GameSession` and `ReminderLog`.
- cloud-authoritative `Reminder`.
- `BehaviorFlag.evidence NOT NULL`.
- consent relationship enforcement.
- role-based access.
- audit logging.
- retention/export/deletion strategy.
- encrypted local storage.
- TLS-only network communication.

## 4.4 UX Foundation

Create patient design system:

- large typography
- large tap targets
- high contrast
- simple icons
- voice-first interaction pattern
- calm positive feedback
- full-screen reminder pattern
- low-cognitive-load navigation
- senior mode

### Phase 0 Gate

Do not begin broad feature development until:

- architecture decision record is approved;
- core schema is reviewed against `architecture.md`;
- consent model is defined;
- clinical advisor/review path is identified;
- target hardware is selected;
- patient UX principles are represented in the design system;
- legal/compliance-sensitive work is visibly marked for review.

---

# 5. Phase 1 — Core Offline MVP

## Objective

Build the smallest complete patient experience that remains useful with no internet.

## 5.1 Patient App Shell

Implement:

- onboarding/device pairing foundation;
- patient profile;
- home screen;
- patient mode;
- senior mode;
- large-text/high-contrast UI;
- voice interaction foundation;
- local timezone handling.

## 5.2 Local Data Layer

Implement local SQLite storage for patient-device data.

Patient actions must follow:

`Patient action → local write → local queue → background sync`

Never:

`Patient action → network request → wait → local write`

## 5.3 Reminders

Implement:

- medication;
- meals;
- hydration;
- hygiene;
- appointments;
- custom tasks;
- one-time reminders;
- recurring reminders;
- priority;
- local scheduling;
- full-attention notification;
- Done;
- Snooze;
- Need Help;
- voice acknowledgment;
- timestamped `ReminderLog`.

Default unacknowledged window: 30 minutes, configurable by patient/task priority.

Reminder definitions originate from the cloud and are synced to the device.

## 5.4 Cognitive Games

Start with representative categories:

- memory recall;
- attention/focus;
- language/word finding;
- simple problem solving/sequencing.

Sessions should default to 3–7 minutes.

Capture at write time:

- `game_type`
- timestamps
- score
- duration
- mistake count
- hesitation average
- difficulty
- device battery at start
- completion/abandonment state

Game feedback must remain encouraging.

## 5.5 Mood & Wellbeing

Implement:

- one-tap mood check-in;
- caregiver-assisted check-in;
- local-first storage;
- timestamp;
- cloud sync when available.

## 5.6 Sync

Implement:

- foreground sync;
- timer-based sync;
- reconnect-triggered sync;
- incremental payloads;
- batches, approximately 100 records per batch;
- retry handling;
- sync state;
- `SyncLog`;
- multi-day backlog recovery.

Design target: local storage should comfortably support 90+ days of normal game/reminder activity before pruning becomes necessary.

## 5.7 Low-Power Mode

Implement a mode that:

- reduces background sync frequency;
- reduces animation;
- minimizes unnecessary processing;
- preserves reminders and core functionality.

### Phase 1 Gate

The MVP is not complete until:

- patient core flows work with zero connectivity;
- local writes occur before sync;
- `GameSession` and `ReminderLog` are append-only;
- reminders work offline;
- games work offline;
- mood check-ins work offline;
- sync resumes correctly after prolonged disconnection;
- no patient-facing sync error is shown;
- performance is tested on target low-end hardware;
- accessibility rules pass;
- security/consent foundations are enforced.

---

# 6. Phase 2 — Caregiver & Care-Team Platform

## Objective

Give caregivers and care-team members a secure, useful view of the patient without turning the product into surveillance.

## 6.1 Authentication & Roles

Implement:

- Patient;
- Primary Caregiver;
- Secondary Caregiver;
- Doctor;
- ASHA;
- ANM;
- PHC/CHC care-team access where applicable;
- legal guardian / power-of-attorney flow.

Every access path must be linked to an explicit consent-backed relationship.

## 6.2 Caregiver Dashboard

Implement:

- today's task status;
- historical adherence;
- game history;
- mood trends;
- caregiver observations;
- recent activity;
- visible last-sync timestamp;
- stale-data state;
- multi-caregiver activity log.

The dashboard must never imply that stale data represents current patient status.

## 6.3 Reminder Management

Caregiver/authorized care-team users can:

- create;
- edit;
- delete;
- configure recurrence;
- set category;
- set priority;
- set escalation window.

Changes sync down to the patient device.

The cloud remains authoritative.

## 6.4 Caregiver Notes

Implement first-class timestamped observations.

Examples of permitted use:

- qualitative observations;
- day-to-day behavior notes;
- contextual observations around unusual activity.

Do not hide these records in an unqueryable JSON blob.

## 6.5 Notification Preferences

Support:

- critical real-time alerts;
- configurable priorities;
- caregiver preferences;
- quiet hours;
- batching/digest for non-critical notifications.

### Phase 2 Gate

Verify:

- consent enforcement;
- caregiver isolation between patients;
- role permissions;
- reminder cloud authority;
- dashboard staleness display;
- caregiver notes;
- mood trends;
- shared-caregiver activity history;
- secure authentication;
- audit logging.

---

# 7. Phase 3 — Scoring, Reports & Phase-1 Monitoring

## Objective

Turn collected activity into transparent trends, deterministic flags, escalation and structured reports.

## 7.1 Progress & Scoring

Implement composite weekly score using:

1. game performance;
2. routine adherence;
3. engagement.

Support:

- daily;
- weekly;
- monthly;
- quarterly trends.

The score is explicitly an engagement/activity trend, not a diagnosis.

Required disclaimer:

> "This score reflects engagement and activity trends. It is not a medical diagnosis. Please consult your doctor about any concerns."

## 7.2 Phase-1 Rule Engine

Implement deterministic rules as configurable constants.

### Rule A — Missed Reminder Streak

- Medication `no_response` streak ≥3 → `watch`
- Medication `no_response` streak ≥5 → `alert`

### Rule B — Inactivity Gap

- No `GameSession` and no `ReminderLog` response for 48 hours → `watch`
- 96 hours → `alert`

### Rule C — Game Score Decline

For a game type:

- score >25% below patient's prior 14-day average;
- sustained across 3+ consecutive sessions;
- produce `game_score_decline`.

### Rule D — Response Latency Increase

- game hesitation or reminder response latency >2× patient's 30-day average;
- produce `response_latency_increase`.

Every rule must define:

- trigger;
- severity;
- evidence;
- generated-by version.

## 7.3 BehaviorFlag

Every generated flag must include:

- patient;
- flag type;
- severity;
- exact `generated_by` version;
- human-readable `evidence`;
- detected timestamp.

No opaque flag reaches caregivers/doctors.

## 7.4 Human-in-the-Loop

Allow:

- confirm;
- dismiss;
- annotate;
- acknowledge.

Record these actions for future rule tuning and potential later labeling, subject to consent.

## 7.5 Escalation

Implement:

`Reminder missed → second patient alert → primary caregiver SMS/push → optional secondary contact`

Critical caregiver notification target:

**within 5 minutes of the missed critical task.**

Critical alerts must have SMS/USSD fallback in the Northeast deployment.

Do not automatically contact emergency services without the explicitly defined human decision path.

## 7.6 Weekly Doctor Report

Generate a concise 1–2 page report containing:

- routine adherence;
- game performance;
- score trends;
- notable flags;
- caregiver observations;
- mood summary;
- missed-task incidents;
- escalation history.

Doctor report frequency:

- weekly default;
- optional daily digest for higher-risk patients;
- bi-weekly/monthly for stable patients.

## 7.7 Community Health Worker Report

Provide a simpler action-oriented format for:

- ASHA;
- ANM;
- PHC/CHC staff.

The report should prioritize actions and key events rather than detailed clinical-style graphs.

## 7.8 Report Delivery

Support the selected secure delivery mechanism.

Any compliance-sensitive transmission code must retain:

`// LEGAL REVIEW REQUIRED`

until appropriate legal review/sign-off is recorded.

### Phase 3 Gate

Do not release monitoring/reporting as complete until:

- every flag is explainable;
- evidence is visible;
- raw data is accessible;
- rule versions are recorded;
- thresholds are configurable;
- human review controls work;
- critical alert SLA is tested;
- SMS/USSD fallback is tested for the pilot;
- doctor reports are concise and secure;
- community-health-worker reports are simplified;
- non-diagnostic framing is verified.

---

# 8. Phase 4 — Northeast India Pilot Readiness

## Objective

Adapt the complete core system for the actual operating conditions described in the PRD.

## 8.1 Connectivity

Test:

- zero connectivity;
- intermittent 2G/3G;
- short connectivity windows;
- long offline periods;
- delayed sync;
- interrupted uploads;
- low-data plans.

Measure:

- sync payload size;
- KB per sync cycle;
- weekly data footprint;
- backlog recovery time.

## 8.2 Power

Test:

- low battery;
- low-power mode;
- background behavior;
- charging interruptions.

Ensure reminders continue to work even when network services are unavailable.

## 8.3 Language

Define pilot language priority based on selected districts.

Architecture should support:

- Assamese;
- Bengali;
- Bodo;
- Nagamese;
- Khasi;
- Mizo;
- Manipuri/Meitei;
- Nepali;
- Hindi;
- English;

with actual launch coverage determined by pilot needs.

Prioritize human-recorded natural voice for launch languages.

## 8.4 Cultural Localization

Game content should use culturally familiar:

- objects;
- food;
- festivals;
- attire;
- family structures;
- local context.

Do not treat direct machine translation of generic content as sufficient localization.

## 8.5 Shared Devices

Implement and test:

- multiple profiles;
- quick patient-mode switching;
- caregiver-mode switching;
- secure session boundaries;
- no cross-patient data leakage.

## 8.6 Feature-Phone Fallback

Where included in pilot scope:

- SMS reminders;
- reminder calls;
- local-language messaging;
- caregiver-operated logging.

## 8.7 Community Health Worker Workflow

Validate workflows for:

- ASHA;
- ANM;
- PHC/CHC staff.

Include escalation toward district-level care/telemedicine where the deployment model supports it.

### Phase 4 Gate

Pilot readiness requires:

- offline reliability proven;
- low-power behavior proven;
- low-bandwidth sync measured;
- SMS/USSD critical fallback tested;
- shared-device isolation tested;
- target-language content reviewed;
- voice content reviewed;
- culturally localized games reviewed;
- community-health-worker workflow tested;
- minimum target-device specification confirmed.

---

# 9. Phase 5 — Pilot & Stabilization

## Objective

Run a controlled pilot before scaling functionality or AI sophistication.

## 9.1 Pilot Strategy

Pilot in a small number of representative districts with differing:

- terrain;
- connectivity;
- language;
- device availability;
- care infrastructure.

The pilot should validate the assumptions in the PRD rather than merely demonstrate the app.

## 9.2 Primary Pilot Metrics

Track:

- Weekly Active Patients;
- Weekly Active Caregivers;
- task adherence;
- game sessions/week;
- game completion;
- mood check-in usage;
- report open/engagement;
- missed-medication incidents;
- 30/60/90-day retention;
- caregiver satisfaction;
- patient/caregiver usability feedback;
- notification latency;
- sync success rate;
- stale-data duration;
- per-sync data usage;
- battery impact.

## 9.3 Clinical & UX Review

Validate:

- game design;
- scoring methodology;
- wording;
- accessibility;
- alert usefulness;
- false-positive/false-negative behavior;
- clinician interpretation;
- community-health-worker usefulness.

## 9.4 Rule Tuning

Use caregiver/doctor feedback to identify:

- noisy rules;
- missing rules;
- excessive alerts;
- insufficient alerts;
- confusing evidence.

Do not silently modify rules in production. Version changes and preserve `generated_by`.

### Phase 5 Gate

Move to personalized anomaly detection only when:

- core reliability is demonstrated;
- sufficient consistent per-patient data is accumulating;
- rule outputs are understood;
- feedback/acknowledgment data is being captured;
- clinical and product stakeholders agree that Phase 2 adds value.

---

# 10. Phase 6 — Phase-2 Personalized Intelligence

## Objective

Replace purely fixed thresholds with per-patient statistical baselines.

## 10.1 Preconditions

Phase 2 requires cloud historical data.

A patient should generally have approximately **4–6 weeks of consistent activity** before a baseline is trusted.

For insufficient history:

- suppress the anomaly;
- or show it explicitly as low confidence.

## 10.2 Baselines

Maintain rolling baselines for:

- game score;
- response latency;
- reminder-response rate;
- daily activity count.

Suggested starting approach:

- trailing 30-day window;
- nightly recalculation;
- rolling mean;
- rolling standard deviation;
- personalized z-score.

Do not compare a patient against population norms as the primary baseline.

## 10.3 Explainability

Every anomaly must show:

- metric;
- patient's historical baseline;
- observed value;
- relevant time window;
- deviation;
- generated model/version;
- evidence data.

## 10.4 Model Governance

Version every model change.

`BehaviorFlag.generated_by` must record the exact version.

Maintain:

- model/version history;
- configuration history;
- evaluation results;
- bias review;
- rollback capability.

### Phase 6 Gate

Do not enable personalized anomaly flags broadly until:

- baseline stability is demonstrated;
- low-data behavior is safe;
- false-positive behavior is evaluated;
- explainability is visible;
- model versions are auditable;
- caregiver/doctor review controls remain intact.

---

# 11. Phase 7 — Advanced AI & Clinical Decision Support

## Objective

Introduce advanced AI only where it provides useful support without violating the product's non-diagnostic boundary.

## 11.1 Natural-Language Note Summarization

AI may summarize caregiver notes/check-in comments into a weekly narrative.

Output must:

- preserve the source context;
- identify recurring themes;
- avoid inventing facts;
- remain traceable to underlying notes;
- remain clearly a summary, not a clinical conclusion.

## 11.2 Personalized Game Adaptation

Progressively improve game selection/difficulty using historical performance.

The system must not require continuous cloud AI access for core gameplay.

Basic adaptation should remain available through deterministic/on-device logic when needed.

## 11.3 Doctor Insight Panel

If approved for implementation:

- aggregate multiple data sources;
- display observations;
- show underlying data;
- show relevant trends;
- show flags and evidence;
- avoid standalone conclusions.

## 11.4 Conversational Companion

If included:

- optional;
- calm;
- simple;
- repetition-tolerant;
- orientation-supportive;
- based on approved personalization data;
- clearly labeled as a comfort/engagement feature;
- not therapy;
- not diagnosis.

## 11.5 Speech & Language Analysis

Treat as advanced/experimental.

Before real-patient activation:

- explicit consent;
- clinical validation;
- language-specific validation;
- bias audit;
- regulatory review;
- clear supplementary/non-diagnostic labeling.

### Phase 7 Gate

Advanced AI cannot become a real-patient clinical-facing feature until applicable clinical, regulatory, bias, consent and explainability requirements are documented as satisfied.

---

# 12. Phase 8 — Phase-3 Population-Level Model

## Objective

Build a population-trained model only after the prerequisites identified by the architecture are genuinely met.

## 12.1 Required Preconditions

All must be met:

### Data Volume

A meaningful population of patients with months of longitudinal data.

The architecture describes this as realistically requiring **hundreds of patients with months of data each**. The exact threshold must be decided by the product/clinical team rather than invented in implementation.

### Ground-Truth Labels

Obtain meaningful labels through mechanisms such as:

- caregiver confirmation/dismissal;
- clinician feedback;
- clinical evaluation partnerships.

Labels must be collected under appropriate consent.

### Clinical Partnership

Have an identified clinical validation partner, such as:

- geriatrician;
- neuropsychologist;
- memory clinic;
- equivalent clinical evaluator.

### Bias & Population Validity

Evaluate across differences including:

- language;
- education;
- culture;
- hearing/vision impairment;
- regional population characteristics.

### Regulatory/Legal Review

Assess whether intended claims/features alter the product's regulatory classification.

## 12.2 Model Strategy

Prefer interpretable models such as:

- gradient-boosted trees;
- engineered-feature models;
- lightweight temporal models where justified.

Features may include:

- rolling statistics;
- trend slopes;
- adherence trends;
- response latency;
- game performance;
- engagement;
- mood;
- validated additional signals.

Do not start with a black-box deep-learning system merely because it is technically possible.

## 12.3 Inference

Population model runs should be:

- cloud-based;
- batch;
- scheduled;
- not required in real time;
- not required for patient core functionality.

### Phase 8 Release Gate

No population model is enabled for real patients until:

- data-volume requirement is explicitly approved;
- labeling pipeline is established;
- clinical validation is complete;
- bias audit is complete;
- model is versioned;
- explainability is verified;
- consent is verified;
- regulatory/legal review is complete;
- rollback and monitoring are available.

---

# 13. Phase 9 — Scale, Governance & Continuous Improvement

## Objective

Operate Recollect safely as adoption grows.

## 13.1 Reliability

Continuously monitor:

- reminder delivery;
- critical alert latency;
- sync failures;
- stale dashboards;
- offline backlog;
- crash rates;
- cold-start performance;
- low-end device performance.

## 13.2 Security

Maintain:

- access reviews;
- audit logs;
- encryption;
- vulnerability/security testing;
- data deletion;
- data export;
- retention enforcement.

## 13.3 AI Governance

For every deployed model:

- version;
- owner;
- purpose;
- training data scope;
- consent basis;
- evaluation results;
- bias evaluation;
- known limitations;
- deployment date;
- rollback version.

## 13.4 Clinical Governance

Maintain periodic review of:

- games;
- scoring;
- AI outputs;
- speech features;
- report wording;
- escalation logic;
- clinical claims.

## 13.5 Regional Expansion

Expand languages/districts only after validating:

- language quality;
- voice quality;
- cultural relevance;
- connectivity;
- device compatibility;
- community-health-worker workflow;
- data costs.

---

# 14. Cross-Phase Dependencies

```text
PHASE 0
  │
  ├── Architecture decisions
  ├── Schema/security/consent
  ├── UX/accessibility foundation
  └── Pilot decisions
       │
       ▼
PHASE 1
  │
  ├── Offline patient app
  ├── Local SQLite
  ├── Reminders
  ├── Games
  ├── Mood
  └── Sync
       │
       ▼
PHASE 2
  │
  ├── Auth & roles
  ├── Caregiver dashboard
  ├── Notes
  └── Care-team workflows
       │
       ▼
PHASE 3
  │
  ├── Scoring
  ├── Phase-1 rules
  ├── BehaviorFlag
  ├── Escalation
  └── Reports
       │
       ▼
PHASE 4
  │
  ├── NE India offline/low-bandwidth hardening
  ├── Languages/voice
  ├── Shared devices
  └── ASHA/ANM/PHC workflows
       │
       ▼
PHASE 5
  │
  └── Controlled pilot + evidence
       │
       ├───────────────┐
       ▼               ▼
PHASE 6             PRODUCT / CLINICAL REVIEW
  │
  └── Personalized baselines
       │
       ▼
PHASE 7
  │
  └── Advanced AI features
       │
       ▼
PHASE 8
  │
  └── Population model
       │
       ▼
PHASE 9
  │
  └── Scale + governance
```

---

# 15. Definition of Done — Every Phase

Before a phase is considered complete:

- [ ] Requirements for the phase are implemented.
- [ ] Relevant `rules.md` hard rules are tested.
- [ ] No diagnostic/curative language was introduced.
- [ ] New patient writes are local-first.
- [ ] Offline behavior has been tested where applicable.
- [ ] Security and consent boundaries have been tested.
- [ ] Accessibility requirements have been tested.
- [ ] Schema changes match `architecture.md`.
- [ ] New monitoring rules have configurable thresholds.
- [ ] New flags have explainable evidence.
- [ ] Model/rule versions are recorded in `generated_by`.
- [ ] Critical alerts have the required fallback path.
- [ ] Compliance-sensitive code contains `// LEGAL REVIEW REQUIRED` until sign-off.
- [ ] NE India-specific requirements are tested for deployment-targeted builds.
- [ ] Documentation has been updated for material architecture/product changes.

---

# 16. Explicitly Deferred Until Preconditions Are Met

The following must **not** be pulled forward merely because they are technically attractive:

### Population-trained AI

Deferred until sufficient data, labeling, clinical validation and bias review exist.

### Speech/language cognitive-pattern analysis

Deferred until explicit consent, clinical validation, language/bias validation and regulatory assessment are complete.

### Black-box clinical insight generation

Avoided in favor of explainable outputs with raw-data visibility.

### Continuous cloud AI dependency

Never permitted for core reminders, games, logging or basic adaptive behavior.

### Patient-device reminder authority

Not permitted; cloud remains authoritative.

### Diagnostic/staging functionality

Outside the product boundary.

---

# 17. Final Release Sequence

The intended strategic sequence is:

**Build the reliable offline foundation → collect high-quality longitudinal data → establish caregiver/care-team workflows → ship transparent rules → validate in the real target environment → personalize against each patient's own baseline → introduce advanced AI only when justified → consider population modeling only when evidence and clinical infrastructure support it.**

This sequencing is deliberately conservative because Recollect operates with vulnerable users, health-adjacent data, intermittent infrastructure, and AI outputs that could otherwise be overinterpreted.

---

## 18. Source Traceability

| Phase | Primary PRD Areas | Primary Architecture Areas | Primary Rules Areas |
|---|---|---|---|
| 0 | Sections 5–8, 12–13 | Sections 3, 7, 9 | Sections 2, 4, 7, 8 |
| 1 | FR-1, FR-2, FR-6, FR-9 | Sections 2, 4, 5, 8 | Sections 3, 7, 9 |
| 2 | FR-4, FR-7 | Sections 2, 4, 7 | Sections 4, 8 |
| 3 | FR-3, FR-5, FR-8.1, FR-8.7–8.9 | Section 6 | Sections 2, 5, 6 |
| 4 | Section 8 / FR-9.1–9.16 | Sections 5, 8, 9 | Section 9 |
| 5 | Sections 3, 10–13 | Section 9 | Section 10 |
| 6 | FR-8.1–8.2 | Section 6 Phase 2 | Section 5 |
| 7 | FR-8.3–8.6 | Section 6 | Sections 2, 5, 8 |
| 8 | FR-8.5–8.9 | Section 6 Phase 3 | Section 5 |
| 9 | Sections 7, 10–13 | Sections 7–9 | Sections 8–10 |

---

**End of `phases.md`**
