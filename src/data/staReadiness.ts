export const staReadinessItems = [
  { id: 'entity', title: 'Applicant entity and governance', cue: 'Verify formation, board oversight, filing status, and who may apply or sign.' },
  { id: 'program', title: 'Defined program and participants', cue: 'Document the pilot, ages, service area, accessibility, schedule, and safeguards.' },
  { id: 'curriculum', title: 'Educational plan and capable team', cue: 'Outline sessions, qualified instructors, mentor supervision, roles, and training.' },
  { id: 'budget', title: 'Line-item budget and support', cue: 'Prepare cost assumptions, sources of other support, and any documentation required for a match.' },
  { id: 'partners', title: 'Partner and property permissions', cue: 'Confirm collaborators, shared space use, transport, and written commitments when needed.' },
  { id: 'outcomes', title: 'Outcomes and recordkeeping', cue: 'Choose measures, attendance records, consent practices, evaluation, and expense documentation.' },
  { id: 'funder', title: 'Specific funder verification', cue: 'Check current eligibility, allowable costs, dates, award cap, match, and reporting directly with the funder.' },
] as const;
export type StaReadinessId = typeof staReadinessItems[number]['id'];
export type StaReadinessStatus = 'Not started' | 'In progress' | 'Ready for review';
export const staReadinessStatuses: StaReadinessStatus[] = ['Not started', 'In progress', 'Ready for review'];
export type StaReadinessRecord = Record<StaReadinessId, { status: StaReadinessStatus; note: string }>;
export const initialStaReadiness = Object.fromEntries(staReadinessItems.map(item => [item.id, { status: 'Not started', note: '' }])) as StaReadinessRecord;
export function formatStaReadiness(value: StaReadinessRecord): string {
  return [
    'SAVE THE ARTS · GRANT PREPARATION STATUS DRAFT',
    ...staReadinessItems.flatMap(item => [`${item.title}: ${value[item.id].status}`, `Working note: ${value[item.id].note.trim() || 'Not entered'}`]),
    'Ready for review means the team has material to examine. It does not mean the entity or program qualifies for any particular grant.',
    'Verify current funder rules and supporting records before applying. Device-local planning only; no application, meeting request, or leadership appointment was submitted.',
  ].join('\n');
}
