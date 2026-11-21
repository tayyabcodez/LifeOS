'use client';

import React, { useState, useEffect, useMemo, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAssignmentStore, Assignment } from '@/store/assignmentStore';
import { getUrgencyInfo, UrgencyLevel, calculateDaysUntilDue } from '@/lib/urgency';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

function getTodayISODate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function playCompletionSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    // Satisfying rising 2-tone chime (F5 -> A5)
    osc.frequency.setValueAtTime(698.46, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

export function AssignmentTracker() {
  const prefersReduced = useReducedMotion();
  const assignments = useAssignmentStore((state) => state.assignments);
  const addAssignment = useAssignmentStore((state) => state.addAssignment);
  const toggleComplete = useAssignmentStore((state) => state.toggleComplete);
  const deleteAssignment = useAssignmentStore((state) => state.deleteAssignment);

  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | UrgencyLevel>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDoneExpanded, setIsDoneExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formError, setFormError] = useState('');

  const formTitleId = useId();

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    toggleComplete(id);
    if (!currentlyCompleted) {
      playCompletionSound();
      setToastMessage('+20 XP · Task Done! 🎉');
      setTimeout(() => setToastMessage(null), 2400);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Separate active and completed, sort active by soonest due date first
  const { activeItems, completedItems, counts } = useMemo(() => {
    const active = assignments
      .filter((a) => !a.completed)
      .map((a) => ({
        ...a,
        urgency: getUrgencyInfo(a.dueDate),
      }))
      .sort((a, b) => {
        const daysDiff = a.urgency.daysLeft - b.urgency.daysLeft;
        if (daysDiff !== 0) return daysDiff;
        return a.title.localeCompare(b.title);
      });

    const completed = assignments
      .filter((a) => a.completed)
      .map((a) => ({
        ...a,
        urgency: getUrgencyInfo(a.dueDate),
      }))
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

    const redCount = active.filter((a) => a.urgency.level === 'red').length;
    const yellowCount = active.filter((a) => a.urgency.level === 'yellow').length;
    const greenCount = active.filter((a) => a.urgency.level === 'green').length;

    return {
      activeItems: active,
      completedItems: completed,
      counts: {
        all: active.length,
        red: redCount,
        yellow: yellowCount,
        green: greenCount,
      },
    };
  }, [assignments]);

  const filteredActiveItems = useMemo(() => {
    if (filter === 'all') return activeItems;
    return activeItems.filter((a) => a.urgency.level === filter);
  }, [activeItems, filter]);

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormSubject('');
    // Default due date: tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    setFormDueDate(`${yr}-${mo}-${da}`);
    setFormError('');
    setIsAddOpen(true);
  };

  const handleCloseAdd = () => {
    setIsAddOpen(false);
    setFormError('');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter an assignment title');
      return;
    }
    if (!formDueDate) {
      setFormError('Please select a due date');
      return;
    }

    addAssignment({
      title: formTitle.trim(),
      subject: formSubject.trim() || 'General',
      dueDate: formDueDate,
    });

    handleCloseAdd();
  };

  const handleAddSampleAssignments = () => {
    const today = new Date();
    const addDays = (days: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${yr}-${mo}-${da}`;
    };

    addAssignment({
      title: 'Operating Systems Lab Report',
      subject: 'CS 301',
      dueDate: addDays(1), // Kal due (RED)
    });
    addAssignment({
      title: 'Linear Algebra Problem Set 4',
      subject: 'Math 202',
      dueDate: addDays(4), // This week (YELLOW)
    });
    addAssignment({
      title: 'Economics Essay Draft',
      subject: 'Econ 101',
      dueDate: addDays(12), // Later (GREEN)
    });
  };

  if (!mounted) {
    return (
      <article className="card rv" style={{ '--s': 2.5 } as React.CSSProperties}>
        <div className="card-h">
          <h2 className="lab">Assignment Tracker</h2>
        </div>
        <div className="py-8 text-center text-ink2 opacity-60">
          Loading assignments...
        </div>
      </article>
    );
  }

  // Visual styling token helper
  const getLevelStyle = (level: UrgencyLevel) => {
    switch (level) {
      case 'red':
        return {
          border: '#ef4444',
          dot: '#ef4444',
          bgBadge: 'rgba(239, 68, 68, 0.12)',
          textBadge: '#ef4444',
          borderBadge: 'rgba(239, 68, 68, 0.28)',
          iconSymbol: '⚠️',
        };
      case 'yellow':
        return {
          border: '#f59e0b',
          dot: '#f59e0b',
          bgBadge: 'rgba(245, 158, 11, 0.12)',
          textBadge: '#f59e0b',
          borderBadge: 'rgba(245, 158, 11, 0.28)',
          iconSymbol: '⏳',
        };
      case 'green':
        return {
          border: '#10b981',
          dot: '#10b981',
          bgBadge: 'rgba(16, 185, 129, 0.12)',
          textBadge: '#10b981',
          borderBadge: 'rgba(16, 185, 129, 0.28)',
          iconSymbol: '🗓️',
        };
    }
  };

  return (
    <article
      className="card rv assignment-tracker-card"
      style={{ '--s': 2.5 } as React.CSSProperties}
      aria-labelledby="at-heading"
    >
      {/* Header */}
      <div className="card-h" style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'color-mix(in srgb, var(--focus, #f2a22a) 18%, transparent)',
              color: 'var(--focus, #f2a22a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="lab" id="at-heading" style={{ margin: 0 }}>
              Assignment Tracker
            </h2>
            <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--ink3, #7d8194)' }}>
              Urgency-coded task queue
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleOpenAdd}
            aria-label="Add assignment"
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
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
            <span>Add task</span>
          </button>
        </div>
      </div>

      {/* Floating Celebration Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.9 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '96px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: '#10b981',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              zIndex: 30,
              pointerEvents: 'none',
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Urgency Alert Strip */}
      {counts.red > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 12px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.28)',
            color: '#ef4444',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '13px', animation: prefersReduced ? undefined : 'pulse 1.5s infinite' }}>🚨</span>
          <span>
            <b>Urgent deadline:</b> {counts.red} {counts.red === 1 ? 'task is' : 'tasks are'} overdue or due tomorrow!
          </span>
        </div>
      )}

      {/* Filter Chips */}
      <div
        role="group"
        aria-label="Filter assignments by urgency"
        style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '6px',
        }}
      >
        {/* All */}
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '3px 9px',
            fontSize: '11.5px',
            fontWeight: 600,
            borderRadius: '999px',
            border: filter === 'all' ? '1px solid var(--btn, #161b32)' : '1px solid var(--line, #e8e0cf)',
            background: filter === 'all' ? 'var(--btn, #161b32)' : 'transparent',
            color: filter === 'all' ? 'var(--btnink, #ffffff)' : 'var(--ink2, #51566a)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          All ({counts.all})
        </button>

        {/* Red (Urgent / Overdue) */}
        <button
          type="button"
          onClick={() => setFilter('red')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 9px',
            fontSize: '11.5px',
            fontWeight: 600,
            borderRadius: '999px',
            border: filter === 'red' ? '1px solid #ef4444' : '1px solid var(--line, #e8e0cf)',
            background: filter === 'red' ? 'rgba(239, 68, 68, 0.16)' : 'transparent',
            color: filter === 'red' ? '#ef4444' : 'var(--ink2, #51566a)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
          <span>Red ({counts.red})</span>
        </button>

        {/* Yellow (This week) */}
        <button
          type="button"
          onClick={() => setFilter('yellow')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 9px',
            fontSize: '11.5px',
            fontWeight: 600,
            borderRadius: '999px',
            border: filter === 'yellow' ? '1px solid #f59e0b' : '1px solid var(--line, #e8e0cf)',
            background: filter === 'yellow' ? 'rgba(245, 158, 11, 0.16)' : 'transparent',
            color: filter === 'yellow' ? '#f59e0b' : 'var(--ink2, #51566a)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
          <span>Yellow ({counts.yellow})</span>
        </button>

        {/* Green (Later) */}
        <button
          type="button"
          onClick={() => setFilter('green')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 9px',
            fontSize: '11.5px',
            fontWeight: 600,
            borderRadius: '999px',
            border: filter === 'green' ? '1px solid #10b981' : '1px solid var(--line, #e8e0cf)',
            background: filter === 'green' ? 'rgba(16, 185, 129, 0.16)' : 'transparent',
            color: filter === 'green' ? '#10b981' : 'var(--ink2, #51566a)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          <span>Green ({counts.green})</span>
        </button>
      </div>

      {/* Main List */}
      {activeItems.length === 0 ? (
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
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>🎉</div>
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--ink, #171a2b)' }}>
            Sab clear! 🎉
          </h3>
          <p style={{ margin: '0 auto 12px', maxWidth: '300px', fontSize: '12.5px', color: 'var(--ink2, #51566a)' }}>
            No pending assignments right now. Take a breather or add your next homework task.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleOpenAdd}
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                borderRadius: '8px',
                background: 'var(--btn, #161b32)',
                color: 'var(--btnink, #ffffff)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              + Add assignment
            </button>
            <button
              type="button"
              onClick={handleAddSampleAssignments}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '8px',
                background: 'transparent',
                color: 'var(--ink2, #51566a)',
                border: '1px solid var(--line, #e8e0cf)',
                cursor: 'pointer',
              }}
            >
              Load samples
            </button>
          </div>
        </div>
      ) : filteredActiveItems.length === 0 ? (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            borderRadius: '10px',
            background: 'color-mix(in srgb, var(--sunk, #f3eee2) 30%, transparent)',
            fontSize: '12.5px',
            color: 'var(--ink2, #51566a)',
            margin: '6px 0',
          }}
        >
          No assignments matching this filter.
        </div>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <AnimatePresence initial={false}>
            {filteredActiveItems.map((item) => {
              const styleToken = getLevelStyle(item.urgency.level);
              return (
                <motion.li
                  key={item.id}
                  layout={!prefersReduced}
                  initial={prefersReduced ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={prefersReduced ? { duration: 0 } : { duration: 0.2 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'color-mix(in srgb, var(--sunk, #f3eee2) 45%, transparent)',
                    border: '1px solid var(--line, #e8e0cf)',
                    borderLeft: `4px solid ${styleToken.border}`,
                    position: 'relative',
                  }}
                >
                  {/* Checkbox */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    title="Mark as completed"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggle(item.id, item.completed)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: 'var(--good, #1f9d62)',
                        cursor: 'pointer',
                      }}
                      aria-label={`Mark "${item.title}" as completed`}
                    />
                  </label>

                  {/* Body Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '13.5px',
                          color: 'var(--ink, #171a2b)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                        title={item.title}
                      >
                        {item.title}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '3px',
                        flexWrap: 'wrap',
                        fontSize: '11.5px',
                      }}
                    >
                      {/* Subject tag */}
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'color-mix(in srgb, var(--card, #fff) 80%, transparent)',
                          color: 'var(--ink2, #51566a)',
                          border: '1px solid var(--line, #e8e0cf)',
                          fontWeight: 500,
                        }}
                      >
                        {item.subject}
                      </span>

                      {/* Urgency due label */}
                      <span
                        style={{
                          fontWeight: 600,
                          color: styleToken.textBadge,
                        }}
                      >
                        {item.urgency.label}
                      </span>

                      {/* Accessible non-color indicator */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: styleToken.bgBadge,
                          color: styleToken.textBadge,
                          border: `1px solid ${styleToken.borderBadge}`,
                          fontSize: '10.5px',
                          fontWeight: 600,
                        }}
                        aria-label={`Urgency category: ${item.urgency.textLabel}`}
                      >
                        <span aria-hidden="true">{styleToken.iconSymbol}</span>
                        <span>{item.urgency.textLabel}</span>
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => deleteAssignment(item.id)}
                    aria-label={`Delete assignment ${item.title}`}
                    title="Delete task"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--ink3, #7d8194)',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {/* Collapsed "Done" section */}
      {completedItems.length > 0 && (
        <div style={{ marginTop: '12px', borderTop: '1px solid var(--line, #e8e0cf)', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => setIsDoneExpanded(!isDoneExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink3, #7d8194)',
              cursor: 'pointer',
              padding: '4px 0',
              fontSize: '12px',
              fontWeight: 600,
            }}
            aria-expanded={isDoneExpanded}
          >
            <span>
              Done ({completedItems.length})
            </span>
            <span>{isDoneExpanded ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {isDoneExpanded && (
            <ul
              style={{
                listStyle: 'none',
                margin: '8px 0 0',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <AnimatePresence initial={false}>
                {completedItems.map((item) => (
                  <motion.li
                    key={item.id}
                    layout={!prefersReduced}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'color-mix(in srgb, var(--sunk, #f3eee2) 20%, transparent)',
                      border: '1px solid var(--line, #e8e0cf)',
                      opacity: 0.6,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggle(item.id, item.completed)}
                      style={{
                        width: '15px',
                        height: '15px',
                        accentColor: 'var(--good, #1f9d62)',
                        cursor: 'pointer',
                      }}
                      aria-label={`Unmark "${item.title}"`}
                    />
                    <div style={{ flex: 1, minWidth: 0, textDecoration: 'line-through', fontSize: '12.5px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--ink2, #51566a)' }}>
                        {item.title}
                      </span>{' '}
                      <span style={{ fontSize: '11px', color: 'var(--ink3, #7d8194)' }}>
                        ({item.subject})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAssignment(item.id)}
                      aria-label={`Delete completed assignment ${item.title}`}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--ink3, #7d8194)',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        fontSize: '12px',
                      }}
                    >
                      ✕
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      )}

      {/* Add Assignment Dialog */}
      <AnimatePresence>
        {isAddOpen && (
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
              onClick={handleCloseAdd}
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
              aria-labelledby={formTitleId}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
              animate={prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                borderRadius: '16px',
                background: 'var(--card, #fffdf8)',
                border: '1px solid var(--line, #e8e0cf)',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                padding: '20px',
                color: 'var(--ink, #171a2b)',
                zIndex: 1001,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 id={formTitleId} style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                  Add Assignment
                </h3>
                <button
                  type="button"
                  onClick={handleCloseAdd}
                  aria-label="Close dialog"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--ink2, #51566a)',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '4px',
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
                    fontSize: '12px',
                    fontWeight: 500,
                    marginBottom: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                  }}
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label
                    htmlFor="at-form-title"
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--ink, #171a2b)',
                      marginBottom: '4px',
                    }}
                  >
                    Assignment Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="at-form-title"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Chapter 4 Exercises"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--line, #e8e0cf)',
                      background: 'var(--sunk, #f3eee2)',
                      color: 'var(--ink, #171a2b)',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="at-form-subject"
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--ink, #171a2b)',
                      marginBottom: '4px',
                    }}
                  >
                    Subject
                  </label>
                  <input
                    id="at-form-subject"
                    type="text"
                    placeholder="e.g. Math, History, CS 101"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--line, #e8e0cf)',
                      background: 'var(--sunk, #f3eee2)',
                      color: 'var(--ink, #171a2b)',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="at-form-date"
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--ink, #171a2b)',
                      marginBottom: '4px',
                    }}
                  >
                    Due Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="at-form-date"
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--line, #e8e0cf)',
                      background: 'var(--sunk, #f3eee2)',
                      color: 'var(--ink, #171a2b)',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={handleCloseAdd}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--line, #e8e0cf)',
                      background: 'transparent',
                      color: 'var(--ink2, #51566a)',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '7px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--btn, #161b32)',
                      color: 'var(--btnink, #ffffff)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Save Task
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
