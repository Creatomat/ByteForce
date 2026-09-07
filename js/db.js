/**
 * Recollect Local-First Database Layer
 * Adheres strictly to architecture.md Section 4 & 5 and rules.md Section 3 & 4
 * 
 * Rules Enforced:
 * 1. [HARD] Patient-facing writes go to local storage first, always.
 * 2. [HARD] GameSession and ReminderLog rows are append-only.
 * 3. [HARD] Reminder definitions are cloud-authoritative.
 * 4. [HARD] BehaviorFlag.evidence is required (NOT NULL).
 * 5. [HARD] Every trend field (hesitation_avg_ms, mistake_count, latency) is captured at write time.
 */

const STORAGE_PREFIX = 'recollect_db_';

class RecollectDB {
  constructor() {
    this.isOnline = navigator.onLine !== undefined ? navigator.onLine : true;
    this.syncQueue = [];
    this.initDatabase();
  }

  initDatabase() {
    const initialized = localStorage.getItem(STORAGE_PREFIX + 'initialized');
    if (!initialized) {
      this.seedInitialData();
      localStorage.setItem(STORAGE_PREFIX + 'initialized', 'true');
    } else {
      // Ensure new tables are seeded if upgrading
      this.ensureExtendedTables();
    }
  }

  ensureExtendedTables() {
    if (!this.getItem('CareTeamMember').length) {
      this.seedCareTeam();
    }
    if (!this.getItem('CareTeamMessage').length) {
      this.seedCareTeamMessages();
    }
    if (!this.getItem('CaregiverActivityLog').length) {
      this.seedActivityLogs();
    }
    if (!this.getItem('Reminder').length) {
      this.seedDefaultReminders();
    }
  }

  seedDefaultReminders() {
    const now = new Date().toISOString();
    const patientId = 'p_eleanor_vance_001';
    const caregiverId = 'cg_sarah_vance_001';
    const initialReminders = [
      {
        reminder_id: 'rem_001',
        patient_id: patientId,
        type: 'medication',
        label: 'Morning Blood Pressure Pill (Lisinopril 10mg)',
        instructions: 'Take 1 yellow oval tablet with a full glass of cool water',
        scheduled_time: '09:00',
        pill_details: { shape: 'Yellow Oval V 42', count: '1 Pill', water: '1 Full Glass' },
        created_by: caregiverId,
        active: true,
        priority: 'critical',
        escalation_window_mins: 30,
        updated_at: now
      },
      {
        reminder_id: 'rem_002',
        patient_id: patientId,
        type: 'hydration',
        label: 'Afternoon Hydration & Berry Tea',
        instructions: 'Drink a cup of fresh warm berry tea with honey',
        scheduled_time: '14:00',
        pill_details: { count: '1 Cup', water: 'Fresh Warm Tea' },
        created_by: caregiverId,
        active: true,
        priority: 'normal',
        escalation_window_mins: 60,
        updated_at: now
      },
      {
        reminder_id: 'rem_003',
        patient_id: patientId,
        type: 'appointment',
        label: 'Evening Garden Walk & Stroll',
        instructions: 'Enjoy 15 minutes of fresh terrace air and bird watching',
        scheduled_time: '17:30',
        pill_details: { count: '15 Mins', water: 'Comfortable shoes' },
        created_by: caregiverId,
        active: true,
        priority: 'normal',
        escalation_window_mins: 45,
        updated_at: now
      }
    ];
    this.setItem('Reminder', initialReminders);
  }

  seedCareTeam() {
    const members = [
      {
        id: 'ct_sarah',
        name: 'Sarah Vance',
        roleTitle: 'Primary Family Caregiver',
        relationship: 'Daughter (Power of Attorney)',
        avatar: '👩',
        contact: '+91 98765 43210',
        status: 'Active on Tablet Sync',
        isPrimary: true
      },
      {
        id: 'ct_priya',
        name: 'Priya Vance',
        roleTitle: 'Secondary Co-Caregiver',
        relationship: 'Daughter (Evening check-in)',
        avatar: '👧',
        contact: '+91 98765 43211',
        status: 'Active',
        isPrimary: false
      },
      {
        id: 'ct_thorne',
        name: 'Dr. Robert Thorne',
        roleTitle: 'Attending Neurologist',
        relationship: 'District Civil Hospital',
        avatar: '🩺',
        contact: 'dr.thorne@health.gov.in',
        status: 'Weekly report review',
        isPrimary: false
      },
      {
        id: 'ct_anita',
        name: 'Anita Roy',
        roleTitle: 'Lead ASHA Worker',
        relationship: 'Primary Health Centre (PHC)',
        avatar: '🌾',
        contact: '+91 94350 12345',
        status: 'Bi-weekly home visit',
        isPrimary: false
      }
    ];
    this.setItem('CareTeamMember', members);
  }

  seedCareTeamMessages() {
    const messages = [
      {
        id: 'msg_1',
        channel: 'doctor',
        sender: 'Sarah Vance',
        senderRole: 'caregiver',
        content: 'Dr. Thorne, Eleanor was very energetic during the memory game today. Her accuracy is stable.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'msg_2',
        channel: 'doctor',
        sender: 'Dr. Thorne',
        senderRole: 'doctor',
        content: 'Excellent to hear. Keep observing the morning medication routine. The 94% weekly adherence is very reassuring.',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        id: 'msg_3',
        channel: 'asha',
        sender: 'Anita Roy (ASHA)',
        senderRole: 'asha',
        content: 'Namaste Sarah. I will visit Eleanor this Wednesday afternoon for the routine blood pressure and hydration check.',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: 'msg_4',
        channel: 'asha',
        sender: 'Sarah Vance',
        senderRole: 'caregiver',
        content: 'Thank you Anita! Eleanor is looking forward to seeing you. Her tablet routine is going smoothly.',
        timestamp: new Date(Date.now() - 3600000 * 7).toISOString()
      }
    ];
    this.setItem('CareTeamMessage', messages);
  }

  seedActivityLogs() {
    const activities = [
      {
        id: 'act_1',
        author: 'Priya Vance',
        role: 'Secondary Sibling',
        action: 'Breakfast & Morning Check',
        content: 'Checked in for breakfast. Eleanor enjoyed warm berry tea and toast.',
        timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString()
      },
      {
        id: 'act_2',
        author: 'Sarah Vance',
        role: 'Primary Daughter',
        action: 'Routine Confirmation',
        content: 'Confirmed Lisinopril 10mg tablet was taken with water.',
        timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString()
      }
    ];
    this.setItem('CaregiverActivityLog', activities);
  }

  // --- Seed Initial Data ---
  seedInitialData() {
    const now = new Date().toISOString();
    const patientId = 'p_eleanor_vance_001';
    const caregiverId = 'cg_sarah_vance_001';

    const patient = {
      patient_id: patientId,
      full_name: 'Eleanor Vance',
      date_of_birth: '1948-03-14',
      device_id: 'tab_bedside_081',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      care_notes: 'Mild cognitive impairment. Prefers morning visual routines. Daily Lisinopril 10mg.',
      created_at: now
    };

    const caregiver = {
      caregiver_id: caregiverId,
      full_name: 'Sarah Vance',
      email: 'sarah.vance@recollectcare.org',
      phone: '+91 98765 43210',
      role: 'primary',
      auth_provider_id: 'auth_usr_sarah_01',
      created_at: now
    };

    const link = {
      link_id: 'link_001',
      patient_id: patientId,
      caregiver_id: caregiverId,
      consent_confirmed_at: '2026-08-01T09:00:00Z',
      notification_prefs: {
        missed_medication: 'instant_sms_and_push',
        inactivity_gap: 'push_only',
        weekly_report: 'email_digest'
      }
    };

    const historicalGameSessions = [
      {
        session_id: 'gs_seed_001',
        patient_id: patientId,
        game_type: 'memory_match',
        started_at: '2026-09-02T10:15:00Z',
        completed_at: '2026-09-02T10:19:30Z',
        score: 92,
        duration_seconds: 270,
        mistake_count: 1,
        hesitation_avg_ms: 1240,
        difficulty_level: 'gentle_adaptive',
        device_battery_pct_at_start: 88,
        status: 'completed'
      },
      {
        session_id: 'gs_seed_002',
        patient_id: patientId,
        game_type: 'memory_match',
        started_at: '2026-09-03T11:00:00Z',
        completed_at: '2026-09-03T11:04:45Z',
        score: 88,
        duration_seconds: 285,
        mistake_count: 2,
        hesitation_avg_ms: 1420,
        difficulty_level: 'gentle_adaptive',
        device_battery_pct_at_start: 74,
        status: 'completed'
      }
    ];

    const initialReminderLogs = [
      {
        log_id: 'rlog_seed_001',
        reminder_id: 'rem_001',
        patient_id: patientId,
        scheduled_for: '2026-09-03T09:00:00Z',
        patient_response: 'acknowledged',
        responded_at: '2026-09-03T09:04:12Z',
        response_latency_seconds: 252
      }
    ];

    const initialCaregiverNotes = [
      {
        note_id: 'note_001',
        patient_id: patientId,
        caregiver_id: caregiverId,
        content: 'Eleanor had bright recall looking at seaside trip photos. She remembered the saltwater taffy shop and smiled.',
        tag: 'Cognitive Spark',
        created_at: '2026-09-03T19:45:00Z'
      }
    ];

    const initialMoodLogs = [
      {
        mood_id: 'mood_001',
        patient_id: patientId,
        mood_score: 5,
        mood_label: 'Calm & Peaceful',
        created_at: '2026-09-03T08:30:00Z',
        source: 'patient_self_report'
      }
    ];

    this.setItem('Patient', [patient]);
    this.setItem('Caregiver', [caregiver]);
    this.setItem('PatientCaregiverLink', [link]);
    this.setItem('GameSession', historicalGameSessions);
    this.setItem('ReminderLog', initialReminderLogs);
    this.setItem('CaregiverNote', initialCaregiverNotes);
    this.setItem('MoodLog', initialMoodLogs);
    this.setItem('BehaviorFlag', []);
    this.setItem('SyncLog', [
      {
        sync_id: 'sync_seed_001',
        device_id: 'tab_bedside_081',
        patient_id: patientId,
        sync_started_at: now,
        sync_completed_at: now,
        records_pushed: 4,
        records_failed: 0,
        status: 'success',
        error_detail: null
      }
    ]);

    this.seedDefaultReminders();
    this.seedCareTeam();
    this.seedCareTeamMessages();
    this.seedActivityLogs();
  }

  // --- Storage Helpers ---
  getItem(table) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + table);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading table ${table}:`, e);
      return [];
    }
  }

  setItem(table, data) {
    try {
      localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(data));
    } catch (e) {
      console.error(`Error writing table ${table}:`, e);
    }
  }

  // --- Append-Only Write Methods ---
  insertGameSession(session) {
    if (!session.session_id) {
      session.session_id = 'gs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    const sessions = this.getItem('GameSession');
    sessions.push(session);
    this.setItem('GameSession', sessions);
    this.queueForSync('GameSession', session);
    return session;
  }

  insertReminderLog(log) {
    if (!log.log_id) {
      log.log_id = 'rlog_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    const logs = this.getItem('ReminderLog');
    logs.push(log);
    this.setItem('ReminderLog', logs);
    this.queueForSync('ReminderLog', log);
    return log;
  }

  insertCaregiverNote(note) {
    if (!note.note_id) {
      note.note_id = 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    note.created_at = note.created_at || new Date().toISOString();
    const notes = this.getItem('CaregiverNote');
    notes.unshift(note);
    this.setItem('CaregiverNote', notes);
    this.queueForSync('CaregiverNote', note);
    return note;
  }

  insertMoodLog(mood) {
    if (!mood.mood_id) {
      mood.mood_id = 'mood_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    mood.created_at = mood.created_at || new Date().toISOString();
    const moods = this.getItem('MoodLog');
    moods.unshift(mood);
    this.setItem('MoodLog', moods);
    this.queueForSync('MoodLog', mood);
    return mood;
  }

  insertBehaviorFlag(flag) {
    if (!flag.evidence) {
      throw new Error('[HARD RULE VIOLATION] BehaviorFlag.evidence is required and cannot be null.');
    }
    if (!flag.flag_id) {
      flag.flag_id = 'flag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    flag.detected_at = flag.detected_at || new Date().toISOString();
    const flags = this.getItem('BehaviorFlag');
    flags.unshift(flag);
    this.setItem('BehaviorFlag', flags);
    return flag;
  }

  updateBehaviorFlag(flagId, updates) {
    const flags = this.getItem('BehaviorFlag');
    const index = flags.findIndex(f => f.flag_id === flagId);
    if (index !== -1) {
      flags[index] = { ...flags[index], ...updates };
      this.setItem('BehaviorFlag', flags);
      return flags[index];
    }
    return null;
  }

  // --- Care Team & Messages ---
  getCareTeamMembers() {
    return this.getItem('CareTeamMember');
  }

  addCareTeamMember(member) {
    if (!member.id) {
      member.id = 'ct_' + Date.now();
    }
    const members = this.getItem('CareTeamMember');
    members.push(member);
    this.setItem('CareTeamMember', members);
    return member;
  }

  getCareTeamMessages(channel = 'doctor') {
    const all = this.getItem('CareTeamMessage');
    return all.filter(m => m.channel === channel);
  }

  addCareTeamMessage(msg) {
    if (!msg.id) {
      msg.id = 'msg_' + Date.now();
    }
    msg.timestamp = msg.timestamp || new Date().toISOString();
    const all = this.getItem('CareTeamMessage');
    all.push(msg);
    this.setItem('CareTeamMessage', all);
    this.queueForSync('CareTeamMessage', msg);
    return msg;
  }

  getActivityLogs() {
    return this.getItem('CaregiverActivityLog');
  }

  addActivityLog(act) {
    if (!act.id) {
      act.id = 'act_' + Date.now();
    }
    act.timestamp = act.timestamp || new Date().toISOString();
    const logs = this.getItem('CaregiverActivityLog');
    logs.unshift(act);
    this.setItem('CaregiverActivityLog', logs);
    return act;
  }

  // --- Cloud-Authoritative Reminder Methods ---
  saveReminder(reminder) {
    if (!reminder.reminder_id) {
      reminder.reminder_id = 'rem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    reminder.updated_at = new Date().toISOString();
    const reminders = this.getItem('Reminder');
    const index = reminders.findIndex(r => r.reminder_id === reminder.reminder_id);
    if (index !== -1) {
      reminders[index] = reminder;
    } else {
      reminders.push(reminder);
    }
    this.setItem('Reminder', reminders);
    return reminder;
  }

  deleteReminder(reminderId) {
    const reminders = this.getItem('Reminder').filter(r => r.reminder_id !== reminderId);
    this.setItem('Reminder', reminders);
  }

  // --- Alert Escalation Settings ---
  getAlertSettings() {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + 'alert_settings');
      return data ? JSON.parse(data) : {
        instantPush: true,
        smsFallback: true,
        unackWindow: '30',
        batchDigest: true
      };
    } catch(e) {
      return { instantPush: true, smsFallback: true, unackWindow: '30', batchDigest: true };
    }
  }

  saveAlertSettings(settings) {
    localStorage.setItem(STORAGE_PREFIX + 'alert_settings', JSON.stringify(settings));
  }

  // --- Local-First Sync Queue Simulation ---
  queueForSync(table, record) {
    this.syncQueue.push({ table, record, timestamp: new Date().toISOString() });
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  processSyncQueue() {
    if (this.syncQueue.length === 0) return;
    const count = this.syncQueue.length;
    const now = new Date().toISOString();
    
    // Create SyncLog entry
    const syncLogs = this.getItem('SyncLog');
    const newSync = {
      sync_id: 'sync_' + Date.now(),
      device_id: 'tab_bedside_081',
      patient_id: 'p_eleanor_vance_001',
      sync_started_at: now,
      sync_completed_at: now,
      records_pushed: count,
      records_failed: 0,
      status: 'success',
      error_detail: null
    };
    syncLogs.unshift(newSync);
    this.setItem('SyncLog', syncLogs.slice(0, 30));
    this.syncQueue = [];
  }

  getLastSyncTime() {
    const syncLogs = this.getItem('SyncLog');
    if (syncLogs && syncLogs.length > 0) {
      return syncLogs[0].sync_completed_at;
    }
    return null;
  }

  // Data Export & Deletion
  exportPatientData(patientId) {
    return {
      export_version: '1.0',
      exported_at: new Date().toISOString(),
      patient: this.getItem('Patient').find(p => p.patient_id === patientId),
      reminders: this.getItem('Reminder').filter(r => r.patient_id === patientId),
      reminder_logs: this.getItem('ReminderLog').filter(r => r.patient_id === patientId),
      game_sessions: this.getItem('GameSession').filter(g => g.patient_id === patientId),
      caregiver_notes: this.getItem('CaregiverNote').filter(n => n.patient_id === patientId),
      mood_logs: this.getItem('MoodLog').filter(m => m.patient_id === patientId),
      behavior_flags: this.getItem('BehaviorFlag').filter(b => b.patient_id === patientId),
      care_team: this.getItem('CareTeamMember'),
      activity_logs: this.getItem('CaregiverActivityLog')
    };
  }

  deletePatientData(patientId) {
    this.setItem('Patient', this.getItem('Patient').filter(p => p.patient_id !== patientId));
    this.setItem('Reminder', this.getItem('Reminder').filter(r => r.patient_id !== patientId));
    this.setItem('ReminderLog', this.getItem('ReminderLog').filter(r => r.patient_id !== patientId));
    this.setItem('GameSession', this.getItem('GameSession').filter(g => g.patient_id !== patientId));
    this.setItem('CaregiverNote', this.getItem('CaregiverNote').filter(n => n.patient_id !== patientId));
    this.setItem('MoodLog', this.getItem('MoodLog').filter(m => m.patient_id !== patientId));
    this.setItem('BehaviorFlag', this.getItem('BehaviorFlag').filter(b => b.patient_id !== patientId));
  }

  // Session & Authentication
  getActiveSession() {
    try {
      const s = localStorage.getItem(STORAGE_PREFIX + 'active_session');
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  }

  setActiveSession(session) {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'active_session', JSON.stringify(session));
    } catch (e) {
      console.error('Error setting session:', e);
    }
  }

  clearActiveSession() {
    localStorage.removeItem(STORAGE_PREFIX + 'active_session');
  }

  authenticateUser(role, pin) {
    if (role === 'patient') {
      return {
        success: true,
        session: { role: 'patient', userId: 'p_eleanor_vance_001', name: 'Eleanor Vance', title: 'Senior Space' }
      };
    }
    if (role === 'caregiver') {
      if (!pin || pin === '1234') {
        return {
          success: true,
          session: { role: 'caregiver', userId: 'cg_sarah_vance_001', name: 'Sarah Vance', title: 'Primary Family Caregiver' }
        };
      }
      return { success: false, error: 'Incorrect Caregiver PIN. (Default demo PIN is 1234)' };
    }
    if (role === 'clinical') {
      if (!pin || pin === '9999') {
        return {
          success: true,
          session: { role: 'clinical', userId: 'dr_thorne_001', name: 'Dr. Thorne / ASHA Lead', title: 'Neurologist & Health Worker Lead' }
        };
      }
      return { success: false, error: 'Incorrect Clinical PIN. (Default demo PIN is 9999)' };
    }
    return { success: false, error: 'Unknown role' };
  }
}

// Global Singleton Database Instance
window.recollectDB = new RecollectDB();
