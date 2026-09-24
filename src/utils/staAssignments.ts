import { staReadinessItems, type StaReadinessId } from '../data/staReadiness';

export const STA_ASSIGNMENTS_KEY = '@ptown/sta-assignments/v1';
export type StaAssignment = { proposedOwner: string; targetDate: string };
export type StaAssignments = Record<StaReadinessId, StaAssignment>;
export const emptyStaAssignments = Object.fromEntries(staReadinessItems.map(item => [item.id, { proposedOwner: '', targetDate: '' }])) as StaAssignments;

export function validTargetDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function readStaAssignments(value: string | null): StaAssignments {
  if (value === null) return emptyStaAssignments;
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid assignments');
  const data = parsed as Record<string, unknown>;
  if (Object.keys(data).length !== staReadinessItems.length) throw new Error('Invalid assignments');
  for (const item of staReadinessItems) {
    const entry = data[item.id];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid assignment');
    const fields = entry as Record<string, unknown>;
    if (Object.keys(fields).length !== 2 || typeof fields.proposedOwner !== 'string' || fields.proposedOwner.length > 80 || typeof fields.targetDate !== 'string' || (fields.targetDate !== '' && !validTargetDate(fields.targetDate))) throw new Error('Invalid assignment');
  }
  return data as StaAssignments;
}

export function formatStaAssignments(value: StaAssignments): string {
  return [
    'SAVE THE ARTS · PROPOSED PREPARATION OWNERS AND DATES',
    ...staReadinessItems.flatMap(item => [item.title, `Proposed owner: ${value[item.id].proposedOwner.trim() || 'Unassigned'}`, `Target date: ${value[item.id].targetDate || 'Not set'}`]),
    'Planning draft only. Confirm each person’s agreement and the dates directly; no invitation, appointment, meeting, or grant submission has been sent.',
  ].join('\n');
}
