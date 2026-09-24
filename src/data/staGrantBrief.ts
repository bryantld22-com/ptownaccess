export const staApplicantStates = [
  'Entity and filing status to verify',
  'Nonprofit applicant details under review',
  'Fiscal sponsor possibility to discuss',
  'Other applicant structure to clarify',
] as const;
export const staMeetingQuestions = [
  'Which local, state, or federal funding programs may fit this specific arts education plan?',
  'What applicant structure, registrations, board records, or fiscal sponsor arrangement would be required?',
  'Which costs, such as instruction, materials, transportation, accessibility, and evaluation, are allowable?',
  'What deadlines, match requirements, funding caps, reporting periods, and prior track record apply?',
  'What can we prepare now, and who should review the next draft before an application?',
] as const;
export type StaGrantBrief = {
  program: string; audience: string; applicant: string; request: string;
  useOfFunds: string; outcomes: string; partners: string; questions: readonly string[];
};
export function formatStaGrantBrief(value: StaGrantBrief): string {
  return [
    'SAVE THE ARTS · GRANT MEETING DISCUSSION DRAFT',
    `Proposed program: ${value.program.trim()}`,
    `Who it would serve: ${value.audience.trim()}`,
    `Applicant status for verification: ${value.applicant}`,
    `Working funding request: ${value.request.trim() || 'To develop with budget and funder limits'}`,
    `Proposed use of funds: ${value.useOfFunds.trim()}`,
    `Outcomes to measure: ${value.outcomes.trim()}`,
    `Potential partners and staffing: ${value.partners.trim() || 'To confirm'}`,
    'QUESTIONS FOR THE GRANTS CONVERSATION',
    ...value.questions.map((question, index) => `${index + 1}. ${question}`),
    'FOLLOW-UP: Verify each funder’s current eligibility, allowable costs, deadline, match, entity requirements, and application documents directly. Confirm program scope, partners, and budget before applying.',
    'Internal planning draft only. No meeting was scheduled, grant eligibility confirmed, application submitted, funding promised, or leadership appointment announced.',
  ].join('\n');
}
