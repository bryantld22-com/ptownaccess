import { mediaGroupDivisions } from './mediaGroup';

export function formatMediaPassport(participant: string, divisionId: string, skills: ReadonlySet<string>, evidence: string, mentor: string): string {
  const division = mediaGroupDivisions.find(item => item.id === divisionId);
  if (!division) throw new Error('Choose a Media Group division');
  return [
    'PTOWN MEDIA ACADEMY · SKILLS PASSPORT DRAFT',
    `Participant or working name: ${participant.trim()}`,
    `Division: ${division.title}`,
    `Proposed mentor or reviewer: ${mentor.trim() || 'To assign'}`,
    ...division.passport.map(skill => `${skills.has(skill) ? '[Evidence noted]' : '[Practice needed]'} ${skill}`),
    `Portfolio evidence and contribution: ${evidence.trim()}`,
    'A mentor must review artifacts, verify the participant’s contribution and permissions, and document feedback before treating a skill as demonstrated.',
    'This draft is not enrollment, a credential, internship placement, employment, or a completed assessment. Copying does not submit or save this assessment.',
  ].join('\n');
}
