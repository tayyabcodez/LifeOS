export type UrgencyLevel = 'red' | 'yellow' | 'green';

export interface UrgencyInfo {
  level: UrgencyLevel;
  daysLeft: number;
  label: string; // e.g. "Kal due", "3 din baad", "Overdue by 2 days"
  textLabel: string; // Accessible text e.g. "Urgent", "This week", "Later"
  icon: 'alert-triangle' | 'clock' | 'calendar';
}

/**
 * Calculates days remaining from a reference date (default: today) to the due date.
 */
export function calculateDaysUntilDue(
  dueDateStr: string,
  referenceDate: Date = new Date()
): number {
  if (!dueDateStr) return 0;
  const [y, m, d] = dueDateStr.slice(0, 10).split('-').map(Number);
  const dueTime = new Date(y, m - 1, d).getTime();
  const refTime = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  ).getTime();
  const diffMs = dueTime - refTime;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Pure, reusable function to determine urgency level and human labels:
 * - RED: due tomorrow (1 day), today (0 days), or overdue (< 0 days)
 * - YELLOW: due within this week (2–7 days)
 * - GREEN: due later than 7 days (> 7 days)
 */
export function getUrgencyInfo(
  dueDateStr: string,
  referenceDate: Date = new Date()
): UrgencyInfo {
  const daysLeft = calculateDaysUntilDue(dueDateStr, referenceDate);

  if (daysLeft < 0) {
    const overdueCount = Math.abs(daysLeft);
    return {
      level: 'red',
      daysLeft,
      label: `Overdue by ${overdueCount} ${overdueCount === 1 ? 'day' : 'days'}`,
      textLabel: 'Overdue',
      icon: 'alert-triangle',
    };
  }

  if (daysLeft === 0) {
    return {
      level: 'red',
      daysLeft,
      label: 'Aaj due',
      textLabel: 'Due today',
      icon: 'alert-triangle',
    };
  }

  if (daysLeft === 1) {
    return {
      level: 'red',
      daysLeft,
      label: 'Kal due',
      textLabel: 'Due tomorrow',
      icon: 'alert-triangle',
    };
  }

  if (daysLeft <= 7) {
    return {
      level: 'yellow',
      daysLeft,
      label: `${daysLeft} din baad`,
      textLabel: 'This week',
      icon: 'clock',
    };
  }

  return {
    level: 'green',
    daysLeft,
    label: `${daysLeft} din baad`,
    textLabel: 'Later',
    icon: 'calendar',
  };
}
