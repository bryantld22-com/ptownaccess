export const MARKETING_BRIEF_KEY = '@ptown/marketing-brief/v1';
export const MARKETING_BRIEF_LIMIT = 160;
export type MarketingBriefRecord = { campaign: string; audience: string; objective: string; owner: string; action: string; measure: string };
export const emptyMarketingBrief: MarketingBriefRecord = { campaign: '', audience: '', objective: '', owner: '', action: '', measure: '' };
const fields = ['campaign', 'audience', 'objective', 'owner', 'action', 'measure'] as const;
export function readMarketingBrief(raw: string | null): MarketingBriefRecord {
  if (raw === null) return emptyMarketingBrief;
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid brief');
  const data = parsed as Record<string, unknown>;
  if (Object.keys(data).length !== fields.length || fields.some(field => typeof data[field] !== 'string' || (data[field] as string).length > MARKETING_BRIEF_LIMIT)) throw new Error('Invalid brief');
  return data as MarketingBriefRecord;
}
const clean = (value: string) => value.trim().replace(/\s+/g, ' ');
export function formatMarketingBrief(value: MarketingBriefRecord): string {
  return [
    'PTOWN MARKETING · CAMPAIGN BRIEF DRAFT',
    `Campaign: ${clean(value.campaign) || '[needed]'}`,
    `Audience: ${clean(value.audience) || '[needed]'}`,
    `Objective: ${clean(value.objective) || '[needed]'}`,
    `Responsible owner: ${clean(value.owner) || '[needed]'}`,
    `Guest action: ${clean(value.action) || '[needed]'}`,
    `Success measure: ${clean(value.measure) || '[needed]'}`,
    'Before publication: confirm dates, offer, capacity, permissions, budget, consent, approved assets, and working guest path.',
    'This is an internal draft. It is not approved, published, submitted, or a live sign-up.',
  ].join('\n');
}
export function marketingBriefComplete(value: MarketingBriefRecord): boolean {
  return fields.every(field => clean(value[field]).length > 0);
}
