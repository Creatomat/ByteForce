# Feature Maintenance & Lifecycle Instructions — Recollect

> **Platform:** Recollect (Cognitive Care, Routine Support & Monitoring Platform)  
> **Target Audience:** Developers, AI Agents & Contributors  
> **Purpose:** This document is the **mandatory, exhaustive checklist** of every file, layer, and specification that must invariably be updated whenever a feature is **added**, **improved**, **changed**, or **removed** in Recollect.

---

## 1. Architectural Layer Map

Whenever modifying Recollect, you must inspect and update the corresponding layers across the codebase:

```
+-------------------------------------------------------------------------------+
|                           RECOLLECT PLATFORM LAYERS                           |
+-------------------+-----------------------------+-----------------------------+
| Layer             | Primary File(s)             | Responsibilities            |
+-------------------+-----------------------------+-----------------------------+
| 1. Markup & DOM   | index.html                  | Semantic HTML5, IDs, ARIA,  |
|                   |                             | data-i18n attributes        |
+-------------------+-----------------------------+-----------------------------+
| 2. Styling &      | css/styles.css              | Biophilic Light, Dark Mode, |
|    Theming        |                             | High Contrast, Font Scaling |
+-------------------+-----------------------------+-----------------------------+
| 3. Application    | js/app.js                   | Controller, State, Engines, |
|    Controller     |                             | Cross-Role Sync, Telemetry  |
+-------------------+-----------------------------+-----------------------------+
| 4. Data Layer     | js/db.js                    | Offline LocalStorage schema,|
|                   |                             | seed data, sync queue       |
+-------------------+-----------------------------+-----------------------------+
| 5. International- | js/i18n.js                  | 5 Regional Languages, TTS,  |
|    ization        |                             | Web Audio chime fallback    |
+-------------------+-----------------------------+-----------------------------+
| 6. Documentation  | README.md, docs/*.md        | Features, Manual, PRD,      |
|                   |                             | Architecture, Design, Rules |
+-------------------+-----------------------------+-----------------------------+
```

---

## 2. Invariant Design & Engineering Rules

Before editing any code, verify strict adherence to Recollect's foundational invariants:

1. **"Calm Over Clever" Senior UX**:
   - Zero countdown timers, zero penalty buzzers, zero red error states on the senior patient interface.
   - Exactly one primary decision per screen or modal.
   - Generous touch targets ($\ge 64\text{px}$) and large typography ($\ge 20\text{pt}$ base).
2. **5-Language Parity**:
   - Every single user-facing string must be translated across all 5 regional languages:
     1. **English (`en`)**
     2. **Assamese (`as`)**
     3. **Bengali (`bn`)**
     4. **Khasi (`kha`)**
     5. **Hindi (`hi`)**
   - Never add a hardcoded string to `index.html` or `app.js` without a corresponding `data-i18n` attribute and 5 dictionary entries in `js/i18n.js`.
3. **Triple Theme Compatibility**:
   - All visual elements must render cleanly in:
     1. **Default Light Biophilic** (warm cream `#fdfbf7`, soft sage green `#059669`, terracotta `#c2410c`).
     2. **Dark Mode** (`body.dark-mode` / `#0b1329` slate palette).
     3. **High Contrast Mode** (`body.high-contrast-mode` / pure black `#000000`, white `#ffffff`, yellow `#ffff00`, $\ge 3\text{px}$ solid borders).
4. **3-Tier Senior Font Scaling**:
   - Ensure text and layout elements scale cleanly across:
     - `body.font-scale-normal` (20pt base)
     - `body.font-scale-large` (24pt / +20%)
     - `body.font-scale-xlarge` (28pt / +40%)
5. **Two-Way Cross-Role Synchronization**:
   - Patient interactions (routine completion, mood log, game session, emergency help) must silently and immediately update:
     - `recollectDB` tables.
     - The Caregiver Activity & Hand-off Log.
     - The Longitudinal Trends chart and adherence indicators.
     - The Doctor's Clinical Hub and `RuleEngine` flags.
6. **Zero Build Tools & Offline-First Integrity**:
   - Vanilla HTML5, CSS3, and ES6+ modules only. No Webpack, Vite, Babel, or npm build dependencies.
   - Must run directly via GitHub Pages or any static HTTP server.

---

## 3. Action-Specific Checklists

### 3.1 Checklist: When ADDING a New Feature

- [ ] **1. Markup (`index.html`)**:
  - [ ] Add semantic HTML elements with distinct IDs.
  - [ ] Add accessibility attributes: `role`, `aria-label`, `aria-modal`, `aria-labelledby`.
  - [ ] Attach `data-i18n="<key>"` to all text nodes and `data-i18n-placeholder="<key>"` to inputs.
  - [ ] Wire user click events to `app.<methodName>()`.

- [ ] **2. Styling & Theming (`css/styles.css`)**:
  - [ ] Add core styles under the appropriate section using CSS custom properties (`var(--primary)`, `var(--surface)`, etc.).
  - [ ] Add dark mode overrides under `/* DARK MODE THEME */` (`body.dark-mode .<class>`).
  - [ ] Add high contrast overrides under `/* High Contrast Alternate Theme */` (`body.high-contrast-mode .<class>`).
  - [ ] Add font scaling selectors under `body.font-scale-large` and `body.font-scale-xlarge`.
  - [ ] Ensure mobile and tablet responsiveness with flexible grid / flex layouts.

- [ ] **3. Controller & State (`js/app.js`)**:
  - [ ] Initialize feature state variables in `RecollectApp.constructor()`.
  - [ ] Restore persisted state from `localStorage` in `init()` if applicable.
  - [ ] Implement event handler methods and validation logic.
  - [ ] If senior patient action: dispatch telemetry to `recollectDB.insert...` and `recollectDB.addActivityLog`.
  - [ ] Evaluate clinical rules via `window.ruleEngine.evaluateAllRules()` if clinical telemetry is affected.
  - [ ] Trigger cross-role UI renders (`renderActivityLogs()`, `updateClinicalMetrics()`, etc.).

- [ ] **4. Database Layer (`js/db.js`)**:
  - [ ] If new entity: define table store name and seed initial mock records.
  - [ ] Provide helper query/mutation methods on `RecollectDB` (e.g. `insert...`, `get...`).
  - [ ] Queue changes for offline synchronization via `queueSync()`.

- [ ] **5. Internationalization (`js/i18n.js`)**:
  - [ ] Add new dictionary keys to English (`en`).
  - [ ] Add accurate translations to Assamese (`as`).
  - [ ] Add accurate translations to Bengali (`bn`).
  - [ ] Add accurate translations to Khasi (`kha`).
  - [ ] Add accurate translations to Hindi (`hi`).
  - [ ] If spoken audio is involved: add TTS voice script in `speakText()` or provide pentatonic chime fallback.

- [ ] **6. Documentation Suite**:
  - [ ] `README.md`: Add feature bullet point and architectural mentions.
  - [ ] `docs/features.md`: Add functional requirements, personas impacted, and edge cases.
  - [ ] `docs/user_manual.md`: Add step-by-step instructions for seniors, caregivers, or clinicians.
  - [ ] `docs/prd.md`: Add or expand formal Functional Requirement (FR) entry.
  - [ ] `docs/architecture.md`: Update component map, state flow diagram, or data schema.
  - [ ] `docs/design.md`: Document layout specifications, typography, color tokens, and touch rules.
  - [ ] `docs/rules.md`: Document clinical heuristics, safety bounds, or non-punitive guidelines.

---

### 3.2 Checklist: When IMPROVING or MODIFYING an Existing Feature

- [ ] **1. Markup (`index.html`)**:
  - [ ] Update element attributes, structures, or modals without breaking existing element IDs.
  - [ ] Verify that existing onclick handlers still bind to valid controller methods.

- [ ] **2. Styling & Theming (`css/styles.css`)**:
  - [ ] Update component styles while maintaining CSS variable bindings.
  - [ ] Verify that dark mode overrides still match updated class names.
  - [ ] Verify that high contrast borders and background rules apply cleanly.
  - [ ] Verify that font scaling rules apply to any newly introduced child elements.

- [ ] **3. Controller & State (`js/app.js`)**:
  - [ ] Refactor or extend existing controller methods.
  - [ ] Preserve telemetry logging and cross-role dispatch signatures.
  - [ ] Ensure backward compatibility with existing `localStorage` keys and data structures.

- [ ] **4. Database Layer (`js/db.js`)**:
  - [ ] If schema fields changed: update existing table serialization and seed data.

- [ ] **5. Internationalization (`js/i18n.js`)**:
  - [ ] Update translation strings across all 5 languages (`en`, `as`, `bn`, `kha`, `hi`).
  - [ ] Ensure placeholder replacements (e.g. `{score}`, `{target}`) match new parameters.

- [ ] **6. Documentation Suite**:
  - [ ] Update `docs/features.md` to reflect improved capabilities and parameters.
  - [ ] Update `docs/user_manual.md` with revised UI navigation or descriptions.
  - [ ] Update `docs/prd.md`, `docs/architecture.md`, `docs/design.md`, and `docs/rules.md`.

---

### 3.3 Checklist: When CHANGING Feature Behavior / Interaction Flow

- [ ] **1. Review Dementia Care Safety Invariants**:
  - [ ] Ensure the new behavior does not introduce anxiety, urgency countdowns, or harsh buzzers.
  - [ ] Ensure changes to appearance/settings are password-gated behind Caregiver PIN `1234`.

- [ ] **2. Codebase Updates**:
  - [ ] Update HTML, CSS, `app.js`, `db.js`, and `i18n.js` in lockstep.
  - [ ] Verify that telemetry dispatched to `recollectDB` accurately reflects new behavioral metrics.

- [ ] **3. Documentation Updates**:
  - [ ] Document the behavioral change rationale in `docs/design.md` and `docs/rules.md`.
  - [ ] Update user journey walkthroughs in `docs/user_manual.md`.
  - [ ] Update requirements in `docs/prd.md` and `docs/features.md`.

---

### 3.4 Checklist: When REMOVING or DEPRECATING a Feature

- [ ] **1. Markup (`index.html`)**:
  - [ ] Safely remove obsolete DOM nodes and buttons.
  - [ ] Ensure no broken aria references (`aria-labelledby`, `role="dialog"`).

- [ ] **2. Styling (`css/styles.css`)**:
  - [ ] Remove dead CSS rules, including obsolete dark mode, high contrast, and font-scale selectors.

- [ ] **3. Controller (`js/app.js`)**:
  - [ ] Remove unused state variables, methods, intervals, and event listeners.
  - [ ] Ensure calls from other modules do not throw `TypeError: undefined is not a function`.

- [ ] **4. Database Layer (`js/db.js`)**:
  - [ ] Deprecate table or cleanup obsolete keys from `localStorage`.

- [ ] **5. Internationalization (`js/i18n.js`)**:
  - [ ] Clean up deprecated dictionary keys across all 5 languages.

- [ ] **6. Documentation**:
  - [ ] Remove references from `README.md`, `docs/features.md`, and `docs/user_manual.md`.
  - [ ] Note deprecation in `docs/prd.md` and `docs/architecture.md`.

---

## 4. Quality Verification & Testing Protocol

Before committing any feature modifications, execute the following verification steps:

1. **Syntax & Parity Verification**:
   - Run delimiter parity checks on `js/app.js`, `js/db.js`, and `js/i18n.js`:
     ```bash
     python3 -c "
     for path in ['ByteForce/js/app.js', 'ByteForce/js/db.js', 'ByteForce/js/i18n.js']:
         with open(path) as f: code = f.read()
         stack = []
         for line_no, ch in enumerate(code, 1):
             if ch in '{[(': stack.append(ch)
             elif ch in '}])':
                 if not stack: raise Exception(f'Unmatched {ch} in {path}')
                 stack.pop()
         assert not stack, f'Unclosed delimiters in {path}'
     print('All JavaScript files: Delimiter Parity Verified!')
     "
     ```

2. **5-Language Integrity Verification**:
   - Confirm that all 5 languages have identical dictionary key counts or fallbacks:
     ```bash
     python3 -c "
     with open('ByteForce/js/i18n.js') as f: content = f.read()
     for lang in ['en', 'as', 'bn', 'kha', 'hi']:
         assert f'\"{lang}\":' in content, f'Missing {lang} dictionary in i18n.js'
     print('All 5 Regional Languages Verified!')
     "
     ```

3. **Theme & Scaling Visual Check**:
   - Verify Default Light Theme renders properly.
   - Verify Dark Mode toggles on (`body.dark-mode`) and renders with low glare.
   - Verify High Contrast Mode (`body.high-contrast-mode`) renders with AAA contrast.
   - Verify Large (`24pt`) and Extra Large (`28pt`) font scaling preserves card geometry without truncation.

4. **Cross-Role Synchronicity Check**:
   - Perform an action in the Senior Patient Space.
   - Switch to Family Caregiver Portal (`PIN 1234`); verify instant update in today's timeline and activity log.
   - Switch to Doctor Clinical Hub (`Passcode 9999`); verify clinical telemetry and flags reflect the action.
