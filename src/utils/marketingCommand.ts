import { MARKETING_BRIEF_KEY, marketingBriefComplete, readMarketingBrief } from './marketingBrief';
import { formatBudgetCents } from '../data/marketingBudget';
import { MARKETING_BUDGET_KEY, marketingBudgetTotals, readMarketingBudgetPlan } from './marketingBudgetPlan';
import { MARKETING_CALENDAR_KEY, readMarketingStart } from './marketingCalendarPlan';
import { MARKETING_LAUNCH_REVIEW_KEY, marketingLaunchChecks, readMarketingLaunchReview } from './marketingLaunchReview';
import { MARKETING_STAFF_KEY, marketingStaffRoles, readMarketingStaffPlan } from './marketingStaffPlan';

export const marketingCommandKeys = [MARKETING_STAFF_KEY, MARKETING_BRIEF_KEY, MARKETING_LAUNCH_REVIEW_KEY, MARKETING_CALENDAR_KEY, MARKETING_BUDGET_KEY] as const;
export type MarketingCommandSnapshot = Record<typeof marketingCommandKeys[number], string | null>;
export type MarketingCommandStatus = { title: string; detail: string; href: string; blocked: boolean };
export function marketingCommandStatuses(snapshot: MarketingCommandSnapshot): MarketingCommandStatus[] {
  const statuses: MarketingCommandStatus[] = [];
  let briefRaw = snapshot[MARKETING_BRIEF_KEY];
  let briefReady = false;
  try {
    const staff = readMarketingStaffPlan(snapshot[MARKETING_STAFF_KEY]);
    const proposed = marketingStaffRoles.filter(role => staff[role.id].proposedPerson.trim()).length;
    statuses.push({ title: 'Proposed staffing', detail: `${proposed} of ${marketingStaffRoles.length} functions have a proposed person. Confirm roles directly before assigning access.`, href: '/marketing-staff', blocked: proposed < marketingStaffRoles.length });
  } catch { statuses.push({ title: 'Proposed staffing', detail: 'Saved staffing data could not be read. Review it in the worksheet; this view will not substitute values.', href: '/marketing-staff', blocked: true }); }
  try {
    const brief = readMarketingBrief(briefRaw);
    briefReady = !!briefRaw && marketingBriefComplete(brief);
    statuses.push({ title: 'Campaign brief', detail: briefReady ? `Saved draft: ${brief.campaign.trim()}. All six fields contain text; the campaign remains unapproved.` : 'A complete six-field campaign brief has not been saved.', href: '/marketing-brief', blocked: !briefReady });
  } catch { briefRaw = null; statuses.push({ title: 'Campaign brief', detail: 'Saved brief could not be read. Review the original record before planning a launch.', href: '/marketing-brief', blocked: true }); }
  try {
    const review = readMarketingLaunchReview(snapshot[MARKETING_LAUNCH_REVIEW_KEY]);
    const matched = !!review && !!briefRaw && review.sourceBrief === briefRaw;
    const gathered = matched ? marketingLaunchChecks.filter(item => review.checks[item.id].status === 'Evidence gathered').length : 0;
    statuses.push({ title: 'Launch verification', detail: matched ? `${gathered} of ${marketingLaunchChecks.length} areas marked evidence gathered for this exact saved brief. Final release approval remains separate.` : 'No current launch review matches the saved campaign brief.', href: '/marketing-launch-review', blocked: !matched || gathered < marketingLaunchChecks.length });
  } catch { statuses.push({ title: 'Launch verification', detail: 'Saved launch review could not be read. Check the original record.', href: '/marketing-launch-review', blocked: true }); }
  try {
    const start = readMarketingStart(snapshot[MARKETING_CALENDAR_KEY]);
    statuses.push({ title: 'Twelve-month calendar', detail: start ? `Proposed work-plan start: ${start}. This is not an opening or event date.` : 'No planning start date has been saved; the twelve months remain relative.', href: '/marketing-calendar', blocked: !start });
  } catch { statuses.push({ title: 'Twelve-month calendar', detail: 'Saved planning date could not be read. Check the calendar before using date ranges.', href: '/marketing-calendar', blocked: true }); }
  try {
    const plan = readMarketingBudgetPlan(snapshot[MARKETING_BUDGET_KEY]);
    if (!plan) statuses.push({ title: 'Planning budget', detail: 'No budget worksheet has been saved. Finance has not confirmed funding.', href: '/marketing-budget', blocked: true });
    else {
      const { ceiling, allocated } = marketingBudgetTotals(plan);
      statuses.push({ title: 'Planning budget', detail: `Draft ceiling ${formatBudgetCents(ceiling)}; allocated ${formatBudgetCents(allocated)}. ${allocated > ceiling ? `Over the draft ceiling by ${formatBudgetCents(allocated - ceiling)}.` : `Unallocated ${formatBudgetCents(ceiling - allocated)}.`} Neither funding nor spend is approved here.`, href: '/marketing-budget', blocked: allocated > ceiling });
    }
  } catch { statuses.push({ title: 'Planning budget', detail: 'Saved budget could not be read. Check the worksheet before using figures.', href: '/marketing-budget', blocked: true }); }
  return statuses;
}
export function formatMarketingCommand(snapshot: MarketingCommandSnapshot): string {
  return [
    'PTOWN MARKETING & BRAND · INTERNAL COMMAND REVIEW',
    ...marketingCommandStatuses(snapshot).flatMap(item => [`${item.title}: ${item.blocked ? 'Follow-up needed' : 'Draft material present'}`, item.detail]),
    'The campaign scorecard remains a temporary worksheet and is not included in this saved-record summary. Review its copied draft separately.',
    'This summary does not approve spending, staffing, campaign claims, or publication.',
  ].join('\n');
}
