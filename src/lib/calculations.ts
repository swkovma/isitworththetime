// Shared calculation constants, types, and functions
// Used by both Astro frontmatter (build-time) and client-side script (runtime)

// 8 hours per day * 250 work days per year
export const WORK_HOURS_PER_YEAR = 8 * 250;
export const WORK_DAYS_PER_YEAR = 250;

// Type definitions
export interface FrequencyItem {
  label: string;
  multiplier: number;
}

export interface TimeSavingItem {
  label: string;
  seconds: number;
}

// Columns: frequency (how often you do the task)
// Multipliers based on 250 working days per year (Mon-Fri with 2 weeks holiday)
export const frequencies: FrequencyItem[] = [
  { label: '50/day', multiplier: 50 * 250 },
  { label: '5/day', multiplier: 5 * 250 },
  { label: 'Daily', multiplier: 250 },
  { label: 'Weekly', multiplier: 50 },
  { label: 'Monthly', multiplier: 12 },
  { label: 'Yearly', multiplier: 1 },
];

// Rows: time saved per occurrence
export const timeSavings: TimeSavingItem[] = [
  { label: '1 second', seconds: 1 },
  { label: '5 seconds', seconds: 5 },
  { label: '30 seconds', seconds: 30 },
  { label: '1 minute', seconds: 60 },
  { label: '5 minutes', seconds: 5 * 60 },
  { label: '30 minutes', seconds: 30 * 60 },
  { label: '1 hour', seconds: 60 * 60 },
  { label: '4 hours', seconds: 4 * 60 * 60 },
  { label: '1 day', seconds: 8 * 60 * 60 },  // assuming 8 working hours in a day
];

/**
 * Calculate the monetary value of time saved.
 */
export function calculateCellValue(
  salary: number,
  freqMultiplier: number,
  timeSeconds: number,
  period: 'annual' | 'monthly'
): number {
  const hourlyRate = salary / WORK_HOURS_PER_YEAR;
  const rawSecondsPerYear = freqMultiplier * timeSeconds;
  const totalHoursPerYear = rawSecondsPerYear / 3600;
  const annualValue = hourlyRate * totalHoursPerYear;
  const periodDivisor = period === 'monthly' ? 12 : 1;
  return annualValue / periodDivisor;
}

/**
 * Calculate time saved in seconds.
 */
export function calculateTimeValue(
  freqMultiplier: number,
  timeSeconds: number,
  period: 'annual' | 'monthly'
): number {
  const rawSecondsPerYear = freqMultiplier * timeSeconds;
  const periodDivisor = period === 'monthly' ? 12 : 1;
  return rawSecondsPerYear / periodDivisor;
}

/**
 * Format a monetary value for display with currency symbol.
 */
export function formatCurrency(value: number, symbol: string = '$'): string {
  if (value >= 1_000_000_000) {
    return symbol + Math.round(value / 1_000_000_000) + 'B';
  }
  if (value >= 10_000_000) {
    return symbol + Math.round(value / 1_000_000) + 'M';
  }
  if (value >= 1_000_000) {
    return symbol + (value / 1_000_000).toFixed(0).replace(/\.0$/, '') + 'M';
  }
  if (value >= 10_000) {
    return symbol + Math.round(value / 1000) + 'k';
  }
  if (value >= 1_000) {
    return symbol + (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  if (value >= 1) {
    return symbol + Math.round(value);
  }
  if (value >= 0.1) {
    return symbol + value.toFixed(2);
  }
  return symbol + '0';
}

/**
 * Format seconds as human-readable time duration with aggressive rounding.
 * We assume an 8-hour workday and 250 workdays per year.
 */
export function formatTime(totalSeconds: number): string {
  if (totalSeconds < 1) {
    return '<1s';
  }

  // Careful to use 250 work days, 8 hours per day
  const SECONDS_PER_MINUTE = 60;
  const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
  const SECONDS_PER_DAY = 8 * SECONDS_PER_HOUR;  // 8 hours per day
  const SECONDS_PER_WEEK = 5 * SECONDS_PER_DAY;  // 5 working days per week
  const SECONDS_PER_YEAR = 250 * SECONDS_PER_DAY;  // 250 working days per year

  // Years (250 work days)
  if (totalSeconds >= SECONDS_PER_YEAR * 0.75) {
    const years = Math.round(totalSeconds / SECONDS_PER_YEAR);
    return `${years}y`;
  }

  // Weeks (round to nearest week when >= 4 days)
  if (totalSeconds >= SECONDS_PER_DAY * 4) {
    const weeks = Math.round(totalSeconds / SECONDS_PER_WEEK);
    return `${weeks}w`;
  }

  // Days (round to nearest day when >= 1.5 days)
  if (totalSeconds >= SECONDS_PER_DAY * 1.5) {
    const days = Math.round(totalSeconds / SECONDS_PER_DAY);
    return `${days}d`;
  }

  // 1 day threshold
  if (totalSeconds >= SECONDS_PER_DAY * 0.75) {
    return '1d';
  }

  // Hours (round to nearest hour when >= 2 hours)
  if (totalSeconds >= SECONDS_PER_HOUR * 2) {
    const hours = Math.round(totalSeconds / SECONDS_PER_HOUR);
    return `${hours}h`;
  }

  // 1 hour threshold
  if (totalSeconds >= SECONDS_PER_HOUR * 0.75) {
    return '1h';
  }

  // Minutes (round to nearest minute when >= 2 minutes)
  if (totalSeconds >= SECONDS_PER_MINUTE * 2) {
    const minutes = Math.round(totalSeconds / SECONDS_PER_MINUTE);
    return `${minutes}m`;
  }

  // 1 minute threshold
  if (totalSeconds >= SECONDS_PER_MINUTE * 0.75) {
    return '1m';
  }

  // Seconds
  return `${Math.round(totalSeconds)}s`;
}

/**
 * Get the color tier based on monetary value magnitude relative to salary.
 */
export function getCurrencyTier(value: number, salary: number): string {
  // normalise the tier levels to 100k
  const ratio = 100000 * (value / salary);
  if (ratio < 10) return 'tier-1';
  if (ratio < 100) return 'tier-2';
  if (ratio < 1000) return 'tier-3';
  if (ratio < 10000) return 'tier-4';
  return 'tier-5';
}

/**
 * Get the color tier based on time value.
 * s=grey, m=green, h=blue, d=purple, w/y=red
 */
export function getTimeTier(displaySeconds: number): string {
  const SECONDS_PER_MINUTE = 60;
  const SECONDS_PER_HOUR = 3600;
  const SECONDS_PER_DAY = 28800;

  if (displaySeconds < SECONDS_PER_MINUTE * 0.75) {
    return 'tier-1'; // seconds - grey
  } else if (displaySeconds < SECONDS_PER_HOUR * 0.75) {
    return 'tier-2'; // minutes - green
  } else if (displaySeconds < SECONDS_PER_DAY * 0.75) {
    return 'tier-3'; // hours - blue
  } else if (displaySeconds < SECONDS_PER_DAY * 4) {
    return 'tier-4'; // days - purple
  }
  return 'tier-5'; // weeks/years - red
}

/**
 * Get opacity for currency values. Fades very high and very low values.
 */
export function getCurrencyOpacity(value: number, salary: number): number {
  // Fade high values
  const HIGH_FADE_START = salary * 0.05;
  const HIGH_FADE_END = salary * 2.00;
  const highRaw = 1 - (Math.log(value) - Math.log(HIGH_FADE_START)) / (Math.log(HIGH_FADE_END) - Math.log(HIGH_FADE_START));
  const highOpacity = Math.min(1, Math.max(0.2, highRaw));

  // Fade low values (below $5, fading to min at $1)
  const LOW_FADE_START = 5;
  const LOW_FADE_END = 1;
  let lowOpacity = 1;
  if (value < LOW_FADE_START) {
    const lowRaw = (value - LOW_FADE_END) / (LOW_FADE_START - LOW_FADE_END);
    lowOpacity = Math.min(1, Math.max(0.2, lowRaw));
  }

  return Math.min(highOpacity, lowOpacity);
}

/**
 * Get opacity for time values. Fades very high and very low values.
 */
export function getTimeOpacity(seconds: number): number {
  const SECONDS_PER_DAY = 28800;
  const SECONDS_PER_WEEK = SECONDS_PER_DAY * 5;
  const SECONDS_PER_YEAR = SECONDS_PER_DAY * 250;

  // Fade low values (under 1 minute)
  const LOW_FADE_START = 60; // 1 minute
  const LOW_FADE_END = 1;    // 1 second
  let lowOpacity = 1;
  if (seconds < LOW_FADE_START) {
    const lowRaw = (seconds - LOW_FADE_END) / (LOW_FADE_START - LOW_FADE_END);
    lowOpacity = Math.min(1, Math.max(0.2, lowRaw));
  }

  // Fade high values (unrealistic time savings)
  // Start fading at 1 month (4 weeks), fully faded at 1 year
  const HIGH_FADE_START = SECONDS_PER_WEEK * 4;  // ~1 month
  const HIGH_FADE_END = SECONDS_PER_YEAR;        // 1 year
  let highOpacity = 1;
  if (seconds > HIGH_FADE_START) {
    const highRaw = 1 - (Math.log(seconds) - Math.log(HIGH_FADE_START)) /
                        (Math.log(HIGH_FADE_END) - Math.log(HIGH_FADE_START));
    highOpacity = Math.min(1, Math.max(0.2, highRaw));
  }

  return Math.min(lowOpacity, highOpacity);
}

/**
 * Result of getCellDisplay - all values needed to render a cell.
 */
export interface CellDisplayResult {
  text: string;
  opacity: number;
  tier: string;
}

/**
 * Get all display values for a table cell.
 * Used by both static generation and client-side updates.
 */
export function getCellDisplay(
  salary: number,
  freqMultiplier: number,
  timeSeconds: number,
  period: 'annual' | 'monthly',
  mode: 'money' | 'time',
  currencySymbol: string = '$'
): CellDisplayResult {
  const displayMoney = calculateCellValue(salary, freqMultiplier, timeSeconds, period);
  const annualValue = calculateCellValue(salary, freqMultiplier, timeSeconds, 'annual');
  const displaySeconds = calculateTimeValue(freqMultiplier, timeSeconds, period);

  if (mode === 'money') {
    return {
      text: salary > 0 ? formatCurrency(displayMoney, currencySymbol) : '—',
      opacity: salary > 0 ? getCurrencyOpacity(annualValue, salary) : 1,
      tier: salary > 0 && annualValue > 0 ? getCurrencyTier(annualValue, salary) : '',
    };
  } else {
    return {
      text: formatTime(displaySeconds),
      opacity: getTimeOpacity(displaySeconds),
      tier: getTimeTier(displaySeconds),
    };
  }
}

// Legacy alias for backwards compatibility
export const getTier = getCurrencyTier;
