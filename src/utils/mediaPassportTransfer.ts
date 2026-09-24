import { readMediaPassports, type MediaPassportDraft } from './mediaPassports';

export const MAX_MEDIA_PASSPORT_TRANSFER = 100000;
export function createMediaPassportTransfer(drafts: MediaPassportDraft[]): string {
  const code = JSON.stringify({ app: 'PTown Access', type: 'media-passport-transfer', format: 1, drafts });
  if (code.length > MAX_MEDIA_PASSPORT_TRANSFER) throw new Error('Transfer too large');
  return code;
}
export function readMediaPassportTransfer(value: string): MediaPassportDraft[] {
  if (!value.trim() || value.length > MAX_MEDIA_PASSPORT_TRANSFER) throw new Error('Invalid transfer');
  const packet: unknown = JSON.parse(value);
  if (!packet || typeof packet !== 'object') throw new Error('Invalid transfer');
  const data = packet as { app?: unknown; type?: unknown; format?: unknown; drafts?: unknown };
  if (data.app !== 'PTown Access' || data.type !== 'media-passport-transfer' || data.format !== 1 || !Array.isArray(data.drafts)) throw new Error('Invalid transfer');
  return readMediaPassports(JSON.stringify(data.drafts));
}

export type MediaPassportMergeChoice = 'current' | 'incoming';
export function planMediaPassportMerge(current: MediaPassportDraft[], incoming: MediaPassportDraft[], choices: Record<string, MediaPassportMergeChoice>) {
  const merged = [...current];
  const conflicts: MediaPassportDraft[] = [];
  let added = 0, identical = 0;
  for (const item of incoming) {
    const index = merged.findIndex(value => value.id === item.id);
    if (index < 0) { merged.push(item); added++; continue; }
    if (JSON.stringify(merged[index]) === JSON.stringify(item)) { identical++; continue; }
    conflicts.push(item);
    if (choices[item.id] === 'incoming') merged[index] = item;
  }
  const duplicates = merged.filter((item, index) => merged.findIndex(other => other.participant.trim().toLowerCase() === item.participant.trim().toLowerCase() && other.divisionId === item.divisionId) !== index);
  return { merged, conflicts, unresolved: conflicts.filter(item => !choices[item.id]), added, identical, duplicates, overLimit: merged.length > 50 };
}
