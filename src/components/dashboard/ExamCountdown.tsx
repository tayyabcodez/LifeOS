'use client';

import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useExamStore, Exam } from '@/store/examStore';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

function calculateDaysLeft(dateStr: string): number {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const examDay = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffMs = examDay - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function formatExamDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTodayISODate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type UrgencyLevel = 'urgent' | 'moderate' | 'relaxed';

function getUrgencyLevel(daysLeft: number): UrgencyLevel {
  if (daysLeft < 7) return 'urgent';
  if (daysLeft <= 14) return 'moderate';
  return 'relaxed';
}

export function ExamCountdown() {
  const prefersReduced = useReducedMotion();
  const exams = useExamStore((state) => state.exams);
  const addExam = useExamStore((state) => state.addExam);
  const removeExam = useExamStore((state) => state.removeExam);

  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPastExams, setShowPastExams] = useState(false);

  // Form states
  const [formSubject, setFormSubject] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formHours, setFormHours] = useState('15');
  const [formError, setFormError] = useState('');

  const modalTitleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation for modal
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Group and sort exams
  const { nearestExam, otherUpcomingExams, pastExams } = React.useMemo(() => {
    if (!exams || exams.length === 0) {
      return { nearestExam: null, otherUpcomingExams: [], pastExams: [] };
    }

    const calculated = exams.map((exam) => ({
      ...exam,
      daysLeft: calculateDaysLeft(exam.date),
    }));

    const upcoming = calculated
      .filter((e) => e.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const past = calculated
      .filter((e) => e.daysLeft < 0)
      .sort((a, b) => b.daysLeft - a.daysLeft);

    return {
      nearestExam: upcoming[0] || null,
      otherUpcomingExams: upcoming.slice(1),
      pastExams: past,
    };
  }, [exams]);

  const handleOpenModal = () => {
    setFormSubject('');
    // Default date: 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    setFormDate(`${yr}-${mo}-${da}`);
    setFormHours('15');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const handleSubmitExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) {
      setFormError('Please enter a subject name');
      return;
    }
    if (!formDate) {
      setFormError('Please choose an exam date');
      return;
    }
    const hoursNum = parseFloat(formHours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setFormError('Target hours must be greater than 0');
      return;
    }

    addExam({
      subject: formSubject.trim(),
      date: formDate,
      targetHoursTotal: Math.round(hoursNum * 10) / 10,
    });

    setIsModalOpen(false);
  };

  const handleAddSampleExam = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    addExam({
      subject: 'Computer Networks',
      date: `${yr}-${mo}-${da}`,
      targetHoursTotal: 10,
    });
  };

  if (!mounted) {
    return (
      <article className="card rv" style={{ '--s': 2.5 } as React.CSSProperties}>
        <div className="card-h">
          <h2 className="lab">Exam Countdown</h2>
        </div>
        <div className="py-8 text-center text-ink2 opacity-60">
          Loading exam schedule...
        </div>
      </article>
    );
  }

  // Target calculation for nearest upcoming exam
  let dailyTargetHours = 0;
  let isExamToday = false;
  let urgency: UrgencyLevel = 'relaxed';

  if (nearestExam) {
    if (nearestExam.daysLeft === 0) {
      isExamToday = true;
      dailyTargetHours = nearestExam.targetHoursTotal;
      urgency = 'urgent';
    } else {
      // remaining target hours ÷ days left (rounded to 0.5h)
      const rawTarget = nearestExam.targetHoursTotal / nearestExam.daysLeft;
      dailyTargetHours = Math.round(rawTarget * 2) / 2;
      if (dailyTargetHours === 0 && nearestExam.targetHoursTotal > 0) {
        dailyTargetHours = 0.5;
      }
      urgency = getUrgencyLevel(nearestExam.daysLeft);
    }
  }

  // Urgency styling tokens
  const urgencyStyles = {
    urgent: {
      badgeBg: 'rgba(239, 68, 68, 0.12)',
      badgeText: '#ef4444',
      badgeBorder: 'rgba(239, 68, 68, 0.3)',
      ringColor: '#ef4444',
      cardBorder: 'rgba(239, 68, 68, 0.28)',
      targetBg: 'rgba(239, 68, 68, 0.06)',
      tagLabel: 'High Urgency',
    },
    moderate: {
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeText: '#f59e0b',
      badgeBorder: 'rgba(245, 158, 11, 0.3)',
      ringColor: '#f59e0b',
      cardBorder: 'rgba(245, 158, 11, 0.28)',
      targetBg: 'rgba(245, 158, 11, 0.06)',
      tagLabel: 'Moderate',
    },
    relaxed: {
      badgeBg: 'rgba(99, 102, 241, 0.12)',
      badgeText: '#6366f1',
      badgeBorder: 'rgba(99, 102, 241, 0.3)',
      ringColor: '#6366f1',
      cardBorder: 'var(--line)',
      targetBg: 'rgba(99, 102, 241, 0.05)',
      tagLabel: 'On Track',
    },
  }[urgency];

  // SVG Progress Ring calculations
  // Circle radius 28 -> Circumference = 2 * PI * 28 ≈ 175.93
  const ringRadius = 28;
  const circumference = 2 * Math.PI * ringRadius;
  // Progress urgency: closer to 0 days = fuller ring (from 10% min to 100%)
  const progressRatio = nearestExam
    ? nearestExam.daysLeft === 0
      ? 1
      : Math.max(0.12, Math.min(1, (30 - Math.min(30, nearestExam.daysLeft)) / 30))
    : 0;
  const strokeOffset = circumference - progressRatio * circumference;

  return (
    <article
      className="card rv exam-countdown-card"
      style={{
        '--s': 2.5,
        border: nearestExam && urgency !== 'relaxed' ? `1px solid ${urgencyStyles.cardBorder}` : undefined,
      } as React.CSSProperties}
      aria-labelledby="ec-heading"
    >
      {/* Header */}
      <div className="card-h" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'color-mix(in srgb, var(--study, #6b8cff) 18%, transparent)',
              color: 'var(--study, #6b8cff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
          </div>
          <div>
            <h2 className="lab" id="ec-heading" style={{ margin: 0 }}>
              Exam Countdown
            </h2>
            <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--ink3, #7d8194)' }}>
              Nearest milestone &amp; daily study pace
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {nearestExam && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                background: urgencyStyles.badgeBg,
                color: urgencyStyles.badgeText,
                border: `1px solid ${urgencyStyles.badgeBorder}`,
              }}
            >
              <i
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: urgencyStyles.badgeText,
                }}
              />
              {isExamToday ? 'Exam Day!' : `${urgencyStyles.tagLabel} · ${nearestExam.daysLeft}d left`}
            </span>
          )}

          <button
            type="button"
            onClick={handleOpenModal}
            aria-label="Add upcoming exam"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 11px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '999px',
              background: 'var(--btn, #161b32)',
              color: 'var(--btnink, #ffffff)',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.15s, opacity 0.15s',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
            <span>Add exam</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!nearestExam ? (
        /* Empty State */
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px dashed var(--line, #e8e0cf)',
            background: 'color-mix(in srgb, var(--sunk, #f3eee2) 40%, transparent)',
            margin: '6px 0',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              margin: '0 auto 10px',
              background: 'color-mix(in srgb, var(--study, #6b8cff) 15%, transparent)',
              color: 'var(--study, #6b8cff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: 'var(--ink, #171a2b)' }}>
            No upcoming exams scheduled
          </h3>
          <p style={{ margin: '0 auto 14px', maxWidth: '340px', fontSize: '13px', color: 'var(--ink2, #51566a)' }}>
            Add your next test or final exam to calculate your daily study target and stay exam-ready without stress.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleOpenModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                background: 'var(--btn, #161b32)',
                color: 'var(--btnink, #ffffff)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              + Add your first exam
            </button>
            <button
              type="button"
              onClick={handleAddSampleExam}
              style={{
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 500,
                borderRadius: '8px',
                background: 'transparent',
                color: 'var(--ink2, #51566a)',
                border: '1px solid var(--line, #e8e0cf)',
                cursor: 'pointer',
              }}
            >
              Try sample exam
            </button>
          </div>
        </div>
      ) : (
        /* Nearest Upcoming Exam Spotlight */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Urgency Alert or Pacing Banner */}
          {nearestExam.daysLeft <= 4 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.28)',
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '14px', animation: prefersReduced ? undefined : 'pulse 1.5s infinite' }}>🚨</span>
              <span>
                <b>Time is running short!</b> Only {nearestExam.daysLeft} {nearestExam.daysLeft === 1 ? 'day' : 'days'} left for {nearestExam.subject}. Complete your {dailyTargetHours}h target today!
              </span>
            </div>
          ) : nearestExam.daysLeft > 14 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '14px' }}>✨</span>
              <span>
                <b>Pacing comfortably!</b> {nearestExam.daysLeft} days runway. A steady {dailyTargetHours}h/day makes exams easy!
              </span>
            </div>
          ) : null}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px',
              alignItems: 'stretch',
            }}
          >
            {/* Left box: Nearest Exam Info & Progress Ring */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'color-mix(in srgb, var(--sunk, #f3eee2) 50%, transparent)',
                border: '1px solid var(--line, #e8e0cf)',
                position: 'relative',
              }}
            >
              {/* Progress Ring with Days Left */}
              <div
                style={{
                  position: 'relative',
                  width: '68px',
                  height: '68px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="68"
                  height="68"
                  viewBox="0 0 68 68"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  aria-hidden="true"
                >
                  {/* Track circle */}
                  <circle
                    cx="34"
                    cy="34"
                    r={ringRadius}
                    fill="none"
                    stroke="var(--line, #e8e0cf)"
                    strokeWidth="4"
                    opacity={0.6}
                  />
                  {/* Animated urgency ring */}
                  <motion.circle
                    cx="34"
                    cy="34"
                    r={ringRadius}
                    fill="none"
                    stroke={urgencyStyles.ringColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{
                      strokeDashoffset: prefersReduced ? strokeOffset : circumference,
                    }}
                    animate={{ strokeDashoffset: strokeOffset }}
                    transition={
                      prefersReduced
                        ? { duration: 0 }
                        : { duration: 0.9, ease: 'easeOut' }
                    }
                  />
                </svg>

                {/* Number inside ring */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--ink, #171a2b)',
                      fontFamily: 'var(--sans)',
                    }}
                  >
                    <AnimatedNumber value={nearestExam.daysLeft} />
                  </span>
                  <span
                    style={{
                      fontSize: '8.5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--ink3, #7d8194)',
                      letterSpacing: '0.04em',
                      marginTop: '2px',
                    }}
                  >
                    {nearestExam.daysLeft === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>

              {/* Exam details text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink3, #7d8194)', fontWeight: 600 }}>
                    Target Exam
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExam(nearestExam.id)}
                    aria-label={`Remove exam ${nearestExam.subject}`}
                    title="Remove this exam"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--ink3, #7d8194)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      lineHeight: 1,
                      padding: '2px 4px',
                      borderRadius: '4px',
                    }}
                  >
                    ✕
                  </button>
                </div>
                <h3
                  style={{
                    margin: '2px 0 3px',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: 'var(--ink, #171a2b)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={nearestExam.subject}
                >
                  {nearestExam.subject}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ink2, #51566a)' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{formatExamDate(nearestExam.date)}</span>
                  <span>·</span>
                  <span>{nearestExam.targetHoursTotal}h prep goal</span>
                </div>
              </div>
            </div>

            {/* Right box: Prominent "Today's Study Target" */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '14px 18px',
                borderRadius: '12px',
                background: urgencyStyles.targetBg,
                border: `1px solid ${urgencyStyles.badgeBorder}`,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                    color: urgencyStyles.badgeText,
                  }}
                >
                  {isExamToday ? 'Today is the Day!' : "Today's Study Target"}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--ink3, #7d8194)',
                    fontWeight: 500,
                  }}
                >
                  {isExamToday ? 'Final sprint' : `${nearestExam.targetHoursTotal}h ÷ ${nearestExam.daysLeft}d`}
                </span>
              </div>

              {/* Prominent Target Headline */}
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--ink, #171a2b)',
                  margin: '2px 0 4px',
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--sans)',
                }}
              >
                {isExamToday ? (
                  <span style={{ color: urgencyStyles.badgeText }}>Aaj hai exam! 🎉</span>
                ) : (
                  <span>
                    Aaj <span style={{ color: urgencyStyles.badgeText }}>{dailyTargetHours} hrs</span> padho
                  </span>
                )}
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: 'var(--ink2, #51566a)',
                  lineHeight: 1.4,
                }}
              >
                {isExamToday
                  ? 'All the best! Review key summary sheets, stay hydrated, and trust your preparation.'
                  : `Focus on high-yield topics to stay on track for ${nearestExam.subject}.`}
              </p>
            </div>
          </div>

          {/* Other upcoming exams (if any) */}
          {otherUpcomingExams.length > 0 && (
            <div
              style={{
                marginTop: '4px',
                paddingTop: '10px',
                borderTop: '1px solid var(--line, #e8e0cf)',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--ink3, #7d8194)',
                  marginBottom: '8px',
                }}
              >
                Other upcoming exams ({otherUpcomingExams.length})
              </span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '8px',
                }}
              >
                {otherUpcomingExams.map((exam) => {
                  const examUrgency = getUrgencyLevel(exam.daysLeft);
                  const examTarget =
                    exam.daysLeft > 0
                      ? Math.round((exam.targetHoursTotal / exam.daysLeft) * 2) / 2 || 0.5
                      : exam.targetHoursTotal;
                  return (
                    <div
                      key={exam.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'color-mix(in srgb, var(--sunk, #f3eee2) 30%, transparent)',
                        border: '1px solid var(--line, #e8e0cf)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, marginRight: '8px' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: 'var(--ink, #171a2b)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={exam.subject}
                        >
                          {exam.subject}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--ink3, #7d8194)' }}>
                          {formatExamDate(exam.date)} · {exam.daysLeft}d left · {examTarget}h/day
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExam(exam.id)}
                        aria-label={`Remove exam ${exam.subject}`}
                        title="Remove exam"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--ink3, #7d8194)',
                          cursor: 'pointer',
                          padding: '4px',
                          fontSize: '12px',
                          lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past / Completed exams toggle */}
          {pastExams.length > 0 && (
            <div style={{ fontSize: '11.5px', color: 'var(--ink3, #7d8194)' }}>
              <button
                type="button"
                onClick={() => setShowPastExams(!showPastExams)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink3, #7d8194)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '11.5px',
                  textDecoration: 'underline',
                }}
              >
                {showPastExams ? 'Hide' : 'Show'} past exams ({pastExams.length})
              </button>
              {showPastExams && (
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {pastExams.map((exam) => (
                    <div
                      key={exam.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'color-mix(in srgb, var(--sunk, #f3eee2) 20%, transparent)',
                        opacity: 0.65,
                      }}
                    >
                      <span>
                        <s style={{ textDecoration: 'line-through' }}>{exam.subject}</s> ({formatExamDate(exam.date)}) - Passed
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExam(exam.id)}
                        aria-label={`Delete past exam ${exam.subject}`}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: 'var(--ink3, #7d8194)',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Exam Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleCloseModal}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(10, 12, 18, 0.55)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
              aria-hidden="true"
            />

            {/* Modal Card */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={modalTitleId}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
              animate={prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '420px',
                borderRadius: '16px',
                background: 'var(--card, #fffdf8)',
                border: '1px solid var(--line, #e8e0cf)',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                padding: '20px',
                color: 'var(--ink, #171a2b)',
                zIndex: 1001,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'color-mix(in srgb, var(--study, #6b8cff) 20%, transparent)',
                      color: 'var(--study, #6b8cff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h3 id={modalTitleId} style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>
                    Add Upcoming Exam
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Close modal"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--ink2, #51566a)',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                  }}
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#ef4444',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    marginBottom: '14px',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                  }}
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitExam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Subject Name */}
                <div>
                  <label
                    htmlFor="form-subject"
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: 'var(--ink, #171a2b)',
                      marginBottom: '4px',
                    }}
                  >
                    Subject Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="form-subject"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Operating Systems, Calculus"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--line, #e8e0cf)',
                      background: 'var(--sunk, #f3eee2)',
                      color: 'var(--ink, #171a2b)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Exam Date */}
                <div>
                  <label
                    htmlFor="form-date"
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: 'var(--ink, #171a2b)',
                      marginBottom: '4px',
                    }}
                  >
                    Exam Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="form-date"
                    type="date"
                    required
                    min={getTodayISODate()}
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--line, #e8e0cf)',
                      background: 'var(--sunk, #f3eee2)',
                      color: 'var(--ink, #171a2b)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Total Target Hours */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label
                      htmlFor="form-hours"
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: 'var(--ink, #171a2b)',
                      }}
                    >
                      Total Target Study Hours
                    </label>
                    <span style={{ fontSize: '11.5px', color: 'var(--ink3, #7d8194)' }}>
                      Total prep needed
                    </span>
                  </div>
                  <input
                    id="form-hours"
                    type="number"
                    min="1"
                    max="300"
                    step="0.5"
                    required
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--line, #e8e0cf)',
                      background: 'var(--sunk, #f3eee2)',
                      color: 'var(--ink, #171a2b)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--line, #e8e0cf)',
                      background: 'transparent',
                      color: 'var(--ink2, #51566a)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--btn, #161b32)',
                      color: 'var(--btnink, #ffffff)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Save Exam
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </article>
  );
}
