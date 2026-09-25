export const STA_MENTOR_READINESS_KEY = '@ptown/sta-mentor-readiness/v1';
export const mentorReadinessChecks = [
  { id: 'mentor', title: 'Mentor qualifications and screening', cue: 'Define relevant teaching experience, references, screening, and who may lead instrument or voice work.' },
  { id: 'supervision', title: 'Student supervision', cue: 'Name responsible adults, visibility rules, arrival and departure procedures, and incident response.' },
  { id: 'consent', title: 'Consent and boundaries', cue: 'Prepare guardian consent where needed, appropriate touch rules, and separate permission for photos or recordings.' },
  { id: 'space', title: 'Accessible teaching space', cue: 'Confirm a visible, accessible room with seating, acoustics, safe circulation, and a quiet option.' },
  { id: 'equipment', title: 'Instruments and materials', cue: 'Check instrument fit, maintenance, cleaning, storage, loan terms, and materials for each learner.' },
  { id: 'voice', title: 'Voice care', cue: 'Review comfortable practice, qualified vocal guidance, breaks, and stopping for pain or strain.' },
  { id: 'plan', title: 'Lesson and feedback plan', cue: 'Agree on small learning goals, demonstration, learner practice, feedback, and a noncompetitive reflection.' },
  { id: 'operations', title: 'Schedule and support', cue: 'Confirm actual mentors, session dates, capacity, accessibility requests, funding, and a contact for questions.' },
] as const;
export type MentorReadinessId = typeof mentorReadinessChecks[number]['id'];
export type MentorReadinessStatus = 'Needs work' | 'Material gathered';
export type MentorReadinessRecord = Record<MentorReadinessId, { status: MentorReadinessStatus; note: string }>;
export function newMentorReadiness(): MentorReadinessRecord {
  return Object.fromEntries(mentorReadinessChecks.map(item => [item.id, { status: 'Needs work', note: '' }])) as MentorReadinessRecord;
}
export function readMentorReadiness(raw: string | null): MentorReadinessRecord {
  if (raw === null) return newMentorReadiness();
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid mentor readiness');
  const record = parsed as Record<string, unknown>;
  if (Object.keys(record).length !== mentorReadinessChecks.length) throw new Error('Invalid mentor readiness');
  for (const item of mentorReadinessChecks) {
    const value = record[item.id];
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid mentor readiness');
    const entry = value as Record<string, unknown>;
    if (Object.keys(entry).length !== 2 || (entry.status !== 'Needs work' && entry.status !== 'Material gathered') || typeof entry.note !== 'string' || entry.note.length > 300) throw new Error('Invalid mentor readiness');
  }
  return record as MentorReadinessRecord;
}
export function formatMentorReadiness(record: MentorReadinessRecord): string {
  return [
    'SAVE THE ARTS · MENTOR PILOT READINESS DRAFT',
    ...mentorReadinessChecks.flatMap(item => [`${item.title}: ${record[item.id].status}`, `Evidence or next step: ${record[item.id].note.trim() || 'Not entered'}`]),
    'Material gathered is a planning status, not authorization to run sessions. Confirm policies, people, and approvals outside this worksheet.',
  ].join('\n');
}
