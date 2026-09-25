import { readMarketingBudgetPlan, type MarketingBudgetPlan } from './marketingBudgetPlan';

export const MAX_MARKETING_BUDGET_TRANSFER = 2000;
export function createMarketingBudgetTransfer(record: MarketingBudgetPlan): string {
  const validated = readMarketingBudgetPlan(JSON.stringify(record));
  if (!validated) throw new Error('Invalid budget');
  const code = JSON.stringify({ app: 'PTown Access', type: 'marketing-budget-transfer', format: 1, record: validated });
  if (code.length > MAX_MARKETING_BUDGET_TRANSFER) throw new Error('Transfer too large');
  return code;
}
export function readMarketingBudgetTransfer(code: string): MarketingBudgetPlan {
  if (!code.trim() || code.length > MAX_MARKETING_BUDGET_TRANSFER) throw new Error('Invalid transfer');
  const parsed: unknown = JSON.parse(code);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid transfer');
  const packet = parsed as Record<string, unknown>;
  if (Object.keys(packet).length !== 4 || packet.app !== 'PTown Access' || packet.type !== 'marketing-budget-transfer' || packet.format !== 1 || !packet.record) throw new Error('Invalid transfer');
  const record = readMarketingBudgetPlan(JSON.stringify(packet.record));
  if (!record) throw new Error('Invalid transfer');
  return record;
}
