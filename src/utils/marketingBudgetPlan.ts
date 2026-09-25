import { parseBudgetCents } from '../data/marketingBudget';
import { budgetLines } from '../data/marketingOperations';

export const MARKETING_BUDGET_KEY = '@ptown/marketing-budget/v1';
export type MarketingBudgetPlan = { ceiling: string; amounts: string[] };
export const emptyMarketingBudgetPlan: MarketingBudgetPlan = { ceiling: '', amounts: budgetLines.map(() => '') };
export function readMarketingBudgetPlan(raw: string | null): MarketingBudgetPlan | null {
  if (raw === null) return null;
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid marketing budget');
  const plan = parsed as Record<string, unknown>;
  if (Object.keys(plan).length !== 2 || typeof plan.ceiling !== 'string' || plan.ceiling.length > 14 || !Array.isArray(plan.amounts) || plan.amounts.length !== budgetLines.length) throw new Error('Invalid marketing budget');
  const ceiling = parseBudgetCents(plan.ceiling);
  if (ceiling === null || ceiling <= 0 || plan.amounts.some(value => typeof value !== 'string' || value.length > 14 || (value.trim() && parseBudgetCents(value) === null))) throw new Error('Invalid marketing budget');
  return plan as MarketingBudgetPlan;
}
export function marketingBudgetTotals(plan: MarketingBudgetPlan) {
  const ceiling = parseBudgetCents(plan.ceiling);
  if (ceiling === null || ceiling <= 0 || plan.amounts.length !== budgetLines.length) throw new Error('Invalid marketing budget');
  const allocations = plan.amounts.map(value => value.trim() ? parseBudgetCents(value) : 0);
  if (allocations.some(value => value === null)) throw new Error('Invalid marketing budget');
  return { ceiling, allocations: allocations as number[], allocated: allocations.reduce<number>((sum, value) => sum + (value ?? 0), 0) };
}
