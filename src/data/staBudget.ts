export const staBudgetLines = [
  { id: 'instruction', label: 'Teaching artists and mentors', cue: 'Session preparation, instruction, and supervised learning.' },
  { id: 'materials', label: 'Creative materials and equipment', cue: 'Consumables, safe tools, and program-specific supplies.' },
  { id: 'access', label: 'Access and participant support', cue: 'Accessibility, interpretation, and participation support as designed.' },
  { id: 'travel', label: 'Heritage Tour transportation', cue: 'Transport and travel costs only if a tour is within the proposed scope.' },
  { id: 'production', label: 'Program production and space', cue: 'Approved stage, media, room, and technical expenses.' },
  { id: 'evaluation', label: 'Evaluation and administration', cue: 'Documenting outcomes and allowable project coordination.' },
] as const;
export type StaBudgetId = typeof staBudgetLines[number]['id'];
export type StaBudgetEntry = { request: string; other: string };
export type StaBudgetValues = Record<StaBudgetId, StaBudgetEntry>;
export function parseStaDollars(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  if (!/^(?:0|[1-9]\d{0,6})(?:\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, cents = ''] = trimmed.split('.');
  return Number(whole) * 100 + Number(cents.padEnd(2, '0'));
}
export function summarizeStaBudget(values: StaBudgetValues) {
  let request = 0, other = 0;
  for (const line of staBudgetLines) {
    const entry = values[line.id];
    const grant = parseStaDollars(entry.request), contribution = parseStaDollars(entry.other);
    if (grant === null || contribution === null) return null;
    request += grant; other += contribution;
  }
  return { request, other, total: request + other };
}
export function staMoney(cents: number) { return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
export function formatStaBudget(program: string, values: StaBudgetValues): string {
  const total = summarizeStaBudget(values);
  if (!total || !total.total) throw new Error('Enter valid line items');
  return [
    'SAVE THE ARTS · WORKING PROGRAM BUDGET DRAFT',
    `Program: ${program.trim()}`,
    ...staBudgetLines.map(line => {
      const entry = values[line.id];
      return `${line.label}: proposed grant ${staMoney(parseStaDollars(entry.request)!)} · other planned support ${staMoney(parseStaDollars(entry.other)!)} · total ${staMoney(parseStaDollars(entry.request)! + parseStaDollars(entry.other)!)}`;
    }),
    `Proposed grant request: ${staMoney(total.request)}`,
    `Other planned support: ${staMoney(total.other)}`,
    `Total working program cost: ${staMoney(total.total)}`,
    'Other support is a planning amount, not a verified match, committed donation, or confirmed in-kind contribution.',
    'Verify applicant eligibility, funder cap, allowable costs, match definitions, documentation, and current deadline before using this draft in an application. No grant was identified or submitted.',
  ].join('\n');
}
