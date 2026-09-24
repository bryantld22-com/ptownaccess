import { budgetLines } from './marketingOperations';

export const MAX_BUDGET_CENTS = 100_000_000_00;

export function parseBudgetCents(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '');
  if (!normalized || !/^(?:\d+)(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, decimal = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents <= MAX_BUDGET_CENTS ? cents : null;
}

export function formatBudgetCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatBudgetWorksheet(total: number, allocations: readonly number[]): string {
  const allocated = allocations.reduce((sum, cents) => sum + cents, 0);
  return [
    'PTOWN MARKETING · BUDGET WORKSHEET DRAFT',
    `Planning ceiling: ${formatBudgetCents(total)}`,
    ...budgetLines.map((line, index) => `${line}: ${formatBudgetCents(allocations[index] ?? 0)}`),
    `Allocated: ${formatBudgetCents(allocated)}`,
    allocated > total ? `Over ceiling: ${formatBudgetCents(allocated - total)}` : `Unallocated: ${formatBudgetCents(total - allocated)}`,
    'Draft figures only. Finance must confirm funding, line owners, commitments, approval limits, and actual spend before purchases.',
  ].join('\n');
}
