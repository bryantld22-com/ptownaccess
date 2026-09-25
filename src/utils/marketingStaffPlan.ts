import { marketingRoles } from '../data/marketingOperations';

export const MARKETING_STAFF_KEY = '@ptown/marketing-staff/v1';
export const marketingStaffRoles = marketingRoles.map((role, index) => ({ ...role, id: `role-${index + 1}` })) as ({ id: string; role: string; accountable: string })[];
export type MarketingStaffEntry = { proposedPerson: string; coverageNote: string };
export type MarketingStaffPlan = Record<string, MarketingStaffEntry>;
export const emptyMarketingStaffPlan: MarketingStaffPlan = Object.fromEntries(marketingStaffRoles.map(item => [item.id, { proposedPerson: '', coverageNote: '' }]));
export function readMarketingStaffPlan(raw: string | null): MarketingStaffPlan {
  if (raw === null) return emptyMarketingStaffPlan;
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid staffing plan');
  const data = parsed as Record<string, unknown>;
  if (Object.keys(data).length !== marketingStaffRoles.length) throw new Error('Invalid staffing plan');
  for (const role of marketingStaffRoles) {
    const entry = data[role.id];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid staffing entry');
    const fields = entry as Record<string, unknown>;
    if (Object.keys(fields).length !== 2 || typeof fields.proposedPerson !== 'string' || fields.proposedPerson.length > 80 || typeof fields.coverageNote !== 'string' || fields.coverageNote.length > 240) throw new Error('Invalid staffing entry');
  }
  return data as MarketingStaffPlan;
}
export function formatMarketingStaffPlan(plan: MarketingStaffPlan): string {
  return [
    'PTOWN MARKETING & BRAND · PROPOSED STAFFING DRAFT',
    ...marketingStaffRoles.flatMap(item => [item.role, `Proposed person: ${plan[item.id].proposedPerson.trim() || 'Open seat'}`, `Coverage / next step: ${plan[item.id].coverageNote.trim() || 'Not entered'}`]),
    'A person may cover more than one function during startup. Confirm interest, authority, scope, and availability directly; this worksheet makes no appointment and sends no invitation.',
  ].join('\n');
}
