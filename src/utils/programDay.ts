import { weekDays } from '../data/events';

// Construct in local time: parsing a YYYY-MM-DD string as UTC changes the
// weekday for guests west of UTC. Also reject rolled-over calendar dates.
export function programDay(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const value = new Date(year, month - 1, day);
  if (value.getFullYear() !== year || value.getMonth() !== month - 1 || value.getDate() !== day) return null;
  return weekDays[(value.getDay() + 6) % 7];
}
