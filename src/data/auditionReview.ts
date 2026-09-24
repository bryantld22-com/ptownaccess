import { followingWednesday } from './auditionPath';

export const auditionCriteria = [
  { id: 'audience', label: 'Audience capture', cue: 'Observe whether the act holds attention and connects with the room.' },
  { id: 'craft', label: 'Craft and material', cue: 'Observe the song, set, movement, or production idea in its actual stage form.' },
  { id: 'stage', label: 'Stage control', cue: 'Observe timing, presence, transitions, and recovery.' },
  { id: 'readiness', label: 'Nine-day readiness', cue: 'Observe whether the act can prepare a suitable set with the music director, musicians, and dancers.' },
  { id: 'professionalism', label: 'Professionalism', cue: 'Observe call time, communication, respect for staff, and follow-through.' },
] as const;
export type AuditionCriterion = typeof auditionCriteria[number]['id'];
export type AuditionRating = 'Not observed' | '1' | '2' | '3' | '4' | '5';
export const auditionPaths = ['Discuss Wednesday invitation', 'Further Monday observation', 'Development conversation', 'No current fit'] as const;
export function formatAuditionReview(name: string, monday: string, ratings: Record<AuditionCriterion, AuditionRating>, evidence: string, path: string): string {
  const wednesday = followingWednesday(monday);
  if (!wednesday) throw new Error('A valid Monday is required');
  return [
    'PTOWN · MONDAY AUDITION REVIEW DRAFT',
    `Act: ${name.trim()}`,
    `Monday audition: ${monday}`,
    `Possible following-week Wednesday: ${wednesday} (nine days later)`,
    ...auditionCriteria.map(item => `${item.label}: ${ratings[item.id]}${ratings[item.id] === 'Not observed' ? '' : ' / 5'}`),
    `Observed evidence: ${evidence.trim()}`,
    `Proposed discussion path: ${path}`,
    'An invitation requires PTown review, artist acceptance, and separate confirmation of date, personnel, set, rehearsal, and production. Ratings do not select an act.',
    'Temporary internal draft. No invitation was sent or audition result recorded.',
  ].join('\n');
}
