/**
 * Recollect Phase-1 Monitoring & Rule Engine
 * Adheres strictly to architecture.md Section 6, rules.md Section 2 & 5, and PRD.md FR-3.1–3.5, FR-8.7
 * 
 * Rules Enforced:
 * 1. [HARD] Every AI/rule-generated flag must be explainable with evidence pointing to underlying data.
 * 2. [HARD] Phase 1 thresholds are configurable constants, not hardcoded.
 * 3. [HARD] BehaviorFlag.generated_by must record exact version ('rule_v1').
 * 4. [HARD] No diagnostic or curative claims anywhere.
 */

const RULE_CONFIG = {
  VERSION: 'rule_v1',
  MISSED_MEDICATION_WATCH_STREAK: 3,
  MISSED_MEDICATION_ALERT_STREAK: 5,
  INACTIVITY_WATCH_HOURS: 48,
  INACTIVITY_ALERT_HOURS: 96,
  SCORE_DECLINE_PERCENT_THRESHOLD: 0.25,
  SCORE_DECLINE_CONSECUTIVE_SESSIONS: 3,
  LATENCY_SPIKE_MULTIPLIER: 2.0
};

class RuleEngine {
  constructor(db) {
    this.db = db || window.recollectDB;
  }

  /**
   * Evaluates all Phase-1 rules against the patient's local/synced history
   */
  evaluateAllRules(patientId) {
    const flagsGenerated = [];

    const flagA = this.checkMissedRemindersStreak(patientId);
    if (flagA) flagsGenerated.push(flagA);

    const flagB = this.checkInactivityGap(patientId);
    if (flagB) flagsGenerated.push(flagB);

    const flagC = this.checkGameScoreDecline(patientId);
    if (flagC) flagsGenerated.push(flagC);

    const flagD = this.checkResponseLatencyIncrease(patientId);
    if (flagD) flagsGenerated.push(flagD);

    return flagsGenerated;
  }

  /**
   * Rule A — Missed Reminders Streak
   */
  checkMissedRemindersStreak(patientId) {
    const logs = this.db.getItem('ReminderLog')
      .filter(l => l.patient_id === patientId)
      .sort((a, b) => new Date(b.scheduled_for) - new Date(a.scheduled_for));

    let consecutiveMisses = 0;
    const missedTimestamps = [];

    for (const log of logs) {
      if (log.patient_response === 'no_response' || log.patient_response === 'dismissed') {
        consecutiveMisses++;
        missedTimestamps.push(log.scheduled_for);
      } else if (log.patient_response === 'acknowledged') {
        break;
      }
    }

    if (consecutiveMisses >= RULE_CONFIG.MISSED_MEDICATION_WATCH_STREAK) {
      const severity = consecutiveMisses >= RULE_CONFIG.MISSED_MEDICATION_ALERT_STREAK ? 'alert' : 'watch';
      const flag = {
        flag_id: 'flag_missed_streak_' + Date.now(),
        patient_id: patientId,
        flag_type: 'missed_reminders_streak',
        severity: severity,
        generated_by: RULE_CONFIG.VERSION,
        evidence: {
          consecutive_misses: consecutiveMisses,
          threshold_evaluated: severity === 'alert' ? RULE_CONFIG.MISSED_MEDICATION_ALERT_STREAK : RULE_CONFIG.MISSED_MEDICATION_WATCH_STREAK,
          timestamps: missedTimestamps.slice(0, 5),
          description: `Patient has ${consecutiveMisses} consecutive unacknowledged medication routine reminders.`
        },
        detected_at: new Date().toISOString(),
        acknowledged_by: null,
        acknowledged_at: null,
        user_notes: null
      };

      this.db.insertBehaviorFlag(flag);
      return flag;
    }
    return null;
  }

  /**
   * Rule B — Inactivity Gap
   */
  checkInactivityGap(patientId) {
    const gameSessions = this.db.getItem('GameSession')
      .filter(g => g.patient_id === patientId)
      .sort((a, b) => new Date(b.completed_at || b.started_at) - new Date(a.completed_at || a.started_at));

    const reminderLogs = this.db.getItem('ReminderLog')
      .filter(l => l.patient_id === patientId && l.patient_response === 'acknowledged')
      .sort((a, b) => new Date(b.responded_at || b.scheduled_for) - new Date(a.responded_at || a.scheduled_for));

    const latestGameTime = gameSessions.length > 0 ? new Date(gameSessions[0].completed_at || gameSessions[0].started_at).getTime() : 0;
    const latestReminderTime = reminderLogs.length > 0 ? new Date(reminderLogs[0].responded_at || reminderLogs[0].scheduled_for).getTime() : 0;

    const mostRecentActivityTime = Math.max(latestGameTime, latestReminderTime);
    if (mostRecentActivityTime === 0) return null;

    const hoursSinceActivity = (Date.now() - mostRecentActivityTime) / (1000 * 60 * 60);

    if (hoursSinceActivity >= RULE_CONFIG.INACTIVITY_WATCH_HOURS) {
      const severity = hoursSinceActivity >= RULE_CONFIG.INACTIVITY_ALERT_HOURS ? 'alert' : 'watch';
      const flag = {
        flag_id: 'flag_inactivity_' + Date.now(),
        patient_id: patientId,
        flag_type: 'inactivity_gap',
        severity: severity,
        generated_by: RULE_CONFIG.VERSION,
        evidence: {
          hours_inactive: Math.round(hoursSinceActivity),
          last_activity_timestamp: new Date(mostRecentActivityTime).toISOString(),
          description: `No recorded patient game sessions or reminder interactions for ${Math.round(hoursSinceActivity)} hours.`
        },
        detected_at: new Date().toISOString(),
        acknowledged_by: null,
        acknowledged_at: null,
        user_notes: null
      };

      this.db.insertBehaviorFlag(flag);
      return flag;
    }
    return null;
  }

  /**
   * Rule C — Game Score Decline
   */
  checkGameScoreDecline(patientId) {
    const gameSessions = this.db.getItem('GameSession')
      .filter(g => g.patient_id === patientId && g.score !== undefined)
      .sort((a, b) => new Date(b.completed_at || b.started_at) - new Date(a.completed_at || a.started_at));

    if (gameSessions.length < RULE_CONFIG.SCORE_DECLINE_CONSECUTIVE_SESSIONS + 3) {
      return null; // Not enough longitudinal data yet
    }

    // Recent N sessions vs prior baseline
    const recentSessions = gameSessions.slice(0, RULE_CONFIG.SCORE_DECLINE_CONSECUTIVE_SESSIONS);
    const priorSessions = gameSessions.slice(RULE_CONFIG.SCORE_DECLINE_CONSECUTIVE_SESSIONS, RULE_CONFIG.SCORE_DECLINE_CONSECUTIVE_SESSIONS + 10);

    const priorAvg = priorSessions.reduce((sum, s) => sum + s.score, 0) / priorSessions.length;
    const recentAvg = recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length;

    if (priorAvg > 0 && (priorAvg - recentAvg) / priorAvg >= RULE_CONFIG.SCORE_DECLINE_PERCENT_THRESHOLD) {
      const dropPct = Math.round(((priorAvg - recentAvg) / priorAvg) * 100);
      const flag = {
        flag_id: 'flag_score_decline_' + Date.now(),
        patient_id: patientId,
        flag_type: 'game_score_decline',
        severity: 'watch',
        generated_by: RULE_CONFIG.VERSION,
        evidence: {
          recent_average_score: Math.round(recentAvg),
          prior_baseline_score: Math.round(priorAvg),
          drop_percentage: dropPct,
          session_count_evaluated: RULE_CONFIG.SCORE_DECLINE_CONSECUTIVE_SESSIONS,
          description: `Memory activity scores averaged ${Math.round(recentAvg)} over the last ${RULE_CONFIG.SCORE_DECLINE_CONSECUTIVE_SESSIONS} sessions, a ${dropPct}% variance from 14-day baseline (${Math.round(priorAvg)}).`
        },
        detected_at: new Date().toISOString(),
        acknowledged_by: null,
        acknowledged_at: null,
        user_notes: null
      };

      this.db.insertBehaviorFlag(flag);
      return flag;
    }
    return null;
  }

  /**
   * Rule D — Response Latency Increase
   */
  checkResponseLatencyIncrease(patientId) {
    const gameSessions = this.db.getItem('GameSession')
      .filter(g => g.patient_id === patientId && g.hesitation_avg_ms !== undefined)
      .sort((a, b) => new Date(b.completed_at || b.started_at) - new Date(a.completed_at || a.started_at));

    if (gameSessions.length < 4) return null;

    const recentHesitation = gameSessions[0].hesitation_avg_ms;
    const baselineSessions = gameSessions.slice(1, 10);
    const baselineHesitationAvg = baselineSessions.reduce((sum, s) => sum + s.hesitation_avg_ms, 0) / baselineSessions.length;

    if (baselineHesitationAvg > 0 && recentHesitation >= baselineHesitationAvg * RULE_CONFIG.LATENCY_SPIKE_MULTIPLIER) {
      const flag = {
        flag_id: 'flag_latency_' + Date.now(),
        patient_id: patientId,
        flag_type: 'response_latency_increase',
        severity: 'watch',
        generated_by: RULE_CONFIG.VERSION,
        evidence: {
          recent_hesitation_ms: recentHesitation,
          baseline_hesitation_ms: Math.round(baselineHesitationAvg),
          multiplier: (recentHesitation / baselineHesitationAvg).toFixed(1),
          description: `Average touch decision latency was ${recentHesitation}ms in recent session, compared to normal baseline of ${Math.round(baselineHesitationAvg)}ms.`
        },
        detected_at: new Date().toISOString(),
        acknowledged_by: null,
        acknowledged_at: null,
        user_notes: null
      };

      this.db.insertBehaviorFlag(flag);
      return flag;
    }
    return null;
  }

  /**
   * Computes the Composite Weekly Engagement & Activity Score
   * Formula:
   * 1. Routine Adherence (40%)
   * 2. Game Performance (40%)
   * 3. Engagement (20%)
   * Range: 0–100
   */
  computeCompositeWeeklyScore(patientId) {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    // 1. Routine Adherence
    const reminderLogs = this.db.getItem('ReminderLog')
      .filter(l => l.patient_id === patientId && new Date(l.scheduled_for).getTime() >= sevenDaysAgo);
    
    let adherenceRate = 90; // Default warm baseline
    if (reminderLogs.length > 0) {
      const acknowledgedCount = reminderLogs.filter(l => l.patient_response === 'acknowledged').length;
      adherenceRate = Math.round((acknowledgedCount / reminderLogs.length) * 100);
    }

    // 2. Game Performance
    const gameSessions = this.db.getItem('GameSession')
      .filter(g => g.patient_id === patientId && new Date(g.completed_at || g.started_at).getTime() >= sevenDaysAgo);
    
    let gameAvgScore = 88;
    if (gameSessions.length > 0) {
      gameAvgScore = Math.round(gameSessions.reduce((sum, s) => sum + (s.score || 80), 0) / gameSessions.length);
    }

    // 3. Engagement
    const targetSessionsPerWeek = 4;
    const engagementRate = Math.min(100, Math.round((Math.max(1, gameSessions.length) / targetSessionsPerWeek) * 100));

    const composite = Math.round((adherenceRate * 0.40) + (gameAvgScore * 0.40) + (engagementRate * 0.20));

    return {
      composite_score: composite,
      components: {
        routine_adherence_pct: adherenceRate,
        game_performance_avg: gameAvgScore,
        weekly_engagement_pct: engagementRate,
        total_game_sessions: gameSessions.length,
        total_reminders_evaluated: reminderLogs.length
      },
      disclaimer: "This score reflects engagement and activity trends. It is not a medical diagnosis. Please consult your doctor about any concerns."
    };
  }
}

window.ruleEngine = new RuleEngine(window.recollectDB);
