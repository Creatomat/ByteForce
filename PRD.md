# Product Requirements Document (PRD)
## Recollect — A Support App for Dementia & Memory Care

**Version:** 1.0
**Status:** Draft for Review
**Owner:** Product Team
**Last Updated:** September 4, 2026

---

## 1. Executive Summary

Recollect is a mobile and tablet application designed to support elderly individuals living with dementia or age-related memory loss, while giving family caregivers and physicians the tools to monitor progress and intervene early. The app combines daily routine support (reminders), cognitive stimulation (games/exercises), condition tracking (grading/scoring), AI-assisted pattern detection, and care coordination (caregiver dashboard + automated reports to doctors and community health workers) into a single connected ecosystem.

**This version of the product is specialized for deployment in remote and rural areas of Northeast India**, where connectivity, power, device access, language, and specialist availability differ significantly from urban markets. Section 8 details the specific adaptations — offline-first design, regional language and voice support, feature-phone fallback, and integration with community health workers (ASHA/ANM) and local health infrastructure — that make the product usable and trustworthy in this context, rather than treating it as an afterthought localization of a metro-first product.

**Important framing:** Dementia is a progressive neurological condition. This app is designed to support daily functioning, cognitive engagement, routine adherence, and early detection of changes — not to cure or reverse dementia. All product copy, marketing, and in-app language must avoid claims of "curing" or "reversing" the condition and should instead reference "supporting cognitive engagement," "maintaining function," and "slowing perceived decline where possible," consistent with clinical guidance. A licensed medical professional should review all health-related claims before launch.

---

## 2. Problem Statement

- Elderly individuals with dementia/memory loss struggle with daily routines (medication, meals, hygiene, appointments) and often experience isolation, anxiety, and reduced cognitive stimulation.
- Family caregivers are frequently unpaid, geographically distant, or juggling other responsibilities, making it hard to consistently monitor the patient's condition, routine adherence, and day-to-day behavioral changes.
- Doctors typically only see patients periodically (monthly/quarterly), which means gradual cognitive or behavioral decline can go undetected between visits.
- There is no easy, non-intrusive way to translate day-to-day observations into structured, doctor-usable data.
- **In remote Northeast India specifically**, these problems are compounded by hilly/remote terrain, inconsistent mobile connectivity and electricity, high linguistic diversity, lower smartphone/digital literacy among the elderly, and a severe shortage of geriatric and neurology specialists — meaning most patients rely on family caregivers and community health workers (ASHA/ANM) rather than a personal physician for day-to-day monitoring.

---

## 3. Goals & Objectives

| Goal | Success Indicator |
|---|---|
| Help patients maintain daily routines | ≥80% of scheduled reminders acknowledged/completed weekly |
| Provide cognitive stimulation activities | Patients complete ≥3 game sessions/week |
| Track cognitive trends over time | Weekly score trend available for 90%+ of active users |
| Keep caregivers informed in real time | Caregiver notified within 5 minutes of a missed critical task |
| Support clinical decision-making | Doctors receive a structured weekly report automatically |
| Improve patient/caregiver quality of life | Positive sentiment in quarterly caregiver/patient surveys |

---

## 4. Target Users & Personas

### 4.1 Primary User — The Patient
- Age 60+, mild-to-moderate cognitive impairment or diagnosed dementia (early to mid-stage; late-stage patients typically require full-time caregiver operation of the app).
- May have limited tech fluency, vision/hearing impairment, or motor difficulty.
- Needs: simple UI, large text/buttons, minimal steps per action, voice support, calm and non-frustrating error handling.

### 4.2 Secondary User — The Caregiver
- Family member or professional caregiver, may not live with the patient.
- Needs: real-time visibility into patient status, alerts for missed tasks, simple way to log observations, low-friction communication with the doctor.

### 4.3 Tertiary User — The Physician / Clinician / Community Health Worker
- Needs: concise, structured, clinically relevant weekly summaries; ability to flag concerns; minimal time investment (reports should be scannable in under 2 minutes).
- In remote NE India deployments, this role frequently extends to **ASHA workers, ANMs, and PHC/CHC staff** who may be the primary point of contact for the patient rather than a specialist doctor — see Section 8.4 for role-specific requirements.

---

## 5. Scope

### 5.1 In Scope (v1.0)
- Patient-facing reminders (medication, meals, hygiene, appointments, hydration)
- Caregiver notification system for missed/incomplete tasks
- Cognitive stimulation games (memory, attention, word-finding, pattern recognition)
- Scoring/grading system based on game performance and task adherence
- Caregiver dashboard with historical trends
- Automated weekly PDF/email report sent to the assigned doctor
- Basic patient mood/wellbeing check-ins
- Multi-role account system (Patient, Caregiver, Doctor) with permissions

### 5.2 Out of Scope (v1.0)
- Diagnostic claims or AI-based diagnosis of dementia stage
- Prescription management / e-prescribing
- Video consultation (may be considered for v2.0)
- Integration with wearables (may be considered for v2.0)
- Multi-language support beyond the primary launch language (planned for v2.0)

---

## 6. Feature Requirements

### 6.1 Reminder & Daily Routine Management

**Description:** Patients receive scheduled reminders for medication, meals, hydration, hygiene, appointments, and other caregiver-defined tasks.

**Functional Requirements:**
- FR-1.1: Caregiver or doctor can create/edit/delete recurring or one-time reminders (task name, time, frequency, category, priority level).
- FR-1.2: Reminders delivered via push notification, audible alert, and on-screen full-attention prompt (not a dismissible small banner) to accommodate cognitive impairment.
- FR-1.3: Patient can mark a task "Done," "Snooze," or "Need Help" with a single tap/voice command.
- FR-1.4: If a reminder is not acknowledged within a configurable time window (default 30 min), the system escalates: second in-app alert → SMS/push to caregiver → optional call/alert to secondary contact.
- FR-1.5: Medication reminders support dosage/instruction text and optional photo of the pill/package for identification.
- FR-1.6: All reminder interactions (completed, snoozed, missed) are timestamped and logged for reporting.
- FR-1.7: Support voice-based interaction for patients with limited literacy or motor ability.

**Non-Functional Requirements:**
- Large fonts (minimum 18pt equivalent), high-contrast UI, simple iconography.
- Works offline for locally scheduled reminders; syncs when connectivity returns.

---

### 6.2 Cognitive Stimulation Games

**Description:** A library of games designed with input from occupational therapists / neuropsychologists to support memory, attention, language, and problem-solving skills.

**Functional Requirements:**
- FR-2.1: Game categories: Memory recall (photo/name matching), Attention & focus (pattern spotting, sorting), Language (word association, naming objects), Problem-solving (simple puzzles, sequencing).
- FR-2.2: Adaptive difficulty — game difficulty adjusts based on patient's historical performance (up if consistently succeeding, down if consistently struggling, to avoid frustration).
- FR-2.3: Sessions are short by default (3–7 minutes) to match attention spans typical in cognitive impairment.
- FR-2.4: Immediate positive-reinforcement feedback (encouraging tone regardless of outcome; no harsh "failure" messaging).
- FR-2.5: Games log completion time, accuracy, and hesitation/response time as scoring inputs.
- FR-2.6: Caregivers/doctors can assign specific game sets based on the patient's needs.
- FR-2.7: A "Family Photos" personalization mode lets caregivers upload real photos of family/friends/pets for memory games, increasing emotional relevance.

**Design/Content Requirement:**
- All game content and difficulty curves should be reviewed by a clinical advisor (occupational therapist, neuropsychologist, or geriatrician) prior to launch. Games are a supportive/engagement tool, not a clinical treatment device, and should be labeled as such in-app.

---

### 6.3 Grading & Progress Tracking System

**Description:** A scoring mechanism that converts game performance and routine adherence into interpretable trend data for caregivers and doctors — not a diagnostic score.

**Functional Requirements:**
- FR-3.1: Composite weekly score combining: (a) game performance (accuracy, speed, consistency), (b) routine adherence rate (% reminders completed on time), (c) engagement (days active, session count).
- FR-3.2: Score trends displayed as simple visual charts (line graphs) over daily/weekly/monthly/quarterly views.
- FR-3.3: System flags notable changes (e.g., sudden decline >X% week-over-week) for caregiver and doctor visibility — framed as "worth discussing with your doctor," not a diagnosis.
- FR-3.4: Caregivers can add manual qualitative observations (e.g., "more confused today," "good day, recognized grandchildren") tagged with date/time, which appear alongside quantitative scores.
- FR-3.5: All scoring methodology should be transparent and explainable (avoid "black box" AI scores) so doctors can trust and interpret it.

**Guardrail:** In-app copy must clearly state: "This score reflects engagement and activity trends. It is not a medical diagnosis. Please consult your doctor about any concerns."

---

### 6.4 Caregiver Dashboard

**Functional Requirements:**
- FR-4.1: Real-time view of today's task completion status.
- FR-4.2: Historical view of adherence, game scores, mood check-ins, and caregiver notes.
- FR-4.3: Push/SMS/email notifications for missed critical tasks (configurable by priority).
- FR-4.4: Multi-caregiver support (e.g., siblings sharing care duties) with shared visibility and an activity log of who did what.
- FR-4.5: Ability to message the assigned doctor's office directly from the dashboard (non-emergency, async).
- FR-4.6: Emergency contact quick-access (one-tap call to primary caregiver, secondary contact, or emergency services if configured).

---

### 6.5 Automated Weekly Doctor Report

**Functional Requirements:**
- FR-5.1: System auto-generates a structured weekly report including: routine adherence %, game performance summary and trend, notable score changes/flags, caregiver-submitted qualitative notes, mood/wellbeing check-in summary, missed-task incidents and escalation history.
- FR-5.2: Report delivered via secure email (encrypted PDF attachment) or direct upload to a doctor-facing portal, based on doctor preference.
- FR-5.3: Report format should be concise (1–2 pages), scannable, and follow a consistent structure clinicians can quickly parse.
- FR-5.4: Doctor can adjust report frequency (weekly default; option for daily digest for higher-risk patients, or bi-weekly/monthly for stable patients).
- FR-5.5: Doctor can reply within the platform to request more data, flag a concern, or recommend a plan adjustment, which notifies the caregiver.
- FR-5.6: All patient health data transmission must be HIPAA-compliant (US) or regionally equivalent (e.g., GDPR in EU, DPDP Act in India), with signed data-sharing consent from the patient or legal guardian on file.

---

### 6.6 Mood & Wellbeing Check-ins

**Functional Requirements:**
- FR-6.1: Simple daily check-in (e.g., emoji-based mood scale) patients can complete in one tap.
- FR-6.2: Optional caregiver-assisted check-in for patients unable to self-report.
- FR-6.3: Mood trends included in caregiver dashboard and doctor reports.

---

### 6.7 Account, Roles & Permissions

**Functional Requirements:**
- FR-7.1: Three role types: Patient, Caregiver (Primary/Secondary), Doctor — each with tailored UI and permission scopes.
- FR-7.2: Caregiver/doctor accounts are linked to a patient profile via invitation + consent flow.
- FR-7.3: Patient data visibility is permissioned — patients (or their legal guardian) must consent to caregiver/doctor data sharing during onboarding.
- FR-7.4: Support for legal guardian/power-of-attorney account management for patients unable to manage consent themselves.

---

### 6.8 AI-Powered Intelligence Layer

**Description:** An AI layer that analyzes patterns across reminders, game performance, mood check-ins, speech, and caregiver notes to surface insights for caregivers and give doctors richer decision-support data. AI here is a **decision-support and pattern-detection tool that assists a licensed clinician — it does not independently diagnose dementia or any medical condition.** Dementia diagnosis clinically requires cognitive testing, medical history, imaging, and clinician judgment; the app's role is to surface data and flag patterns worth a clinician's attention, not to replace that process.

**Functional Requirements:**

- FR-8.1 (Pattern & Anomaly Detection): AI continuously analyzes routine adherence, game scores, mood check-ins, and sleep/activity timing (if available) to detect deviations from the patient's own historical baseline (e.g., increased hesitation in games, more missed medications, disrupted routine timing) and flags them for caregiver/doctor review.
- FR-8.2 (Personalized Adaptive Difficulty): AI tunes game difficulty and content selection per-patient in real time based on performance trends, rather than fixed rule-based thresholds, and can recommend which cognitive domains (memory, language, attention) may benefit from more focused exercises.
- FR-8.3 (Natural Language Note Summarization): AI summarizes free-text caregiver notes and check-in comments into a concise weekly narrative for the doctor report, highlighting recurring themes (e.g., repeated mentions of confusion, agitation, or improved recognition of family).
- FR-8.4 (Conversational Companion): An optional AI conversational companion for the patient offers light conversation, gentle memory prompts (e.g., recalling family names/events from the personalization data), and orientation reminders (date, time, location) to reduce anxiety and confusion — scripted to be calm, simple, and repetition-tolerant. This is a comfort/engagement feature, not a therapy or diagnostic tool, and should be clearly labeled as such to the patient and family.
- FR-8.5 (Speech & Language Pattern Analysis - optional/advanced): With explicit consent, analyze speech patterns during voice interactions (pause frequency, word-finding difficulty, sentence complexity) as an additional signal alongside game data. This is an emerging research area (e.g., linguistic biomarkers for cognitive decline); any such feature must be validated with clinical partners and clearly labeled as experimental/supplementary, not diagnostic.
- FR-8.6 (Doctor-Facing Clinical Insight Panel): AI aggregates all data sources into a structured insight panel for the doctor (e.g., "Attention-task accuracy declined 18% over 6 weeks while medication adherence remained stable, suggesting the change may not be adherence-related") — presented as an observation to investigate, with the underlying data always visible, never as a standalone conclusion or diagnosis.
- FR-8.7 (Explainability): Every AI-generated flag or insight must show the underlying data driving it (e.g., "flagged because: 3 consecutive weeks of declining word-recall scores + 2 caregiver notes mentioning confusion"). No opaque "black box" scores should reach doctors or caregivers.
- FR-8.8 (Human-in-the-loop Controls): Doctors and caregivers can confirm, dismiss, or annotate AI-generated flags; dismissed/confirmed outcomes should feed back into refining the model's thresholds for that patient (with appropriate consent for model training use).
- FR-8.9 (Escalation Logic): Combine AI-detected anomalies with rule-based safety triggers (e.g., a sudden sharp decline plus multiple missed critical medications) to raise a higher-urgency alert to caregivers and optionally the doctor's office, rather than waiting for the weekly report cycle.

**Guardrails & Compliance Considerations:**

- **No autonomous diagnosis:** The product must not present AI outputs as a diagnosis, risk score of "you have dementia," or staging of disease severity. Language should consistently use terms like "pattern observed," "worth discussing with your doctor," or "flagged for review."
- **Regulatory classification:** Depending on final feature scope and claims (especially FR-8.5 and FR-8.6), this product may qualify as Software as a Medical Device (SaMD) under FDA (US), MDR (EU), or equivalent regional frameworks. Legal/regulatory counsel should assess this early, since diagnostic-support claims can trigger a materially different approval pathway than a wellness/engagement app.
- **Clinical validation:** Any AI model used for pattern detection or speech analysis should be validated against clinical ground truth with input from geriatricians/neuropsychologists before being surfaced to doctors as anything more than raw data visualization.
- **Bias and population validity:** Cognitive and speech baselines vary by language, education level, culture, and hearing/vision impairment. Models must be tested across diverse patient populations to avoid flagging normal variation as decline (or missing real decline) in underrepresented groups.
- **Data use and consent:** Patients/guardians must separately consent to their data being used for AI analysis (and, if applicable, model training) beyond basic app functionality, with a clear opt-out that doesn't disable core reminder/game features.
- **Avoiding overreliance:** UI/UX should reinforce that AI insights supplement, not replace, clinical judgment and in-person evaluation, for both doctors and caregivers.

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Accessibility | WCAG 2.1 AA compliance minimum; large-text mode, voice narration, high contrast mode, simplified "senior mode" UI |
| Privacy & Security | End-to-end encryption for health data in transit and at rest; HIPAA/GDPR/regional compliance; role-based access control; audit logs |
| Reliability | 99.5% uptime target for reminder delivery and alerting systems (critical path) |
| Performance | App cold-start under 3 seconds; reminder notifications delivered within 10 seconds of scheduled time |
| Offline Support | Core reminder function must work without active internet connection |
| Localization | Launch language + regional date/time/measurement formats; architecture ready for future multi-language support |
| Device Support | iOS and Android phones/tablets; consider a simplified companion for basic feature phones (SMS reminders) for low-tech-access patients |
| Data Retention | Configurable retention policy; data export/delete on patient/guardian request (right to be forgotten compliance) |
| AI Model Governance | Versioned, auditable models; explainable outputs; separate consent for AI analysis/training use; periodic bias and accuracy audits with clinical partners |

---

## 8. Regional Specialization: Remote North East India Deployment

**Rationale:** Northeast India (Assam, Meghalaya, Mizoram, Manipur, Nagaland, Tripura, Arunachal Pradesh, Sikkim) presents a distinct operating environment from urban/metro deployments: hilly and often remote terrain, patchy or absent mobile data connectivity, frequent power outages, lower smartphone penetration among the elderly, high linguistic diversity, thin geriatric/neurology specialist coverage, and care that is typically family- and community-based rather than institution-based. Recollect's core design must adapt to these realities rather than assume a reliable, high-bandwidth, English/Hindi-literate, smartphone-native user base.

### 8.1 Connectivity & Offline-First Architecture

- FR-9.1: The app must be **fully offline-capable for all core daily functions** — reminders, task logging, games, and mood check-ins must work with zero connectivity and queue data locally.
- FR-9.2: Background sync uses **opportunistic, low-bandwidth sync**: when any connectivity (even brief 2G/3G) is detected, the app syncs incrementally (small delta payloads, not full re-uploads) rather than waiting for a stable connection.
- FR-9.3: Weekly doctor reports and caregiver alerts should support a **store-and-forward model** — if the patient's device has no connectivity, data queues and is sent as soon as the caregiver's or a relay device (e.g., a community health worker's phone) comes online.
- FR-9.4: Provide an **SMS/USSD fallback channel** for critical alerts (missed medication, sharp score decline) to reach caregivers who may not have smartphones or reliable data, since SMS typically works on weaker network signals than data services.
- FR-9.5: Avoid dependence on continuous cloud AI calls for core reminder/game functionality; where feasible, run lightweight on-device models for reminder logic and basic game adaptivity so functionality is not degraded by connectivity gaps (heavier AI analysis in Section 6.8 can run asynchronously when connectivity is available).

### 8.2 Language & Literacy Localization

- FR-9.6: Launch UI and voice support in major regional languages relevant to the target districts — e.g., **Assamese, Bengali, Bodo, Nagamese, Khasi, Mizo (Mizo tawng), Manipuri/Meitei (Meitei Mayek script support), and Nepali** — prioritized based on the specific states/districts of initial rollout, plus Hindi and English as bridge languages.
- FR-9.7: Given variable literacy levels among elderly users, prioritize **icon-based and voice-first navigation** over text-heavy UI; every core action (reminder acknowledgment, game instructions, mood check-in) should be operable via voice or large single-tap icons, not just text.
- FR-9.8: Voice prompts and the AI conversational companion (FR-8.4) should use **locally recorded, natural-sounding voice talent** in relevant regional languages/dialects rather than generic text-to-speech, since tone and familiarity matter significantly for elderly comfort and trust; synthetic TTS may be used as an interim fallback for lower-priority languages.
- FR-9.9: Game content (memory/language exercises) should be **culturally localized** — using regionally familiar objects, festivals, food, attire, and family structures — rather than direct translation of generic Western/urban content, to keep cognitive exercises relevant and effective.

### 8.3 Device & Infrastructure Constraints

- FR-9.10: Optimize the app for **low-end Android devices** (common in the region) with modest RAM/storage, and minimize battery drain given inconsistent access to charging (support for a "low power mode" that reduces background sync frequency and animation use).
- FR-9.11: Since patients may share a single family device or rely on a caregiver's phone, support a **multi-profile / shared-device mode** where a caregiver can quickly switch into "patient mode" for the day's interaction and back to their own profile.
- FR-9.12: For patients with no smartphone access at all, offer a **basic feature-phone mode**: scheduled reminder calls/SMS in the local language, and a simplified caregiver-operated logging flow (caregiver logs adherence/observations on their own smartphone on the patient's behalf).

### 8.4 Care Ecosystem Integration (Community Health Workers & Local Health System)

- FR-9.13: Given the shortage of neurologists/geriatricians in remote NE India, extend the "Doctor" role to support **ASHA (Accredited Social Health Activist) workers, ANMs (Auxiliary Nurse Midwives), and Primary Health Centre (PHC)/Community Health Centre (CHC) staff** as intermediate care-team roles who can review alerts, visit patients, and escalate to a district hospital or telemedicine specialist when needed — since a dedicated specialist may only be reachable periodically.
- FR-9.14: Support a **telemedicine handoff flow**: when a weekly report or AI-flagged pattern indicates a concern, the app can help the caregiver/health worker initiate a referral or telemedicine consultation with a district hospital or scheme-affiliated specialist (e.g., under India's Ayushman Bharat Digital Mission or state telemedicine programs), rather than assuming an already-assigned personal physician as in the base product.
- FR-9.15: Reports generated for community health workers should be **even simpler and more action-oriented** than the standard doctor report — e.g., a one-line status ("Adherence dropped, 2 missed medications, recommend home visit") rather than detailed trend graphs, matching the workflow and training level of ASHA/ANM staff.
- FR-9.16: Where possible, integrate with or export data compatible with existing government digital health infrastructure (e.g., Ayushman Bharat Health Account / ABHA ID) to support continuity of care across facilities.

### 8.5 Deployment, Distribution & Adoption Strategy

- Partner with **state health departments, NGOs, and local community/religious organizations** active in elder care and rural health outreach for distribution and trust-building, since a purely app-store-driven rollout is unlikely to reach the target population effectively.
- Consider a **community health worker-assisted onboarding model**: ASHA workers or local volunteers help install the app, set up the patient's reminder schedule, and train family caregivers during a home visit, given lower digital literacy among target families.
- Pricing/business model for this segment should account for lower ability to pay; consider **government scheme subsidization, NGO sponsorship, or a freemium core (reminders + basic games) with paid advanced AI/reporting tiers** for those who want it.
- Pilot in a small number of representative districts (varying terrain and connectivity profiles) before broader NE India rollout, to validate offline sync reliability, language content quality, and community health worker workflow fit.

### 8.6 Additional Non-Functional Requirements for This Deployment

| Category | Requirement |
|---|---|
| Network Resilience | Full core functionality (reminders, games, logging) with zero connectivity; incremental low-bandwidth sync; SMS fallback for critical alerts |
| Power Resilience | Low-power mode; minimal background processing; clear guidance for solar-charging/community charging point contexts where relevant |
| Language Coverage | Minimum viable set of regional languages defined per pilot district before launch; voice content prioritized over text |
| Device Compatibility | Must run acceptably on low-RAM/low-storage Android devices (define minimum spec, e.g., Android 8+, 2GB RAM) |
| Care-Team Flexibility | System must support non-physician care-team roles (ASHA/ANM/PHC staff) as first-class report recipients, not just a licensed doctor |
| Data Sync Cost | Minimize mobile data usage per sync cycle (target a low per-week data footprint) given cost-sensitivity of data plans in the region |

### 8.7 Risks Specific to This Deployment

| Risk | Mitigation |
|---|---|
| Elderly patients/families lack smartphones or reliable connectivity | Feature-phone mode (SMS/call reminders), caregiver-operated logging, offline-first core design |
| Low trust in a new app among rural elderly and families | Community health worker-assisted onboarding, partnerships with trusted local organizations, culturally localized content |
| Insufficient regional-language voice/AI quality at launch | Phase language rollout by pilot district priority; use human-recorded audio before investing in full regional AI/TTS models |
| Thin specialist doctor availability for weekly reports | Extend report recipients to ASHA/ANM/PHC staff with simplified, action-oriented reports; telemedicine referral flow for escalation |
| High cost of mobile data for target families | Aggressive data-usage optimization; SMS fallback; potential subsidized data partnerships |
| Regulatory/language variation across NE Indian states | Engage state-level health departments early; confirm compliance requirements per state during pilot planning |

---

## 9. User Journeys (Illustrative)

**Patient — Morning Routine:**
1. App sends a full-screen, audible reminder: "Time for your morning medication."
2. Patient taps "Done" or says "Done."
3. If not acknowledged in 30 minutes, caregiver receives a push notification: "Mom hasn't confirmed her 8 AM medication."

**Caregiver — Weekly Check:**
1. Opens dashboard, sees adherence at 92% this week, slight dip in memory game accuracy.
2. Adds a note: "Seemed more tired than usual on Wednesday."
3. Reviews auto-flagged trend alert and decides to mention it during the doctor's report review.

**Doctor — Report Review:**
1. Receives weekly PDF report via secure email Monday morning.
2. Scans adherence and score trend graphs, reads caregiver notes.
3. Sends an in-app message: "Let's increase the frequency of the attention exercises. See me next Tuesday if the trend continues."

---

## 10. Success Metrics (KPIs)

- Weekly Active Patients (WAP) and Weekly Active Caregivers (WAC)
- Task adherence rate (% completed on time)
- Game session frequency and completion rate
- Report open/engagement rate by doctors
- Caregiver-reported satisfaction (quarterly NPS/survey)
- Reduction in missed-medication incidents over time
- Retention rate at 30/60/90 days

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Over-claiming clinical benefit ("cures dementia") | Legal/clinical review of all copy; explicit disclaimers; position as a support & monitoring tool |
| Patient frustration with technology | Extensive usability testing with target age group; voice-first and single-tap interactions; caregiver-assisted setup |
| Alert fatigue for caregivers | Configurable priority levels and thresholds; digest options instead of every single alert |
| Health data breach | Encryption, strict access controls, regular security audits, compliance certification |
| Doctors not engaging with reports | Keep reports short, structured, and low-effort; allow customization of frequency/format |
| Caregiver burnout from constant monitoring | Design "quiet hours," smart batching of non-critical notifications, and positive-framing to avoid a surveillance feel |
| AI misinterpreted as a diagnosis, or regulatory non-compliance (SaMD) | Explicit non-diagnostic framing in UI/copy; early legal/regulatory assessment; explainable, data-backed flags only; clinical validation before launch |
| AI bias across languages/cultures/education levels leads to false or missed flags | Diverse validation dataset, per-patient baselining rather than population norms, ongoing bias audits with clinical advisors |
| Overreliance on AI insights by doctors or caregivers | UI reinforces "supplement, not replacement" messaging; underlying raw data always visible alongside any AI flag |

---

## 12. Open Questions for Stakeholder Review

1. Should the app support institutional use (care homes, assisted living facilities) in addition to home caregivers in v1.0, or defer to v2.0?
2. What clinical advisory board or partnership is needed to validate the games and scoring methodology before launch?
3. Which regions/regulatory frameworks (HIPAA, GDPR, India's DPDP Act, etc.) are the priority launch markets, since this affects the compliance architecture?
4. Should there be a "read-only" doctor portal in addition to email reports, for doctors managing many patients?
5. What is the pricing/business model (subscription, per-caregiver, healthcare-provider licensing)?
6. Should AI features (especially speech analysis and the doctor-facing insight panel) launch in v1.0, or be phased in after clinical validation and regulatory assessment are complete, to avoid delaying the core reminder/games/reporting functionality?
7. Which AI approach fits budget and timeline — a smaller, patient-specific baselining model (simpler, more explainable, per-user) vs. a larger population-trained model (potentially more powerful but harder to validate for bias and explainability)?
8. Which Northeast Indian states/districts should be prioritized for the initial pilot, and what is the language/dialect priority order for launch (this drives voice-content and translation investment)?
9. Which state health departments, NGOs, or telemedicine programs (e.g., existing Ayushman Bharat or state-run initiatives) should be approached as distribution/onboarding partners?
10. What is the minimum viable device/connectivity spec we should design and test against, based on ground-truth infrastructure conditions in the target pilot districts?

---

## 13. Appendix: Suggested Clinical Review Checklist (Pre-Launch)

- [ ] Cognitive game design reviewed by occupational therapist or neuropsychologist
- [ ] Scoring/grading methodology reviewed for clinical soundness and non-diagnostic framing
- [ ] All in-app and marketing copy reviewed for accurate, non-overstated claims
- [ ] Data privacy/compliance review completed (HIPAA/GDPR/regional)
- [ ] Accessibility audit completed with target-age user testing group
- [ ] Emergency escalation workflow tested end-to-end
- [ ] AI pattern-detection and (if included) speech-analysis models validated against clinical ground truth
- [ ] Regulatory/legal assessment of SaMD classification completed for AI decision-support features
- [ ] AI outputs tested for bias across languages, education levels, and cultural backgrounds
- [ ] AI explainability confirmed — every flag traceable to underlying data, no unexplained scores shown to doctors or caregivers

---

*This document is a living draft intended to guide design, engineering, and clinical review discussions. It should be updated as user research, clinical input, and regulatory review progress.*
