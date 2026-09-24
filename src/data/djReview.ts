export const djCriteria = [
  { id: 'room', label: 'Room reading', cue: 'Notice whether the DJ responds to energy and adjusts to the audience.' },
  { id: 'transitions', label: 'Transitions', cue: 'Notice timing and continuity between songs and energy levels.' },
  { id: 'genres', label: 'Genre range', cue: 'Notice range across the planned mix without treating one generation as an afterthought.' },
  { id: 'crowd', label: 'Crowd control', cue: 'Notice pacing, safe participation, and recovery when a selection does not land.' },
  { id: 'presentation', label: 'Professional presentation', cue: 'Notice call time, equipment readiness, staff communication, and clean presentation.' },
  { id: 'mic', label: 'Mic discipline', cue: 'Notice clarity, restraint, and appropriate announcements.' },
  { id: 'bridge', label: 'Generational bridge', cue: 'Notice smooth movement between current and classic music for a shared room.' },
] as const;
export type DjCriterion = typeof djCriteria[number]['id'];
export type DjRating = 'Not observed' | '1' | '2' | '3' | '4' | '5';

export function formatDjReview(name: string, evidence: string, ratings: Record<DjCriterion, DjRating>, path: string): string {
  return [
    'PTOWN · AFTER-PARTY DJ EVALUATION DRAFT',
    `DJ or producer: ${name.trim()}`,
    ...djCriteria.map(item => `${item.label}: ${ratings[item.id]}${ratings[item.id] === 'Not observed' ? '' : ' / 5'}`),
    `Observed evidence: ${evidence.trim()}`,
    `Proposed discussion path: ${path}`,
    'PTown leadership must review the evidence and confirm any audition, rotation, booking, or contract. This draft is not an offer.',
    'Temporary internal draft. Nothing was submitted or communicated to the DJ.',
  ].join('\n');
}
