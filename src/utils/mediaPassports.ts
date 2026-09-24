import { mediaGroupDivisions } from '../data/mediaGroup';

export const MEDIA_PASSPORTS_KEY = '@ptown/media-passports/v1';
export type MediaPassportDraft = {
  id: string; participant: string; divisionId: string; skills: string[];
  evidence: string; mentor: string; updatedAt: string;
};
export function readMediaPassports(value: string | null): MediaPassportDraft[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.length > 50) throw new Error('Invalid saved passports');
  const valid = parsed.every((item): item is MediaPassportDraft => {
    if (!item || typeof item !== 'object') return false;
    const draft = item as MediaPassportDraft;
    const division = mediaGroupDivisions.find(value => value.id === draft.divisionId);
    return Boolean(division && typeof draft.id === 'string' && draft.id.length <= 80 &&
      typeof draft.participant === 'string' && draft.participant.length <= 120 &&
      Array.isArray(draft.skills) && draft.skills.length <= division.passport.length &&
      draft.skills.every(skill => typeof skill === 'string' && division.passport.some(value => value === skill)) &&
      typeof draft.evidence === 'string' && draft.evidence.length <= 1000 &&
      typeof draft.mentor === 'string' && draft.mentor.length <= 120 &&
      typeof draft.updatedAt === 'string' && !Number.isNaN(Date.parse(draft.updatedAt)));
  });
  if (!valid || new Set((parsed as MediaPassportDraft[]).map(item => item.id)).size !== parsed.length) throw new Error('Invalid saved passports');
  return parsed as MediaPassportDraft[];
}
