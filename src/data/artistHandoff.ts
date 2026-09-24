export const handoffChecks = [
  { id: 'evidence', label: 'Monday and Wednesday evidence reviewed', detail: 'Compare audition notes, Wednesday observations, and any DJ set notes when relevant.' },
  { id: 'conversation', label: 'Artist conversation planned', detail: 'Discuss goals, capacity, interest, and the work required; do not imply an offer.' },
  { id: 'materials', label: 'Materials and rights identified', detail: 'Confirm the EPK or work sample, repertoire, collaborators, and any performance or recording permissions needed.' },
  { id: 'resources', label: 'PTown capacity checked', detail: 'Check mentor, music director, stage, production, rehearsal, and calendar availability.' },
  { id: 'terms', label: 'Terms and scope to be documented', detail: 'Prepare a separate written agreement for any paid slot, program participation, or media use.' },
] as const;
export type HandoffCheck = typeof handoffChecks[number]['id'];
export const handoffPaths = ['Continue observation', 'Development conversation', 'Support or filler slot discussion', 'Weekend booking discussion', 'No current fit'] as const;
export function formatArtistHandoff(name: string, path: string, evidence: string, checked: ReadonlySet<HandoffCheck>, owner: string): string {
  return [
    'PTOWN · ARTIST SHOWCASE HANDOFF DRAFT',
    `Act: ${name.trim()}`,
    `Proposed owner discussion: ${path}`,
    `Observed basis: ${evidence.trim()}`,
    `Review owner or team: ${owner.trim()}`,
    ...handoffChecks.map(item => `${checked.has(item.id) ? '[Reviewed]' : '[Still to review]'} ${item.label}`),
    'Owner decision, artist acceptance, resources, dates, permissions, and written terms require separate confirmation. This worksheet is not an invitation, booking, enrollment, or contract.',
    'Temporary internal draft; no data was saved or sent.',
  ].join('\n');
}
