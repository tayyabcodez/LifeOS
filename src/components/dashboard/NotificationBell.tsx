'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useExamStore } from '@/store/examStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getUrgencyInfo } from '@/lib/urgency';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

function calculateDaysLeft(dateStr: string): number {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const examDay = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffMs = examDay - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function NotificationBell() {
  const prefersReduced = useReducedMotion();
  const exams = useExamStore((state) => state.exams);
  const assignments = useAssignmentStore((state) => state.assignments);
  const toggleComplete = useAssignmentStore((state) => state.toggleComplete);

  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const bellRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('lifeos.readNotifications');
      if (saved) setReadIds(JSON.parse(saved));
    } catch {}
  }, []);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Aggregate alerts
  const notifications = React.useMemo(() => {
    const list: Array<{
      id: string;
      type: 'urgent-exam' | 'urgent-assignment' | 'study-target' | 'celebration';
      title: string;
      desc: string;
      badge: string;
      urgency: 'high' | 'med' | 'good';
      actionLabel?: string;
      assignmentId?: string;
    }> = [];

    // 1. Check assignments
    assignments.forEach((asn) => {
      if (!asn.completed) {
        const info = getUrgencyInfo(asn.dueDate);
        if (info.daysLeft < 0) {
          list.push({
            id: `notif-overdue-${asn.id}`,
            type: 'urgent-assignment',
            title: `Overdue: ${asn.title}`,
            desc: `${asn.subject} was due ${Math.abs(info.daysLeft)} days ago! Complete it now to catch up.`,
            badge: 'Action Required',
            urgency: 'high',
            actionLabel: 'Mark Done',
            assignmentId: asn.id,
          });
        } else if (info.daysLeft === 0) {
          list.push({
            id: `notif-today-${asn.id}`,
            type: 'urgent-assignment',
            title: `Due Today: ${asn.title}`,
            desc: `Submit your ${asn.subject} assignment today before midnight!`,
            badge: 'Due Today',
            urgency: 'high',
            actionLabel: 'Mark Done',
            assignmentId: asn.id,
          });
        } else if (info.daysLeft === 1) {
          list.push({
            id: `notif-tomorrow-${asn.id}`,
            type: 'urgent-assignment',
            title: `Kal Due: ${asn.title}`,
            desc: `${asn.subject} is due tomorrow! Finish it early to sleep peacefully.`,
            badge: 'Kal Due',
            urgency: 'high',
            actionLabel: 'Mark Done',
            assignmentId: asn.id,
          });
        } else if (info.daysLeft <= 3) {
          list.push({
            id: `notif-soon-${asn.id}`,
            type: 'urgent-assignment',
            title: `${asn.title} due in ${info.daysLeft} days`,
            desc: `${asn.subject} deadline is approaching this week.`,
            badge: 'This Week',
            urgency: 'med',
            actionLabel: 'Mark Done',
            assignmentId: asn.id,
          });
        }
      }
    });

    // 2. Check exams
    const activeExams = exams
      .map((e) => ({ ...e, daysLeft: calculateDaysLeft(e.date) }))
      .filter((e) => e.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    if (activeExams.length > 0) {
      const nearest = activeExams[0];
      if (nearest.daysLeft === 0) {
        list.push({
          id: `notif-exam-today-${nearest.id}`,
          type: 'urgent-exam',
          title: `Exam Today: ${nearest.subject}!`,
          desc: `Final sprint! All the best, stay calm and review key cheat sheets.`,
          badge: 'Exam Day',
          urgency: 'high',
        });
      } else if (nearest.daysLeft <= 4) {
        const rawDaily = nearest.targetHoursTotal / nearestExamDailyDivisor(nearest.daysLeft);
        const dailyTarget = Math.round(rawDaily * 2) / 2 || 0.5;
        list.push({
          id: `notif-exam-near-${nearest.id}`,
          type: 'study-target',
          title: `Study Target: Aaj ${dailyTarget} hrs padho`,
          desc: `${nearest.subject} exam is in ${nearest.daysLeft} days. Staying consistent today avoids last-minute cramming!`,
          badge: `In ${nearest.daysLeft}d`,
          urgency: nearest.daysLeft <= 2 ? 'high' : 'med',
        });
      }
    }

    // 3. Completed celebration if assignments were done
    const completedCount = assignments.filter((a) => a.completed).length;
    if (completedCount > 0 && list.length === 0) {
      list.push({
        id: 'notif-all-caught-up',
        type: 'celebration',
        title: `Sab clear! All caught up 🎉`,
        desc: `You have completed ${completedCount} assignments and your study schedule is on track. Excellent momentum!`,
        badge: 'Ahead of Pace',
        urgency: 'good',
      });
    }

    return list;
  }, [assignments, exams]);

  function nearestExamDailyDivisor(days: number) {
    return days <= 0 ? 1 : days;
  }

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;
  const hasHighUrgency = notifications.some((n) => n.urgency === 'high');

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem('lifeos.readNotifications', JSON.stringify(allIds));
    } catch {}
  };

  const handleQuickComplete = (assignmentId?: string) => {
    if (assignmentId) {
      toggleComplete(assignmentId);
    }
  };

  if (!mounted) {
    return (
      <button
        className="icon-btn"
        aria-label="Notifications"
        style={{ position: 'relative' }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      </button>
    );
  }

  return (
    <div ref={bellRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell Button */}
      <button
        type="button"
        className="icon-btn"
        aria-label={`Notifications: ${unreadCount} new alerts`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            handleMarkAllRead();
          }
        }}
        style={{
          position: 'relative',
          cursor: 'pointer',
          background: isOpen ? 'var(--sunk, #f3eee2)' : undefined,
        }}
        title="Alerts &amp; Notifications"
      >
        {/* Animated Bell Icon */}
        <motion.div
          animate={
            hasHighUrgency && !prefersReduced
              ? { rotate: [0, -10, 10, -10, 8, -4, 0] }
              : { rotate: 0 }
          }
          transition={{
            repeat: hasHighUrgency ? Infinity : 0,
            repeatDelay: 4,
            duration: 0.6,
          }}
          style={{ display: 'grid', placeItems: 'center' }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </motion.div>

        {/* Badge Indicator */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              minWidth: '16px',
              height: '16px',
              borderRadius: '999px',
              background: hasHighUrgency ? '#ef4444' : '#f59e0b',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: hasHighUrgency
                ? '0 0 0 2px var(--card, #fff), 0 0 8px rgba(239, 68, 68, 0.6)'
                : '0 0 0 2px var(--card, #fff)',
              animation: hasHighUrgency && !prefersReduced ? 'pulse 2s infinite' : undefined,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={popoverId}
            role="dialog"
            aria-label="Alerts and Notifications"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -4 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '320px',
              maxWidth: '90vw',
              borderRadius: '16px',
              background: 'var(--card, #fffdf8)',
              border: '1px solid var(--line, #e8e0cf)',
              boxShadow: '0 16px 36px -10px rgba(0,0,0,0.25)',
              zIndex: 1000,
              overflow: 'hidden',
              color: 'var(--ink, #171a2b)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderBottom: '1px solid var(--line, #e8e0cf)',
                background: 'color-mix(in srgb, var(--sunk, #f3eee2) 40%, transparent)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🔔</span>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>
                  Smart Study Alerts
                </span>
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink3, #7d8194)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 4px',
                  }}
                >
                  Mark read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div
              style={{
                maxHeight: '340px',
                overflowY: 'auto',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>✨</div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--ink, #171a2b)' }}>
                    No alerts pending
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--ink2, #51566a)' }}>
                    Add exams or assignments to get automated study warnings &amp; pace alerts.
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const isHigh = item.urgency === 'high';
                  const isGood = item.urgency === 'good';
                  const borderCol = isHigh
                    ? '#ef4444'
                    : isGood
                    ? '#10b981'
                    : '#f59e0b';
                  const badgeBg = isHigh
                    ? 'rgba(239, 68, 68, 0.12)'
                    : isGood
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(245, 158, 11, 0.12)';
                  const badgeText = isHigh
                    ? '#ef4444'
                    : isGood
                    ? '#10b981'
                    : '#f59e0b';

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'color-mix(in srgb, var(--sunk, #f3eee2) 35%, transparent)',
                        border: '1px solid var(--line, #e8e0cf)',
                        borderLeft: `4px solid ${borderCol}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '12.5px',
                            color: 'var(--ink, #171a2b)',
                          }}
                        >
                          {item.title}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: badgeBg,
                            color: badgeText,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.badge}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '11.5px',
                          color: 'var(--ink2, #51566a)',
                          lineHeight: 1.35,
                        }}
                      >
                        {item.desc}
                      </p>

                      {item.actionLabel && item.assignmentId && (
                        <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleQuickComplete(item.assignmentId)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: 'var(--btn, #161b32)',
                              color: 'var(--btnink, #ffffff)',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            ✓ {item.actionLabel}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
