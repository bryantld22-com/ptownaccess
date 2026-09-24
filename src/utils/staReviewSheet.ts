import { staReadinessItems, type StaReadinessRecord } from '../data/staReadiness';
import type { StaAssignments } from './staAssignments';

export function formatStaReviewSheet(readiness: StaReadinessRecord, assignments: StaAssignments): string {
  const ready = staReadinessItems.filter(item => readiness[item.id].status === 'Ready for review').length;
  const owners = staReadinessItems.filter(item => assignments[item.id].proposedOwner.trim()).length;
  return [
    'SAVE THE ARTS · INTERNAL PREPARATION REVIEW SHEET',
    `${ready} of 7 areas marked ready for team review; ${owners} of 7 have a proposed owner.`,
    ...staReadinessItems.flatMap((item, index) => [
      `${index + 1}. ${item.title}`,
      `Status: ${readiness[item.id].status}`,
      `Working note: ${readiness[item.id].note.trim() || 'Not entered'}`,
      `Proposed owner: ${assignments[item.id].proposedOwner.trim() || 'Unassigned'}`,
      `Target date: ${assignments[item.id].targetDate || 'Not set'}`,
    ]),
    'Internal draft. Confirm proposed responsibilities with each person. Ready for review does not establish funder eligibility. No appointment, invitation, meeting, or application was sent.',
  ].join('\n');
}
