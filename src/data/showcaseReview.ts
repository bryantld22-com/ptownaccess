export const reviewCriteria = [
  { id: 'audience', label: 'Audience engagement', cue: 'Observe attention, response, and the act’s connection with the room.' },
  { id: 'stage', label: 'Stage control', cue: 'Observe pacing, presence, transitions, and ability to recover.' },
  { id: 'craft', label: 'Craft delivery', cue: 'Observe artistic or comedic execution appropriate to the act.' },
  { id: 'preparation', label: 'Preparation', cue: 'Observe readiness of material, cues, band or dancer coordination, and timing.' },
  { id: 'professionalism', label: 'Professionalism', cue: 'Observe communication, respect for staff, call time, and follow-through.' },
] as const;

export type ReviewCriterion = typeof reviewCriteria[number]['id'];
export type ReviewRating = 'Not observed' | '1' | '2' | '3' | '4' | '5';

export function validShowcaseWednesday(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date.getUTCDay() === 3;
}

export function formatShowcaseReview(act: string, date: string, ratings: Record<ReviewCriterion, ReviewRating>, evidence: string, nextStep: string): string {
  return [
    'PTOWN · WEDNESDAY SHOWCASE REVIEW DRAFT',
    `Act: ${act.trim()}`,
    `Showcase date: ${date}`,
    ...reviewCriteria.map(item => `${item.label}: ${ratings[item.id]} / 5${ratings[item.id] === 'Not observed' ? ' (no rating)' : ''}`),
    `Observed evidence: ${evidence.trim()}`,
    `Proposed discussion path: ${nextStep}`,
    'Review the observations with Artist Development leadership and the act as appropriate. A score does not approve enrollment, support work, or a weekend booking.',
    'Temporary internal draft. No result was submitted or communicated to the act.',
  ].join('\n');
}
