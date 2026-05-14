import { useMemo } from 'react';
import { parseDate, getNextAnniversaryDate, daysUntil } from '../utils/dateUtils';

/**
 * Computes upcoming birthdays and death anniversaries from family data.
 * Only persons with a full date (dd-mm-yyyy) appear.
 *
 * @param {Array}  familyData
 * @param {number} daysAhead   - window in days (default 365)
 * @returns {{ events: Array, todayEvents: Array, soonEvents: Array }}
 */
export function useUpcomingEvents(familyData, daysAhead = 365) {
  return useMemo(() => {
    const events = [];

    for (const person of familyData) {
      const d = person.data;
      const name = `${d.firstName} ${d.lastName}`;
      const currentYear = new Date().getFullYear();

      // ── Birthday ──────────────────────────────────────────────────────────
      if (d.birthday) {
        const next = getNextAnniversaryDate(d.birthday);
        if (next !== null) {
          const days = daysUntil(next);
          if (days >= 0 && days <= daysAhead) {
            const birthParsed = parseDate(d.birthday);
            // Age this anniversary year
            const age = next.getFullYear() - birthParsed.year;
            events.push({
              type: 'birthday',
              person,
              name,
              nextDate: next,
              daysUntil: days,
              originalDate: d.birthday,
              // Living person → show their upcoming age; deceased → "would have been"
              age,
              isDeceased: Boolean(d.death),
            });
          }
        }
      }

      // ── Death anniversary ─────────────────────────────────────────────────
      if (d.death) {
        const next = getNextAnniversaryDate(d.death);
        if (next !== null) {
          const days = daysUntil(next);
          if (days >= 0 && days <= daysAhead) {
            const deathParsed = parseDate(d.death);
            const yearsAgo = next.getFullYear() - deathParsed.year;
            // Would-be age on this death anniversary (born year → anniversary year)
            const birthParsed = parseDate(d.birthday);
            const age = birthParsed ? next.getFullYear() - birthParsed.year : null;
            events.push({
              type: 'death',
              person,
              name,
              nextDate: next,
              daysUntil: days,
              originalDate: d.death,
              yearsAgo,
              age,
              isDeceased: true,
            });
          }
        }
      }
    }

    // Sort chronologically (today first)
    events.sort((a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name));

    const todayEvents = events.filter(e => e.daysUntil === 0);
    const soonEvents  = events.filter(e => e.daysUntil > 0 && e.daysUntil <= 7);

    return { events, todayEvents, soonEvents };
  }, [familyData, daysAhead]);
}
