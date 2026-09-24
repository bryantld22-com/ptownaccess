import { formatBudgetCents } from './marketingBudget';

export type CampaignCounts = {
  reach: number;
  visits: number;
  optIns: number;
  attendance: number;
  repeatAttendance: number;
};

export function parseCampaignCount(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '');
  if (!/^\d+$/.test(normalized)) return null;
  const count = Number(normalized);
  return Number.isSafeInteger(count) && count <= 1_000_000_000 ? count : null;
}

export function rate(numerator: number, denominator: number): string {
  return denominator > 0 ? `${(numerator / denominator * 100).toFixed(1)}%` : 'N/A';
}

export function campaignScorecard(label: string, counts: CampaignCounts, spendCents: number | null): string {
  const { reach, visits, optIns, attendance, repeatAttendance } = counts;
  return [
    'PTOWN MARKETING · CAMPAIGN SCORECARD DRAFT',
    `Campaign or period: ${label.trim()}`,
    `Reach: ${reach.toLocaleString('en-US')}`,
    `Program-page visits: ${visits.toLocaleString('en-US')} · visits / reach: ${rate(visits, reach)}`,
    `Confirmed opt-ins: ${optIns.toLocaleString('en-US')} · opt-ins / visits: ${rate(optIns, visits)}`,
    `Verified attendance: ${attendance.toLocaleString('en-US')} · attendance / visits: ${rate(attendance, visits)}`,
    `Returning attendees: ${repeatAttendance.toLocaleString('en-US')} · returning / attendance: ${rate(repeatAttendance, attendance)}`,
    spendCents === null ? 'Campaign spend: not entered' : `Campaign spend: ${formatBudgetCents(spendCents)} · spend / attendee: ${attendance > 0 ? formatBudgetCents(Math.round(spendCents / attendance)) : 'N/A'}`,
    'Rates compare reported totals; they do not prove that a campaign caused attendance. Check unique-person definitions, attribution, consent, and source records before reporting.',
    'Draft only. Figures are not verified or submitted to PTown.',
  ].join('\n');
}
