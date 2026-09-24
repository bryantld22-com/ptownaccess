import { initialStaReadiness, staReadinessItems, staReadinessStatuses, type StaReadinessRecord } from '../data/staReadiness';
export const STA_READINESS_KEY = '@ptown/sta-readiness/v1';
export function readStaReadiness(value: string | null): StaReadinessRecord {
  if (!value) return initialStaReadiness;
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid readiness record');
  const data = parsed as Record<string, unknown>;
  if (Object.keys(data).length !== staReadinessItems.length) throw new Error('Invalid readiness record');
  for (const item of staReadinessItems) {
    const entry = data[item.id];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid readiness record');
    const field = entry as { status?: unknown; note?: unknown };
    if (!staReadinessStatuses.includes(field.status as typeof staReadinessStatuses[number]) || typeof field.note !== 'string' || field.note.length > 400) throw new Error('Invalid readiness record');
  }
  return data as StaReadinessRecord;
}
