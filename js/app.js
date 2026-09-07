/**
 * Recollect Application Controller & Authentication Engine
 * Complies with: PRD.md, architecture.md, design.md, rules.md, phases.md
 */

class RecollectApp {
  constructor() {
    this.activeSession = null;
    this.patientId = 'p_eleanor_vance_001';
    this.caregiverId = 'cg_sarah_vance_001';
    this.isOnline = true;
    this.isLowPower = false;
    this.isHighContrast = false;
    this.fontScale = 'normal';
    this.voiceModeEnabled = true;
    this.activePhotoPack = 'family'; // 'family' | 'cultural'
    this.currentCategory = 'memory';
    this.activeMessageChannel = 'doctor'; // 'doctor' | 'asha'

    // Patient Score Tracker
    this.patientStars = parseInt(localStorage.getItem('recollect_patient_stars') || '12', 10);
    this.currentGameScore = 100;
    this.activeGameEngine = 'memory'; // 'memory' | 'attention' | 'language' | 'problem'

    // Game 1: Memory state
    this.gameStartTime = null;
    this.gameMistakes = 0;
    this.gameMatches = 0;
    this.lastCardClickTime = null;
    this.hesitationSamples = [];
    this.activeCards = [];
    this.selectedCards = [];
    this.isCheckingMatch = false;

    // Game 2: Attention state
    this.attentionTarget = null;
    this.attentionTotalTargets = 3;
    this.attentionFoundCount = 0;
    this.attentionTiles = [];

    // Game 3: Language state
    this.languageRoundIndex = 0;
    this.languageTotalRounds = 3;
    this.languageItems = [];
    this.currentLanguageItem = null;

    // Game 4: Problem Solving state
    this.problemRoutineType = 'morning';
    this.problemNextStep = 1;
    this.problemSteps = [];
    this.problemPlacedSteps = [];

    // Active call state
    this.activeCallInterval = null;
    this.callDurationSec = 0;

    // Toast timeout
    this.toastTimeout = null;

    // Periodic time & orientation update
    this.clockInterval = null;

    this.init();
  }

  init() {
    // 1. Restore persistent accessibility & appearance preferences
    this.isDarkMode = localStorage.getItem('recollect_dark_mode') === 'true';
    this.isHighContrast = localStorage.getItem('recollect_high_contrast') === 'true';

    this.darkScheduleEnabled = localStorage.getItem('recollect_dark_schedule_enabled') === 'true';
    this.darkScheduleStart = localStorage.getItem('recollect_dark_schedule_start') || '20:00';
    this.darkScheduleEnd = localStorage.getItem('recollect_dark_schedule_end') || '07:00';

    this.hcScheduleEnabled = localStorage.getItem('recollect_hc_schedule_enabled') === 'true';
    this.hcScheduleStart = localStorage.getItem('recollect_hc_schedule_start') || '18:00';
    this.hcScheduleEnd = localStorage.getItem('recollect_hc_schedule_end') || '21:00';

    this.syncThemeControls();
    this.evaluateThemeSchedules();

    this.fontScale = localStorage.getItem('recollect_font_scale') || 'normal';
    document.body.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    document.body.classList.add(`font-scale-${this.fontScale}`);
    const fontSelect = document.getElementById('fontSizeSelector');
    if (fontSelect) fontSelect.value = this.fontScale;

    // 2. Initialize i18n
    if (window.i18n) {
      window.i18n.updateDOM();
      const savedLang = localStorage.getItem('recollect_lang') || 'en';
      const langSelect = document.getElementById('langSelect');
      if (langSelect) langSelect.value = savedLang;
      const settingsLang = document.getElementById('settingsLangSelect');
      if (settingsLang) settingsLang.value = savedLang;
    }

    // 3. Dynamic Time & Orientation Engine
    this.updateOrientationTime();
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(() => {
      this.updateOrientationTime();
      this.evaluateThemeSchedules();
    }, 30000);

    // 4. Restore Alert Escalation Settings
    this.restoreAlertSettings();

    // 5. Evaluate Phase-1 rules
    if (window.ruleEngine) {
      window.ruleEngine.evaluateAllRules(this.patientId);
    }

    // 6. Restore authenticated session
    this.restoreSession();

    // 7. Initialize Patient Score Display
    this.updatePatientScoreDisplay();
  }

  // --- Dynamic Time, Greeting, and Date Engine ---
  updateOrientationTime() {
    const now = new Date();
    const hour = now.getHours();

    // Determine greeting & weather keys
    const greetingKey = window.i18n ? window.i18n.getTimeOfDayGreetingKey(hour) : 'greeting_morning';
    const weatherKey = window.i18n ? window.i18n.getTimeOfDayWeatherKey(hour) : 'weather_morning';

    // 1. Update Patient Greeting
    const greetingEl = document.querySelector('.orientation-greeting');
    if (greetingEl && window.i18n) {
      greetingEl.setAttribute('data-i18n', greetingKey);
      greetingEl.textContent = window.i18n.getText(greetingKey);
    }

    // 2. Update Patient Date
    const dateEl = document.querySelector('.orientation-date');
    if (dateEl && window.i18n) {
      dateEl.textContent = window.i18n.getFormattedDate(now);
    }

    // 3. Update Weather Info
    const weatherEl = document.querySelector('.orientation-meta span:first-child');
    if (weatherEl && window.i18n) {
      weatherEl.setAttribute('data-i18n', weatherKey);
      weatherEl.textContent = window.i18n.getText(weatherKey);
    }

    // 4. Update Caregiver Header Live Sync time
    const syncText = document.getElementById('cgSyncText');
    if (syncText) {
      syncText.textContent = window.i18n ? window.i18n.t('live_hub_sync', { time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }) : `Live Hub Sync: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // 5. Update next or current scheduled routine on patient dashboard
    this.updatePatientRoutineCard();
  }

  updatePatientRoutineCard() {
    const routineCard = document.getElementById('currentRoutineCard');
    if (!routineCard) return;

    const logs = window.recollectDB ? window.recollectDB.getItem('ReminderLog') : [];
    const isTaken = logs.some(l => l.reminder_id === 'rem_001' && l.patient_response === 'acknowledged');

    const takeMedBtn = document.getElementById('takeMedBtn');
    const routineTimeTag = document.getElementById('routineTimeTag');
    const routineNameEl = document.querySelector('[data-i18n="routine_name"]');
    const routineSubEl = document.querySelector('[data-i18n="routine_sub"]');

    if (isTaken) {
      if (takeMedBtn) {
        takeMedBtn.classList.add('done-state');
        takeMedBtn.style.background = '#059669';
        takeMedBtn.innerHTML = `<span>✓</span> <span>${window.i18n ? window.i18n.getText('med_taken_confirm', { time: '9:02 AM' }) : 'Completed • Wonderful job, Eleanor!'}</span>`;
      }
      if (routineTimeTag) {
        routineTimeTag.textContent = window.i18n ? window.i18n.t('routine_completed_today') : 'Completed for today';
        routineTimeTag.style.color = '#059669';
      }
    } else {
      if (takeMedBtn) {
        takeMedBtn.classList.remove('done-state');
        takeMedBtn.style.background = '';
        takeMedBtn.innerHTML = `<span>✓</span> <span data-i18n="take_med_btn">${window.i18n ? window.i18n.getText('take_med_btn') : 'I took my medicine'}</span>`;
      }
      if (routineTimeTag) {
        routineTimeTag.textContent = window.i18n ? window.i18n.t('routine_scheduled_for', { time: '9:00 AM' }) : 'Scheduled for 9:00 AM';
        routineTimeTag.style.color = 'var(--on-surface-variant)';
      }
    }
  }

  // --- Brand Home Navigation ---
  handleBrandClick() {
    this.showLoginScreen();
    this.showToast(window.i18n ? window.i18n.t('toast_nav_profile') : 'Navigated to profile and space selection.', '🌿');
  }

  // --- Session & Authentication Engine (PRD FR-7.1, FR-9.11) ---
  restoreSession() {
    const session = window.recollectDB.getActiveSession();
    if (session && session.role) {
      this.applySession(session);
    } else {
      this.showLoginScreen();
    }
  }

  showLoginScreen() {
    this.activeSession = null;
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active-view'));
    document.getElementById('view-login')?.classList.add('active-view');

    const badge = document.getElementById('activeUserBadge');
    if (badge) badge.style.display = 'none';

    document.getElementById('networkToggleBtn')?.style.setProperty('display', 'none');
    document.getElementById('powerModeBtn')?.style.setProperty('display', 'none');
    document.getElementById('langSelect')?.style.setProperty('display', 'none');
    document.getElementById('emergencyHelpBtn')?.style.setProperty('display', 'none');
    document.getElementById('patientCaregiverSettingsBtn')?.style.setProperty('display', 'none');
    document.getElementById('appLogoutBtn')?.style.setProperty('display', 'none');
  }

  loginAsRole(role) {
    let pin = '';
    if (role === 'caregiver') {
      pin = document.getElementById('cgPinInput')?.value || '';
    } else if (role === 'clinical') {
      pin = document.getElementById('clinPinInput')?.value || '';
    }

    const authResult = window.recollectDB.authenticateUser(role, pin);
    if (!authResult.success) {
      this.showToast(window.i18n ? window.i18n.t('toast_pin_incorrect') : authResult.error, '⚠️');
      return;
    }

    window.recollectDB.setActiveSession(authResult.session);
    this.applySession(authResult.session);
    const roleTitle = window.i18n ? (authResult.session.role === 'patient' ? window.i18n.t('role_senior_space') : (authResult.session.role === 'caregiver' ? window.i18n.t('role_caregiver_title') : window.i18n.t('role_clinical_title'))) : authResult.session.title;
    this.showToast(window.i18n ? window.i18n.t('toast_login_success', { title: roleTitle }) : `Logged in to ${authResult.session.title}`, '🌿');
  }

  applySession(session) {
    this.activeSession = session;

    const badge = document.getElementById('activeUserBadge');
    const avatar = document.getElementById('activeUserAvatar');
    const name = document.getElementById('activeUserName');
    const roleTitle = document.getElementById('activeUserRoleTitle');

    if (badge && avatar && name && roleTitle) {
      badge.style.display = 'flex';
      name.textContent = session.name;
      let roleKey = 'role_senior_space';
      if (session.role === 'caregiver') roleKey = 'role_caregiver_title';
      if (session.role === 'clinical') roleKey = 'role_clinical_title';
      roleTitle.setAttribute('data-i18n', roleKey);
      roleTitle.textContent = window.i18n ? window.i18n.getText(roleKey) : `(${session.title})`;

      if (session.role === 'patient') {
        avatar.textContent = '👵';
        document.getElementById('networkToggleBtn')?.style.setProperty('display', 'none');
        document.getElementById('powerModeBtn')?.style.setProperty('display', 'none');
        document.getElementById('langSelect')?.style.setProperty('display', 'none');
        document.getElementById('appLogoutBtn')?.style.setProperty('display', 'none');
        document.getElementById('emergencyHelpBtn')?.style.setProperty('display', 'inline-flex');
        document.getElementById('patientCaregiverSettingsBtn')?.style.setProperty('display', 'inline-flex');
      } else {
        avatar.textContent = session.role === 'caregiver' ? '👩' : '🩺';
        document.getElementById('networkToggleBtn')?.style.setProperty('display', 'inline-flex');
        document.getElementById('powerModeBtn')?.style.setProperty('display', 'inline-flex');
        document.getElementById('langSelect')?.style.setProperty('display', 'inline-flex');
        document.getElementById('appLogoutBtn')?.style.setProperty('display', 'inline-flex');
        document.getElementById('emergencyHelpBtn')?.style.setProperty('display', 'none');
        document.getElementById('patientCaregiverSettingsBtn')?.style.setProperty('display', 'none');
      }
    }

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active-view'));
    const targetSection = document.getElementById(`view-${session.role}`);
    if (targetSection) {
      targetSection.classList.add('active-view');
    }

    if (session.role === 'patient') {
      this.refreshPatientHomeState();
    } else if (session.role === 'caregiver') {
      this.renderCaregiverTimeline();
      this.renderCaregiverNotes();
      this.renderCareTeamGrid();
      this.renderCareTeamMessages();
      this.renderActivityLogs();
    } else if (session.role === 'clinical') {
      this.updateClinicalMetrics();
      this.renderBehaviorFlags();
    }
  }

  logoutUser() {
    window.recollectDB.clearActiveSession();
    this.showLoginScreen();
    this.showToast(window.i18n ? window.i18n.t('toast_logout_success') : 'Logged out securely.', '🔒');
  }

  refreshPatientHomeState() {
    this.updateOrientationTime();
  }

  // --- Patient Actions & Full Attention Modal ---
  openReminderAttention() {
    const modal = document.getElementById('reminderAttentionModal');
    if (modal) {
      modal.classList.add('active-modal');
      const listeningText = document.getElementById('voiceListeningText');
      if (listeningText && window.i18n) {
        listeningText.textContent = window.i18n.getText('voice_listening');
      }
      if (this.voiceModeEnabled && window.i18n) {
        const promptText = window.i18n ? window.i18n.t("tts_med_morning_prompt") : "Eleanor, it is time for your morning medicine. Take 1 yellow tablet with a full glass of cool water.";
        window.i18n.speakText(promptText);
      }
    }
  }

  closeReminderAttention() {
    document.getElementById('reminderAttentionModal')?.classList.remove('active-modal');
  }

  confirmMorningMedicine() {
    const now = new Date();
    const isoString = now.toISOString();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    window.recollectDB.insertReminderLog({
      reminder_id: 'rem_001',
      patient_id: this.patientId,
      scheduled_for: '2026-09-07T09:00:00Z',
      patient_response: 'acknowledged',
      responded_at: isoString,
      response_latency_seconds: 120
    });

    // Append to Caregiver Activity & Hand-off Log (Cross-role synchronization)
    window.recollectDB.addActivityLog({
      author: 'Eleanor Vance (Bedside Tablet)',
      role: 'Senior Patient Space',
      action: 'Routine Completed',
      content: `Eleanor confirmed taking Morning Blood Pressure Pill (Lisinopril 10mg) with a glass of water at ${timeStr}.`,
      timestamp: isoString
    });

    this.closeReminderAttention();
    this.updatePatientRoutineCard();
    this.renderCaregiverTimeline();
    this.renderActivityLogs();

    if (window.ruleEngine) {
      window.ruleEngine.evaluateAllRules(this.patientId);
      this.renderBehaviorFlags();
    }

    const confirmMsg = window.i18n 
      ? window.i18n.getText('med_taken_confirm', { time: timeStr })
      : `Completed at ${timeStr} • Wonderful job, Eleanor!`;
    this.showToast(confirmMsg, '🌸');

    if (window.i18n) {
      window.i18n.speakText(window.i18n.t("tts_med_morning_congrat"));
    }
  }

  snoozeReminder() {
    this.closeReminderAttention();
    const now = new Date().toISOString();
    window.recollectDB.addActivityLog({
      author: 'Eleanor Vance (Bedside Tablet)',
      role: 'Senior Patient Space',
      action: 'Routine Snoozed',
      content: 'Eleanor requested a 10-minute snooze for Morning Medicine.',
      timestamp: now
    });
    this.renderActivityLogs();
    this.showToast(window.i18n ? window.i18n.t('toast_rem_snooze') : 'Reminder snoozed for 10 minutes. Sarah has been notified.', '⏰');
  }

  requestReminderHelp() {
    this.closeReminderAttention();
    const now = new Date().toISOString();
    window.recollectDB.addActivityLog({
      author: 'Eleanor Vance (Bedside Tablet)',
      role: 'Senior Patient Space',
      action: '🚨 Assistance Requested',
      content: 'Eleanor requested help with morning medicine from daughter Sarah.',
      timestamp: now
    });
    this.renderActivityLogs();
    this.showToast(window.i18n ? window.i18n.t('toast_rem_help') : 'Sarah has been notified that you need help. She will call you shortly!', '🤝');
  }

  // --- Auditory Narration & Speech (PRD FR-9.8) ---
  playDayNarration() {
    const btn = document.getElementById('listenDayBtn');
    const icon = document.getElementById('speakerIcon');

    if (window.i18n && window.i18n.isSpeaking) {
      window.i18n.stopSpeaking();
      btn?.classList.remove('speaking');
      if (icon) icon.textContent = '🔊';
      return;
    }

    btn?.classList.add('speaking');
    if (icon) icon.textContent = '⏸️';

    window.i18n.speakText(null, () => {
      btn?.classList.remove('speaking');
      if (icon) icon.textContent = '🔊';
    });
  }



  // --- Brain & Memory Games Hub ---
  openGamesHub() {
    document.getElementById('gamesHubModal')?.classList.add('active-modal');
  }

  closeGamesHub() {
    document.getElementById('gamesHubModal')?.classList.remove('active-modal');
  }

  switchPhotoPack(packType) {
    this.activePhotoPack = packType;
    const btnFamily = document.getElementById('packBtnFamily');
    const btnCultural = document.getElementById('packBtnCultural');
    const subtitle = document.getElementById('packSubtitleLabel');

    if (packType === 'family') {
      btnFamily?.classList.add('primary');
      btnCultural?.classList.remove('primary');
      if (subtitle) subtitle.textContent = window.i18n ? window.i18n.t('pack_family_name') : 'Family Photo Match';
      this.showToast(window.i18n ? window.i18n.t('toast_pack_family') : 'Switched to Family Photos Pack (Granddaughter Lily, Buddy)', '📷');
    } else {
      btnCultural?.classList.add('primary');
      btnFamily?.classList.remove('primary');
      if (subtitle) subtitle.textContent = window.i18n ? window.i18n.t('pack_cultural_name') : 'Northeast Cultural Pack';
      this.showToast(window.i18n ? window.i18n.t('toast_pack_cultural') : 'Switched to Northeast India Cultural Memories (Bihu, Tea, River)', '🌿');
    }
  }

  // ==========================================================================
  // BRAIN & COGNITIVE GAMES: 4 DISTINCT ENGINES, FULL-SCREEN & SCORE TRACKER
  // ==========================================================================
  startCategoryGame(category) {
    this.currentCategory = category;
    this.activeGameEngine = category;
    this.closeGamesHub();

    // Reset session telemetry
    this.gameMistakes = 0;
    this.gameMatches = 0;
    this.hesitationSamples = [];
    this.gameStartTime = Date.now();
    this.lastCardClickTime = Date.now();
    this.currentGameScore = 100;

    // Update header icons and localized titles
    const badge = document.getElementById('gameCategoryBadge');
    const titleEl = document.getElementById('gameModalTitle');
    const icons = {
      memory: '🌸',
      attention: '🔍',
      language: '🗣️',
      problem: '🧩'
    };
    const titles = {
      memory: window.i18n ? window.i18n.t('game_modal_title_memory') : '🌸 Family Photo Memory Game',
      attention: window.i18n ? window.i18n.t('game_modal_title_attention') : '🔍 Garden Flower Focus Game',
      language: window.i18n ? window.i18n.t('game_modal_title_language') : '🗣️ Word & Everyday Object Recall Game',
      problem: window.i18n ? window.i18n.t('game_modal_title_problem') : '🧩 Daily Routine Step Game'
    };

    if (badge) badge.textContent = icons[category] || '🌸';
    if (titleEl) titleEl.textContent = titles[category] || '🌸 Memory & Brain Game';

    this.updateInGameScoreDisplay();
    this.updateBloomProgress(0);

    // Launch appropriate engine
    if (category === 'memory') {
      this.setupMemoryGame();
    } else if (category === 'attention') {
      this.setupAttentionGame();
    } else if (category === 'language') {
      this.setupLanguageGame();
    } else if (category === 'problem') {
      this.setupProblemSolvingGame();
    }

    const modal = document.getElementById('gameModal');
    if (modal) {
      modal.classList.add('active-modal', 'active-takeover');
    }
  }

  // --------------------------------------------------------------------------
  // PATIENT-SIDE SCORE TRACKER
  // --------------------------------------------------------------------------
  updatePatientScoreDisplay() {
    const homePillText = document.getElementById('patientHomeScoreText');
    const stage = this.getBloomStageLabel(this.patientStars);
    const label = window.i18n ? window.i18n.t('score_tracker_stars') : 'Garden Stars';

    if (homePillText) {
      homePillText.textContent = `${label}: ${this.patientStars} • ${stage}`;
    }
  }

  updateInGameScoreDisplay() {
    const starsText = document.getElementById('inGameStarsText');
    const scoreText = document.getElementById('inGameScoreText');
    const stage = this.getBloomStageLabel(this.patientStars);
    const starsLabel = window.i18n ? window.i18n.t('score_tracker_stars') : 'Garden Stars';

    if (starsText) {
      starsText.textContent = `${starsLabel}: ${this.patientStars}`;
    }
    if (scoreText) {
      const scoreStr = window.i18n ? window.i18n.t('score_tracker_pts', { score: this.currentGameScore }) : `Score: ${this.currentGameScore} pts`;
      scoreText.textContent = `${scoreStr} • ${stage}`;
    }
  }

  getBloomStageLabel(stars) {
    if (stars >= 20) return window.i18n ? window.i18n.t('bloom_stage_sunflower') : '🌻 Sunflower Champion';
    if (stars >= 12) return window.i18n ? window.i18n.t('bloom_stage_daisy') : '🌼 Blooming Daisy';
    if (stars >= 6) return window.i18n ? window.i18n.t('bloom_stage_budding') : '🌿 Budding Green';
    return window.i18n ? window.i18n.t('bloom_stage_sprout') : '🌱 Fresh Sprout';
  }

  updateBloomProgress(matchesCount) {
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`bloomDot${i}`);
      if (dot) {
        if (i <= matchesCount) {
          dot.textContent = '🌻';
          dot.classList.add('bloomed');
        } else {
          dot.textContent = '🌱';
          dot.classList.remove('bloomed');
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // ENGINE 1: MEMORY GAME (Family & Cultural Photo Matching)
  // --------------------------------------------------------------------------
  setupMemoryGame() {
    let cardData = [];

    if (this.activePhotoPack === 'family') {
      cardData = [
        { id: 'c1', label: 'Granddaughter Lily', subtitle: 'Lily in Sunny Dress', art: '👧' },
        { id: 'c2', label: 'Buddy the Dog', subtitle: 'Golden Family Dog', art: '🐕' },
        { id: 'c3', label: 'Rose Garden', subtitle: 'Yellow Terrace Bloom', art: '🌹' },
        { id: 'c4', label: 'Sunday Lunch Tea', subtitle: 'Family Tea Cup', art: '🫖' }
      ];
    } else {
      cardData = [
        { id: 'c1', label: 'Assam Tea Garden', subtitle: 'Green Hills & Mist', art: '🍃' },
        { id: 'c2', label: 'Bihu Dhol Drum', subtitle: 'Harvest Festival Beat', art: '🥁' },
        { id: 'c3', label: 'Brahmaputra Sunset', subtitle: 'Golden River Glow', art: '🌅' },
        { id: 'c4', label: 'Rhino of Kaziranga', subtitle: 'Gentle Wildlife', art: '🦏' }
      ];
    }

    const deck = [];
    cardData.forEach(item => {
      deck.push({ ...item, uid: item.id + '_a', isMatched: false, isRevealed: false });
      deck.push({ ...item, uid: item.id + '_b', isMatched: false, isRevealed: false });
    });

    this.activeCards = deck.sort(() => 0.5 - Math.random());
    this.selectedCards = [];
    this.isCheckingMatch = false;

    const banner = document.getElementById('gameFeedbackBanner');
    if (banner) {
      banner.textContent = window.i18n ? window.i18n.t('game_feedback_welcome') : '💚 Welcome to your garden memories! Touch two cards to peek.';
    }

    this.renderMemoryGrid();
  }

  renderMemoryGrid() {
    const area = document.getElementById('memoryGameGrid');
    if (!area) return;

    area.innerHTML = '';
    area.className = 'game-grid';

    this.activeCards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = `photo-card ${card.isRevealed || card.isMatched ? 'revealed' : ''} ${card.isMatched ? 'matched' : ''}`;
      cardEl.onclick = () => this.handleMemoryCardClick(index);

      if (card.isRevealed || card.isMatched) {
        cardEl.innerHTML = `
          <div class="card-art">${card.art}</div>
          <strong class="card-label">${card.label}</strong>
          <span class="card-subtitle">${card.subtitle}</span>
        `;
      } else {
        cardEl.innerHTML = `
          <div class="card-art" style="color:var(--primary);">🌿</div>
          <span class="card-label" style="font-size:1.1rem; color:var(--on-surface-variant);">${window.i18n ? window.i18n.t('card_touch_peek') : 'Touch to Peek'}</span>
        `;
      }
      area.appendChild(cardEl);
    });
  }

  handleMemoryCardClick(index) {
    if (this.isCheckingMatch) return;
    const card = this.activeCards[index];
    if (card.isRevealed || card.isMatched) return;

    const now = Date.now();
    const hesitation = now - this.lastCardClickTime;
    this.hesitationSamples.push(hesitation);
    this.lastCardClickTime = now;

    card.isRevealed = true;
    this.selectedCards.push({ card, index });
    this.renderMemoryGrid();

    if (this.selectedCards.length === 2) {
      this.checkMemorySelectedMatch();
    }
  }

  checkMemorySelectedMatch() {
    this.isCheckingMatch = true;
    const [first, second] = this.selectedCards;
    const banner = document.getElementById('gameFeedbackBanner');

    if (first.card.id === second.card.id) {
      first.card.isMatched = true;
      second.card.isMatched = true;
      this.gameMatches++;
      this.updateBloomProgress(this.gameMatches);

      if (banner) {
        const encouragements = [
          window.i18n ? window.i18n.t('memory_praise_1') : '🌸 Beautiful! A happy memory found.',
          window.i18n ? window.i18n.t('memory_praise_2') : '🌻 Wonderful gentle recall, Eleanor!',
          window.i18n ? window.i18n.t('memory_praise_3') : '🌿 Bloomed like a sweet garden flower!'
        ];
        banner.textContent = encouragements[Math.floor(Math.random() * encouragements.length)];
      }

      this.selectedCards = [];
      this.isCheckingMatch = false;
      this.renderMemoryGrid();

      if (this.gameMatches === 4) {
        setTimeout(() => this.handleGameCompletion(), 800);
      }
    } else {
      this.gameMistakes++;
      this.currentGameScore = Math.max(70, 100 - (this.gameMistakes * 5));
      this.updateInGameScoreDisplay();

      if (banner) {
        banner.textContent = window.i18n ? window.i18n.t('memory_peek_encourage') : '💚 Good peek! Cards will gently turn back over.';
      }

      setTimeout(() => {
        first.card.isRevealed = false;
        second.card.isRevealed = false;
        this.selectedCards = [];
        this.isCheckingMatch = false;
        this.renderMemoryGrid();
      }, 1200);
    }
  }

  // --------------------------------------------------------------------------
  // ENGINE 2: ATTENTION GAME (Garden Flower Focus & Observation)
  // --------------------------------------------------------------------------
  setupAttentionGame() {
    const flowerCatalog = [
      { id: 'sunflower', nameKey: 'flower_sunflower', defaultName: 'Yellow Sunflower', icon: '🌻', desc: 'Warm Bright Petals' },
      { id: 'rose', nameKey: 'flower_rose', defaultName: 'Terrace Rose', icon: '🌹', desc: 'Velvet Red Bloom' },
      { id: 'daisy', nameKey: 'flower_daisy', defaultName: 'Terrace Daisy', icon: '🌼', desc: 'Pure White Petals' },
      { id: 'marigold', nameKey: 'flower_marigold', defaultName: 'Garden Marigold', icon: '🏵️', desc: 'Golden Festive Bloom' },
      { id: 'lavender', nameKey: 'flower_lavender', defaultName: 'Sweet Lavender', icon: '🪻', desc: 'Fragrant Purple Scent' }
    ];

    // Pick target flower randomly
    const targetIdx = Math.floor(Math.random() * flowerCatalog.length);
    this.attentionTarget = flowerCatalog[targetIdx];
    this.attentionTotalTargets = 3;
    this.attentionFoundCount = 0;

    // Distractor flowers
    const otherFlowers = flowerCatalog.filter(f => f.id !== this.attentionTarget.id);

    // Build 10 garden tiles: exactly 3 target flowers + 7 distractors
    const tiles = [];
    for (let i = 0; i < this.attentionTotalTargets; i++) {
      tiles.push({
        id: this.attentionTarget.id,
        nameKey: this.attentionTarget.nameKey,
        name: this.attentionTarget.defaultName,
        icon: this.attentionTarget.icon,
        isTarget: true,
        isFound: false
      });
    }

    while (tiles.length < 10) {
      const distractor = otherFlowers[Math.floor(Math.random() * otherFlowers.length)];
      tiles.push({
        id: distractor.id,
        nameKey: distractor.nameKey,
        name: distractor.defaultName,
        icon: distractor.icon,
        isTarget: false,
        isFound: false
      });
    }

    this.attentionTiles = tiles.sort(() => 0.5 - Math.random());

    const targetLabel = window.i18n ? window.i18n.t(this.attentionTarget.nameKey) : this.attentionTarget.defaultName;
    const banner = document.getElementById('gameFeedbackBanner');
    if (banner) {
      banner.textContent = window.i18n ? 
        window.i18n.t('attention_target_prompt', { total: this.attentionTotalTargets, target: targetLabel }) :
        `Spot and tap all ${this.attentionTotalTargets} blooming ${targetLabel} in your garden!`;
    }

    this.renderAttentionGrid();
  }

  renderAttentionGrid() {
    const area = document.getElementById('memoryGameGrid');
    if (!area) return;

    const targetLabel = window.i18n ? window.i18n.t(this.attentionTarget.nameKey) : this.attentionTarget.defaultName;
    area.className = 'game-attention-canvas';
    area.innerHTML = `
      <div class="attention-target-banner">
        <span style="font-size:2.2rem;">${this.attentionTarget.icon}</span>
        <span>${window.i18n ? window.i18n.t('attention_target_prompt', { total: this.attentionTotalTargets, target: targetLabel }) : `Spot and tap all ${this.attentionTotalTargets} blooming ${targetLabel}!`}</span>
        <span style="background:var(--surface-container-high); padding:0.2rem 0.8rem; border-radius:var(--radius-full); font-size:1.1rem;">
          ${this.attentionFoundCount} / ${this.attentionTotalTargets}
        </span>
      </div>
      <div class="flower-bed-grid" id="flowerBedContainer"></div>
    `;

    const container = document.getElementById('flowerBedContainer');
    if (!container) return;

    this.attentionTiles.forEach((tile, index) => {
      const tileEl = document.createElement('div');
      tileEl.className = `flower-tile ${tile.isFound ? 'bloomed-target' : ''}`;
      tileEl.onclick = () => this.handleAttentionFlowerClick(index);

      const tileLabel = window.i18n ? window.i18n.t(tile.nameKey) : tile.name;
      tileEl.innerHTML = `
        <div class="flower-tile-icon">${tile.icon}</div>
        <div class="flower-tile-label">${tile.isFound ? `✓ ${tileLabel}` : tileLabel}</div>
      `;
      container.appendChild(tileEl);
    });
  }

  handleAttentionFlowerClick(index) {
    const tile = this.attentionTiles[index];
    const banner = document.getElementById('gameFeedbackBanner');

    const now = Date.now();
    const hesitation = now - this.lastCardClickTime;
    this.hesitationSamples.push(hesitation);
    this.lastCardClickTime = now;

    if (tile.isFound) {
      if (banner) banner.textContent = window.i18n ? window.i18n.t('attention_already_found') : 'This lovely flower is already blooming!';
      return;
    }

    if (tile.isTarget) {
      tile.isFound = true;
      this.attentionFoundCount++;
      this.gameMatches++;
      this.updateBloomProgress(this.attentionFoundCount);

      const targetLabel = window.i18n ? window.i18n.t(this.attentionTarget.nameKey) : this.attentionTarget.defaultName;
      if (banner) {
        banner.textContent = window.i18n ? 
          window.i18n.t('attention_found_praise', { target: targetLabel }) : 
          `Wonderful focus! You found a blooming ${targetLabel}!`;
      }

      this.renderAttentionGrid();

      if (this.attentionFoundCount >= this.attentionTotalTargets) {
        if (banner) {
          banner.textContent = window.i18n ? window.i18n.t('attention_complete_praise') : 'All target flowers are blooming in your garden!';
        }
        setTimeout(() => this.handleGameCompletion(), 900);
      }
    } else {
      this.gameMistakes++;
      this.currentGameScore = Math.max(70, 100 - (this.gameMistakes * 5));
      this.updateInGameScoreDisplay();

      const targetLabel = window.i18n ? window.i18n.t(this.attentionTarget.nameKey) : this.attentionTarget.defaultName;
      if (banner) {
        banner.textContent = window.i18n ? 
          window.i18n.t('attention_other_flower', { target: targetLabel }) : 
          `That is a lovely flower! Look closely for the ${targetLabel}.`;
      }
    }
  }

  // --------------------------------------------------------------------------
  // ENGINE 3: LANGUAGE GAME (Word & Everyday Object Recall)
  // --------------------------------------------------------------------------
  setupLanguageGame() {
    const itemsCatalog = [
      { id: 'teapot', promptKey: 'lang_prompt_teapot', nameKey: 'lang_item_teapot', defaultPrompt: 'What do we use to enjoy our warm morning tea?', defaultName: 'Teacup & Teapot', icon: '🫖' },
      { id: 'book', promptKey: 'lang_prompt_book', nameKey: 'lang_item_book', defaultPrompt: 'What do we open to read peaceful stories and memories?', defaultName: 'Story Book', icon: '📖' },
      { id: 'glasses', promptKey: 'lang_prompt_glasses', nameKey: 'lang_item_glasses', defaultPrompt: 'What do we wear on our eyes to see and read clearly?', defaultName: 'Reading Glasses', icon: '👓' },
      { id: 'apple', promptKey: 'lang_prompt_apple', nameKey: 'lang_item_apple', defaultPrompt: 'Which sweet fruit is crisp, red, and healthy to eat?', defaultName: 'Fresh Apple', icon: '🍎' },
      { id: 'scarf', promptKey: 'lang_prompt_scarf', nameKey: 'lang_item_scarf', defaultPrompt: 'What soft woolen item keeps our neck warm in cool weather?', defaultName: 'Woolen Scarf', icon: '🧣' },
      { id: 'water', promptKey: 'lang_prompt_water', nameKey: 'lang_item_water', defaultPrompt: 'What clear and cool drink keeps us refreshed throughout the day?', defaultName: 'Cool Water', icon: '🥤' }
    ];

    this.languageItemsCatalog = itemsCatalog;
    this.languageRounds = itemsCatalog.sort(() => 0.5 - Math.random()).slice(0, 3);
    this.languageTotalRounds = 3;
    this.languageRoundIndex = 0;

    const banner = document.getElementById('gameFeedbackBanner');
    if (banner) {
      banner.textContent = window.i18n ? window.i18n.t('lang_feedback_welcome') : '🗣️ Touch the everyday item that matches the question!';
    }

    this.loadCurrentLanguageRound();
  }

  loadCurrentLanguageRound() {
    this.currentLanguageItem = this.languageRounds[this.languageRoundIndex];
    const otherItems = this.languageItemsCatalog.filter(i => i.id !== this.currentLanguageItem.id);
    const distractors = otherItems.sort(() => 0.5 - Math.random()).slice(0, 3);
    this.languageOptions = [this.currentLanguageItem, ...distractors].sort(() => 0.5 - Math.random());

    this.renderLanguageBoard();
  }

  renderLanguageBoard() {
    const area = document.getElementById('memoryGameGrid');
    if (!area) return;

    area.className = 'game-language-canvas';
    const promptText = window.i18n ? window.i18n.t(this.currentLanguageItem.promptKey) : this.currentLanguageItem.defaultPrompt;

    area.innerHTML = `
      <div class="language-board">
        <div class="language-prompt-card">
          <div style="font-size:1.1rem; font-weight:800; color:var(--primary); background:var(--surface-container-high); padding:0.25rem 1rem; border-radius:var(--radius-full); margin-bottom:0.5rem;">
            ${window.i18n ? window.i18n.t('lang_round_indicator', { current: this.languageRoundIndex + 1, total: this.languageTotalRounds }) : `Round ${this.languageRoundIndex + 1} of ${this.languageTotalRounds}`}
          </div>
          <h3 class="language-prompt-question">${promptText}</h3>
        </div>
        <div class="language-options-grid" id="languageOptionsGrid"></div>
      </div>
    `;

    const grid = document.getElementById('languageOptionsGrid');
    if (!grid) return;

    this.languageOptions.forEach(opt => {
      const optEl = document.createElement('div');
      optEl.className = 'language-option-card';
      optEl.id = `langOpt_${opt.id}`;
      optEl.onclick = () => this.handleLanguageChoiceClick(opt.id);

      const label = window.i18n ? window.i18n.t(opt.nameKey) : opt.defaultName;
      optEl.innerHTML = `
        <div class="option-icon">${opt.icon}</div>
        <strong class="option-label">${label}</strong>
      `;
      grid.appendChild(optEl);
    });
  }

  handleLanguageChoiceClick(choiceId) {
    const banner = document.getElementById('gameFeedbackBanner');
    const now = Date.now();
    const hesitation = now - this.lastCardClickTime;
    this.hesitationSamples.push(hesitation);
    this.lastCardClickTime = now;

    const optEl = document.getElementById(`langOpt_${choiceId}`);

    if (choiceId === this.currentLanguageItem.id) {
      if (optEl) optEl.classList.add('correct');
      this.gameMatches++;
      this.updateBloomProgress(this.languageRoundIndex + 1);

      const itemLabel = window.i18n ? window.i18n.t(this.currentLanguageItem.nameKey) : this.currentLanguageItem.defaultName;
      if (banner) {
        banner.textContent = window.i18n ? 
          window.i18n.t('lang_correct_praise', { item: itemLabel }) : 
          `Wonderful recall, Eleanor! That is the ${itemLabel}.`;
      }

      setTimeout(() => {
        this.languageRoundIndex++;
        if (this.languageRoundIndex < this.languageTotalRounds) {
          this.loadCurrentLanguageRound();
        } else {
          if (banner) {
            banner.textContent = window.i18n ? window.i18n.t('lang_complete_praise') : '🎉 Outstanding word and memory recall, Eleanor!';
          }
          this.handleGameCompletion();
        }
      }, 1100);
    } else {
      this.gameMistakes++;
      this.currentGameScore = Math.max(70, 100 - (this.gameMistakes * 5));
      this.updateInGameScoreDisplay();

      if (banner) {
        banner.textContent = window.i18n ? 
          window.i18n.t('lang_encourage_try') : 
          'Good peek! Think about which item we use. Try tapping again!';
      }
    }
  }

  // --------------------------------------------------------------------------
  // ENGINE 4: PROBLEM SOLVING GAME (Daily Routine Steps Sequencing)
  // --------------------------------------------------------------------------
  setupProblemSolvingGame() {
    const isMorning = new Date().getHours() < 16;
    this.problemRoutineType = isMorning ? 'morning' : 'evening';

    if (this.problemRoutineType === 'morning') {
      this.problemSteps = [
        { step: 1, key: 'routine_step_morning_1', text: 'Wake up & stretch gently', icon: '🌅' },
        { step: 2, key: 'routine_step_morning_2', text: 'Drink a full glass of cool water', icon: '🥤' },
        { step: 3, key: 'routine_step_morning_3', text: 'Take morning medicine with water', icon: '💊' },
        { step: 4, key: 'routine_step_morning_4', text: 'Enjoy warm fresh breakfast', icon: '🥣' }
      ];
    } else {
      this.problemSteps = [
        { step: 1, key: 'routine_step_evening_1', text: 'Enjoy warm light dinner', icon: '🍲' },
        { step: 2, key: 'routine_step_evening_2', text: 'Take a peaceful garden stroll', icon: '🚶' },
        { step: 3, key: 'routine_step_evening_3', text: 'Brush teeth and wash face', icon: '🪥' },
        { step: 4, key: 'routine_step_evening_4', text: 'Settle into cozy restful bed', icon: '🛏️' }
      ];
    }

    this.problemNextStep = 1;
    this.problemShuffledChoices = [...this.problemSteps].sort(() => 0.5 - Math.random());

    const banner = document.getElementById('gameFeedbackBanner');
    const routineTitle = window.i18n ? 
      window.i18n.t(this.problemRoutineType === 'morning' ? 'routine_morning_title' : 'routine_evening_title') : 
      (this.problemRoutineType === 'morning' ? 'Morning Sunshine Routine' : 'Peaceful Evening Routine');

    if (banner) {
      banner.textContent = window.i18n ? 
        window.i18n.t('routine_prompt_next', { step: 1, routine: routineTitle }) : 
        `Step 1: What is the first thing Eleanor does in the ${routineTitle}?`;
    }

    this.renderProblemSolvingBoard();
  }

  renderProblemSolvingBoard() {
    const area = document.getElementById('memoryGameGrid');
    if (!area) return;

    area.className = 'game-routine-canvas';
    const routineTitle = window.i18n ? 
      window.i18n.t(this.problemRoutineType === 'morning' ? 'routine_morning_title' : 'routine_evening_title') : 
      (this.problemRoutineType === 'morning' ? 'Morning Sunshine Routine' : 'Peaceful Evening Routine');

    area.innerHTML = `
      <div class="routine-board">
        <div style="text-align:center; font-size:1.35rem; font-weight:800; color:var(--primary); margin-bottom:0.25rem;">
          🗓️ ${routineTitle}
        </div>
        
        <!-- 4 Sequential Routine Slots -->
        <div class="routine-slots-container" id="routineSlotsContainer"></div>

        <div style="font-size:1.15rem; font-weight:700; color:var(--on-surface-variant); text-align:center; margin-top:0.5rem;">
          ${window.i18n ? window.i18n.t('routine_order_instruction') : 'Tap the steps below in order (1 -> 2 -> 3 -> 4):'}
        </div>

        <!-- 4 Shuffled Step Choices -->
        <div class="routine-choices-container" id="routineChoicesContainer"></div>
      </div>
    `;

    const slotsContainer = document.getElementById('routineSlotsContainer');
    const choicesContainer = document.getElementById('routineChoicesContainer');

    // Render Slots
    this.problemSteps.forEach(s => {
      const isFilled = s.step < this.problemNextStep;
      const slotEl = document.createElement('div');
      slotEl.className = `routine-slot ${isFilled ? 'filled' : ''}`;

      const stepText = window.i18n ? window.i18n.t(s.key) : s.text;
      if (isFilled) {
        slotEl.innerHTML = `
          <span class="routine-slot-num">${window.i18n ? window.i18n.t('routine_step_done', { step: s.step }) : `✓ Step ${s.step}`}</span>
          <div style="font-size:2.5rem; line-height:1;">${s.icon}</div>
          <strong class="routine-slot-txt">${stepText}</strong>
        `;
      } else {
        slotEl.innerHTML = `
          <span class="routine-slot-num">${window.i18n ? window.i18n.t('routine_step_num', { step: s.step }) : `Step ${s.step}`}</span>
          <div style="font-size:2.2rem; opacity:0.4;">⏳</div>
          <span style="font-size:1rem; color:var(--on-surface-variant);">${window.i18n ? window.i18n.t('routine_slot_placeholder') : 'Touch below to place'}</span>
        `;
      }
      slotsContainer.appendChild(slotEl);
    });

    // Render Choices
    this.problemShuffledChoices.forEach(choice => {
      const isLocked = choice.step < this.problemNextStep;
      const choiceEl = document.createElement('div');
      choiceEl.className = `routine-choice-card ${isLocked ? 'locked' : ''}`;
      choiceEl.id = `routineChoice_${choice.step}`;
      choiceEl.onclick = () => this.handleRoutineStepClick(choice.step);

      const stepText = window.i18n ? window.i18n.t(choice.key) : choice.text;
      choiceEl.innerHTML = `
        <div class="choice-icon">${choice.icon}</div>
        <strong class="choice-label">${stepText}</strong>
      `;
      choicesContainer.appendChild(choiceEl);
    });
  }

  handleRoutineStepClick(stepNumber) {
    const banner = document.getElementById('gameFeedbackBanner');
    const now = Date.now();
    const hesitation = now - this.lastCardClickTime;
    this.hesitationSamples.push(hesitation);
    this.lastCardClickTime = now;

    if (stepNumber === this.problemNextStep) {
      this.problemNextStep++;
      this.gameMatches++;
      this.updateBloomProgress(this.gameMatches);

      if (banner) {
        banner.textContent = window.i18n ? 
          window.i18n.t('routine_correct_step', { step: stepNumber }) : 
          `Wonderful! Step ${stepNumber} is nicely in place.`;
      }

      this.renderProblemSolvingBoard();

      if (this.problemNextStep > 4) {
        if (banner) {
          banner.textContent = window.i18n ? 
            window.i18n.t('routine_complete_praise') : 
            'Your entire routine is in wonderful harmony!';
        }
        setTimeout(() => this.handleGameCompletion(), 900);
      }
    } else {
      this.gameMistakes++;
      this.currentGameScore = Math.max(70, 100 - (this.gameMistakes * 5));
      this.updateInGameScoreDisplay();

      if (banner) {
        banner.textContent = window.i18n ? 
          window.i18n.t('routine_order_guidance') : 
          'We usually do that at another time! Let\'s find what comes next.';
      }
    }
  }

  // --------------------------------------------------------------------------
  // GAME CONTROLS, HINTS, AUDIO & COMPLETION
  // --------------------------------------------------------------------------
  giveGameHint() {
    if (this.activeGameEngine === 'memory') {
      const unmatched = this.activeCards.filter(c => !c.isMatched && !c.isRevealed);
      if (unmatched.length > 0) {
        const targetId = unmatched[0].id;
        const pair = this.activeCards.filter(c => c.id === targetId);
        pair.forEach(c => c.isRevealed = true);
        this.renderMemoryGrid();

        setTimeout(() => {
          pair.forEach(c => {
            if (!c.isMatched) c.isRevealed = false;
          });
          this.renderMemoryGrid();
        }, 1400);

        this.showToast(window.i18n ? window.i18n.t('hint_memory_pair') : 'Gentle hint: Here is a lovely card pair blooming!', '💡');
      }
    } else if (this.activeGameEngine === 'attention') {
      const unfoundTarget = this.attentionTiles.find(t => t.isTarget && !t.isFound);
      if (unfoundTarget) {
        const targetLabel = window.i18n ? window.i18n.t(unfoundTarget.nameKey) : unfoundTarget.name;
        this.showToast(window.i18n ? window.i18n.t('hint_attention_target', { target: `${targetLabel} ${unfoundTarget.icon}` }) : `Gentle hint: Look closely for a ${targetLabel} ${unfoundTarget.icon}`, '💡');
        const targetEls = document.querySelectorAll('.flower-tile');
        targetEls.forEach(el => {
          if (el.textContent.includes(targetLabel) && !el.classList.contains('bloomed-target')) {
            el.classList.add('hint-pulse');
            setTimeout(() => el.classList.remove('hint-pulse'), 1800);
          }
        });
      }
    } else if (this.activeGameEngine === 'language') {
      const correctEl = document.getElementById(`langOpt_${this.currentLanguageItem.id}`);
      if (correctEl) {
        correctEl.classList.add('hint-highlight');
        setTimeout(() => correctEl.classList.remove('hint-highlight'), 1800);
        this.showToast(window.i18n ? window.i18n.t('hint_language_choice') : 'Gentle hint: Notice the glowing choice card!', '💡');
      }
    } else if (this.activeGameEngine === 'problem') {
      const nextChoiceEl = document.getElementById(`routineChoice_${this.problemNextStep}`);
      if (nextChoiceEl) {
        nextChoiceEl.classList.add('hint-highlight');
        setTimeout(() => nextChoiceEl.classList.remove('hint-highlight'), 1800);
        this.showToast(window.i18n ? window.i18n.t('hint_problem_step', { step: this.problemNextStep }) : `Gentle hint: Look for Step ${this.problemNextStep}`, '💡');
      }
    }
  }

  playGameAudioInstruction() {
    let key = 'tts_instruction_memory';
    if (this.activeGameEngine === 'attention') key = 'tts_instruction_attention';
    else if (this.activeGameEngine === 'language') key = 'tts_instruction_language';
    else if (this.activeGameEngine === 'problem') key = 'tts_instruction_problem';

    const text = window.i18n ? window.i18n.t(key) : 'Take all your time and enjoy your gentle game.';
    if (window.i18n) {
      window.i18n.speakText(text);
    }
  }

  handleGameCompletion() {
    const duration = Math.round((Date.now() - this.gameStartTime) / 1000);
    const avgHesitation = Math.round(this.hesitationSamples.reduce((a, b) => a + b, 0) / (this.hesitationSamples.length || 1));
    const score = Math.max(75, 100 - (this.gameMistakes * 5));

    // Award Garden Stars
    let starsAwarded = 3;
    if (this.gameMistakes === 0) starsAwarded = 5;
    else if (this.gameMistakes <= 2) starsAwarded = 4;

    this.patientStars += starsAwarded;
    localStorage.setItem('recollect_patient_stars', this.patientStars.toString());

    // Update patient score displays
    this.updatePatientScoreDisplay();

    // Configure completion modal
    const starsEl = document.getElementById('completionStarsAwarded');
    const summaryEl = document.getElementById('completionScoreSummary');
    const msgEl = document.getElementById('completeMsg');

    if (starsEl) {
      starsEl.textContent = window.i18n ? 
        window.i18n.t('score_awarded_stars', { stars: starsAwarded }) : 
        `⭐ +${starsAwarded} Garden Stars Bloomed!`;
    }
    if (summaryEl) {
      summaryEl.textContent = window.i18n ? 
        window.i18n.t('score_summary_text', { stars: this.patientStars, score }) : 
        `Total Stars: ${this.patientStars} • Session Score: ${score}/100`;
    }
    if (msgEl) {
      msgEl.textContent = window.i18n ? 
        window.i18n.t('game_completion_msg') : 
        'Your garden memories bloomed beautifully. Have a peaceful rest of your day.';
    }

    // Telemetry dispatch to DB
    window.recollectDB.insertGameSession({
      patient_id: this.patientId,
      game_type: `${this.activeGameEngine}_session`,
      score,
      duration_seconds: duration,
      mistake_count: this.gameMistakes,
      hesitation_avg_ms: avgHesitation,
      started_at: new Date(this.gameStartTime).toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed'
    });

    // Cross-role sync: Log to Caregiver Activity Stream
    window.recollectDB.addActivityLog({
      author: 'Eleanor Vance (Bedside Tablet)',
      role: 'Senior Patient Space',
      action: 'Game Completed',
      content: `Eleanor completed ${this.activeGameEngine.toUpperCase()} game. Score: ${score}/100 with ${this.gameMistakes} mistake(s). +${starsAwarded} Garden Stars earned!`,
      timestamp: new Date().toISOString()
    });

    this.renderActivityLogs();
    this.closeMemoryGameModal();
    document.getElementById('gameCompleteModal')?.classList.add('active-modal');

    // Update clinical telemetry
    if (window.ruleEngine) {
      window.ruleEngine.evaluateAllRules(this.patientId);
      this.updateClinicalMetrics();
    }
  }

  closeMemoryGameModal() {
    const modal = document.getElementById('gameModal');
    if (modal) {
      modal.classList.remove('active-modal', 'active-takeover');
    }
  }

  closeGameCompletionModal() {
    document.getElementById('gameCompleteModal')?.classList.remove('active-modal');
  }

  // --- Mood Check-in Modal ---
  openMoodModal() {
    document.getElementById('moodModal')?.classList.add('active-modal');
  }

  closeMoodModal() {
    document.getElementById('moodModal')?.classList.remove('active-modal');
  }

  logMood(score, label, btnElement) {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    btnElement?.classList.add('selected');

    const isCaregiverAssisted = document.getElementById('moodCaregiverAssisted')?.checked;
    const now = new Date().toISOString();

    window.recollectDB.insertMoodLog({
      patient_id: this.patientId,
      mood_score: score,
      mood_label: label,
      recorded_by: isCaregiverAssisted ? 'caregiver' : 'patient'
    });

    // Append to Caregiver Activity Log
    window.recollectDB.addActivityLog({
      author: isCaregiverAssisted ? 'Sarah Vance' : 'Eleanor Vance',
      role: isCaregiverAssisted ? 'Family Caregiver' : 'Senior Patient Space',
      action: 'Mood Check-in',
      content: `Mood recorded: "${label}" (${score}/5). Recorded by ${isCaregiverAssisted ? 'Sarah on Eleanor\'s behalf' : 'Eleanor on bedside tablet'}.`,
      timestamp: now
    });

    this.renderActivityLogs();
    this.showToast(window.i18n ? window.i18n.t('toast_mood_recorded', { label }) : `Mood check-in recorded: ${label}`, '🌸');
  }

  // --- Interactive Audio Calls & Emergency System ---
  callSarah() {
    this.startAudioCallSimulation('Sarah Vance (Daughter)', 'Calling Sarah...');
    window.recollectDB.addActivityLog({
      author: 'Eleanor Vance (Bedside Tablet)',
      role: 'Senior Patient Space',
      action: 'Call Initiated',
      content: 'Eleanor placed a tablet call to Sarah Vance.',
      timestamp: new Date().toISOString()
    });
    this.renderActivityLogs();
  }

  callEleanor() {
    this.startAudioCallSimulation('Eleanor Vance (Mother)', 'Calling Bedside Tablet...');
    window.recollectDB.addActivityLog({
      author: 'Sarah Vance',
      role: 'Primary Family Caregiver',
      action: 'Call Initiated',
      content: 'Sarah placed a call to Eleanor\'s bedside tablet.',
      timestamp: new Date().toISOString()
    });
    this.renderActivityLogs();
  }

  startAudioCallSimulation(targetName, detail) {
    const modal = document.getElementById('audioCallModal');
    const targetEl = document.getElementById('callTargetName');
    const statusEl = document.getElementById('callStatusDetail');
    const timerEl = document.getElementById('callTimerDisplay');

    if (modal && targetEl && statusEl && timerEl) {
      targetEl.textContent = targetName;
      statusEl.textContent = detail;
      timerEl.textContent = '00:00';
      modal.classList.add('active-modal');

      this.callDurationSec = 0;
      if (this.activeCallInterval) clearInterval(this.activeCallInterval);

      // Play soft call tone
      if (window.i18n) {
        window.i18n.playMelodicChime();
      }

      // Simulate connection after 2 seconds
      setTimeout(() => {
        if (modal.classList.contains('active-modal')) {
          statusEl.textContent = window.i18n ? window.i18n.t('call_connected_active') : '🟢 Connected • Audio Call Active';
          this.activeCallInterval = setInterval(() => {
            this.callDurationSec++;
            const mins = String(Math.floor(this.callDurationSec / 60)).padStart(2, '0');
            const secs = String(this.callDurationSec % 60).padStart(2, '0');
            timerEl.textContent = `${mins}:${secs}`;
          }, 1000);
        }
      }, 2000);
    }
  }

  endAudioCall() {
    if (this.activeCallInterval) clearInterval(this.activeCallInterval);
    document.getElementById('audioCallModal')?.classList.remove('active-modal');
    this.showToast(window.i18n ? window.i18n.t('toast_call_ended') : 'Call ended.', '📞');
  }

  triggerEmergencyHelp() {
    document.getElementById('emergencyModal')?.classList.add('active-modal');
    if (window.i18n) window.i18n.playMelodicChime();

    window.recollectDB.addActivityLog({
      author: 'Eleanor Vance (Bedside Tablet)',
      role: 'Senior Patient Space',
      action: '🚨 EMERGENCY ALERT',
      content: 'Eleanor pressed Emergency Help on bedside tablet. Immediate alert dispatched.',
      timestamp: new Date().toISOString()
    });
    this.renderActivityLogs();
  }

  triggerCaregiverEmergency() {
    document.getElementById('emergencyModal')?.classList.add('active-modal');
    if (window.i18n) window.i18n.playMelodicChime();
  }

  closeEmergencyModal() {
    document.getElementById('emergencyModal')?.classList.remove('active-modal');
  }

  acknowledgeEmergency() {
    this.closeEmergencyModal();
    this.showToast(window.i18n ? window.i18n.t('toast_emerg_confirmed') : 'Emergency response confirmed. Team is on the way.', '🚨');
  }

  // --- Caregiver Settings & Accessibility Controls ---
  openCaregiverSettings() {
    const modal = document.getElementById('caregiverSettingsModal');
    if (modal) {
      modal.classList.add('active-modal');
      document.getElementById('settingsPinGate').style.display = 'block';
      document.getElementById('settingsUnlockedBody').style.display = 'none';
      const pinInput = document.getElementById('settingsPinInput');
      if (pinInput) pinInput.value = '1234';
    }
  }

  closeCaregiverSettings() {
    document.getElementById('caregiverSettingsModal')?.classList.remove('active-modal');
  }

  verifySettingsPin() {
    const pin = document.getElementById('settingsPinInput')?.value;
    if (pin === '1234') {
      document.getElementById('settingsPinGate').style.display = 'none';
      document.getElementById('settingsUnlockedBody').style.display = 'block';
      this.syncThemeControls();
      this.evaluateThemeSchedules();
    } else {
      this.showToast(window.i18n ? window.i18n.t('toast_pin_incorrect') : 'Incorrect Caregiver PIN. Demo default is 1234.', '⚠️');
    }
  }

  syncThemeControls() {
    const dmToggle = document.getElementById('toggleDarkMode');
    if (dmToggle) dmToggle.checked = this.isDarkMode;

    const hcToggle = document.getElementById('toggleHighContrast');
    if (hcToggle) hcToggle.checked = this.isHighContrast;

    const dsToggle = document.getElementById('toggleDarkSchedule');
    if (dsToggle) dsToggle.checked = this.darkScheduleEnabled;

    const dsTimesRow = document.getElementById('darkScheduleTimesRow');
    if (dsTimesRow) dsTimesRow.style.display = this.darkScheduleEnabled ? 'flex' : 'none';

    const dsStart = document.getElementById('darkScheduleStart');
    if (dsStart) dsStart.value = this.darkScheduleStart;

    const dsEnd = document.getElementById('darkScheduleEnd');
    if (dsEnd) dsEnd.value = this.darkScheduleEnd;

    const hsToggle = document.getElementById('toggleHcSchedule');
    if (hsToggle) hsToggle.checked = this.hcScheduleEnabled;

    const hsTimesRow = document.getElementById('hcScheduleTimesRow');
    if (hsTimesRow) hsTimesRow.style.display = this.hcScheduleEnabled ? 'flex' : 'none';

    const hsStart = document.getElementById('hcScheduleStart');
    if (hsStart) hsStart.value = this.hcScheduleStart;

    const hsEnd = document.getElementById('hcScheduleEnd');
    if (hsEnd) hsEnd.value = this.hcScheduleEnd;
  }

  isTimeWithinWindow(startStr, endStr) {
    if (!startStr || !endStr) return false;
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const [sH, sM] = startStr.split(':').map(Number);
    const [eH, eM] = endStr.split(':').map(Number);
    const start = sH * 60 + (sM || 0);
    const end = eH * 60 + (eM || 0);
    if (start <= end) {
      return current >= start && current < end;
    } else {
      // Spans midnight e.g. 20:00 to 07:00
      return current >= start || current < end;
    }
  }

  evaluateThemeSchedules() {
    let darkActive = false;
    let hcActive = false;

    const isHcScheduledNow = this.hcScheduleEnabled && this.isTimeWithinWindow(this.hcScheduleStart, this.hcScheduleEnd);
    const isDarkScheduledNow = this.darkScheduleEnabled && this.isTimeWithinWindow(this.darkScheduleStart, this.darkScheduleEnd);

    const darkBadge = document.getElementById('darkScheduleBadge');
    if (darkBadge) {
      if (this.darkScheduleEnabled) {
        darkBadge.className = `schedule-status-badge ${isDarkScheduledNow ? 'active' : 'inactive'}`;
        darkBadge.textContent = isDarkScheduledNow 
          ? (window.i18n ? window.i18n.getText('schedule_active_badge') : 'Active Now (Scheduled)')
          : (window.i18n ? window.i18n.getText('schedule_inactive_badge') : 'Scheduled');
      } else {
        darkBadge.className = 'schedule-status-badge inactive';
        darkBadge.textContent = window.i18n ? window.i18n.getText('schedule_inactive_badge') : 'Scheduled';
      }
    }

    const hcBadge = document.getElementById('hcScheduleBadge');
    if (hcBadge) {
      if (this.hcScheduleEnabled) {
        hcBadge.className = `schedule-status-badge ${isHcScheduledNow ? 'active' : 'inactive'}`;
        hcBadge.textContent = isHcScheduledNow
          ? (window.i18n ? window.i18n.getText('schedule_active_badge') : 'Active Now (Scheduled)')
          : (window.i18n ? window.i18n.getText('schedule_inactive_badge') : 'Scheduled');
      } else {
        hcBadge.className = 'schedule-status-badge inactive';
        hcBadge.textContent = window.i18n ? window.i18n.getText('schedule_inactive_badge') : 'Scheduled';
      }
    }

    if (isHcScheduledNow) {
      hcActive = true;
    } else if (isDarkScheduledNow) {
      darkActive = true;
    } else {
      // Manual preferences
      if (this.isHighContrast) {
        hcActive = true;
      } else if (this.isDarkMode) {
        darkActive = true;
      }
    }

    document.body.classList.toggle('high-contrast-mode', hcActive);
    document.body.classList.toggle('dark-mode', darkActive && !hcActive);
  }

  toggleDarkMode(enabled) {
    this.isDarkMode = enabled;
    localStorage.setItem('recollect_dark_mode', enabled);
    if (enabled) {
      this.isHighContrast = false;
      localStorage.setItem('recollect_high_contrast', 'false');
      const hcToggle = document.getElementById('toggleHighContrast');
      if (hcToggle) hcToggle.checked = false;
    }
    this.evaluateThemeSchedules();
    this.showToast(window.i18n ? (enabled ? window.i18n.t('toast_dark_active') : window.i18n.t('toast_standard_restored')) : (enabled ? 'Dark Mode (Calm Night) active.' : 'Standard theme restored.'), '🌙');
  }

  toggleHighContrast(enabled) {
    this.isHighContrast = enabled;
    localStorage.setItem('recollect_high_contrast', enabled);
    if (enabled) {
      this.isDarkMode = false;
      localStorage.setItem('recollect_dark_mode', 'false');
      const dmToggle = document.getElementById('toggleDarkMode');
      if (dmToggle) dmToggle.checked = false;
    }
    this.evaluateThemeSchedules();
    this.showToast(window.i18n ? (enabled ? window.i18n.t('toast_hc_active') : window.i18n.t('toast_standard_restored')) : (enabled ? 'High-contrast black & white theme active.' : 'Standard theme restored.'), '🎨');
  }

  toggleDarkSchedule(enabled) {
    this.darkScheduleEnabled = enabled;
    localStorage.setItem('recollect_dark_schedule_enabled', enabled);
    const timesRow = document.getElementById('darkScheduleTimesRow');
    if (timesRow) timesRow.style.display = enabled ? 'flex' : 'none';
    this.evaluateThemeSchedules();
    this.showToast(window.i18n ? (enabled ? window.i18n.t('toast_dark_sched_enabled') : window.i18n.t('toast_dark_sched_disabled')) : (enabled ? 'Dark Mode schedule enabled.' : 'Dark Mode schedule disabled.'), '⏰');
  }

  updateDarkScheduleTimes() {
    const start = document.getElementById('darkScheduleStart')?.value || '20:00';
    const end = document.getElementById('darkScheduleEnd')?.value || '07:00';
    this.darkScheduleStart = start;
    this.darkScheduleEnd = end;
    localStorage.setItem('recollect_dark_schedule_start', start);
    localStorage.setItem('recollect_dark_schedule_end', end);
    this.evaluateThemeSchedules();
    this.showToast(window.i18n ? window.i18n.t('toast_dark_sched_updated', { start, end }) : `Dark Mode schedule updated: ${start} to ${end}`, '⏰');
  }

  toggleHcSchedule(enabled) {
    this.hcScheduleEnabled = enabled;
    localStorage.setItem('recollect_hc_schedule_enabled', enabled);
    const timesRow = document.getElementById('hcScheduleTimesRow');
    if (timesRow) timesRow.style.display = enabled ? 'flex' : 'none';
    this.evaluateThemeSchedules();
    this.showToast(window.i18n ? (enabled ? window.i18n.t('toast_hc_sched_enabled') : window.i18n.t('toast_hc_sched_disabled')) : (enabled ? 'High-Contrast schedule enabled.' : 'High-Contrast schedule disabled.'), '⏰');
  }

  updateHcScheduleTimes() {
    const start = document.getElementById('hcScheduleStart')?.value || '18:00';
    const end = document.getElementById('hcScheduleEnd')?.value || '21:00';
    this.hcScheduleStart = start;
    this.hcScheduleEnd = end;
    localStorage.setItem('recollect_hc_schedule_start', start);
    localStorage.setItem('recollect_hc_schedule_end', end);
    this.evaluateThemeSchedules();
    this.showToast(window.i18n ? window.i18n.t('toast_hc_sched_updated', { start, end }) : `High-Contrast schedule updated: ${start} to ${end}`, '⏰');
  }

  setFontScale(scale) {
    this.fontScale = scale;
    localStorage.setItem('recollect_font_scale', scale);
    document.body.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    document.body.classList.add(`font-scale-${scale}`);
    
    const selector = document.getElementById('fontSizeSelector');
    if (selector) selector.value = scale;
    
    this.showToast(window.i18n ? window.i18n.t('toast_text_size_set', { scale: scale.toUpperCase() }) : `Patient app text size set to ${scale.toUpperCase()}`, '🔤');
  }

  toggleVoiceMode(enabled) {
    this.voiceModeEnabled = enabled;
    this.showToast(window.i18n ? (enabled ? window.i18n.t('toast_voice_enabled') : window.i18n.t('toast_voice_silenced')) : (enabled ? 'Voice narration enabled.' : 'Voice narration silenced.'), '🔊');
  }

  switchSpaceFromSettings(role) {
    this.closeCaregiverSettings();
    const authResult = window.recollectDB.authenticateUser(role, role === 'clinical' ? '9999' : '1234');
    if (authResult.success) {
      window.recollectDB.setActiveSession(authResult.session);
      this.applySession(authResult.session);
      const switchRoleTitle = window.i18n ? (authResult.session.role === 'patient' ? window.i18n.t('role_senior_space') : (authResult.session.role === 'caregiver' ? window.i18n.t('role_caregiver_title') : window.i18n.t('role_clinical_title'))) : authResult.session.title;
      this.showToast(window.i18n ? window.i18n.t('toast_space_switched', { title: switchRoleTitle }) : `Switched space to ${authResult.session.title}`, '🌿');
    }
  }

  // --- Consent Modal ---
  openConsentModal() {
    document.getElementById('consentModal')?.classList.add('active-modal');
    this.setConsentStep(1);
  }

  closeConsentModal() {
    document.getElementById('consentModal')?.classList.remove('active-modal');
  }

  setConsentStep(step) {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`consentStep${i}`);
      if (el) el.style.display = i === step ? 'block' : 'none';
    }
  }

  finishConsent() {
    this.closeConsentModal();
    this.showToast(window.i18n ? window.i18n.t('toast_consent_confirmed') : 'Patient & Caregiver consent confirmed and signed locally.', '✓');
  }

  // --- Caregiver Platform Tabs ---
  setCaregiverTab(tabName) {
    document.querySelectorAll('.cg-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('cgTabContentToday').style.display = 'none';
    document.getElementById('cgTabContentTrends').style.display = 'none';
    document.getElementById('cgTabContentJournal').style.display = 'none';
    document.getElementById('cgTabContentCareTeam').style.display = 'none';
    document.getElementById('cgTabContentAlerts').style.display = 'none';

    const tabMap = {
      today: { btn: 'cgTabBtnToday', content: 'cgTabContentToday' },
      trends: { btn: 'cgTabBtnTrends', content: 'cgTabContentTrends' },
      journal: { btn: 'cgTabBtnJournal', content: 'cgTabContentJournal' },
      careteam: { btn: 'cgTabBtnCareTeam', content: 'cgTabContentCareTeam' },
      alerts: { btn: 'cgTabBtnAlerts', content: 'cgTabContentAlerts' }
    };

    if (tabMap[tabName]) {
      document.getElementById(tabMap[tabName].btn)?.classList.add('active');
      document.getElementById(tabMap[tabName].content)?.style.setProperty('display', 'block');
    }

    if (tabName === 'careteam') {
      this.renderCareTeamGrid();
      this.renderCareTeamMessages();
      this.renderActivityLogs();
    } else if (tabName === 'today') {
      this.renderCaregiverTimeline();
    }
  }

  // --- Timeframe Switching (Daily, Weekly, Monthly, Quarterly) ---
  setTimeframe(tf, btn) {
    document.querySelectorAll('.timeframe-pill').forEach(b => b.classList.remove('active'));
    btn?.classList.add('active');

    const chartContainer = document.querySelector('.trends-chart-container');
    if (!chartContainer) return;

    // Distinct realistic datasets per timeframe
    const datasets = {
      daily: {
        summary: '🟢 Daily Routine Complete (96% adherence)',
        avgAdh: 'Avg 96%',
        avgScore: 'Avg 94/100',
        labels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
        adherencePoints: '80,40  188,35  296,48  404,42  512,38  620,32',
        scorePoints: '80,60  188,58  296,65  404,60  512,55  620,52',
        dots: [
          { cx: 80, cy: 40 }, { cx: 188, cy: 35 }, { cx: 296, cy: 48 },
          { cx: 404, cy: 42 }, { cx: 512, cy: 38 }, { cx: 620, cy: 32 }
        ]
      },
      weekly: {
        summary: '🟢 Baseline Stable (94% adherence)',
        avgAdh: 'Avg 94%',
        avgScore: 'Avg 91/100',
        labels: ['Oct 18', 'Oct 19', 'Oct 20', 'Oct 21', 'Oct 22', 'Oct 23', 'Today'],
        adherencePoints: '80,55  170,45  260,60  350,40  440,50  530,45  620,42',
        scorePoints: '80,70  170,68  260,75  350,65  440,68  530,62  620,60',
        dots: [
          { cx: 80, cy: 55 }, { cx: 170, cy: 45 }, { cx: 260, cy: 60 },
          { cx: 350, cy: 40 }, { cx: 440, cy: 50 }, { cx: 530, cy: 45 }, { cx: 620, cy: 42 }
        ]
      },
      monthly: {
        summary: '🟢 4-Week Adherence Trend Healthy (92%)',
        avgAdh: 'Avg 92%',
        avgScore: 'Avg 89/100',
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        adherencePoints: '110,65  270,50  430,45  590,40',
        scorePoints: '110,75  270,72  430,68  590,62',
        dots: [
          { cx: 110, cy: 65 }, { cx: 270, cy: 50 }, { cx: 430, cy: 45 }, { cx: 590, cy: 40 }
        ]
      },
      quarterly: {
        summary: '🟢 90-Day Cohort Adherence High (93%)',
        avgAdh: 'Avg 93%',
        avgScore: 'Avg 90/100',
        labels: ['July', 'August', 'September'],
        adherencePoints: '150,60  350,48  550,42',
        scorePoints: '150,72  350,66  550,58',
        dots: [
          { cx: 150, cy: 60 }, { cx: 350, cy: 48 }, { cx: 550, cy: 42 }
        ]
      }
    };

    const d = datasets[tf] || datasets.weekly;

    // Render SVG
    const svgContent = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <strong>${window.i18n ? window.i18n.t('chart_title_timeline', { tf: tf.toUpperCase() }) : `Routine Adherence & Composite Score Timeline (${tf.toUpperCase()})`}</strong>
        <span style="font-size:0.9rem; color:#059669; font-weight:700;">${d.summary}</span>
      </div>
      
      <svg viewBox="0 0 700 200" width="100%" height="180" style="background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
        <line x1="50" y1="30" x2="680" y2="30" stroke="#e2e8f0" stroke-dasharray="4"/>
        <line x1="50" y1="80" x2="680" y2="80" stroke="#e2e8f0" stroke-dasharray="4"/>
        <line x1="50" y1="130" x2="680" y2="130" stroke="#e2e8f0" stroke-dasharray="4"/>
        
        <text x="15" y="35" font-size="12" fill="#64748b">100%</text>
        <text x="15" y="85" font-size="12" fill="#64748b">80%</text>
        <text x="15" y="135" font-size="12" fill="#64748b">60%</text>
        
        <polyline fill="none" stroke="#059669" stroke-width="3.5" points="${d.adherencePoints}"/>
        <polyline fill="none" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4" points="${d.scorePoints}"/>
        
        ${d.dots.map(dot => `<circle cx="${dot.cx}" cy="${dot.cy}" r="5" fill="#059669"/>`).join('')}

        ${d.labels.map((lbl, idx) => {
          const step = (680 - 80) / (d.labels.length - 1 || 1);
          const x = 80 + idx * step;
          return `<text x="${x}" y="180" font-size="12" fill="#64748b" text-anchor="middle">${lbl}</text>`;
        }).join('')}
      </svg>
      <div style="display:flex; gap:1.5rem; justify-content:center; margin-top:0.5rem; font-size:0.85rem;">
        <span>🟢 <strong>${window.i18n ? window.i18n.t('chart_adherence_label') : 'Adherence Rate'}</strong> (${d.avgAdh})</span>
        <span>🔵 <strong>${window.i18n ? window.i18n.t('chart_composite_label') : 'Composite Score'}</strong> (${d.avgScore})</span>
      </div>
    `;

    chartContainer.innerHTML = svgContent;
    this.showToast(window.i18n ? window.i18n.t('toast_timeframe_switched', { tf: tf.toUpperCase() }) : `Timeline timeframe switched to: ${tf.toUpperCase()}`, '📈');
  }

  toggleFlagAccordion(el) {
    const content = el.nextElementSibling;
    if (content) {
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? 'block' : 'none';
      const arrow = el.querySelector('span:last-child');
      if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
    }
  }

  // --- Today's Visual Schedule Checklist ---
  renderCaregiverTimeline() {
    const stream = document.getElementById('cgTimelineStream');
    if (!stream) return;

    const logs = window.recollectDB.getItem('ReminderLog') || [];
    const isMedTaken = logs.some(l => l.reminder_id === 'rem_001' && l.patient_response === 'acknowledged');

    // Default baseline schedule items
    const baseItems = [
      {
        id: 'base_001',
        time: '8:15 AM',
        title: window.i18n ? window.i18n.getText('breakfast_label') : 'Warm Breakfast & Tea',
        status: 'completed',
        badge: window.i18n ? `${window.i18n.getText('badge_completed')} 8:15 AM` : 'Completed 8:15 AM',
        sensor: window.i18n ? window.i18n.getText('breakfast_sensor') : 'Kitchen kettle logged at 8:22 AM',
        isDefault: true
      },
      {
        id: 'rem_001',
        time: '9:00 AM',
        title: window.i18n ? window.i18n.getText('med_pill_label') : 'Morning Blood Pressure Pill (Lisinopril 10mg)',
        status: isMedTaken ? 'completed' : 'overdue',
        badge: isMedTaken ? (window.i18n ? `${window.i18n.getText('badge_completed')} 9:02 AM` : 'Completed 9:02 AM') : (window.i18n ? window.i18n.getText('badge_pending_overdue') : 'Pending / 35m Overdue'),
        sensor: isMedTaken ? (window.i18n ? window.i18n.getText('sensor_tablet_confirmed') : 'Bedside tablet confirmed at 9:02 AM') : (window.i18n ? window.i18n.getText('sensor_tablet_chime') : 'Bedside chime played at 9:00 AM'),
        isDefault: true
      },
      {
        id: 'base_002',
        time: '11:30 AM',
        title: window.i18n ? window.i18n.getText('garden_walk_label') : 'Garden Walk with Sarah',
        status: 'upcoming',
        badge: window.i18n ? `${window.i18n.getText('badge_upcoming')} (11:30 AM)` : 'Upcoming (11:30 AM)',
        sensor: window.i18n ? window.i18n.getText('sensor_terrace_door') : 'Terrace door sensor active',
        isDefault: true
      }
    ];

    // Additional custom reminders saved by caregiver
    const customReminders = (window.recollectDB.getItem('Reminder') || []).filter(r => r.reminder_id !== 'rem_001');
    const customItems = customReminders.map(r => {
      const done = logs.some(l => l.reminder_id === r.reminder_id && l.patient_response === 'acknowledged');
      return {
        id: r.reminder_id,
        time: r.scheduled_time || '14:00',
        title: r.label,
        status: done ? 'completed' : 'upcoming',
        badge: done ? (window.i18n ? window.i18n.getText('badge_completed') : 'Completed') : (r.priority === 'critical' ? (window.i18n ? window.i18n.t('badge_critical_pending') : 'Critical Pending') : (window.i18n ? window.i18n.getText('badge_upcoming') : 'Upcoming')),
        sensor: r.instructions || (window.i18n ? window.i18n.t('rem_sensor_fallback') : 'Scheduled caregiver reminder'),
        isDefault: false
      };
    });

    const allItems = [...baseItems, ...customItems];

    stream.innerHTML = allItems.map(item => `
      <div class="timeline-node ${item.status}">
        <div class="timeline-node-header">
          <strong>${item.time} • ${item.title}</strong>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="routine-status-pill ${item.status === 'completed' ? 'done-badge' : (item.status === 'overdue' ? 'pending-badge' : '')}">${item.badge}</span>
            <button class="checklist-action-btn ${item.status === 'completed' ? 'done' : ''}" onclick="app.toggleReminderDone('${item.id}', ${item.status === 'completed'})">
              ${item.status === 'completed' ? (window.i18n ? '↺ ' + window.i18n.getText('btn_undo') : '↺ Undo') : (window.i18n ? '✓ ' + window.i18n.getText('btn_done') : '✓ Done')}
            </button>
            ${!item.isDefault ? `<button class="checklist-action-btn delete" onclick="app.deleteCustomReminder('${item.id}')" title="Delete task">✕</button>` : ''}
          </div>
        </div>
        <div class="timeline-node-sensor">📡 ${window.i18n ? window.i18n.getText('sensor_label') : 'Sensor'}: ${item.sensor}</div>
      </div>
    `).join('');

    const overdueBanner = document.getElementById('cgOverdueBanner');
    if (overdueBanner) {
      overdueBanner.style.display = isMedTaken ? 'none' : 'flex';
    }
  }

  toggleReminderDone(reminderId, isCurrentlyDone) {
    if (reminderId === 'base_001' || reminderId === 'base_002') {
      this.showToast(window.i18n ? window.i18n.t('toast_baseline_logged') : 'Baseline schedule checkpoints are auto-logged.', 'ℹ️');
      return;
    }

    if (reminderId === 'rem_001') {
      if (isCurrentlyDone) {
        // Undo
        const logs = window.recollectDB.getItem('ReminderLog').filter(l => l.reminder_id !== 'rem_001');
        window.recollectDB.setItem('ReminderLog', logs);
        this.showToast(window.i18n ? window.i18n.t('toast_pill_pending') : 'Marked morning pill as pending.', '↺');
      } else {
        this.caregiverMarkTaken();
      }
    } else {
      const logs = window.recollectDB.getItem('ReminderLog');
      if (isCurrentlyDone) {
        const filtered = logs.filter(l => l.reminder_id !== reminderId);
        window.recollectDB.setItem('ReminderLog', filtered);
        this.showToast(window.i18n ? window.i18n.t('toast_rem_pending') : 'Reminder marked as pending.', '↺');
      } else {
        window.recollectDB.insertReminderLog({
          reminder_id: reminderId,
          patient_id: this.patientId,
          scheduled_for: new Date().toISOString(),
          patient_response: 'acknowledged',
          responded_at: new Date().toISOString(),
          response_latency_seconds: 60
        });
        this.showToast(window.i18n ? window.i18n.t('toast_rem_completed') : 'Reminder marked as completed.', '✓');
      }
    }

    this.renderCaregiverTimeline();
    this.updatePatientRoutineCard();
  }

  deleteCustomReminder(reminderId) {
    window.recollectDB.deleteReminder(reminderId);
    this.renderCaregiverTimeline();
    this.showToast(window.i18n ? window.i18n.t('toast_task_removed') : 'Task removed from schedule.', '🗑️');
  }

  refreshCaregiverTimeline() {
    this.renderCaregiverTimeline();
    const syncText = document.getElementById('cgSyncText');
    if (syncText) syncText.textContent = `Live Hub Sync: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    this.showToast(window.i18n ? window.i18n.t('toast_schedule_synced') : 'Caregiver schedule synchronized with Eleanor\'s tablet.', '🔄');
  }

  caregiverMarkTaken() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    window.recollectDB.insertReminderLog({
      reminder_id: 'rem_001',
      patient_id: this.patientId,
      scheduled_for: '2026-09-07T09:00:00Z',
      patient_response: 'acknowledged',
      responded_at: now.toISOString(),
      response_latency_seconds: 2100
    });

    window.recollectDB.addActivityLog({
      author: 'Sarah Vance',
      role: 'Primary Family Caregiver',
      action: 'Routine Marked by Caregiver',
      content: `Sarah confirmed Lisinopril 10mg tablet was taken by Eleanor at ${timeStr}.`,
      timestamp: now.toISOString()
    });

    this.renderCaregiverTimeline();
    this.renderActivityLogs();
    this.updatePatientRoutineCard();
    this.showToast(window.i18n ? window.i18n.t('toast_taken_cg') : 'Marked as taken by Caregiver (Sarah).', '✓');
  }

  simulateSmsEscalation() {
    this.showToast(window.i18n ? window.i18n.t('toast_sms_sent') : '📱 SMS Alert sent to Sarah (+91 98765 43210): "Recollect Alert: Eleanor\'s 9:00 AM Blood Pressure Pill unconfirmed."', '📱');
  }

  // --- Caregiver Notes ---
  submitCaregiverNote() {
    const input = document.getElementById('caregiverNoteInput');
    const tagSelect = document.getElementById('noteTagSelect');
    const text = input?.value?.trim();

    if (!text) {
      this.showToast(window.i18n ? window.i18n.t('toast_note_empty') : 'Please enter an observation note before saving.', '⚠️');
      return;
    }

    window.recollectDB.insertCaregiverNote({
      patient_id: this.patientId,
      caregiver_id: this.caregiverId,
      content: text,
      tag: tagSelect?.value || 'Cognitive Spark'
    });

    window.recollectDB.addActivityLog({
      author: 'Sarah Vance',
      role: 'Primary Family Caregiver',
      action: 'Memory Journal Note',
      content: `"${text}" [Tag: ${tagSelect?.value || 'Observation'}]`,
      timestamp: new Date().toISOString()
    });

    if (input) input.value = '';
    this.renderCaregiverNotes();
    this.renderActivityLogs();
    this.showToast(window.i18n ? window.i18n.t('toast_note_saved') : 'Caregiver observation saved to patient clinical record.', '📝');
  }

  renderCaregiverNotes() {
    const list = document.getElementById('cgNotesList');
    if (!list) return;

    const notes = window.recollectDB.getItem('CaregiverNote') || [];
    list.innerHTML = notes.map(n => `
      <div class="note-item-card">
        <div class="note-meta-row">
          <span class="note-tag-badge">${n.tag || 'Observation'}</span>
          <span>${new Date(n.created_at).toLocaleDateString()} ${new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p style="font-size:0.95rem; color:var(--on-surface);">"${n.content}"</p>
      </div>
    `).join('');
  }

  // --- Add Reminder Modal ---
  openNewReminderModal() {
    document.getElementById('reminderModal')?.classList.add('active-modal');
  }

  closeNewReminderModal() {
    document.getElementById('reminderModal')?.classList.remove('active-modal');
  }

  saveNewReminder(e) {
    e.preventDefault();
    const label = document.getElementById('remLabel')?.value;
    const type = document.getElementById('remType')?.value;
    const time = document.getElementById('remTime')?.value;
    const instructions = document.getElementById('remInstructions')?.value;
    const priority = document.getElementById('remPriority')?.value;

    window.recollectDB.saveReminder({
      patient_id: this.patientId,
      label,
      type,
      scheduled_time: time,
      instructions,
      priority,
      active: true,
      created_by: this.caregiverId
    });

    window.recollectDB.addActivityLog({
      author: 'Sarah Vance',
      role: 'Primary Family Caregiver',
      action: 'Scheduled New Routine',
      content: `Scheduled "${label}" for ${time} (${priority} priority).`,
      timestamp: new Date().toISOString()
    });

    this.closeNewReminderModal();
    this.renderCaregiverTimeline();
    this.renderActivityLogs();
    this.showToast(window.i18n ? window.i18n.t('toast_rem_scheduled', { label, time }) : `New reminder "${label}" scheduled for ${time}.`, '➕');
  }

  // --- Multi-Disciplinary Care Circle & Messaging ---
  renderCareTeamGrid() {
    const grid = document.getElementById('cgCareTeamGrid');
    if (!grid) return;

    const members = window.recollectDB.getCareTeamMembers();
    grid.innerHTML = members.map(m => `
      <div class="care-team-member-card">
        <div class="care-team-member-avatar">${m.avatar || '👤'}</div>
        <div class="care-team-member-info">
          <h4>${m.name}</h4>
          <p><strong>${m.roleTitle}</strong> • ${m.relationship}</p>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <button class="care-team-contact-btn" onclick="app.contactCareTeamMember('${m.name}', '${m.contact}')">
              📞 ${m.contact}
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  contactCareTeamMember(name, contact) {
    this.startAudioCallSimulation(name, window.i18n ? window.i18n.t('call_connecting_to', { contact }) : `Connecting to ${contact}...`);
  }

  promptAddCareTeamMember() {
    const namePrompt = window.i18n ? window.i18n.t('prompt_care_member_name') : 'Enter new care circle member name:';
    const rolePrompt = window.i18n ? window.i18n.t('prompt_care_member_role') : 'Enter role/relation (e.g. Physiotherapist, Neighbor):';
    const phonePrompt = window.i18n ? window.i18n.t('prompt_care_member_phone') : 'Enter phone or email:';
    const defaultRole = window.i18n ? window.i18n.t('default_care_partner_role') : 'Care Partner';

    const name = prompt(namePrompt);
    if (!name) return;
    const role = prompt(rolePrompt) || defaultRole;
    const phone = prompt(phonePrompt) || '+91 98000 00000';

    window.recollectDB.addCareTeamMember({
      name,
      roleTitle: role,
      relationship: 'Care Circle Partner',
      avatar: '🤝',
      contact: phone
    });

    this.renderCareTeamGrid();
    this.showToast(window.i18n ? window.i18n.t('toast_circle_added', { name }) : `Added ${name} to Care Circle.`, '👥');
  }

  switchMessageChannel(channel) {
    this.activeMessageChannel = channel;
    const btnDoc = document.getElementById('chanBtnDoctor');
    const btnAsha = document.getElementById('chanBtnAsha');
    const title = document.getElementById('channelHeaderTitle');
    const banner = document.getElementById('channelNoticeBanner');
    const input = document.getElementById('doctorMsgInput');

    if (channel === 'doctor') {
      btnDoc?.classList.add('active');
      btnAsha?.classList.remove('active');
      if (title) title.innerHTML = `<span>🩺</span> ${window.i18n ? window.i18n.getText('channel_doctor_title') : 'Dr. Robert Thorne — Clinical Channel'}`;
      if (banner) banner.innerHTML = window.i18n ? window.i18n.getText('channel_doctor_banner') : '<span>💬 <strong>Non-Emergency Channel:</strong> Replies typically within 24–48 hours. For immediate medical needs, use Emergency Quick Call.</span>';
      if (input) input.placeholder = window.i18n ? window.i18n.getText('msg_input_ph') : 'Write a non-emergency message to Dr. Thorne...';
    } else {
      btnAsha?.classList.add('active');
      btnDoc?.classList.remove('active');
      if (title) title.innerHTML = `<span>🌾</span> ${window.i18n ? window.i18n.getText('channel_asha_title') : 'Anita Roy (ASHA Lead) — Community Health Channel'}`;
      if (banner) banner.innerHTML = window.i18n ? window.i18n.getText('channel_asha_banner') : '<span>💬 <strong>ASHA Rural Channel:</strong> Direct coordination for weekly home visits, water checks & local PHC support.</span>';
      if (input) input.placeholder = window.i18n ? window.i18n.getText('msg_input_ph') : 'Message Anita Roy regarding home visit or vitals...';
    }

    this.renderCareTeamMessages();
  }

  renderCareTeamMessages() {
    const stream = document.getElementById('doctorMessagesStream');
    if (!stream) return;

    const messages = window.recollectDB.getCareTeamMessages(this.activeMessageChannel);
    stream.innerHTML = messages.map(m => `
      <div class="doctor-msg-bubble ${m.senderRole === 'caregiver' ? 'from-caregiver' : 'from-doctor'}">
        <strong>${m.sender}:</strong> ${m.content}
        <div style="font-size:0.75rem; opacity:0.8; margin-top:0.25rem;">${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `).join('');
    stream.scrollTop = stream.scrollHeight;
  }

  sendCareMessage() {
    const input = document.getElementById('doctorMsgInput');
    const text = input?.value?.trim();
    if (!text) return;

    window.recollectDB.addCareTeamMessage({
      channel: this.activeMessageChannel,
      sender: 'Sarah Vance',
      senderRole: 'caregiver',
      content: text
    });

    if (input) input.value = '';
    this.renderCareTeamMessages();
    this.showToast(window.i18n ? window.i18n.t('toast_msg_delivered') : 'Message delivered.', '💬');

    // Simulate realistic auto-reply after 1.8 seconds
    const activeChan = this.activeMessageChannel;
    setTimeout(() => {
      let replySender = 'Dr. Thorne';
      let replyRole = 'doctor';
      let replyText = 'Received your update. Adherence looks very steady, keep up the positive routine support.';

      if (activeChan === 'asha') {
        replySender = 'Anita Roy (ASHA)';
        replyRole = 'asha';
        replyText = 'Namaste Sarah. Thank you for the note. I will inspect Eleanor\'s pillbox during Wednesday visit.';
      }

      window.recollectDB.addCareTeamMessage({
        channel: activeChan,
        sender: replySender,
        senderRole: replyRole,
        content: replyText
      });

      if (this.activeMessageChannel === activeChan) {
        this.renderCareTeamMessages();
      }
    }, 1800);
  }

  sendDoctorMessage() {
    this.sendCareMessage();
  }

  // --- Caregiver Activity & Hand-off Log ---
  renderActivityLogs() {
    const logContainer = document.getElementById('cgSharedActivityLog');
    if (!logContainer) return;

    const logs = window.recollectDB.getActivityLogs();
    logContainer.innerHTML = logs.map(l => `
      <div class="note-item-card">
        <div class="note-meta-row">
          <strong>${l.author} <span style="font-size:0.8rem; color:var(--on-surface-variant); font-weight:normal;">(${l.role || 'Care Team'})</span></strong>
          <span>${new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p style="font-size:0.95rem; margin-top:0.25rem;">${l.content}</p>
      </div>
    `).join('');
  }

  addHandoffNote() {
    const input = document.getElementById('handoffNoteInput');
    const authorSelect = document.getElementById('handoffAuthorSelect');
    const text = input?.value?.trim();

    if (!text) {
      this.showToast(window.i18n ? window.i18n.t('toast_handoff_empty') : 'Please type a hand-off note first.', '⚠️');
      return;
    }

    const author = authorSelect?.value || 'Sarah Vance (Daughter)';
    window.recollectDB.addActivityLog({
      author,
      role: 'Care Circle Hand-off',
      action: 'Shift Log',
      content: text,
      timestamp: new Date().toISOString()
    });

    if (input) input.value = '';
    this.renderActivityLogs();
    this.showToast(window.i18n ? window.i18n.t('toast_handoff_saved') : 'Hand-off observation logged for the care team.', '📋');
  }

  // --- Alert Escalation Settings ---
  restoreAlertSettings() {
    const settings = window.recollectDB.getAlertSettings();
    const pushEl = document.getElementById('togglePushAlerts');
    const smsEl = document.getElementById('toggleSmsFallback');
    const digestEl = document.getElementById('toggleDigestAlerts');

    if (pushEl) {
      pushEl.checked = settings.instantPush;
      pushEl.onchange = () => this.saveAlertSettingsState();
    }
    if (smsEl) {
      smsEl.checked = settings.smsFallback;
      smsEl.onchange = () => this.saveAlertSettingsState();
    }
    if (digestEl) {
      digestEl.checked = settings.batchDigest;
      digestEl.onchange = () => this.saveAlertSettingsState();
    }
  }

  saveAlertSettingsState() {
    const pushEl = document.getElementById('togglePushAlerts');
    const smsEl = document.getElementById('toggleSmsFallback');
    const digestEl = document.getElementById('toggleDigestAlerts');

    window.recollectDB.saveAlertSettings({
      instantPush: pushEl?.checked ?? true,
      smsFallback: smsEl?.checked ?? true,
      batchDigest: digestEl?.checked ?? true
    });
    this.showToast(window.i18n ? window.i18n.t('toast_alerts_saved') : 'Alert escalation preferences saved.', '🔔');
  }

  // --- Clinical Hub & Behavior Flags (design.md Section 5) ---
  setClinicalTab(tabName) {
    document.querySelectorAll('.clin-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('clinTabContentStandard').style.display = 'none';
    document.getElementById('clinTabContentAsha').style.display = 'none';
    document.getElementById('clinTabContentReport').style.display = 'none';

    if (tabName === 'standard') {
      document.getElementById('clinViewStandard')?.classList.add('active');
      document.getElementById('clinTabContentStandard').style.display = 'block';
    } else if (tabName === 'asha') {
      document.getElementById('clinViewAsha')?.classList.add('active');
      document.getElementById('clinTabContentAsha').style.display = 'block';
    } else if (tabName === 'report') {
      document.getElementById('clinViewReport')?.classList.add('active');
      document.getElementById('clinTabContentReport').style.display = 'block';
    }
  }

  updateClinicalMetrics() {
    if (!window.ruleEngine) return;
    const result = window.ruleEngine.computeCompositeWeeklyScore(this.patientId);

    const scoreEl = document.getElementById('metricCompositeScore');
    const adherenceEl = document.getElementById('metricAdherence');
    const gameEl = document.getElementById('metricGameScore');

    if (scoreEl) scoreEl.textContent = `${result.composite_score} / 100`;
    if (adherenceEl) adherenceEl.textContent = `${result.components.routine_adherence_pct}%`;
    if (gameEl) gameEl.textContent = `${result.components.game_performance_avg}%`;
  }

  runRuleEngineCheck() {
    if (window.ruleEngine) {
      window.ruleEngine.evaluateAllRules(this.patientId);
      this.renderBehaviorFlags();
      this.showToast(window.i18n ? window.i18n.t('toast_rules_evaluated') : 'Deterministic Phase-1 rule engine evaluated.', '⚙️');
    }
  }

  renderBehaviorFlags() {
    const container = document.getElementById('behaviorFlagsList');
    if (!container) return;

    let flags = window.recollectDB.getItem('BehaviorFlag').filter(f => f.patient_id === this.patientId);

    if (flags.length === 0) {
      flags = [{
        flag_id: 'flag_demo_01',
        patient_id: this.patientId,
        flag_type: 'routine_adherence_pattern',
        severity: 'watch',
        generated_by: 'rule_v1',
        evidence: {
          evaluated_rule: 'missed_medication_streak',
          threshold: 3,
          description: 'Medication adherence remains consistent at 94%. No critical streaks detected.'
        },
        detected_at: new Date().toISOString(),
        acknowledged_by: null
      }];
    }

    const flagCountEl = document.getElementById('metricFlagsCount');
    if (flagCountEl) flagCountEl.textContent = `${flags.length} Flag(s)`;

    container.innerHTML = flags.map(f => `
      <div class="behavior-flag-card ${f.severity === 'alert' ? 'severity-alert' : ''}">
        <div class="flag-header-line">
          <div class="flag-type-badge">
            <span>${f.severity === 'alert' ? '🚨' : '⚠️'}</span>
            <span>Pattern: ${f.flag_type.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
          <span style="font-size:0.85rem; font-weight:700; color:#64748b;">Version: <code>${f.generated_by}</code></span>
        </div>
        <div class="flag-evidence-box">
          <strong>Explainable Evidence:</strong> ${f.evidence.description || JSON.stringify(f.evidence)}
        </div>
        <div class="human-review-actions">
          <span style="font-size:0.85rem; font-weight:700; color:var(--on-surface-variant);">Clinician Review:</span>
          <button class="review-action-btn confirm" onclick="app.reviewFlag('${f.flag_id}', 'confirmed')">✓ Confirm Concern</button>
          <button class="review-action-btn dismiss" onclick="app.reviewFlag('${f.flag_id}', 'dismissed')">✕ Dismiss as Noise</button>
          <button class="review-action-btn" onclick="app.reviewFlag('${f.flag_id}', 'annotated')">📝 Add Clinical Note</button>
        </div>
      </div>
    `).join('');
  }

  reviewFlag(flagId, action) {
    window.recollectDB.updateBehaviorFlag(flagId, {
      acknowledged_by: 'dr_thorne_001',
      acknowledged_at: new Date().toISOString(),
      user_action: action
    });
    this.showToast(window.i18n ? window.i18n.t('toast_flag_updated', { action }) : `Flag updated: Marked as ${action}.`, '✓');
    this.renderBehaviorFlags();
  }

  sendDoctorReportReply() {
    const input = document.getElementById('doctorReportReplyInput');
    const text = input?.value?.trim();
    if (!text) {
      this.showToast(window.i18n ? window.i18n.t('toast_reply_empty') : 'Please enter a clinical reply before sending.', '⚠️');
      return;
    }

    window.recollectDB.addCareTeamMessage({
      channel: 'doctor',
      sender: 'Dr. Thorne',
      senderRole: 'doctor',
      content: text
    });

    if (input) input.value = '';
    this.showToast(window.i18n ? window.i18n.t('toast_reply_sent') : 'Physician report reply transmitted to Sarah Vance.', '🩺');
  }

  logAshaHomeVisit() {
    const now = new Date();
    window.recollectDB.addActivityLog({
      author: 'Anita Roy (ASHA Worker)',
      role: 'Primary Health Centre (PHC)',
      action: 'Home Visit Check Completed',
      content: `Completed routine home visit. Blood pressure stable, hydration clean, pillbox verified at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      timestamp: now.toISOString()
    });
    this.renderActivityLogs();
    this.showToast(window.i18n ? window.i18n.t('toast_asha_logged') : 'ASHA Home Visit Checkpoint logged successfully to state register.', '🌾');
  }

  initiateTelemedicineReferral() {
    const packet = {
      patientId: this.patientId,
      name: 'Eleanor Vance',
      abhaId: '91-4521-8890-1234',
      referralHospital: 'District Civil Hospital Telemedicine Hub',
      attendingDoctor: 'Dr. Robert Thorne',
      generatedAt: new Date().toISOString()
    };
    const telemedMsg = window.i18n ? window.i18n.t('telemed_alert_text', {
      name: packet.name,
      abhaId: packet.abhaId,
      hospital: packet.referralHospital,
      doctor: packet.attendingDoctor
    }) : `📡 Ayushman Bharat Telemedicine Referral Generated:\n\nPatient: ${packet.name} (ABHA ID: ${packet.abhaId})\nCenter: ${packet.referralHospital}\nProvider: ${packet.attendingDoctor}\nStatus: Packet queued for district consultation.`;
    alert(telemedMsg);
    this.showToast(window.i18n ? window.i18n.t('toast_telemed_packet') : 'Telemedicine referral packet generated under Ayushman Bharat Digital Health integration.', '🏥');
  }

  exportComplianceData() {
    const data = window.recollectDB.exportPatientData(this.patientId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recollect_patient_${this.patientId}_export.json`;
    a.click();
    this.showToast(window.i18n ? window.i18n.t('toast_compliance_exported') : 'Exported DPDP Act & GDPR compliant JSON bundle.', '📦');
  }

  // --- Network & Power Modes ---
  toggleNetworkMode() {
    this.isOnline = !this.isOnline;
    window.recollectDB.isOnline = this.isOnline;

    const btn = document.getElementById('networkToggleBtn');
    const dot = document.getElementById('netStatusDot');
    const text = document.getElementById('netStatusText');

    if (this.isOnline) {
      if (btn) btn.className = 'status-pill online';
      if (dot) dot.textContent = '🟢';
      const netKey = 'net_online';
      if (text) {
        text.setAttribute('data-i18n', netKey);
        text.textContent = window.i18n ? window.i18n.getText(netKey) : 'Online';
      }
      window.recollectDB.processSyncQueue();
      this.showToast(window.i18n ? window.i18n.t('toast_net_connected') : 'Connected to network. Background sync queue processed.', '🟢');
    } else {
      if (btn) btn.className = 'status-pill offline';
      if (dot) dot.textContent = '🟠';
      const netKey = 'net_offline';
      if (text) {
        text.setAttribute('data-i18n', netKey);
        text.textContent = window.i18n ? window.i18n.getText(netKey) : 'Offline (Local-Only)';
      }
      this.showToast(window.i18n ? window.i18n.t('toast_net_offline') : 'Zero-connectivity offline mode active. All patient writes persist locally.', '🟠');
    }
  }

  togglePowerMode() {
    this.isLowPower = !this.isLowPower;
    document.body.classList.toggle('low-power-mode', this.isLowPower);

    const text = document.getElementById('powerModeText');
    const pwrKey = this.isLowPower ? 'power_low' : 'power_normal';
    if (text) {
      text.setAttribute('data-i18n', pwrKey);
      text.textContent = window.i18n ? window.i18n.getText(pwrKey) : (this.isLowPower ? 'Low Power' : 'Normal');
    }

    const settingsToggle = document.getElementById('toggleLowPowerSettings');
    if (settingsToggle) settingsToggle.checked = this.isLowPower;

    this.showToast(window.i18n ? (this.isLowPower ? window.i18n.t('toast_power_low') : window.i18n.t('toast_power_normal')) : (this.isLowPower ? 'Low-power mode enabled (reduced animation and background polling).' : 'Normal power mode restored.'), '⚡');
  }

  applyLanguageToAllViews() {
    // 1. Update header role title
    const session = this.activeSession || (window.recollectDB ? window.recollectDB.getActiveSession() : null);
    const roleTitle = document.getElementById('activeUserRoleTitle');
    if (session && roleTitle && window.i18n) {
      let roleKey = 'role_senior_space';
      if (session.role === 'caregiver') roleKey = 'role_caregiver_title';
      if (session.role === 'clinical') roleKey = 'role_clinical_title';
      roleTitle.setAttribute('data-i18n', roleKey);
      roleTitle.textContent = window.i18n.getText(roleKey);
    }

    // 2. Update network and power labels in header
    const netText = document.getElementById('netStatusText');
    if (netText && window.i18n) {
      const netKey = this.isOnline ? 'net_online' : 'net_offline';
      netText.setAttribute('data-i18n', netKey);
      netText.textContent = window.i18n.getText(netKey);
    }
    const pwrText = document.getElementById('powerModeText');
    if (pwrText && window.i18n) {
      const pwrKey = this.isLowPower ? 'power_low' : 'power_normal';
      pwrText.setAttribute('data-i18n', pwrKey);
      pwrText.textContent = window.i18n.getText(pwrKey);
    }

    // 3. Update dynamic orientation, date, greeting, and theme schedule badges
    this.updateOrientationTime();
    this.evaluateThemeSchedules();

    // 4. Update role-specific dynamic streams
    if (session && session.role === 'caregiver') {
      this.renderCaregiverTimeline();
      this.renderCaregiverNotes();
      this.renderCareTeamGrid();
      this.renderCareTeamMessages();
      this.renderActivityLogs();
    } else if (session && session.role === 'clinical') {
      this.updateClinicalMetrics();
      this.renderBehaviorFlags();
    }
  }

  changeLanguage(lang) {
    if (window.i18n) {
      window.i18n.setLanguage(lang);
      const mainSelect = document.getElementById('langSelect');
      if (mainSelect) mainSelect.value = lang;
      const settingsSelect = document.getElementById('settingsLangSelect');
      if (settingsSelect) settingsSelect.value = lang;
      this.applyLanguageToAllViews();
      const langNameMap = {
        'en': 'English',
        'as': 'অসমীয়া (Assamese)',
        'bn': 'বাংলা (Bengali)',
        'kha': 'Khasi (Meghalaya)',
        'hi': 'हिन्दी (Hindi)'
      };
      this.showToast(window.i18n ? window.i18n.t('toast_lang_switched', { lang: langNameMap[lang] || lang.toUpperCase() }) : `Language switched to ${langNameMap[lang] || lang.toUpperCase()}`, '🌐');
    }
  }

  showToast(message, icon = '🌿') {
    const toast = document.getElementById('appToast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');

    if (toast && toastMsg && toastIcon) {
      let resolved = message;
      if (window.i18n && typeof message === 'string' && message.startsWith('toast_')) {
        resolved = window.i18n.t(message);
      }
      toastMsg.textContent = resolved;
      toastIcon.textContent = icon;
      toast.style.display = 'flex';

      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  }
}

// Instantiate global application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new RecollectApp();
});
