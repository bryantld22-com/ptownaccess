export const MARKETING_CALENDAR_KEY = '@ptown/marketing-calendar-start/v1';

export function validMarketingStart(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 2000 || year > 2100) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
export function readMarketingStart(raw: string | null): string {
  if (raw === null) return '';
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'string' || !validMarketingStart(parsed)) throw new Error('Invalid planning date');
  return parsed;
}
function monthStart(start: string, offset: number): Date {
  const [year, month, day] = start.split('-').map(Number);
  const first = new Date(Date.UTC(year, month - 1 + offset, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(day, lastDay)));
}
export function marketingMonthRange(start: string, month: number): string {
  if (!validMarketingStart(start) || !Number.isInteger(month) || month < 1 || month > 12) throw new Error('Invalid planning month');
  const from = monthStart(start, month - 1);
  const through = monthStart(start, month);
  through.setUTCDate(through.getUTCDate() - 1);
  return `${from.toISOString().slice(0, 10)} through ${through.toISOString().slice(0, 10)}`;
}

export function formatMarketingCalendarPlan(start: string): string {
  if (start && !validMarketingStart(start)) throw new Error('Invalid planning date');
  return [
    'PTOWN MARKETING & BRAND · TWELVE-MONTH PLANNING DRAFT',
    start ? `Proposed work-plan start: ${start}` : 'Work-plan start: not set; months remain relative.',
    ...marketingCampaigns.flatMap(item => [
      `Month ${item.month}: ${item.title}${start ? ` (${marketingMonthRange(start, item.month)})` : ''}`,
      `Owner function: ${item.channel}`,
      `Action: ${item.action}`,
      `Measure: ${item.measure}`,
    ]),
    'PTown Access funnel: ' + marketingFunnel.map(item => item.stage).join(' → '),
    'All ranges are planning assumptions. Confirm venue readiness, event dates, program details, costs, permissions, consent, and guest paths before publication.',
  ].join('\n');
}
import { marketingCampaigns, marketingFunnel } from '../data/marketing';
