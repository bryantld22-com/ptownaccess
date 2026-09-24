export type ReadinessItem = {
  id: string;
  group: string;
  owner: string;
  label: string;
  evidence: string;
};

export const championshipReadiness: readonly ReadinessItem[] = [
  { id: 'rules', group: 'Competition', owner: 'Tournament director', label: 'Game rules and dispute process approved', evidence: 'Dated rules for each division, scoring, tie-breakers, conduct, appeals, and named decision makers.' },
  { id: 'calendar', group: 'Competition', owner: 'Program director', label: 'Quarterly dates and venue capacity confirmed', evidence: 'Four dated room holds, staffing plan, table counts, accessibility and arrival windows.' },
  { id: 'registration', group: 'Entry', owner: 'Registration lead', label: 'Entry terms and registration process approved', evidence: 'Eligibility, capacity, fee or free status, cancellation, refund terms, check-in, and privacy notice.' },
  { id: 'finance', group: 'Funding', owner: 'Finance lead', label: 'Event budget and sponsor commitments documented', evidence: 'Approved costs, signed sponsor terms, deliverables, and a responsible finance owner.' },
  { id: 'travel', group: 'Funding', owner: 'Finance lead', label: 'Travel award funded and terms reviewed', evidence: 'Available restricted funds, written coverage limits, eligibility, substitutions, cancellation, tax and legal review.' },
  { id: 'chess', group: 'Chess', owner: 'Chess director', label: 'Chess status and officials verified', evidence: 'Written affiliation or event status where claimed, qualified director, rules, reporting and equipment.' },
  { id: 'media', group: 'Media', owner: 'Media producer', label: 'Filming and broadcast controls approved', evidence: 'Participant releases, guardian process, no-film procedure, rights clearance, delay and fair-play controls.' },
  { id: 'safety', group: 'Operations', owner: 'Safety lead', label: 'Venue and safety plan signed off', evidence: 'Accessible routes, staffing, emergency response, insurance review, security and incident escalation.' },
];

export function formatChampionshipHandoff(reviewed: readonly string[]): string {
  const outstanding = championshipReadiness.filter(item => !reviewed.includes(item.id));
  return [
    'PTOWN TOURNAMENT · PLANNING HANDOFF',
    `${outstanding.length} of ${championshipReadiness.length} evidence items outstanding (temporary session review).`,
    'Suggested roles only. Assign named owners and obtain documented PTown approval before public launch.',
    '',
    ...(outstanding.length ? outstanding.flatMap((item, index) => [
      `${index + 1}. ${item.label}`,
      `Owner role: ${item.owner} · ${item.group}`,
      `Evidence needed: ${item.evidence}`,
      '',
    ]) : ['No outstanding marks in this session. Verify the evidence and formal approvals independently.', '']),
    'This brief is a planning aid. It is not registration, qualification, funding confirmation, chess affiliation, media consent, or launch authorization.',
  ].join('\n');
}
