import { readMarketingBrief } from './marketingBrief';

export const MARKETING_LAUNCH_REVIEW_KEY = '@ptown/marketing-launch-review/v1';
export const marketingLaunchChecks = [
  { id: 'program', title: 'Program facts', cue: 'Confirm date, performer, venue, capacity, admission, food, and cancellation details with program leadership.' },
  { id: 'guest', title: 'Guest path', cue: 'Test each published page, reservation or ticket link, contact path, arrival guidance, and accessibility information.' },
  { id: 'rights', title: 'Creative permissions', cue: 'Confirm image, music, performer, testimonial, and production permissions for every channel.' },
  { id: 'budget', title: 'Spend authorization', cue: 'Record the approved ceiling, funding source, channel owner, and any paid placement terms.' },
  { id: 'consent', title: 'Consent and data', cue: 'Check opt-in wording, preference handling, analytics claims, and unsubscribe process before collecting contacts.' },
  { id: 'sponsor', title: 'Partner promises', cue: 'Verify sponsor names, benefits, logo usage, deliverables, and any required written approval.' },
  { id: 'signoff', title: 'Final release decision', cue: 'Collect brand, program, and marketing decision-maker review of the actual final assets and timing.' },
] as const;
export type MarketingLaunchId = typeof marketingLaunchChecks[number]['id'];
export type MarketingLaunchStatus = 'Needs verification' | 'Evidence gathered';
export const marketingLaunchStatuses: MarketingLaunchStatus[] = ['Needs verification', 'Evidence gathered'];
export type MarketingLaunchReview = {
  sourceBrief: string;
  checks: Record<MarketingLaunchId, { status: MarketingLaunchStatus; note: string }>;
};
export function newMarketingLaunchReview(sourceBrief: string): MarketingLaunchReview {
  if (!sourceBrief || sourceBrief.length > 2000) throw new Error('Invalid campaign brief');
  readMarketingBrief(sourceBrief);
  return { sourceBrief, checks: Object.fromEntries(marketingLaunchChecks.map(item => [item.id, { status: 'Needs verification', note: '' }])) as MarketingLaunchReview['checks'] };
}
export function readMarketingLaunchReview(raw: string | null): MarketingLaunchReview | null {
  if (raw === null) return null;
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid review');
  const value = parsed as Record<string, unknown>;
  if (Object.keys(value).length !== 2 || typeof value.sourceBrief !== 'string' || !value.checks || typeof value.checks !== 'object' || Array.isArray(value.checks)) throw new Error('Invalid review');
  newMarketingLaunchReview(value.sourceBrief);
  const checks = value.checks as Record<string, unknown>;
  if (Object.keys(checks).length !== marketingLaunchChecks.length) throw new Error('Invalid review');
  for (const item of marketingLaunchChecks) {
    const entry = checks[item.id];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid review');
    const data = entry as Record<string, unknown>;
    if (Object.keys(data).length !== 2 || !marketingLaunchStatuses.includes(data.status as MarketingLaunchStatus) || typeof data.note !== 'string' || data.note.length > 300) throw new Error('Invalid review');
  }
  return value as MarketingLaunchReview;
}
export function formatMarketingLaunchReview(value: MarketingLaunchReview): string {
  const brief = readMarketingBrief(value.sourceBrief);
  return [
    'PTOWN MARKETING · LAUNCH VERIFICATION DRAFT',
    `Campaign: ${brief.campaign.trim() || 'Unnamed campaign'}`,
    ...marketingLaunchChecks.flatMap(item => [`${item.title}: ${value.checks[item.id].status}`, `Evidence / next step: ${value.checks[item.id].note.trim() || 'Not entered'}`]),
    'Evidence gathered is an internal tracking status, not permission to publish. Confirm the final assets and obtain the required actual approvals before release.',
  ].join('\n');
}
