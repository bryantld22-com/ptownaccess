export function followingWednesday(monday: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(monday)) return null;
  const date = new Date(`${monday}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== monday || date.getUTCDay() !== 1) return null;
  date.setUTCDate(date.getUTCDate() + 9);
  return date.toISOString().slice(0, 10);
}

export function validEpkLink(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && Boolean(url.hostname) && value.trim().length <= 500;
  } catch { return false; }
}

export function auditionDraft(name: string, discipline: string, monday: string, epk: string): string {
  const wednesday = followingWednesday(monday);
  return [
    'PTOWN · AUDITION PREPARATION DRAFT',
    `Artist or act: ${name.trim()}`,
    `Discipline: ${discipline}`,
    `Proposed Monday audition: ${monday}`,
    `Possible following-week Wednesday showcase: ${wednesday ?? 'Date unavailable'} (9 days after Monday, invitation required)`,
    `EPK or performance link: ${epk.trim() || 'Not supplied · optional'}`,
    'Next step if selected: PTown confirms the invitation and connects the artist with the music director, musicians, and dancers for preparation.',
    'Wednesday audience response and performance readiness inform an Artist Development review; a showcase is not enrollment or a weekend booking.',
    'This draft is not registration, a submission, an invitation, or a confirmed event date.',
  ].join('\n');
}

export const showcaseMilestones = [
  { offset: 1, owner: 'Artist Development lead', title: 'Confirm selection and invitation', detail: 'Contact the act, confirm interest and availability, identify performance format, and record a response. The act is not booked until PTown confirms it.' },
  { offset: 3, owner: 'Artist + music director', title: 'Exchange the set and materials', detail: 'Agree on songs or comedy set, key, tempo, clean versions, backing tracks, band needs, dancers, and any EPK or performance reference.' },
  { offset: 6, owner: 'Music director + production lead', title: 'Resolve rehearsal and stage needs', detail: 'Confirm musician and dancer preparation, stage plot, inputs, cues, changeovers, and rehearsal or sound-check arrangements.' },
  { offset: 8, owner: 'Stage manager + artist', title: 'Final readiness check', detail: 'Confirm call time, set duration, introductions, equipment, accessibility, recording choices, and a contingency if the act cannot perform.' },
  { offset: 9, owner: 'PTown show team', title: 'Wednesday showcase and review', detail: 'Run the invited performance, observe audience response and professionalism, document feedback, then consider development or future support roles.' },
] as const;

export function showcaseSchedule(monday: string) {
  if (!followingWednesday(monday)) return null;
  return showcaseMilestones.map(item => {
    const date = new Date(`${monday}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + item.offset);
    return { ...item, date: date.toISOString().slice(0, 10) };
  });
}
