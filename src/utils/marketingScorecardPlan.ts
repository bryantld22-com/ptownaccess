import { parseBudgetCents } from '../data/marketingBudget';
import { parseCampaignCount, type CampaignCounts } from '../data/marketingScorecard';

export const MARKETING_SCORECARD_KEY = '@ptown/marketing-scorecard/v1';
export type MarketingScorecardPlan = { label: string; counts: CampaignCounts; spend: string };
export function readMarketingScorecardPlan(raw: string | null): MarketingScorecardPlan | null {
  if (raw === null) return null;
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid scorecard');
  const plan = parsed as Record<string, unknown>;
  if (Object.keys(plan).length !== 3 || typeof plan.label !== 'string' || !plan.label.trim() || plan.label.length > 120 || typeof plan.spend !== 'string' || plan.spend.length > 14 || (plan.spend.trim() && parseBudgetCents(plan.spend) === null)) throw new Error('Invalid scorecard');
  if (!plan.counts || typeof plan.counts !== 'object' || Array.isArray(plan.counts)) throw new Error('Invalid scorecard');
  const counts = plan.counts as Record<string, unknown>;
  const keys = ['reach', 'visits', 'optIns', 'attendance', 'repeatAttendance'];
  if (Object.keys(counts).length !== keys.length || keys.some(key => typeof counts[key] !== 'number' || !Number.isSafeInteger(counts[key]) || (counts[key] as number) < 0 || (counts[key] as number) > 1_000_000_000 || parseCampaignCount(String(counts[key])) === null)) throw new Error('Invalid scorecard');
  if ((counts.visits as number) > (counts.reach as number) || (counts.optIns as number) > (counts.visits as number) || (counts.repeatAttendance as number) > (counts.attendance as number)) throw new Error('Invalid scorecard');
  return plan as MarketingScorecardPlan;
}
