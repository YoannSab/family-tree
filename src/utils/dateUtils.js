/**
 * Date utility functions for the family tree app.
 *
 * Supported formats:
 *   - "yyyy"        → year only (e.g. "1925")
 *   - "dd-mm-yyyy"  → full date (e.g. "15-03-1950")
 */

/**
 * Parses a date string into its components.
 * @param {string} dateStr
 * @returns {{ day: number|null, month: number|null, year: number, isFullDate: boolean } | null}
 */
export function parseDate(dateStr) {
  if (!dateStr && dateStr !== 0) return null;
  // Accept numbers (e.g. legacy JSON year stored as integer)
  const trimmed = String(dateStr).trim();
  if (!trimmed) return null;

  // dd-mm-yyyy
  const full = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (full) {
    return {
      day: parseInt(full[1], 10),
      month: parseInt(full[2], 10),
      year: parseInt(full[3], 10),
      isFullDate: true,
    };
  }

  // yyyy
  const yearOnly = trimmed.match(/^(\d{4})$/);
  if (yearOnly) {
    return {
      day: null,
      month: null,
      year: parseInt(yearOnly[1], 10),
      isFullDate: false,
    };
  }

  return null;
}

/** Returns true if dateStr is a full date (dd-mm-yyyy), false if year-only. */
export function isFullDate(dateStr) {
  const p = parseDate(dateStr);
  return p ? p.isFullDate : false;
}

/**
 * Formats a date string for display, taking locale into account.
 * @param {string} dateStr  - "yyyy" or "dd-mm-yyyy"
 * @param {string} language - "fr" | "en" | "it"
 * @returns {string}
 */
export function formatDate(dateStr, language = 'fr') {
  const parsed = parseDate(dateStr);
  if (!parsed) return '';

  if (!parsed.isFullDate) {
    return String(parsed.year);
  }

  const localeMap = { fr: 'fr-FR', en: 'en-GB', it: 'it-IT' };
  const locale = localeMap[language] || 'fr-FR';

  // Use UTC to avoid timezone-shift rendering issues
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Short format: "15 mars" / "15 March" / "15 marzo" (no year).
 */
export function formatDateShort(dateStr, language = 'fr') {
  const parsed = parseDate(dateStr);
  if (!parsed || !parsed.isFullDate) return '';

  const localeMap = { fr: 'fr-FR', en: 'en-GB', it: 'it-IT' };
  const locale = localeMap[language] || 'fr-FR';

  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

/**
 * Returns the next occurrence date (as a Date at midnight local) of the
 * anniversary of dateStr. Only works for full dates.
 * @param {string} dateStr
 * @returns {Date | null}
 */
export function getNextAnniversaryDate(dateStr) {
  const parsed = parseDate(dateStr);
  if (!parsed || !parsed.isFullDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisYear = today.getFullYear();

  let candidate = new Date(thisYear, parsed.month - 1, parsed.day);
  candidate.setHours(0, 0, 0, 0);

  if (candidate < today) {
    candidate = new Date(thisYear + 1, parsed.month - 1, parsed.day);
  }

  return candidate;
}

/**
 * Returns number of days until targetDate from today (0 = today, 1 = tomorrow…).
 * @param {Date} targetDate
 * @returns {number}
 */
export function daysUntil(targetDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = targetDate.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
