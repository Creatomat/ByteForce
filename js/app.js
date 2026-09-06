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

    // Game state
    this.gameStartTime = null;
    this.gameMistakes = 0;
    this.gameMatches = 0;
    this.lastCardClickTime = null;
    this.hesitationSamples = [];
    this.activeCards = [];
    this.selectedCards = [];
    this.isCheckingMatch = false;

    // Toast timeout
    this.toastTimeout = null;
    
    this.init();
  }

  init() {
    // Restore persistent accessibility preferences
    this.isHighContrast = localStorage.getItem('recollect_high_contrast') === 'true';
    if (this.isHighContrast) {
      document.body.classList.add('high-contrast-mode');
      const toggle = document.getElementById('toggleHighContrast');
      if (toggle) toggle.checked = true;
    }

    this.fontScale = localStorage.getItem('recollect_font_scale') || 'normal';
    document.body.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    document.body.classList.add(`font-scale-${this.fontScale}`);
    const fontSelect = document.getElementById('fontSizeSelector');
    if (fontSelect) fontSelect.value = this.fontScale;

    // Initialize i18n
    if (window.i18n) {
      window.i18n.updateDOM();
      const savedLang = localStorage.getItem('recollect_lang') || 'en';
      const langSelect = document.getElementById('langSelect');
      if (langSelect) langSelect.value = savedLang;
      const settingsLang = document.getElementById('settingsLangSelect');
      if (settingsLang) settingsLang.value = savedLang;
    }

    // Evaluate Phase-1 rules for patient
    if (window.ruleEngine) {
      window.ruleEngine.evaluateAllRules(this.patientId);
    }

    // Restore authenticated session
    this.restoreSession();
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

    // Reset Header to Logged-Out state
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
      this.showToast(authResult.error, '⚠️');
      return;
    }

    window.recollectDB.setActiveSession(authResult.session);
    this.applySession(authResult.session);
    this.showToast(`Logged in to ${authResult.session.title}`, '🌿');
  }

  applySession(session) {
    this.activeSession = session;

    // Configure Header for active role
    const badge = document.getElementById('activeUserBadge');
    const avatar = document.getElementById('activeUserAvatar');
    const name = document.getElementById('activeUserName');
    const roleTitle = document.getElementById('activeUserRoleTitle');

    if (badge && avatar && name && roleTitle) {
      badge.style.display = 'flex';
      name.textContent = session.name;
      roleTitle.textContent = `(${session.title})`;

      if (session.role === 'patient') {
        avatar.textContent = '👵';
        
        // design.md Section 1 Principle 3 & Section 6.1:
        // Patient app NEVER surfaces sync status, network pill, or technical switches.
        document.getElementById('networkToggleBtn')?.style.setProperty('display', 'none');
        document.getElementById('powerModeBtn')?.style.setProperty('display', 'none');
        document.getElementById('langSelect')?.style.setProperty('display', 'none');
        document.getElementById('appLogoutBtn')?.style.setProperty('display', 'none');
        
        // Show emergency quick-access and subtle caregiver settings affordance
        document.getElementById('emergencyHelpBtn')?.style.setProperty('display', 'inline-flex');
        document.getElementById('patientCaregiverSettingsBtn')?.style.setProperty('display', 'inline-flex');
      } else {
        // Caregiver & Doctor modes show connectivity, language, and logout
        avatar.textContent = session.role === 'caregiver' ? '👩' : '🩺';
        document.getElementById('networkToggleBtn')?.style.setProperty('display', 'inline-flex');
        document.getElementById('powerModeBtn')?.style.setProperty('display', 'inline-flex');
        document.getElementById('langSelect')?.style.setProperty('display', 'inline-flex');
        document.getElementById('appLogoutBtn')?.style.setProperty('display', 'inline-flex');
        
        document.getElementById('emergencyHelpBtn')?.style.setProperty('display', 'none');
        document.getElementById('patientCaregiverSettingsBtn')?.style.setProperty('display', 'none');
      }
    }

    // Render respective dashboard
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active-view'));

    if (session.role === 'patient') {
      document.getElementById('view-patient')?.classList.add('active-view');
      this.refreshPatientHomeState();
    } else if (session.role === 'caregiver') {
      document.getElementById('view-caregiver')?.classList.add('active-view');
      this.renderCaregiverTimeline();
      this.renderCaregiverNotes();
    } else if (session.role === 'clinical') {
      document.getElementById('view-clinical')?.classList.add('active-view');
      this.updateClinicalMetrics();
      this.renderBehaviorFlags();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  logoutUser() {
    window.recollectDB.clearActiveSession();
    this.showLoginScreen();
    this.showToast('You have been logged out. Choose your space to enter.', '🚪');
  }

  refreshPatientHomeState() {
    const logs = window.recollectDB.getItem('ReminderLog') || [];
    const isTaken = logs.some(l => l.reminder_id === 'rem_001' && l.patient_response === 'acknowledged');

    const btn = document.getElementById('takeMedBtn');
    const timeTag = document.getElementById('routineTimeTag');

    if (isTaken && btn) {
      btn.classList.add('completed-state');
      btn.innerHTML = `<span>✓</span> <span>${window.i18n.getText('med_taken_confirm')}</span>`;
      if (timeTag) timeTag.textContent = 'Completed at 9:02 AM';
    } else if (btn) {
      btn.classList.remove('completed-state');
      btn.innerHTML = `<span>✓</span> <span data-i18n="take_med_btn">${window.i18n.getText('take_med_btn')}</span>`;
      if (timeTag) timeTag.textContent = 'Scheduled for 9:00 AM';
    }
  }

  // --- Reminder Full-Attention Prompt Takeover (design.md Section 3.2, FR-1.2, FR-1.3) ---
  openReminderAttention() {
    const modal = document.getElementById('reminderAttentionModal');
    if (modal) {
      modal.classList.add('active-takeover');
      const badge = document.getElementById('voiceListeningBadge');
      if (badge) {
        badge.style.display = this.voiceModeEnabled ? 'inline-flex' : 'none';
      }
      if (this.voiceModeEnabled && window.i18n) {
        window.i18n.speakText("Eleanor, it is time for your morning medicine. Take 1 yellow oval tablet with a full glass of cool water.");
      }
    }
  }

  closeReminderAttention() {
    document.getElementById('reminderAttentionModal')?.classList.remove('active-takeover');
  }

  confirmMorningMedicine() {
    const now = new Date().toISOString();
    
    // Append-only write directly to local storage first (rules.md Section 3)
    window.recollectDB.insertReminderLog({
      reminder_id: 'rem_001',
      patient_id: this.patientId,
      scheduled_for: '2026-10-24T09:00:00Z',
      patient_response: 'acknowledged',
      responded_at: now,
      response_latency_seconds: 120
    });

    this.closeReminderAttention();
    this.refreshPatientHomeState();

    this.showToast('Medicine confirmed and saved on Eleanor\'s tablet.', '💊');
    this.updateClinicalMetrics();
  }

  snoozeReminder() {
    this.closeReminderAttention();
    this.showToast('⏰ Reminder snoozed. We will gently remind you in 10 minutes.', '⏰');
  }

  requestReminderHelp() {
    this.closeReminderAttention();
    
    // Log gentle support flag for caregiver
    window.recollectDB.insertBehaviorFlag({
      patient_id: this.patientId,
      flag_type: 'assistance_request',
      severity: 'watch',
      generated_by: 'patient_app_v1',
      evidence: {
        task: 'Morning Medicine (rem_001)',
        requested_at: new Date().toISOString(),
        description: 'Eleanor requested gentle assistance from Sarah for her morning medication.'
      }
    });

    this.showToast('🤝 We notified Sarah that you need a little help. Take your time, Eleanor.', '💚');
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

  playGameAudioInstruction() {
    const instruction = "Touch two cards gently to find happy memories. There are no timers, take all your time.";
    window.i18n.speakText(instruction);
  }

  // --- Games Hub & Sessions (design.md Section 3.3) ---
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
      if (subtitle) subtitle.textContent = 'Family Photo Match';
      this.showToast('Switched to Family Photo Memories (Lily, Buddy, Garden)', '📷');
    } else {
      btnFamily?.classList.remove('primary');
      btnCultural?.classList.add('primary');
      if (subtitle) subtitle.textContent = 'Northeast Cultural Pack';
      this.showToast('Switched to Northeast India Cultural Memories (Bihu, Tea, River)', '🌿');
    }
  }

  startCategoryGame(category) {
    this.currentCategory = category;
    this.closeGamesHub();
    this.setupMemoryGameCards();
    document.getElementById('gameModal')?.classList.add('active-modal');
  }

  setupMemoryGameCards() {
    let cardData = [];

    if (this.currentCategory === 'memory') {
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
    } else if (this.currentCategory === 'attention') {
      cardData = [
        { id: 'a1', label: 'Yellow Sunflower', subtitle: 'Warm Bright Petals', art: '🌻' },
        { id: 'a2', label: 'Terrace Daisy', subtitle: 'Pure White Bloom', art: '🌼' },
        { id: 'a3', label: 'Sweet Lavender', subtitle: 'Fragrant Purple Scent', art: '🪻' },
        { id: 'a4', label: 'Garden Marigold', subtitle: 'Golden Autumn Flower', art: '🏵️' }
      ];
    } else if (this.currentCategory === 'language') {
      cardData = [
        { id: 'l1', label: 'Fresh Apple', subtitle: 'Sweet & Crisp Fruit', art: '🍎' },
        { id: 'l2', label: 'Morning Bread', subtitle: 'Warm Crust Slice', art: '🍞' },
        { id: 'l3', label: 'Teacup & Honey', subtitle: 'Warm Comfort Drink', art: '☕' },
        { id: 'l4', label: 'Favorite Book', subtitle: 'Stories & Memories', art: '📖' }
      ];
    } else { // problem solving
      cardData = [
        { id: 'p1', label: 'Step 1: Wake Up', subtitle: 'Morning Stretch', art: '🌅' },
        { id: 'p2', label: 'Step 2: Warm Water', subtitle: 'Hydrate Gently', art: '🥤' },
        { id: 'p3', label: 'Step 3: Fresh Breakfast', subtitle: 'Nutrition & Fruit', art: '🥣' },
        { id: 'p4', label: 'Step 4: Garden Walk', subtitle: 'Fresh Air Stroll', art: '🚶' }
      ];
    }

    const deck = [];
    cardData.forEach(item => {
      deck.push({ ...item, uid: item.id + '_a', isMatched: false, isRevealed: false });
      deck.push({ ...item, uid: item.id + '_b', isMatched: false, isRevealed: false });
    });

    this.activeCards = deck.sort(() => 0.5 - Math.random());
    this.selectedCards = [];
    this.gameMatches = 0;
    this.gameMistakes = 0;
    this.hesitationSamples = [];
    this.gameStartTime = Date.now();
    this.lastCardClickTime = Date.now();

    this.renderGameGrid();
  }

  renderGameGrid() {
    const grid = document.getElementById('memoryGameGrid');
    if (!grid) return;

    grid.innerHTML = '';
    this.activeCards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = `photo-card ${card.isRevealed ? 'revealed' : 'hidden-card'} ${card.isMatched ? 'matched' : ''}`;
      cardEl.setAttribute('tabindex', '0');
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('aria-label', card.isRevealed ? card.label : 'Hidden photo card');

      if (card.isRevealed || card.isMatched) {
        cardEl.innerHTML = `
          <div class="card-art">${card.art}</div>
          <div class="card-label">${card.label}</div>
          <div class="card-subtitle">${card.subtitle}</div>
        `;
      } else {
        cardEl.innerHTML = `
          <div class="card-art">🌸</div>
          <div class="card-label">Tap to Peek</div>
          <div class="card-subtitle">Touch gently 👆</div>
        `;
      }

      cardEl.onclick = () => this.handleCardClick(index);
      grid.appendChild(cardEl);
    });
  }

  handleCardClick(index) {
    if (this.isCheckingMatch) return;
    const card = this.activeCards[index];
    if (card.isRevealed || card.isMatched) return;

    const now = Date.now();
    if (this.lastCardClickTime) {
      const latencyMs = now - this.lastCardClickTime;
      if (latencyMs < 10000) {
        this.hesitationSamples.push(latencyMs);
      }
    }
    this.lastCardClickTime = now;

    card.isRevealed = true;
    this.selectedCards.push({ index, card });
    this.renderGameGrid();

    if (this.selectedCards.length === 2) {
      this.checkSelectedMatch();
    }
  }

  checkSelectedMatch() {
    this.isCheckingMatch = true;
    const [c1, c2] = this.selectedCards;
    const banner = document.getElementById('gameFeedbackBanner');

    if (c1.card.id === c2.card.id) {
      c1.card.isMatched = true;
      c2.card.isMatched = true;
      this.gameMatches++;
      this.updateBloomProgress(this.gameMatches);

      // Positive reinforcement (design.md Section 2.2)
      if (banner) {
        banner.style.background = '#f0fdf4';
        banner.style.color = '#065f46';
        banner.textContent = `💚 Wonderful match! You found sweet ${c1.card.label}!`;
      }

      this.selectedCards = [];
      this.isCheckingMatch = false;
      this.renderGameGrid();

      if (this.gameMatches === 4) {
        this.handleGameCompletion();
      }
    } else {
      this.gameMistakes++;
      // Neutral, encouraging redirection (NO red, NO buzzer per design.md Section 2.2 & rules.md Section 2)
      if (banner) {
        banner.style.background = '#fefce8';
        banner.style.color = '#854d0e';
        banner.textContent = "🌸 Let's touch another gentle petal together!";
      }

      setTimeout(() => {
        c1.card.isRevealed = false;
        c2.card.isRevealed = false;
        this.selectedCards = [];
        this.isCheckingMatch = false;
        this.renderGameGrid();
      }, 1200);
    }
  }

  updateBloomProgress(matchesCount) {
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`bloomDot${i}`);
      if (dot) {
        if (i <= matchesCount) {
          dot.classList.add('bloomed');
          dot.textContent = '🌻';
        } else {
          dot.classList.remove('bloomed');
          dot.textContent = '🌱';
        }
      }
    }
  }

  giveGameHint() {
    this.activeCards.forEach(c => { if (!c.isMatched) c.isRevealed = true; });
    this.renderGameGrid();
    const banner = document.getElementById('gameFeedbackBanner');
    if (banner) banner.textContent = '💡 Peek at the garden memories!';

    setTimeout(() => {
      this.activeCards.forEach(c => { if (!c.isMatched) c.isRevealed = false; });
      this.renderGameGrid();
    }, 1500);
  }

  handleGameCompletion() {
    const duration = Math.round((Date.now() - this.gameStartTime) / 1000);
    const avgHesitation = this.hesitationSamples.length > 0 
      ? Math.round(this.hesitationSamples.reduce((a, b) => a + b, 0) / this.hesitationSamples.length)
      : 1350;

    const normalizedScore = Math.max(70, Math.min(100, 100 - (this.gameMistakes * 5)));

    // Save session in DB for Caregiver / Doctor reporting
    window.recollectDB.insertGameSession({
      patient_id: this.patientId,
      game_type: 'memory_match',
      started_at: new Date(this.gameStartTime).toISOString(),
      completed_at: new Date().toISOString(),
      score: normalizedScore,
      duration_seconds: duration,
      mistake_count: this.gameMistakes,
      hesitation_avg_ms: avgHesitation,
      difficulty_level: 'gentle_adaptive',
      device_battery_pct_at_start: 85,
      status: 'completed'
    });

    // Close game modal, open warm completion summary (score is HIDDEN from patient per design.md Section 3.3)
    this.closeMemoryGameModal();
    document.getElementById('gameCompleteModal')?.classList.add('active-modal');

    this.updateClinicalMetrics();
  }

  closeMemoryGameModal() {
    document.getElementById('gameModal')?.classList.remove('active-modal');
  }

  closeGameCompletionModal() {
    document.getElementById('gameCompleteModal')?.classList.remove('active-modal');
  }

  // --- Mood Check-In (design.md Section 3.4) ---
  openMoodModal() {
    document.getElementById('moodModal')?.classList.add('active-modal');
  }

  closeMoodModal() {
    document.getElementById('moodModal')?.classList.remove('active-modal');
  }

  logMood(score, label, btnElement) {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    if (btnElement) btnElement.classList.add('selected');

    const isAssisted = document.getElementById('moodCaregiverAssisted')?.checked;
    const source = isAssisted ? 'caregiver_reported' : 'patient_self_report';

    window.recollectDB.insertMoodLog({
      patient_id: this.patientId,
      mood_score: score,
      mood_label: label,
      source: source
    });

    this.showToast(`Mood check-in recorded: ${label} (${isAssisted ? 'Caregiver Assisted' : 'Self Report'})`, '💚');
  }

  callSarah() {
    this.showToast('Calling Sarah Vance (Daughter) on +91 98765 43210...', '📞');
  }

  callEleanor() {
    this.showToast('Calling Eleanor\'s Bedside Tablet...', '📞');
  }

  triggerEmergencyHelp() {
    this.showToast('🚨 Alert sent to Primary Caregiver (Sarah) and local emergency contacts.', '🚨');
  }

  triggerCaregiverEmergency() {
    this.showToast('🚨 Calling emergency services / secondary contact for Eleanor Vance...', '🚨');
  }

  // --- Caregiver Settings Modal (design.md Section 3.5 & 3.6) ---
  openCaregiverSettings() {
    const modal = document.getElementById('caregiverSettingsModal');
    const pinGate = document.getElementById('settingsPinGate');
    const unlocked = document.getElementById('settingsUnlockedBody');
    const pinInput = document.getElementById('settingsPinInput');

    if (modal) modal.classList.add('active-modal');
    if (pinGate) pinGate.style.display = 'block';
    if (unlocked) unlocked.style.display = 'none';
    if (pinInput) {
      pinInput.value = '1234';
      pinInput.focus();
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
      
      const toggle = document.getElementById('toggleHighContrast');
      if (toggle) toggle.checked = this.isHighContrast;
      const fontSel = document.getElementById('fontSizeSelector');
      if (fontSel) fontSel.value = this.fontScale;
      const voiceToggle = document.getElementById('toggleVoiceMode');
      if (voiceToggle) voiceToggle.checked = this.voiceModeEnabled;
    } else {
      this.showToast('Incorrect Caregiver PIN (Default demo PIN is 1234)', '⚠️');
    }
  }

  toggleHighContrast(enabled) {
    this.isHighContrast = enabled;
    document.body.classList.toggle('high-contrast-mode', enabled);
    localStorage.setItem('recollect_high_contrast', enabled ? 'true' : 'false');
    this.showToast(enabled ? 'High-contrast mode enabled (WCAG AAA)' : 'Standard theme restored', '🎨');
  }

  setFontScale(scale) {
    this.fontScale = scale;
    document.body.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    document.body.classList.add(`font-scale-${scale}`);
    localStorage.setItem('recollect_font_scale', scale);
    this.showToast(`Patient font scaling set to ${scale.toUpperCase()}`, '🔤');
  }

  toggleVoiceMode(enabled) {
    this.voiceModeEnabled = enabled;
    this.showToast(enabled ? 'Voice narration & listening mode active.' : 'Voice mode turned off.', '🔊');
  }

  switchSpaceFromSettings(role) {
    this.closeCaregiverSettings();
    if (role === 'patient') {
      this.loginAsRole('patient');
    } else if (role === 'caregiver') {
      this.loginAsRole('caregiver');
    } else if (role === 'clinical') {
      this.loginAsRole('clinical');
    }
  }

  // --- Consent & Onboarding Multi-Step (design.md Section 6.4) ---
  openConsentModal() {
    this.setConsentStep(1);
    document.getElementById('consentModal')?.classList.add('active-modal');
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
    const aiConsent = document.getElementById('consentAiMonitoring')?.checked;
    this.closeConsentModal();
    this.showToast(`Consent record updated. AI Monitoring: ${aiConsent ? 'Opted-In' : 'Opted-Out'}.`, '📋');
  }

  // --- Caregiver Platform Features (design.md Section 4) ---
  setCaregiverTab(tabName) {
    const tabs = ['today', 'trends', 'journal', 'careteam', 'alerts'];
    tabs.forEach(t => {
      const btn = document.getElementById(`cgTabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
      const content = document.getElementById(`cgTabContent${t.charAt(0).toUpperCase() + t.slice(1)}`);
      if (btn) btn.classList.toggle('active', t === tabName);
      if (content) content.style.display = t === tabName ? 'block' : 'none';
    });
  }

  setTimeframe(tf, btn) {
    document.querySelectorAll('.timeframe-pill').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.showToast(`Switched trends view to ${tf.toUpperCase()} aggregation.`, '📈');
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

  renderCaregiverTimeline() {
    const stream = document.getElementById('cgTimelineStream');
    if (!stream) return;

    const logs = window.recollectDB.getItem('ReminderLog') || [];
    const isTaken = logs.some(l => l.reminder_id === 'rem_001' && l.patient_response === 'acknowledged');

    const items = [
      {
        time: '8:15 AM',
        title: 'Warm Breakfast & Tea',
        status: 'completed',
        badge: 'Completed 8:15 AM',
        sensor: 'Kitchen kettle logged at 8:22 AM'
      },
      {
        time: '9:00 AM',
        title: 'Morning Blood Pressure Pill (Lisinopril 10mg)',
        status: isTaken ? 'completed' : 'overdue',
        badge: isTaken ? 'Completed 9:02 AM' : 'Pending / 35m Overdue',
        sensor: isTaken ? 'Bedside tablet confirmed at 9:02 AM' : 'Bedside chime played at 9:00 AM'
      },
      {
        time: '11:30 AM',
        title: 'Garden Walk with Sarah',
        status: 'upcoming',
        badge: 'Upcoming (11:30 AM)',
        sensor: 'Terrace door sensor active'
      }
    ];

    stream.innerHTML = items.map(item => `
      <div class="timeline-node ${item.status}">
        <div class="timeline-node-header">
          <strong>${item.time} • ${item.title}</strong>
          <span class="routine-status-pill ${item.status === 'completed' ? 'done-badge' : (item.status === 'overdue' ? 'pending-badge' : '')}">${item.badge}</span>
        </div>
        <div class="timeline-node-sensor">📡 Sensor: ${item.sensor}</div>
      </div>
    `).join('');

    const overdueBanner = document.getElementById('cgOverdueBanner');
    if (overdueBanner) {
      overdueBanner.style.display = isTaken ? 'none' : 'flex';
    }
  }

  refreshCaregiverTimeline() {
    this.renderCaregiverTimeline();
    const syncText = document.getElementById('cgSyncText');
    if (syncText) syncText.textContent = `Live Hub Sync: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    this.showToast('Caregiver schedule synchronized with Eleanor\'s tablet.', '🔄');
  }

  caregiverMarkTaken() {
    const now = new Date().toISOString();
    window.recollectDB.insertReminderLog({
      reminder_id: 'rem_001',
      patient_id: this.patientId,
      scheduled_for: '2026-10-24T09:00:00Z',
      patient_response: 'acknowledged',
      responded_at: now,
      response_latency_seconds: 2100
    });

    this.renderCaregiverTimeline();
    this.showToast('Marked as taken by Caregiver (Sarah).', '✓');
  }

  simulateSmsEscalation() {
    this.showToast('📱 SMS Alert sent to Sarah (+91 98765 43210): "Recollect Alert: Eleanor\'s 9:00 AM Blood Pressure Pill unconfirmed."', '📱');
  }

  sendDoctorMessage() {
    const input = document.getElementById('doctorMsgInput');
    const text = input?.value?.trim();
    if (!text) return;

    const stream = document.getElementById('doctorMessagesStream');
    if (stream) {
      const bubble = document.createElement('div');
      bubble.className = 'doctor-msg-bubble from-caregiver';
      bubble.innerHTML = `<strong>Sarah:</strong> ${text}`;
      stream.appendChild(bubble);
      stream.scrollTop = stream.scrollHeight;
    }

    if (input) input.value = '';
    this.showToast('Non-emergency message delivered to Dr. Thorne.', '💬');
  }

  submitCaregiverNote() {
    const input = document.getElementById('caregiverNoteInput');
    const tagSelect = document.getElementById('noteTagSelect');
    const text = input?.value?.trim();

    if (!text) {
      this.showToast('Please enter an observation note before saving.', '⚠️');
      return;
    }

    window.recollectDB.insertCaregiverNote({
      patient_id: this.patientId,
      caregiver_id: this.caregiverId,
      content: text,
      tag: tagSelect?.value || 'Cognitive Spark'
    });

    if (input) input.value = '';
    this.renderCaregiverNotes();
    this.showToast('Caregiver observation saved to patient clinical record.', '📝');
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

    this.closeNewReminderModal();
    this.renderCaregiverTimeline();
    this.showToast(`New reminder "${label}" scheduled for ${time}.`, '➕');
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
      this.showToast('Deterministic Phase-1 rule engine evaluated.', '⚙️');
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
    this.showToast(`Flag updated: Marked as ${action}.`, '✓');
    this.renderBehaviorFlags();
  }

  sendDoctorReportReply() {
    const input = document.getElementById('doctorReportReplyInput');
    const text = input?.value?.trim();
    if (!text) {
      this.showToast('Please enter a clinical reply before sending.', '⚠️');
      return;
    }

    const stream = document.getElementById('doctorMessagesStream');
    if (stream) {
      const bubble = document.createElement('div');
      bubble.className = 'doctor-msg-bubble from-doctor';
      bubble.innerHTML = `<strong>Dr. Thorne:</strong> ${text}`;
      stream.appendChild(bubble);
    }

    if (input) input.value = '';
    this.showToast('Physician report reply transmitted to Sarah Vance.', '🩺');
  }

  logAshaHomeVisit() {
    this.showToast('ASHA Home Visit Checkpoint logged successfully.', '🌾');
  }

  initiateTelemedicineReferral() {
    this.showToast('Telemedicine referral packet generated under Ayushman Bharat Digital Health integration.', '🏥');
  }

  exportComplianceData() {
    const data = window.recollectDB.exportPatientData(this.patientId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recollect_patient_${this.patientId}_export.json`;
    a.click();
    this.showToast('Exported DPDP Act & GDPR compliant JSON bundle.', '📦');
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
      if (text) text.textContent = 'Online';
      window.recollectDB.processSyncQueue();
      this.showToast('Connected to network. Background sync queue processed.', '🟢');
    } else {
      if (btn) btn.className = 'status-pill offline';
      if (dot) dot.textContent = '🟠';
      if (text) text.textContent = 'Offline (Local-Only)';
      this.showToast('Zero-connectivity offline mode active. All patient writes persist locally.', '🟠');
    }
  }

  togglePowerMode() {
    this.isLowPower = !this.isLowPower;
    document.body.classList.toggle('low-power-mode', this.isLowPower);

    const text = document.getElementById('powerModeText');
    if (text) text.textContent = this.isLowPower ? 'Low Power' : 'Normal';
    
    const settingsToggle = document.getElementById('toggleLowPowerSettings');
    if (settingsToggle) settingsToggle.checked = this.isLowPower;

    this.showToast(this.isLowPower ? 'Low-power mode enabled (reduced animation and background polling).' : 'Normal power mode restored.', '⚡');
  }

  changeLanguage(lang) {
    if (window.i18n) {
      window.i18n.setLanguage(lang);
      const mainSelect = document.getElementById('langSelect');
      if (mainSelect) mainSelect.value = lang;
      const settingsSelect = document.getElementById('settingsLangSelect');
      if (settingsSelect) settingsSelect.value = lang;
      this.showToast(`Language switched to ${lang.toUpperCase()}`, '🌐');
    }
  }

  showToast(message, icon = '🌿') {
    const toast = document.getElementById('appToast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');

    if (toast && toastMsg && toastIcon) {
      toastMsg.textContent = message;
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
